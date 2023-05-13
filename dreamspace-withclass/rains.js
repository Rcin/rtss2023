import * as THREE from 'three';

export class rains{

    constructor(rainCount, scene, camera, height, width){
        let position = [];
        this.rainGeo = new THREE.BufferGeometry();
        this.isReady = false;
        this.rainCount = rainCount;
        for (let i = 0; i < rainCount; i++) {
            let rainDrop = new THREE.Vector3(
                //Math.random() * 200 - width/2,
                Math.random() * 200 - 40,
                Math.random() * 1000 - 100,
                Math.random() * 300 - 40
            );
            position.push(rainDrop);
        }
        this.rainGeo.setFromPoints(position);
        console.log("rainGeo", this.rainGeo);
        let rainMaterial = new THREE.PointsMaterial({
            color: 0xaaaaaa,
            size: 0.1,
            transparent: true
        });
        let newrain = new THREE.Points(this.rainGeo, rainMaterial);
        scene.add(newrain);
        this.isReady = true;
    }

    animateRain(){
        if (this.isReady == true){
            for (let i = 0; i<this.rainCount*3; i++){
                if (i % 3 == 1){
                    let velocity = 0;
                    velocity -= 0.1 + Math.random() * 0.1;
                    this.rainGeo.attributes.position.array[i] += velocity;
                }
            }
            this.rainGeo.attributes.position.needsUpdate = true;
        }
        }

}