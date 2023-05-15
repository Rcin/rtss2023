import * as THREE from 'three';


/*
Real Time Social Spaces: This is an example of a basic three.js scene (in the p5.js editor).  It shows the following parts of the scene

Storing everything in a scene: 
THREE.Scene()

Adding a camera: 
THREE.PerspectiveCamera()

Setting up a renderer: 
THREE.WebGLRenderer()

Finally, it adds a sphere to the scene: 
THREE.SphereGeometry()
THREE.MeshBasicMaterial()
THREE.Mesh()


Next, we'll explore some more aspects of three.js scenes:
Change renderer size (i.e. canvas size) 
Changing geometries 
Changing materials 
Adding lights 
Add a render loop 
Changing the renderer's 'clear color' 


*/


console.log('hello! this is a console statement.');

let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000)
camera.position.set(3,2,145);
camera.lookAt(0,0,0);

// let controls = new OrbitControls(camera, canvas);
// controls.target.set(0, 5, 0);
// controls.update();

let loader = new THREE.TextureLoader();

let renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
renderer.setSize(window.innerWidth,window.innerHeight);
document.body.appendChild(renderer.domElement);


let geo = new THREE.TorusKnotGeometry(8,1.5,180, 12);
let mat = new THREE.MeshPhongMaterial({ map: loader.load('ArtificalTexture.png')});
let mesh = new THREE.Mesh(geo, mat);
scene.add(mesh);

let geo2 = new THREE.TorusKnotGeometry(80,25,180, 12);
let mat2 = new THREE.MeshPhongMaterial({ map: loader.load('opticalillusion.png')});
let mesh2 = new THREE.Mesh(geo2, mat2);
scene.add(mesh2);

let geo3 = new THREE.TorusKnotGeometry(350, 25, 180, 12);
let mat3 = new THREE.MeshPhongMaterial({ map: loader.load('optical2.jpeg')});
let mesh3 = new THREE.Mesh(geo3, mat3);
scene.add(mesh3);

let color = 0xFFFFFF;
let intensity = 1;
let light = new THREE.DirectionalLight(color, intensity);
light.position.set(1, 20, 14);
scene.add(light);


let near = 50;
let far = 450;
scene.fog = new THREE.Fog('black', near, far);

function render(time){
  time *= 0.001;
  // do something
  mesh.rotation.x = -time;
  mesh.rotation.y= time;
  
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
