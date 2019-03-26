var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 500);
var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var data = generateHeight( 1024, 1024 );

camera.position.z = 400;
camera.position.y = 300;
camera.rotation.x = 200;

// Without the light, the grid isn't visible at all
light = new THREE.PointLight();
light.position.set(200, 100, 150);
var lightSize = 30;
lightHelper = new THREE.PointLightHelper(light, lightSize);
scene.add(light);
scene.add(lightHelper);

var grid = new THREE.GridHelper( 200, 40, 0x91FCFD, 0x91FCFD );
grid.position.y = -150;
scene.add(grid);


// var geometry = new THREE.Geometry();
// geometry.vertices.push(new THREE.Vector3( -500, 0, 0 ) );
// geometry.vertices.push(new THREE.Vector3( 500, 0, 0 ) );
// linesMaterial = new THREE.LineBasicMaterial( { color: 0x91FCFD, opacity: .2, linewidth: .1 } );

// for ( var i = 0; i <= 20; i ++ ) {
//     var line = new THREE.Line( geometry, linesMaterial );
//     line.position.z = ( i * 50 ) - 500;
//     scene.add( line );

//     var line = new THREE.Line( geometry, linesMaterial );
//     line.position.x = ( i * 50 ) - 500;
//     line.rotation.y =  90 * Math.PI / 180;
//     // line.position.y =  -150;
//     // line.rotation.z =  Math.PI / 180;
//     scene.add( line );
// }

var material = new THREE.MeshPhongMaterial( {color: "#2194ce", shading: THREE.FlatShading, wireframe: true}  );
var quality = 16, step = 1024 / quality;
var geometry = new THREE.PlaneGeometry( 3000, 3000, quality - 1, quality - 1 );

geometry.rotateX(45);

for ( var i = 0, l = geometry.vertices.length; i < l; i ++ ) {
  var x = i % quality, y = Math.floor( i / quality );
  geometry.vertices[ i ].y = data[ ( x * step ) + ( y * step ) * 1024 ] * 2 - 128;
}

mesh = new THREE.Mesh( geometry, material );
mesh.position.y = -150;
scene.add( mesh );

function render() {
  requestAnimationFrame( render );
  renderer.render( scene, camera );
}
render();


function generateHeight( width, height ) {
  var data = new Uint8Array( width * height ), perlin = new ImprovedNoise(),
  size = width * height, quality = 2, z = Math.random() * 100;
  for ( var j = 0; j < 4; j ++ ) {
    quality *= 4;
    for ( var i = 0; i < size; i ++ ) {
      var x = i % width, y = ~~ ( i / width );
      data[ i ] += Math.abs( perlin.noise( x / quality, y / quality, z ) * 0.5 ) * quality + 10;
    }
  }
  return data;
}

