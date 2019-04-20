/* 3D skateboard model from https://poly.google.com/view/7Dfn4VtTCWY */
/* Rock model from https://poly.google.com/view/dmRuyy1VXEv */

	// pink: rgb(195,44,110)
	// blue: rgb(93, 159, 153)

var container;
var keyboard = new THREEx.KeyboardState();
var clock = new THREE.Clock;

var movingCube;
var collideMeshList = [];
var cubes = [];
var message = document.getElementById("message");
var crash = false;
var score = 0;
var scoreText = document.getElementById("score");
var id = 0;
var crashId = " ";
var lastCrashId = " ";

let scene, camera, renderer, simplex, plane, geometry, xZoom, yZoom, noiseStrength;
let skateboard, rock, rockMesh;

var bluetoothConnected = false;
var gameStarted = false;
var zOrientation = 0;
let counter = 3;

setup();
init();
draw();

function setup(){
	setupNoise();
	setup3DModel();
	setupRockModel();
	setupScene();
	setupCamera();
	setupRenderer();
	setupPlane();
	setupLights();
	setupEventListeners();
}

function setupNoise() {
  // By zooming y more than x, we get the
  // appearence of flying along a valley
  xZoom = 7;
  yZoom = 15;
  // noiseStrength = 1.5;
  noiseStrength = 3;
  simplex = new SimplexNoise();
}

function setupScene() {
  scene = new THREE.Scene();
}

function setupCamera() {
  let res = window.innerWidth / window.innerHeight;
  camera = new THREE.PerspectiveCamera(75, res, 0.1, 1000);
	camera.position.set(0, -20, 1);
  camera.rotation.x = -300;
}

function setup3DModel(){
	var loader = new THREE.OBJLoader();
	loader.load(
		'assets/Skateboard.obj',
		function ( object ) {
			skateboard = object;
			skateboard.position.set(0, -19, -0.1);
			skateboard.rotation.set(2, 1.58, -0.5);
			skateboard.scale.set(0.3, 0.3, 0.3);
	
			object.traverse( function ( child ) {
				let material = new THREE.MeshStandardMaterial({
					color: new THREE.Color('rgb(195,44,110)'),
				});
        if ( child instanceof THREE.Mesh ) {
          child.material = material;
        }
			});
		
			scene.add( skateboard );
			renderer.render(scene, camera);
		}
	);
}

function setupRockModel(){
	var loader = new THREE.OBJLoader();
	loader.load(
		'assets/PUSHILIN_rock.obj',
		function ( object ) {
			rock = object;
			rock.position.set(1, -18, -0.1);
			rock.rotation.set(2, 1.58, -0.5);
			rock.scale.set(0.4, 0.4, 0.4);

			let material = new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0x009900, shininess: 30, flatShading: true } );
			rock.traverse( function ( child ) {
				if ( child instanceof THREE.Mesh ) {
					rockMesh = child;
					rockMesh.material = material;
				}
			});
			// scene.add( rock );
			// renderer.render(scene, camera);
		}
	);
}

function setupRenderer() {
  renderer = new THREE.WebGLRenderer({ 
		antialias: true,
		alpha: true
  });
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.autoClear = false;
	renderer.setClearColor(0x000000, 0.0);
	renderer.setClearAlpha(1.0);

  document.body.appendChild(renderer.domElement);
}

function setupPlane() {
  let side = 120;
  geometry = new THREE.PlaneGeometry(40, 40, side, side);
  // let material = new THREE.MeshStandardMaterial({
  //   roughness: 0.8,
  //   color: new THREE.Color(0x91FCFD),
	// 	wireframe: true,
	// });
	// let material = new THREE.MeshNormalMaterial({
	// 	  roughness: 0.8,
	// 	  color: new THREE.Color(0x91FCFD),
	// 		wireframe: true,
	// 	});
	
	// const wireframeGeometry = new THREE.WireframeGeometry( geometry );
	// const wireframeMaterial = new THREE.MeshStandardMaterial( { color: new THREE.Color(0x91FCFD), wireframe: true } );
	// const wireframe = new THREE.LineSegments( wireframeGeometry, wireframeMaterial );

	let material = new THREE.MeshStandardMaterial({
		color: new THREE.Color('rgb(16,28,89)'),
	});

	plane = new THREE.Mesh(geometry, material);
  plane.castShadow = true;
	plane.receiveShadow = true;
	scene.add(plane);

	const wireframeGeometry = new THREE.WireframeGeometry( geometry );
	const wireframeMaterial = new THREE.LineBasicMaterial( { color: 'rgb(93,159,153)' } );
	const wireframe = new THREE.LineSegments( wireframeGeometry, wireframeMaterial );

	plane.add( wireframe );
}

function setupLights() {
  // let ambientLight = new THREE.AmbientLight(0x0c0c0c);
	let ambientLight = new THREE.AmbientLight(new THREE.Color('rgb(195,44,110)'));
	ambientLight.position.set(10, 0, 50);
  scene.add(ambientLight);
  
  // let spotLight = new THREE.SpotLight(0xcccccc);
  let spotLight = new THREE.SpotLight(0xffffff);
  // let spotLight = new THREE.SpotLight(new THREE.Color('rgb(195,44,110)'));
  // spotLight.position.set(-30, 60, 60);
  spotLight.position.set(10, 0, 50);
  spotLight.castShadow = true;
  scene.add(spotLight);
}

