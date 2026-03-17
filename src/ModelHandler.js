import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export default class ModelHandler {
    constructor(scene, path, onLoaded) {
        this.scene = scene;
        this.loader = new GLTFLoader();
        this.mixer = null;
        this.model = null;
        this.onLoaded = onLoaded;

        this.load(path);
    }

    load(path) {
        this.loader.load(path, (gltf) => {
            this.model = gltf.scene;
            this.scene.add(this.model);
            if (this.onLoaded) {
                this.onLoaded(this.model);
            }
            // Setup Animations
            if (gltf.animations.length) {
                this.mixer = new THREE.AnimationMixer(this.model);
                const action = this.mixer.clipAction(gltf.animations[0]);
                //action.loop = THREE.LoopRepeat;
                //action.clampWhenFinished = false;
                action.play();
            }
        });
    }

    update(deltaTime) {
        if (this.mixer) {
            this.mixer.update(deltaTime);
        }
    }
}
