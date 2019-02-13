var container, scene, camera, renderer, controls;
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

var bluetoothConnected = false;

var zOrientation = 0;

let counter = 3;

init();

function init() {
    // Scene
    scene = new THREE.Scene();
    // scene.fog = new THREE.FogExp2( new THREE.Color("rgb(0,0,0)"), 0.0004 );
    scene.fog = new THREE.FogExp2( new THREE.Color("#5a008a"), 0.0003 );

    // Camera
    var screenWidth = window.innerWidth;
    var screenHeight = window.innerHeight;
    camera = new THREE.PerspectiveCamera(75, screenWidth / screenHeight, 1, 1500);
    camera.position.z = 100;
    camera.position.y = 70;

    // Renderer
    if (Detector.webgl) {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } else {
      renderer = new THREE.CanvasRenderer();
    }

    renderer.setSize(screenWidth, screenHeight);
    renderer.autoClear = false;
    renderer.setClearColor(0x000000, 0.0);
    renderer.setClearAlpha(1.0)
    container = document.getElementById("ThreeJS");
    container.appendChild(renderer.domElement);

    THREEx.WindowResize(renderer, camera);

    var light = new THREE.PointLight();
    light.position.set(200, 200, 100);
    var lightSize = 30;
    lightHelper = new THREE.PointLightHelper(light, lightSize);
    scene.add(light);
    scene.add(lightHelper);

    var size = window.innerWidth * 2;
    var divisions = 100;
    // var gridColor = new THREE.Color("rgb(145,252,253)");
    var gridColor = new THREE.Color("rgb(0,0,0)");
    var gridHelper = new THREE.GridHelper( size, divisions, 0x91FCFD, 0x91FCFD );
    gridHelper.position.z = -1000;
    gridHelper.position.y = -50;
    scene.add( gridHelper );

    // geometry = new THREE.Geometry();
    // geometry.vertices.push(new THREE.Vector3(-250, -1, -3000));
    // geometry.vertices.push(new THREE.Vector3(-300, -1, 200));
    // material = new THREE.LineBasicMaterial({
    //     color: 0x11e8bb, linewidth: 5, fog: true
    // });
    // var line1 = new THREE.Line(geometry, material);
    // scene.add(line1);
    // geometry = new THREE.Geometry();
    // geometry.vertices.push(new THREE.Vector3(250, -1, -3000));
    // geometry.vertices.push(new THREE.Vector3(300, -1, 200));
    // var line2 = new THREE.Line(geometry, material);
    // scene.add(line2);

    var cubeGeometry = new THREE.CubeGeometry(50, 25, 60, 5, 5, 5);
    var wireMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        wireframe: true
    });


    movingCube = new THREE.Mesh(cubeGeometry, wireMaterial);
    //            movingCube = new THREE.Mesh(cubeGeometry, material);
    //            movingCube = new THREE.BoxHelper(movingCube);
    movingCube.position.set(0, 25, -20);
    scene.add(movingCube);

    renderer.render(scene, camera);
}

function animate() {
  requestAnimationFrame(animate);
  update();
  renderer.render(scene, camera);
}

function update() {
    var delta = clock.getDelta();
    var moveDistance = 200 * delta;
    var rotateAngle = Math.PI / 2 * delta;

    movingCube.position.x -= zOrientation;

    if(movingCube.position.x > 75 && zOrientation < 0){
      movingCube.position.x += zOrientation;
    }
    if(movingCube.position.x < -75 && zOrientation > 0){
      movingCube.position.x += zOrientation;
    }


    // if (keyboard.pressed("left") || keyboard.pressed("A")) {
    //     if (movingCube.position.x > -270)
    //         movingCube.position.x -= zOrientation;
    // }
    // if (keyboard.pressed("right") || keyboard.pressed("D")) {
    //     if (movingCube.position.x < 270)
    //         movingCube.position.x += zOrientation;
    // }

    var originPoint = movingCube.position.clone();

    for (var vertexIndex = 0; vertexIndex < movingCube.geometry.vertices.length; vertexIndex++) {
        var localVertex = movingCube.geometry.vertices[vertexIndex].clone();
        var globalVertex = localVertex.applyMatrix4(movingCube.matrix);
        var directionVector = globalVertex.sub(movingCube.position);

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
        movingCube.material.color.setHex(0x346386);
        console.log("Crash");
        if (crashId !== lastCrashId) {
            score -= 100;
            lastCrashId = crashId;
        }

        document.getElementById('explode_sound').play()
    } else {
        movingCube.material.color.setHex(0x00ff00);
    }

    if (Math.random() < 0.03 && cubes.length < 30) {
        makeRandomCube();
    }

    for (i = 0; i < cubes.length; i++) {
        if (cubes[i].position.z > camera.position.z) {
            scene.remove(cubes[i]);
            cubes.splice(i, 1);
            collideMeshList.splice(i, 1);
        } else {
            cubes[i].position.z += 10;
        }
        //                renderer.render(scene, camera);
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
    var a = 1 * 50,
        b = getRandomInt(1, 3) * 50,
        c = 1 * 50;
    var geometry = new THREE.CubeGeometry(a, b, c);
    var material = new THREE.MeshBasicMaterial({
        color: Math.random() * 0xffffff,
        size: 3
    });


    var object = new THREE.Mesh(geometry, material);
    var box = new THREE.BoxHelper(object);
    //            box.material.color.setHex(Math.random() * 0xffffff);
    box.material.color.setHex(0xff0000);

    box.position.x = getRandomArbitrary(-250, 250);
    box.position.y = 1 + b / 2;
    // box.position.z = getRandomArbitrary(-800, -1200);
    box.position.z = getRandomArbitrary(-3000, -5000);
    cubes.push(box);
    box.name = "box_" + id;
    id++;
    collideMeshList.push(box);

    scene.add(box);
}

function displayCounter(){
  const counterDiv = document.getElementsByClassName('counter')[0];
  counterDiv.innerHTML = counter;
  if(counter > 0){
    counter--;
  } else if(counter === 0){
    clearInterval(interval);
    counterDiv.classList.add('fade-out');
    animate();
  }
}

let interval;

window.onload = () => {
  const connectButton = document.getElementById('connect');
  var initialised = false;
  var previousValue;
  var difference;

  connectButton.onclick = function(){

    var controller = new DaydreamController();
    controller.onStateChange( function ( state ) {
      if(!bluetoothConnected){
        bluetoothConnected = true;
        connectButton.classList.add('fade-out');

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
