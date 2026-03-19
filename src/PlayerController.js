import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export default class PlayerController {
    constructor(scene, camera, path, onLoaded, options = {}) {
        this.scene = scene;
        this.camera = camera;
        this.loader = new GLTFLoader();
        this.mixer = null;
        this.model = null;
        this.walkAction = null;
        this.runAction = null;
        this.idleAction = null;
        this.idleDelay = 2;
        this.idleTimer = 0;
        this.isIdlePlaying = false;
        
        // Input state
        this.keys = { w: false, a: false, s: false, d: false, shift: false };
        this.analogInput = { x: 0, y: 0 };
        this.analogRun = false;

        // Audio state
        this.audioHandler = options.audioHandler || null;
        this.walkSound = null;
        this.runSound = null;
        this.currentMovementSound = null;
        
        // Bind events
        window.addEventListener('keydown', (e) => this.keys[e.key.toLowerCase()] = true);
        window.addEventListener('keyup', (e) => this.keys[e.key.toLowerCase()] = false);

        this.onLoaded = onLoaded;
        this.initMovementAudio(options);
        this.load(path);
    }

    initMovementAudio(options = {}) {
        if (!this.audioHandler || !this.audioHandler.listener) {
            return;
        }

        const walkPath = options.walkSoundPath || './audio/walk.mp3';
        const runPath = options.runSoundPath || './audio/walk.mp3';
        const walkVolume = options.walkVolume ?? 0.03;
        const runVolume = options.runVolume ?? 0.03;
        const audioLoader = new THREE.AudioLoader();

        audioLoader.load(walkPath, (buffer) => {
            this.walkSound = new THREE.Audio(this.audioHandler.listener);
            this.walkSound.setBuffer(buffer);
            this.walkSound.setLoop(true);
            this.walkSound.setVolume(walkVolume);
        });

        audioLoader.load(runPath, (buffer) => {
            this.runSound = new THREE.Audio(this.audioHandler.listener);
            this.runSound.setBuffer(buffer);
            this.runSound.setLoop(true);
            this.runSound.setVolume(runVolume);
            this.runSound.setPlaybackRate(0.3);
        });
    }

    stopMovementSounds() {
        if (this.walkSound && this.walkSound.isPlaying) {
            this.walkSound.stop();
        }

        if (this.runSound && this.runSound.isPlaying) {
            this.runSound.stop();
        }

        this.currentMovementSound = null;
    }

    updateMovementAudio(isMoving, isRunning) {
        if (!this.audioHandler || !this.audioHandler.listener) {
            return;
        }

        if (this.audioHandler.listener.context.state === 'suspended') {
            return;
        }

        if (!isMoving) {
            this.stopMovementSounds();
            return;
        }

        const target = isRunning ? 'run' : 'walk';
        if (this.currentMovementSound === target) {
            return;
        }

        this.stopMovementSounds();

        if (target === 'run' && this.runSound && !this.runSound.isPlaying) {
            this.runSound.play();
            this.currentMovementSound = 'run';
        }

        if (target === 'walk' && this.walkSound && !this.walkSound.isPlaying) {
            this.walkSound.play();
            this.currentMovementSound = 'walk';
        }
    }

    setAnalogInput(x, y) {
        this.analogInput.x = THREE.MathUtils.clamp(x, -1, 1);
        this.analogInput.y = THREE.MathUtils.clamp(y, -1, 1);
    }

    setAnalogRun(isPressed) {
        this.analogRun = !!isPressed;
    }

    load(path) {
        this.loader.load(path, (gltf) => {
            this.model = gltf.scene;
            this.scene.add(this.model);
            if (this.onLoaded) {
                this.onLoaded(this.model);
            }
            if (gltf.animations.length > 1) {
                this.mixer = new THREE.AnimationMixer(this.model);
                this.walkAction = this.mixer.clipAction(gltf.animations[1]);
                this.walkAction.play();
                this.walkAction.paused = true;

                if (gltf.animations.length > 2) {
                    this.runAction = this.mixer.clipAction(gltf.animations[2]);
                    this.runAction.play();
                    this.runAction.paused = true;
                }

                if (gltf.animations.length > 0) {
                    this.idleAction = this.mixer.clipAction(gltf.animations[0]);
                    this.idleAction.stop();
                }
            }
        });
    }

    update(deltaTime) {
        if (!this.model) return;

        const isRunRequested = (this.keys.shift || this.analogRun) && !!this.runAction;
        const moveSpeed = (isRunRequested ? 4 : 2) * deltaTime;
        const rotateSpeed = 3 * deltaTime;
        let isMoving = false;

        const keyboardForward = (this.keys.w ? 1 : 0) - (this.keys.s ? 1 : 0);
        const keyboardTurn = (this.keys.a ? 1 : 0) - (this.keys.d ? 1 : 0);

        const forwardInput = THREE.MathUtils.clamp(keyboardForward + this.analogInput.y, -1, 1);
        const turnInput = THREE.MathUtils.clamp(keyboardTurn - this.analogInput.x, -1, 1);
        const deadZone = 0.08;

        // 1. Handle Movement & Rotation
        if (Math.abs(forwardInput) > deadZone) {
            this.model.translateZ(moveSpeed * forwardInput);
            isMoving = true;
        }

        if (Math.abs(turnInput) > deadZone) {
            this.model.rotation.y += rotateSpeed * turnInput;
            isMoving = true;
        }

        // 2. Control Walk Animation
        if (this.mixer) {
            const isRunning = isMoving && isRunRequested;

            if (isMoving) {
                this.idleTimer = 0;
                if (this.idleAction && this.isIdlePlaying) {
                    this.idleAction.stop();
                    this.isIdlePlaying = false;
                }
            } else {
                this.idleTimer += deltaTime;
            }

            if (this.walkAction) {
                this.walkAction.paused = !(isMoving && !isRunning);
            }

            if (this.runAction) {
                this.runAction.paused = !isRunning;
            }

            if (!isMoving && this.idleAction && !this.isIdlePlaying && this.idleTimer >= this.idleDelay) {
                this.idleAction.reset();
                this.idleAction.play();
                this.isIdlePlaying = true;
            }

            this.mixer.update(deltaTime);
            this.updateMovementAudio(isMoving, isRunning);
        }

        // 3. Camera Follow (Third Person)
        const relativeOffset = new THREE.Vector3(0, 2, -3);
        // Apply rotation only
        const rotatedOffset = relativeOffset.clone().applyQuaternion(this.model.quaternion);

        // Add position manually
        const cameraOffset = this.model.position.clone().add(rotatedOffset);

        // Smoothly follow the player
        this.camera.position.lerp(cameraOffset, 0.1); 
        this.camera.lookAt(this.model.position.x, this.model.position.y + 1.5, this.model.position.z);
    }

    dispose() {
        this.stopMovementSounds();
    }
}
