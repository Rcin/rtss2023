import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';


let camera, scene, renderer, controls, container;

let frisbee, playerCollider, playerVelocity, playerDirection, sphere, spheres, sphereIdx, mouseTime, keyState = {};

let socket = io();

function init(){

    scene = new THREE.Scene();
    scene.background = new THREE.Color( '#72abc0' );

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set( 0, 10, 10 );
    camera.lookAt(0, 10, 100);
    // const camerahelper = new THREE.CameraHelper( camera );
    // scene.add(camerahelper);

    // const axesHelper = new THREE.AxesHelper( 5 );
    // scene.add( axesHelper );

    // const gridHelper = new THREE.GridHelper(50, 50);
    // scene.add(gridHelper);

    container = document.getElementById( 'container' );

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    //controls
    controls = new PointerLockControls( camera, document.body );

    let blocker = document.getElementById( 'blocker' );
    let instructions = document.getElementById( 'instructions' );
    blocker.addEventListener( 'click', function () {
        controls.lock();
    });
	controls.addEventListener( 'lock', function () {
        blocker.style.display = 'none';
        instructions.style.display = 'none';
        console.log("locked");
    } );
    
    controls.addEventListener( 'unlock', function () {
        blocker.style.display = 'block';
        instructions.style.display = 'block';
        console.log("unlocked");
    } );
    scene.add(controls.getObject());

    //ambient light
    let ambientColor = new THREE.Color({color: 'white'});
    let ambientLight = new THREE.AmbientLight(ambientColor, 0.6);
    scene.add(ambientLight);

    //plane
    const planegeo = new THREE.PlaneGeometry( 500, 500 );
    const planemat = new THREE.MeshBasicMaterial( {color: '#72abc0', side: THREE.DoubleSide} );
    const plane = new THREE.Mesh( planegeo, planemat );
    scene.add( plane );
    plane.rotateX( Math.PI / 2 );

    const wallgeo = new THREE.PlaneGeometry( 500, 500 );
    const wallmat = new THREE.MeshBasicMaterial( {color: 'white', side: THREE.DoubleSide} );
    const front = new THREE.Mesh( wallgeo, wallmat );
    scene.add( front );
    front.position.set(0, 250, -250);

    const left = new THREE.Mesh( wallgeo, wallmat);
    scene.add( left );
    left.rotateY( Math.PI / 2 );
    left.position.set(-250, 250, 0);

    const right = new THREE.Mesh( wallgeo, wallmat );
    scene.add( right );
    right.rotateY( Math.PI / 2 );
    right.position.set(250, 250, 0);

    const back = new THREE.Mesh( wallgeo, wallmat);
    scene.add( back );
    back.position.set(0, 250, 250);

    const top = new THREE.Mesh( wallgeo, wallmat);
    scene.add( top );
    top.rotateX( Math.PI / 2 );
    top.position.set(0, 500, 0);

    // let fog = new THREE.FogExp2(0x11111f, 0.0005);
    scene.fog = new THREE.Fog( 'white', 0, 50 );
    // scene.fog=new THREE.FogExp2(0x11111f, 0.0005);
    // renderer.setClearColor(scene.fog.color);
    
    loadfrisbee();
    animate();
}

function loadfrisbee(){
    const loader = new GLTFLoader();
    loader.load('frisbee.glb', function(gltf){ 
        frisbee = gltf.scene;
        frisbee.scale.set(3, 3, 3);
        frisbee.position.set(0, 5, 3);
        frisbee.castShadow = true;
        scene.add(frisbee);
    });
    camera.lookAt(0, 5,-2);
}

// let frisbeeThrown = false;
// function throwFrisbee(){
//     let velocity = -250;
//     let direction = new THREE.Vector3();
//     console.log("pre-throw", frisbee.position);
//     frisbee.position.z += velocity * delta * 0.1;
//     frisbeeThrown = true;
//     console.log("thrown", frisbee.position)
//     frisbee.position.needsUpdate = true;
// }

window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

socket.on("connect", () => {
    console.log("connected");
});

let throwFris = false;
document.body.addEventListener( 'keydown', ( event ) => {
    // let delta = ( time - prevTime ) / 500;
    if (event.code == 'Space'){
        console.log('throw');
        throwFris = true;
        // if (frisbeeThrown == false){

        // }
    }
});

let frameCount = 0;
//animate
function animate(){
    // console.log('throw');
    frameCount++;
    if (frisbee != null && throwFris == true){
        // console.log("pre-throw", frisbee.position);
        if (frisbee.position.z >= -250){
        frisbee.position.z -= frameCount*0.0005;
        frisbee.rotation.y += frameCount*0.006;
        } else {
            throwFris = false;
            frameCount = 0;
            setTimeout(function(){frisbee.position.z = 3;}, 2000);
        }
        
        console.log("thrown", frisbee.position)
        frisbee.position.needsUpdate = true;
    }


    // controls.update(delta);
    // let prevTime = performance.now();
    
    // console.log("time is", delta);


    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

init();