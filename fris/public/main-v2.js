import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';


let camera, scene, renderer, controls, container, sound;

let frisbee, frisbeeLoaded = false, throwFris = false, throwbackFris = false;

let latitude, longitude;

let socket = io();

function init(){
    setupScene();

    const blocker = document.getElementById( 'blocker' );
    const instructions = document.getElementById( 'instructions' );
    const popupbottom = document.getElementsByClassName("popupbottom")[1];
    blocker.addEventListener( 'click', function () {
        controls.lock();
        blocker.style.display = 'none';
        popupbottom.style.opacity = 100;
        instructions.style.opacity = 100;
        loadSound();
    });
	controls.addEventListener( 'lock', function () {
        blocker.style.display = 'none';
        console.log("locked");
    } );
    
    controls.addEventListener( 'unlock', function () {
        blocker.style.display = 'block';
        popupbottom.style.opacity = 0;
        instructions.style.opacity = 0;
        console.log("unlocked");
    } );
    scene.add(controls.getObject());
    
    loadfrisbee();
    getGeoLocation();  
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
        new THREE.BoxGeometry( 0.1, 0.1, 0.1 ),
        new THREE.MeshBasicMaterial( { color: 'blue' } )
    );
    audioListenerMesh.add( listener );
    audioListenerMesh.position.set(0, 0, 0);
    scene.add( audioListenerMesh );
    
    const mesh = new THREE.Mesh(
        new THREE.SphereGeometry( 0.1, 0.1, 0.1 ),
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
    
    socket.on("peerID", (peer) => {
        console.log("current peer IP", peer);
        if (peer != null){
            let peerLat = peer[0];
            let peerLong = peer[1];
            console.log("peerLat", peerLat, "peerLong", peerLong);
        
            let distance = calculateDistance(latitude, longitude, peerLat, peerLong);
            console.log("distance", distance);
            if (distance != null){
            document.getElementById("ipaddress").innerHTML = distance+" km away";
            // console.log(distance);
            }
        }
        
    });

    socket.on("throwback", (data) => {
        // console.log("throwback", data);
        throwbackFris = true;
    });
}
function calculateDistance(lat1,lon1,lat2,lon2){
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1); 
    var a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    return d;
}
  
function deg2rad(deg) {
    return deg * (Math.PI/180)
}

function getGeoLocation(){
    function success(position) {
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
        console.log("Latitude is", latitude, "Longitude is", longitude);
      }
    
      function error() {
        console.log("Unable to retrieve your location");
      }
    
      if (!navigator.geolocation) {
        console.log("Geolocation is not supported by your browser");
      } else {
        navigator.geolocation.getCurrentPosition(success, error);
      }
}

document.body.addEventListener( 'keydown', ( event ) => {
    if (event.code == 'Space'){
        console.log('throw');
        throwFris = true;
        socket.emit("throw", {id: socket.id, position: frisbee.position});
        socket.emit("newPeer", {id: socket.id, latitude: latitude, longitude: longitude});
    }
});

let frameCount = 0;
//animate
function animate(){
    if (frisbee != null){
    const getCameraRotate = new THREE.Vector3();
    camera.getWorldDirection( getCameraRotate);
    //  console.log(getCameraRotate);
    getCameraRotate.y = 0;
    frisbee.position.needsUpdate = true;
    // console.log("current frisbee location", frisbee.position);
    // frisbee.position.set(getCameraRotate.x * 0.5, 5, getCameraRotate.z * 0.5);
    // frisbee.position.x += getCameraRotate.x * 0.1;
    // frisbee.position.z += getCameraRotate.z * 0.1;
    // frisbee.position.x.set(getCameraRotate.x * 0.5);
    // frisbee.position.z.set(getCameraRotate.z * 0.5);
    // getCameraRotate.add( frisbee.position );
    // frisbee.position.add( getCameraRotate );
    };

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
            }
        } else {
            throwFris = false;
            frameCount = 0;
            // setTimeout(function(){frisbee.position.z = 3;}, 2000);
            // console.log("thrown", frisbee.position)
            console.log("done throwing");
        }

        
    }
    if (frisbee != null && throwbackFris == true){
        document.getElementsByClassName("popuptop")[0].style.opacity = 100;
        document.getElementById("newconnection").style.opacity = 100;
        frameCount++;
        if(frisbee.position.z <= 3){
            frisbee.position.z += frameCount*0.005;
            frisbee.rotation.y -= frameCount*0.06;

            if (sound.isPlaying == false){
            sound.play();
            }
            // console.log("throwing back")
        } else {
            throwbackFris = false;
            frameCount = 0;
            console.log("done throwing back");
            document.getElementsByClassName("popuptop")[0].style.opacity = 0;
            document.getElementById("newconnection").style.opacity = 0;
            // soundPlayed = false;  
        }
    } 
        
    

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

init();