function setupEventListeners() {
  window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function init() {
    // scene.fog = new THREE.FogExp2( new THREE.Color("rgb(0,0,0)"), 0.0004 );
    scene.fog = new THREE.FogExp2( new THREE.Color("#5a008a"), 0.0003 );

    container = document.getElementById("ThreeJS");
    container.appendChild(renderer.domElement);
    renderer.render(scene, camera);
}

function draw() {
  let offset = Date.now() * 0.0004;
  adjustVertices(offset);
	if(gameStarted){
		requestAnimationFrame(draw);
		update()
	}
  renderer.render(scene, camera);
}

function adjustVertices(offset) {
  for (let i = 0; i < plane.geometry.vertices.length; i++) {
    let vertex = plane.geometry.vertices[i];
    let x = vertex.x / xZoom;
    let y = vertex.y / yZoom;
    
    if(vertex.x < -2.5 || vertex.x > 2.5){
      let noise = simplex.noise2D(x, y + offset) * noiseStrength; 
      vertex.z = noise;
    }
  }
  geometry.verticesNeedUpdate = true;
  geometry.computeVertexNormals();
}

function update() {
	// var delta = clock.getDelta();
	// var moveDistance = 200 * delta;
	// var rotateAngle = Math.PI / 2 * delta;

	skateboard.position.x -= zOrientation;

	if(skateboard.position.x > 2 && zOrientation < 0){
		skateboard.position.x += zOrientation;
	}
	if(skateboard.position.x < -2 && zOrientation > 0){
		skateboard.position.x += zOrientation;
	}

	let skateboardGeometry = new THREE.Geometry().fromBufferGeometry( skateboard.children[0].geometry );

	var originPoint = skateboard.position.clone();

	for (var vertexIndex = 0; vertexIndex < skateboardGeometry.vertices.length; vertexIndex++) {
		var localVertex = skateboardGeometry.vertices[vertexIndex].clone();
		var globalVertex = localVertex.applyMatrix4(skateboard.matrix);
		var directionVector = globalVertex.sub(skateboard.position);

		var ray = new THREE.Raycaster(originPoint, directionVector.clone().normalize());
		var collisionResults = ray.intersectObjects(collideMeshList);
		if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()) {
				crash = true;
				crashId = collisionResults[0].object.name;
				break;
		}
		crash = false;
	}

	if (crash) {
		// skateboard.material.color.setHex(0x346386);
		console.log("Crash");
		if (crashId !== lastCrashId) {
			score -= 100;
			lastCrashId = crashId;
		}
		document.getElementById('explode_sound').play()
	} else {
		// skateboardGeometry.material.color.setHex(0x00ff00);
	}

	if (Math.random() < 0.03 && cubes.length < 10) {
		makeRandomCube();
	}

  for (i = 0; i < cubes.length; i++) {
		// if (cubes[i].position.z > camera.position.z) {
		if (cubes[i].position.y < -20) {
			scene.remove(cubes[i]);
			cubes.splice(i, 1);
			collideMeshList.splice(i, 1);
		} else {
			cubes[i].position.y -= 0.05;
		}
		// renderer.render(scene, camera);
	}

  score += 0.1;
  scoreText.innerText = "Score:" + Math.floor(score);
}

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function makeRandomCube() {
    // var object = new THREE.Mesh(geometry, material);
    // var box = new THREE.BoxHelper(object);
    //     // box.material.color.setHex(Math.random() * 0xffffff);
    // box.material.color.setHex(0xff0000);

    // box.position.x = getRandomArbitrary(-250, 250);
    // box.position.y = 1 + b / 2;
    // // box.position.z = getRandomArbitrary(-800, -1200);
    // box.position.z = getRandomArbitrary(-3000, -5000);
    // cubes.push(box);
    // box.name = "box_" + id;
    // id++;
    // collideMeshList.push(box);

		// scene.add(box);
		
		// var geometry = new THREE.CubeGeometry(.5, .5, getRandomInt(1, 3) * .5);

		let material = new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0x009900, shininess: 30, flatShading: true } );
		let rockGeometry = new THREE.Geometry().fromBufferGeometry( rock.children[0].geometry );

		var object = new THREE.Mesh(rockGeometry, material);
		object.position.x = getRandomArbitrary(-2, 2);
		object.position.y = getRandomArbitrary(50, 0);
		object.position.z = 0;

		object.scale.set(0.4, 0.4, 0.4);
		object.rotation.set(2, 1.58, -0.5);

		cubes.push(object);
		object.name = "box_" + id;
		id++;
		collideMeshList.push(object);

		scene.add(object);
}

function displayCounter(){
  const counterDiv = document.getElementsByClassName('counter')[0];
  counterDiv.innerHTML = counter;
  if(counter > 0){
    counter--;
  } else if(counter === 0){
    clearInterval(interval);
		counterDiv.classList.add('fade-out');
		gameStarted = true;
		draw();
  }
}

let interval;

window.onload = () => {
  const connectButton = document.getElementById('connect');
  var previousValue;

  connectButton.onclick = function(){
    var controller = new DaydreamController();
    controller.onStateChange( function ( state ) {
      if(!bluetoothConnected){
        bluetoothConnected = true;
        connectButton.classList.add('fade-out');
        const title = document.getElementsByClassName('title')[0];
        title.classList.add('fade-out');

        interval = setInterval(function(){
          displayCounter();
        },1000);
      }

			if(previousValue !== state.zOri){
				// zOrientation = state.zOri * 10;
				difference = state.zOri - previousValue;
				zOrientation = state.zOri * 15
			}
			previousValue = state.zOri
			// var angle = Math.sqrt( state.xOri * state.xOri + state.yOri * state.yOri + state.zOri * state.zOri );
    } );
    controller.connect();
  }
}
