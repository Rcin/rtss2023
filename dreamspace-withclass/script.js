import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { rains } from './rains.js';

let camera, scene, renderer, controls, clock, cloudParticles = [], flash, rain, rainGeo;

let audioListener;
let audioListenerMesh;
let audioSources = [];

function init(){
    clock = new THREE.Clock();
    scene = new THREE.Scene();
    // scene.background = new THREE.Color( 'white' );
    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000)
    camera.position.set(60,20,0);
    //camera.lookAt(15,100,1000);
    // const camhelper = new THREE.CameraHelper( camera );
    // scene.add( camhelper );

    renderer = new THREE.WebGLRenderer();
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
    renderer.setSize(window.innerWidth,window.innerHeight);
    document.body.appendChild(renderer.domElement);
    let loader = new THREE.TextureLoader();
    
    //cloud
    loader.load("smoke.png", function(texture){
        let cloudGeo = new THREE.PlaneGeometry(400, 400);
        let cloudMaterial = new THREE.MeshLambertMaterial({
            map: texture,
            transparent: true
        });

        for(let p = 0; p < 25; p++){
            let cloud = new THREE.Mesh(cloudGeo, cloudMaterial);
            cloud.position.set(
                Math.random() * 80 - 40,
                20,
                Math.random() * 80 - 40
            );
            cloud.rotation.x = 1.16;
            cloud.rotation.y = -0.12;
            cloud.rotation.z = Math.random() * 360;
            cloud.material.opacity = 0.6;
            cloudParticles.push(cloud);
            scene.add(cloud);
        }
    });


    let gridHelper = new THREE.GridHelper(50, 50);
    // scene.add(gridHelper);

    //~~~~~ first person control ~~~~~~
	controls = new FirstPersonControls(camera, renderer.domElement);
	controls.movementSpeed = 30;

    let intensity = 0.5;
    let directlight = new THREE.DirectionalLight({color: 'white'}, intensity);
    directlight.position.set(60, 20, 14);
    scene.add(directlight);
    directlight.castShadow = true;
    directlight.shadow.mapSize.width = 800;
    directlight.shadow.mapSize.height = 800;
    directlight.shadow.camera.near = 0.5;
    directlight.shadow.camera.far = 500;
    const lighthelper = new THREE.DirectionalLightHelper( directlight, 5 );
    // scene.add( lighthelper );

    let directlight2 = new THREE.DirectionalLight({color: 'white'}, intensity);
    directlight2.position.set(60, -20, 14);
    scene.add(directlight2);
    directlight.castShadow = true;
    directlight.shadow.mapSize.width = 800;
    directlight.shadow.mapSize.height = 800;
    directlight.shadow.camera.near = 0.5;
    directlight.shadow.camera.far = 500;
    const lighthelper2 = new THREE.DirectionalLightHelper( directlight, 5 );
    // scene.add( lighthelper2 );

    //ambient light
    let ambientColor = new THREE.Color({color: 'white'});
    let ambientLight = new THREE.AmbientLight(ambientColor, 0.6);
    scene.add(ambientLight);

    //flash
    flash = new THREE.PointLight(0x062d89, 30, 500, 1.7);
    flash.position.set(50, 50, 40);
    scene.add(flash);
    const sphereSize = 1;
    const pointLightHelper = new THREE.PointLightHelper( flash, sphereSize );
    scene.add( pointLightHelper );

    //fog
    let near = 0;
    let far = 150;
    scene.fog = new THREE.Fog('white', near, far);
    //scene.fog=new THREE.FogExp2(0x11111f, 0.0005);
    renderer.setClearColor(scene.fog.color);

    loadModel();
    loop();
}

function addAudio(){
    audioListener = new THREE.AudioListener();
    camera.add(listener);

    let sound = new THREE.Audio(listener);

    let audioLoader = new THREE.AudioLoader().load("rain-and-thunder.wav", function(buffer){
        sound.setBuffer(buffer);
        sound.setLoop(true);
        sound.setVolume(0.5);
        sound.play();
    });

}

function loadModel(){
    let buildingtexture = new THREE.TextureLoader().load('glasstexture.jpeg');

    const loader1 = new GLTFLoader();
    loader1.load('./models/san_francisco_usa.glb', function(sf1){
        let sfbuilding = sf1.scene;
        sfbuilding.traverse(function(sf1){
            if (sf1 instanceof THREE.Mesh) {
						
                sf1.material.map = buildingtexture;
                sf1.material.metalness = 1;
            }
        });
        scene.add(sfbuilding);
        sfbuilding.scale.set(0.1,0.1,0.1);
        sfbuilding.position.set(0,-2,0);
        sfbuilding.castShadow = true;
    });

    const loader2 = new GLTFLoader();
    loader2.load('./models/san_francisco_usa.glb', function(sf2){
        scene.add(sf2.scene);
        sf2.scene.scale.set(0.1,0.1,0.1);
        sf2.scene.position.set(0,50,0);
        sf2.scene.rotation.x = Math.PI;
        sf2.castShadow = true;
    });
}

function loop(){
    let delta = clock.getDelta();
	//first person
	controls.update(delta);
    
    cloudParticles.forEach(p => {
        p.rotation.z -=0.001;
    });

    if(Math.random() > 0.93 || flash.power > 100){
        if(flash.power < 100)
            flash.position.set(
                Math.random() * 100,
                300 + Math.random() * 200,
                300
            );
        flash.power = 50 + Math.random() * 500;
    }



    // render the scene
    renderer.render(scene, camera);
    if (rain != null){
        rain.animateRain();
    }

    // rinse and repeat
    window.requestAnimationFrame(loop);
  }
  
init();

let rainCount = 100000;
let position = [];
const vFOV = (camera.fov * Math.PI) / 180;
const height = 2 * Math.tan(vFOV / 2) * Math.abs(camera.position.z);
const width = height * camera.aspect;

window.addEventListener('keyup', event => {
    if (event.code ==='Space'){
        rain = new rains(rainCount, scene, camera, height, width);
    }
});