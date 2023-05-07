import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';


let camera, scene, renderer, controls, container, sound;

let frisbee, frisbeeLoaded = false, throwFris = false, throwbackFris = false;

let socket = io();

function init(){
    setupScene();

    let blocker = document.getElementById( 'blocker' );
    let instructions = document.getElementById( 'instructions' );
    blocker.addEventListener( 'click', function () {
        controls.lock();
        blocker.style.display = 'none';
        document.getElementsByClassName("popup")[0].style.opacity = 100;
        document.getElementById("instructions").style.opacity = 100;
        loadSound();
    });
	controls.addEventListener( 'lock', function () {
        blocker.style.display = 'none';
        console.log("locked");
    } );
    
    controls.addEventListener( 'unlock', function () {
        blocker.style.display = 'block';
        document.getElementsByClassName("popup")[0].style.opacity = 0;
        instructions.style.opacity = 0;
        console.log("unlocked");
    } );
    scene.add(controls.getObject());
    
    loadfrisbee();
    setupSocket();
    animate();
}

function setupScene(){
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

    //ambient light
    let ambientColor = new THREE.Color({color: 'white'});
    let ambientLight = new THREE.AmbientLight(ambientColor, 0.6);
    scene.add(ambientLight);

    //box
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

    //fog
    scene.fog = new THREE.Fog( 'white', 0, 50 );
}

function loadfrisbee(){
    const loader = new GLTFLoader();
    loader.load('frisbee.glb', function(gltf){ 
        frisbee = gltf.scene;
        frisbee.scale.set(3, 3, 3);
        frisbee.position.set(0, 5, 3);
        frisbee.castShadow = true;
        scene.add(frisbee);
        frisbeeLoaded = true;
    });
    camera.lookAt(0, 5,-2);
}

//sound
function loadSound(){
    const listener = new THREE.AudioListener();
    const audioListenerMesh = new THREE.Mesh(
        new THREE.BoxGeometry( 1, 1, 1 ),
        new THREE.MeshBasicMaterial( { color: 'blue' } )
    );
    audioListenerMesh.add( listener );
    audioListenerMesh.position.set(0, 0, 0);
    scene.add( audioListenerMesh );
    
    const mesh = new THREE.Mesh(
        new THREE.SphereGeometry( 1, 32, 16 ),
        new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } )
    );
    mesh.position.set(0, 5, 3);
    

    if (frisbeeLoaded == true){
        // camera.add( listener );
        sound = new THREE.PositionalAudio( listener );
        const audioLoader = new THREE.AudioLoader();
        audioLoader.load( 'flyingwoosh.mp3', function( buffer ) {
            sound.setBuffer( buffer );
            sound.setDistanceModel("exponential");
            sound.setRefDistance(1);
            sound.setRolloffFactor(3);
            sound.setLoop( false );
            sound.setVolume( 0.9 );
            // console.log("sound loaded");
        });
        // frisbee.add(sound);
        sound.position.set(0, 5, 3);
        mesh.add(sound);
        scene.add(mesh);
    }
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

function setupSocket(){
    let clientCounter = 0;
    socket.on("connect", () => {
        console.log("connected");
    });
    
    socket.on("peerNumber", (peerCount) => {
        console.log("current peer number", peerCount);
        if (peerCount > 1){
            console.log("more than 1 peer");
        }
    });

    socket.on("throwback", (data) => {
        console.log("throwback", data);
        throwbackFris = true;
    });
}

document.body.addEventListener( 'keydown', ( event ) => {
    if (event.code == 'Space'){
        console.log('throw');
        throwFris = true;
        socket.emit("throw", {id: socket.id, position: frisbee.position});
    }
});

let frameCount = 0;
//animate
function animate(){
    let soundPlayed = false;
    if (frisbee != null && throwFris == true){
        frameCount++;
        // console.log("pre-throw", frisbee.position);
        if (frisbee.position.z >= -250){
        frisbee.position.z -= frameCount*0.05;
        frisbee.rotation.y += frameCount*0.06;
        if (sound.isPlaying == false){
            sound.isPlaying = true;
            sound.play();
            console.log("sound played");
            } else{
                // sound.stop();
                // sound.isPlaying = false;
                console.log("sound stopped");
            }
        } else {
            throwFris = false;
            frameCount = 0;
            // setTimeout(function(){frisbee.position.z = 3;}, 2000);
            // console.log("thrown", frisbee.position)
            console.log("done throwing");
        }

        frisbee.position.needsUpdate = true;
    }
    if (frisbee != null && throwbackFris == true){
        frameCount++;
        if(frisbee.position.z <= 3){
            frisbee.position.z += frameCount*0.005;
            frisbee.rotation.y -= frameCount*0.06;
            if (sound.isPlaying == false){
            sound.play();
            }else{
                sound.stop();
            }
            // console.log("throwing back")
        } else {
            throwbackFris = false;
            frameCount = 0;
            console.log("done throwing back");
            // soundPlayed = false;  
        }
    } 
        
    

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

init();