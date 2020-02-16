/* 3D cheese spaceship model by Tilda Helgesson - https://poly.google.com/view/9yqEUlUjC-N */
/* Donut by Matthew Collier - https://poly.google.com/view/5LrO6cpMump*/

var container;
var collideMeshList = [];
var cubes = [];
var crash = false;
var score = 0;
var scoreText = document.getElementById("score");
var id = 0;
var crashId = " ";
var lastCrashId = " ";
let counter = 3;

const URL = "./assets/ml-model/";

let model, webcam, labelContainer, maxPredictions;

let gesturePredicted = "neutral";

let scene,
  camera,
  renderer,
  simplex,
  plane,
  geometry,
  xZoom,
  yZoom,
  noiseStrength;
let spaceship, rock, rockMesh;

var gameStarted = false;
var zOrientation = 0;
var sound;
var glitchPass, composer;
let starGeo;

setup();
init();
draw();

function setup() {
  setupScene();
  setup3DModel();
  setupRockModel();
  setupStars();
  setupSound();
  setupLights();
}

function setupStars() {
  starGeo = new THREE.Geometry();
  for (let i = 0; i < 6000; i++) {
    let star = new THREE.Vector3(
      Math.random() * 600 - 300,
      Math.random() * 600 - 300,
      Math.random() * 600 - 300
    );
    star.velocity = 0;
    star.acceleration = 0.002;
    starGeo.vertices.push(star);
  }

  let sprite = new THREE.TextureLoader().load("assets/star.png");
  let starMaterial = new THREE.PointsMaterial({
    color: 0xaaaaaa,
    size: 0.7,
    map: sprite
  });

  stars = new THREE.Points(starGeo, starMaterial);
  scene.add(stars);
}

function setupSound() {
  sound = new Howl({
    src: ["assets/delorean-dynamite-long-2.m4a"],
    loop: true
  });
}

