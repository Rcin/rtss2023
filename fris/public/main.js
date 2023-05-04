import * as THREE from 'three';
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let clock = new THREE.Clock();
let delta = clock.getDelta();

let camera, scene, renderer, controls, container;

let frisbee, playerCollider, playerVelocity, playerDirection, sphere, spheres, sphereIdx, mouseTime, keyState = {};

function init(){

    scene = new THREE.Scene();
    scene.background = new THREE.Color( '#72abc0' );
    // let fog = new THREE.FogExp2(0x11111f, 0.0005);
    scene.fog = new THREE.Fog( 'white', 0, 150 );
    // scene.fog=new THREE.FogExp2(0x11111f, 0.0005);
    // renderer.setClearColor(scene.fog.color);

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set( 0, 0, 10 );
    camera.lookAt(0, 0, 0);
    // const camerahelper = new THREE.CameraHelper( camera );
    // scene.add(camerahelper);

    let gridHelper = new THREE.GridHelper(50, 50);
    scene.add(gridHelper);
    
    container = document.getElementById( 'container' );

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.VSMShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.appendChild(renderer.domElement);

    //controls
    // controls = new FirstPersonControls(camera, renderer.domElement);
	// controls.movementSpeed = 30;
    controls = new OrbitControls( camera, renderer.domElement );

    const NUM_SPHERE = 10;
    const SPHERE_RADIUS = 0.2;
    const STEPS_PER_FRAME = 5;
    const SphereGeometry = new THREE.IcosahedronGeometry( SPHERE_RADIUS, 2 );
    const SphereMaterial = new THREE.MeshLambertMaterial( { color: 0xff0000 } );

    spheres = [];
    sphereIdx = 0;

    for (let i = 0; i < NUM_SPHERE; i++){
    sphere = new THREE.Mesh( SphereGeometry, SphereMaterial );
    scene.add(sphere);
    spheres.push({
        mesh: sphere, 
        collider: new THREE.Sphere(new THREE.Vector3( 0, - 100, 0 ), SPHERE_RADIUS ),
        velocity: new THREE.Vector3()
        });
    }

    //player
    playerCollider = new THREE.CapsuleGeometry( new THREE.Vector3(0, 0.35, 0), new THREE.Vector3( 0, 1, 0 ), 0.35);
    playerVelocity = new THREE.Vector3();
    playerDirection = new THREE.Vector3();
    mouseTime = 0;


    //ambient light
    let ambientColor = new THREE.Color({color: 'white'});
    let ambientLight = new THREE.AmbientLight(ambientColor, 0.6);
    scene.add(ambientLight);

    loadfrisbee();
    animate();
}

function loadfrisbee(){
    const loader = new GLTFLoader();
    loader.load('model/frisbee.gltf', function(gltf){ 
        frisbee = gltf.scene;
        frisbee.scale.set(0.02, 0.02, 0.02);
        frisbee.position.set(0, -3, 0);
        frisbee.castShadow = true;
        scene.add(frisbee);
    });
}



window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize(){

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

window.addEventListener('keyup', event => {
    if (event.code ==='Space'){
        console.log('launch!');
    }
});

document.addEventListener('keydown', event => {
    keyState[event.code] = true;    
});

document.addEventListener('keyup', event => {
    keyState[event.code] = false;
});

document.addEventListener('mousedown', event => {
    document.body.requestPointerLock();
    mouseTime = performance.now();
});

document.addEventListener( 'mouseup', () => {
    if ( document.pointerLockElement !== null ) throwFrisbee();
} );

document.body.addEventListener( 'mousemove', ( event ) => {
    if ( document.pointerLockElement === document.body ) {
        camera.rotation.y -= event.movementX / 500;
        camera.rotation.x -= event.movementY / 500;
    }
});


function throwFrisbee(){
    sphere = spheres[sphereIdx];
    camera.getWorldDirection( playerDirection );
    sphere.collider.center.copy(playerCollider.end).addScaledVector(playDirection, playerCollider.radius * 1.5);
    const impulse = 15 + 30*( 1-Math.exp((mouseTime - performance.now())*0.001));
    sphere.velocity.copy(playerDirection).multiplyScalar(impulse);
    sphere.velocity.addScaledVector(playerVelocity, 2);
    sphereIdx = ( sphereIdx + 1 ) % spheres.length;
    console.log("throwing frisbee");
    // let frisbee = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), new THREE.MeshBasicMaterial({color: 'red'}));
    // frisbee.position.set(0, 0, 0);
    // scene.add(frisbee);
}


function spheresCollisions(){
    for ( let i = 0, length = spheres.length; i < length; i ++ ) {
        const s1 = spheres[ i ];
        for ( let j = i + 1; j < length; j ++ ) {
            const s2 = spheres[ j ];
            const d2 = s1.collider.center.distanceToSquared( s2.collider.center );
            const r = s1.collider.radius + s2.collider.radius;
            const r2 = r * r;
            if ( d2 < r2 ) {
                const normal = vector1.subVectors( s1.collider.center, s2.collider.center ).normalize();
                const v1 = vector2.copy( normal ).multiplyScalar( normal.dot( s1.velocity ) );
                const v2 = vector3.copy( normal ).multiplyScalar( normal.dot( s2.velocity ) );

                s1.velocity.add( v2 ).sub( v1 );
                s2.velocity.add( v1 ).sub( v2 );

                const d = ( r - Math.sqrt( d2 ) ) / 2;

                s1.collider.center.addScaledVector( normal, d );
                s2.collider.center.addScaledVector( normal, - d );

            }
        }
    }
}

function updateSpheres( delta ) {

    spheres.forEach( sphere => {

        sphere.collider.center.addScaledVector( sphere.velocity, delta );

        sphere.velocity.addScaledVector( result.normal, - result.normal.dot( sphere.velocity ) * 1.5 );
        sphere.collider.center.add( result.normal.multiplyScalar( result.depth ) );


        const damping = Math.exp( - 1.5 * delta ) - 1;
        sphere.velocity.addScaledVector( sphere.velocity, damping );

        playerSphereCollision( sphere );

    } );

    spheresCollisions();

    for ( const sphere of spheres ) {

        sphere.mesh.position.copy( sphere.collider.center );

    }

}


//animate
function animate(){
    controls.update(delta);
    // updateSpheres( delta );
    renderer.render(scene, camera);
    // stats.update();
    requestAnimationFrame(animate);
}

init();
