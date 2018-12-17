var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 500);
var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

camera.position.z = 400;

// Without the light, the grid isn't visible at all
light = new THREE.PointLight();
light.position.set(200, 100, 150);
var lightSize = 30;
lightHelper = new THREE.PointLightHelper(light, lightSize);
scene.add(light);
scene.add(lightHelper);

var grid = new THREE.GridHelper( 200, 40, 0x91FCFD, 0x91FCFD );
grid.position.y = - 150;
scene.add(grid);

function render() {
  requestAnimationFrame( render );
  renderer.render( scene, camera );
}
render();
