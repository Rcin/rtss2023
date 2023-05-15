import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let camera, scene, renderer, parent, frameCount;
function init(){
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000)
  camera.position.set(3,2,145);
  camera.lookAt(0,0,0);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth,window.innerHeight);
  renderer.setClearColor( '#EDE6CC' );
  document.body.appendChild(renderer.domElement);

  // let gridHelper = new THREE.GridHelper( 25, 25 );
  // scene.add( gridHelper );

  let controls = new OrbitControls( camera, renderer.domElement );

  //tunnel
for (let i = 0; i < 15; i++) {
  let geo = new THREE.TorusKnotGeometry(13,0.2,158,4,1,1);
  let mat = new THREE.MeshBasicMaterial({ color: 'black' });
  let mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);
  mesh.position.z = i*10;
}
let lastgeo = new THREE.TorusKnotGeometry(13,0.2,158,4,1,1);
let lastmat = new THREE.MeshBasicMaterial({ color: 'black' });

//diamonds river
for (let i = 0; i < 15; i++) {
  let geo = new THREE.TetrahedronGeometry(2,1);
  let matSolid = new THREE.MeshBasicMaterial({color:'#EDE6CC',
  wireframe:false,
    polygonOffset: true,
  polygonOffsetFactor: 1, 
  polygonOffsetUnits: 1});
  let diamond = new THREE.Mesh(geo, matSolid );
  scene.add(diamond);

  //wireframe
  let wiregeo = new THREE.EdgesGeometry( diamond.geometry );
  let matWireframe = new THREE.LineBasicMaterial({color:'black'});
  let wireframe = new THREE.LineSegments( wiregeo, matWireframe );
  diamond.add(wireframe);
  diamond.position.x = randomNumber(-5, 20);
  diamond.position.y = -10;
  diamond.position.z = randomNumber(0, 150);
  }

//far away diamonds
for (let i = 0; i < 15; i++) {
  let geo = new THREE.TetrahedronGeometry(1,1);
  let matSolid = new THREE.MeshBasicMaterial({color:'#EDE6CC',
  wireframe:false,
    polygonOffset: true,
  polygonOffsetFactor: 1, 
  polygonOffsetUnits: 1});
  let diamond = new THREE.Mesh(geo, matSolid );
  scene.add(diamond);

  //wireframe
  let wiregeo = new THREE.EdgesGeometry( diamond.geometry );
  let matWireframe = new THREE.LineBasicMaterial({color:'black'});
  let wireframe = new THREE.LineSegments( wiregeo, matWireframe );
  diamond.add(wireframe);
  diamond.position.x = randomNumber(-5, 20);
  diamond.position.y = randomNumber(-10, 25);
  diamond.position.z = randomNumber(-10, 0);
}


  //river plane
  const geometry = new THREE.PlaneGeometry( 25, 175 );
  const material = new THREE.MeshBasicMaterial( {color: 'black', side: THREE.DoubleSide} );
  const plane = new THREE.Mesh( geometry, material );
  scene.add( plane );
  plane.position.x = 6;
  plane.position.y = -10;
  plane.position.z = 70;
  plane.rotation.x = Math.PI / 2;
  // plane.rotation.y= Math.PI / 3;
  
}




function randomNumber(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

init();
function render(time){
    time *= 0.001;
    // do something
    //console.log(time);
    if (time < 18){
        camera.position.z -= time*0.01;
    }
    
    if (time >= 15){
        camera.lookAt(0,(time-30)*0.01,0); //I am trying to have the camera turn upwards but right now it's turning to the wrong way
    } 
    
    // render the scene
    renderer.render(scene, camera);
  
    // rinse and repeat
    window.requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