function setupScene() {
  scene = new THREE.Scene();

  let res = window.innerWidth / window.innerHeight;
  camera = new THREE.PerspectiveCamera(75, res, 0.1, 1000);
  camera.position.set(0, -20, 1);
  camera.rotation.x = -300;

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

function setup3DModel() {
  var mtlLoader = new THREE.MTLLoader();
  mtlLoader.setPath("assets/"); //Give the path upto the mtl file
  mtlLoader.load("cheese/materials.mtl", function(materials) {
    hotdogMaterial = materials;
    materials.preload(); //We can preload the material resources like this.

    var objLoader = new THREE.OBJLoader();
    objLoader.setMaterials(materials); //Set the materials for the objects using OBJLoader's setMaterials method
    objLoader.setPath("assets/"); //Give the path upto the obj file
    objLoader.load("cheese/cheese-spaceship.obj", function(object) {
      spaceship = object;

      // y axis is actually z and z is y;
      spaceship.position.set(0, -18, 0.2);
      spaceship.rotation.set(0.5, -1.8, -1.2);
      spaceship.scale.set(3, 3, 3);

      scene.add(spaceship);
      renderer.render(scene, camera);
    });
  });
}

function setupRockModel() {
  var mtlLoader = new THREE.MTLLoader();
  mtlLoader.setPath("assets/"); //Give the path upto the mtl file
  mtlLoader.load("donut/materials.mtl", function(materials) {
    materials.preload(); //We can preload the material resources like this.

    var objLoader = new THREE.OBJLoader();
    objLoader.setMaterials(materials); //Set the materials for the objects using OBJLoader's setMaterials method
    objLoader.setPath("assets/"); //Give the path upto the obj file
    objLoader.load("donut/model.obj", function(object) {
      rock = object;
      rock.position.set(1, -18, 1);
      rock.rotation.set(0, 0, 1);
      rock.scale.set(1, 1, 1);
    });
  });
}

function setupLights() {
  let ambientLight = new THREE.AmbientLight(
    new THREE.Color("rgb(255,255,255)")
  );
  ambientLight.position.set(10, 0, 50);
  scene.add(ambientLight);

  let spotLight = new THREE.SpotLight(0xffffff);
  spotLight.position.set(10, 0, 50);
  spotLight.castShadow = true;
  scene.add(spotLight);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function init() {
  scene.fog = new THREE.FogExp2(new THREE.Color("#5a008a"), 0.0003);

  container = document.getElementById("ThreeJS");
  container.appendChild(renderer.domElement);
  renderer.render(scene, camera);

  window.addEventListener("resize", onWindowResize);
}

function draw() {
  if (spaceship && gesturePredicted) {
    if (gesturePredicted === "left" && spaceship.position.x > -3) {
      spaceship.rotation.y -= 0.005;
      spaceship.rotation.z += 0.001;

      spaceship.position.x -= 0.04;
    } else if (gesturePredicted === "right" && spaceship.position.x < 3) {
      spaceship.rotation.y += 0.005;
      spaceship.rotation.z -= 0.001;

      spaceship.position.x += 0.04;
    }
  }

  if (gameStarted) {
    starGeo.vertices.forEach(p => {
      p.velocity += p.acceleration;
      p.y -= p.velocity;

      if (p.y < -200) {
        p.y = 200;
        p.velocity = 0;
      }
    });
    starGeo.verticesNeedUpdate = true;
    stars.rotation.y += 0.002;

    requestAnimationFrame(draw);
    update();
  }
  if (composer) {
    composer.render();
  }

  renderer.render(scene, camera);
}

function update() {
  let spaceshipGeometry = new THREE.Geometry().fromBufferGeometry(
    spaceship.children[0].geometry
  );

  var originPoint = spaceship.position.clone();

  for (
    var vertexIndex = 0;
    vertexIndex < spaceshipGeometry.vertices.length;
    vertexIndex++
  ) {
    var localVertex = spaceshipGeometry.vertices[vertexIndex].clone();
    var globalVertex = localVertex.applyMatrix4(spaceship.matrix);
    var directionVector = globalVertex.sub(spaceship.position);

    var ray = new THREE.Raycaster(
      originPoint,
      directionVector.clone().normalize()
    );
    var collisionResults = ray.intersectObjects(collideMeshList);
    if (
      collisionResults.length > 0 &&
      collisionResults[0].distance < directionVector.length()
    ) {
      crash = true;
      crashId = collisionResults[0].object.name;
      break;
    }
    crash = false;
  }

  glitchPass = new THREE.GlitchPass();
  composer = new THREE.EffectComposer(renderer);

  if (crash) {
    if (crashId !== lastCrashId) {
      score -= 1;
      lastCrashId = crashId;

      glitchPass.enabled = true;
      composer.addPass(glitchPass);
    }

    document.getElementById("explode_sound").play();
  } else {
    glitchPass.enabled = false;
    composer.addPass(glitchPass);
  }

  if (Math.random() < 0.03 && cubes.length < 10) {
    makeRandomCube();
  }

  for (i = 0; i < cubes.length; i++) {
    cubes[i].rotation.z += 0.05;
    if (cubes[i].position.y < -20) {
      scene.remove(cubes[i]);
      cubes.splice(i, 1);
      collideMeshList.splice(i, 1);
      //if(!crash){
      score += 1;
      //}
    } else {
      cubes[i].position.y -= 0.1;
    }
  }
  scoreText.innerText = "Score:" + Math.floor(score);

  starGeo.vertices.forEach(p => {
    p.velocity += p.acceleration;
    p.y -= p.velocity;

    if (p.y < -200) {
      p.y = 200;
      p.velocity = 0;
    }
  });
  starGeo.verticesNeedUpdate = true;
}

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

function makeRandomCube() {
  var newRock = rock.clone();

  newRock.position.x = getRandomArbitrary(-25, 25);
  newRock.position.y = getRandomArbitrary(50, 0);
  newRock.position.z = 0;

  newRock.scale.set(7, 7, 7);
  // object.rotation.set(2, 1.58, -0.5);
  newRock.rotation.set(0, 0, 1);

  cubes.push(newRock);
  newRock.name = "box_" + id;
  id++;
  collideMeshList.push(newRock);

  scene.add(newRock);
}

let interval;

window.onload = () => {
  initML();
  if (!isMobile()) {
    const connectButton = document.getElementsByTagName("button")[0];

    connectButton.onclick = () => {
      document.getElementById("connect").classList.add("fade-out");

      const title = document.getElementsByClassName("title")[0];
      title.classList.add("fade-out");
      sound.play();
      sound.fade(0, 1, 3000);

      gameStarted = true;
      draw();
    };
  }
};

const isMobile = () => {
  let check = false;
  (function(a) {
    if (
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(
        a
      ) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
        a.substr(0, 4)
      )
    )
      check = true;
  })(navigator.userAgent || navigator.vendor || window.opera);
  return check;
};

async function initML() {
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";
  model = await tmImage.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  const flip = true; // whether to flip the webcam
  webcam = new tmImage.Webcam(200, 200, flip); // width, height, flip
  await webcam.setup(); // request access to the webcam
  await webcam.play();
  window.requestAnimationFrame(loop);
}

async function loop() {
  webcam.update(); // update the webcam frame
  await predict();
  window.requestAnimationFrame(loop);
}

async function predict() {
  const prediction = await model.predict(webcam.canvas);

  const maxGesture = Math.max.apply(
    Math,
    prediction.map(function(o) {
      return o.probability;
    })
  );

  gesturePredicted = prediction.find(o => o.probability === maxGesture)
    .className;
}
