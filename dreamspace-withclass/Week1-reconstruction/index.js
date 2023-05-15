import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { StereoEffect } from './StereoEffect.js';
import { RGBELoader } from 'https://unpkg.com/three@0.136.0/examples/jsm/loaders/RGBELoader.js';
import { FlakesTexture } from './FlakesTexture.js';

console.log('hello! this is a console statement.');

let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000)
camera.position.set(3,2,145);
camera.lookAt(0,0,0);

let renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
renderer.setSize(window.innerWidth,window.innerHeight);

let effect = new StereoEffect( renderer );
effect.setSize( window.innerWidth, window.innerHeight );
// renderer.outputEncoding = THREE.sRGBEncoding;
// renderer.toneMapping = THREE.ACESFilmicToneMapping;
// renderer.toneMappingExposure = 1.25;
document.body.appendChild(renderer.domElement);

let controls = new OrbitControls(camera, renderer.domElement);

let loader = new THREE.TextureLoader();
let texture1 = new THREE.TextureLoader().load('ArtificalTexture.png');
let texture2 = new THREE.TextureLoader().load('opticalillusion.png');
let texture3 = new THREE.TextureLoader().load('optical2.jpeg');
texture1.mapping = THREE.CubeReflectionMapping;
texture2.mapping = THREE.CubeReflectionMapping;
texture3.mapping = THREE.CubeReflectionMapping;

// let texture = new THREE.CanvasTexture(new FlakesTexture());
// texture.wrapS = THREE.RepeatWrapping;
// texture.wrapT = THREE.RepeatWrapping;
// texture.repeat.x = 10;
// texture.repeat.y = 6;

//skybox
let bgtexture = loader.load('nebula.jpg',
() => {
  const rt = new THREE.WebGLCubeRenderTarget(bgtexture.image.height);
  rt.fromEquirectangularTexture(renderer, bgtexture);
  scene.background = rt.texture;
});

//did not work
// let envmapload = new THREE.PMREMGenerator(renderer);
// new RGBELoader().load('nebula.hdr', function (hdrmap) {
//   let envmap = envmapload.fromCubemap(hdrmap);
//   let reflectivemat = {
//     clearcoat: 1.0,
//     clearcoatRoughness: 0.1,
//     metalness: 0.9,
//     roughness: 0.5,
//     color: 0x8418ca,
//     normalMap: texture,
//     normalScale: new THREE.Vector2(0.5, 0.5),
//     envMap: envmap.texture
//   };

//   let geo = new THREE.TorusKnotGeometry(8,1.5,180, 12);
//   let testmesh = new THREE.Mesh(geo, reflectivemat);
//   testmesh.receiveShadow = true;
//   testmesh.castShadow = true;
//   scene.add(testmesh);
// });


let color = 0xFFFFFF;
let intensity = 1;
let light = new THREE.DirectionalLight(color, intensity);
light.position.set(60, 60, 50);
light.castShadow = true;
scene.add(light);

//Set up shadow properties for the light
light.shadow.mapSize.width = 1000; // default
light.shadow.mapSize.height = 800; // default
light.shadow.camera.near = 15; // default
light.shadow.camera.far = 500; // default

let color2 = 0xFFFFFF;
let intensity2 = 1;
let light2 = new THREE.DirectionalLight(color2, intensity2);
light2.position.set(-60, -60, 50);
light2.castShadow = true;
scene.add(light2);

//Set up shadow properties for the light
light.shadow.mapSize.width = 1000; // default
light.shadow.mapSize.height = 800; // default
light.shadow.camera.near = 15; // default
light.shadow.camera.far = 500; // default

//Create a helper for the shadow camera (optional)
//const helper = new THREE.CameraHelper( light.shadow.camera );
// scene.add( helper );


let geo = new THREE.TorusKnotGeometry(8,1.5,180, 12);
let mat = new THREE.MeshBasicMaterial( { color: '0xffffff', envMap: texture1, refractionRatio: 0.55 } );
// let mat = new THREE.MeshBasicMaterial( { color: 0xffffff, envMap: texture1, refractionRatio: 0.55 } );
//let mat = new THREE.MeshPhongMaterial({ map: loader.load('ArtificalTexture.png'), refractionRatio: 0.95});
let mesh1 = new THREE.Mesh(geo, mat);
mesh1.receiveShadow = true;
mesh1.castShadow = true;
scene.add(mesh1);

let geo2 = new THREE.TorusKnotGeometry(80,25,180, 12);
let mat2 = new THREE.MeshPhongMaterial({ map: loader.load('opticalillusion.png')});
let mesh2 = new THREE.Mesh(geo2, mat);
mesh2.castShadow = true;
mesh2.receiveShadow = true;
scene.add(mesh2);

let geo3 = new THREE.TorusKnotGeometry(350, 25, 180, 12);
let mat3 = new THREE.MeshPhongMaterial({ map: loader.load('optical2.jpeg')});
let mesh3 = new THREE.Mesh(geo3, mat);
mesh3.castShadow = true;
scene.add(mesh3);

// let near = 50;
// let far = 450;
// scene.fog = new THREE.Fog("#1130bf", near, far);

function render(time){
  time *= 0.001;
  // do something
  mesh1.rotation.x = -time;
  mesh1.rotation.y= time;
  
  mesh2.rotation.x= time;
  mesh2.rotation.y= time;
  
  mesh3.rotation.x= time*0.5;
  mesh3.rotation.y= time*0.5;
  
  // render the scene
  renderer.render(scene, camera);

  // rinse and repeat
  window.requestAnimationFrame(render);
}


requestAnimationFrame(render);
