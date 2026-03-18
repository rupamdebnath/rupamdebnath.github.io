import * as THREE from 'three';
import ThreeMeshUI from 'three-mesh-ui';

export default class ButtonHandler {
    constructor(scene, camera, renderer, position = new THREE.Vector3(0, 0, 0), rotation) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;

        this.position = position;
        this.rotation = new THREE.Euler(
        THREE.MathUtils.degToRad(rotation.x),
        THREE.MathUtils.degToRad(rotation.y),
        THREE.MathUtils.degToRad(rotation.z)
        );

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        this.audioHandler = null;
        this.clickCallback = () => {};

        this.init();
        this.setupEvents();
    }

    init() {
        this.container = new ThreeMeshUI.Block({
            width: 1.2,
            height: 0.5,
            padding: 0.05,
            justifyContent: 'center',
            alignItems: 'center',
            fontFamily: 'https://unpkg.com/three-mesh-ui/examples/assets/Roboto-msdf.json',
            fontTexture: 'https://unpkg.com/three-mesh-ui/examples/assets/Roboto-msdf.png',
            backgroundColor: new THREE.Color(0x222222),
            backgroundOpacity: 0.8,
        });

        // Set position from constructor
        this.container.position.copy(this.position);
        this.container.rotation.copy(this.rotation);

        this.scene.add(this.container);

        // Button
        this.button = new ThreeMeshUI.Block({
            width: 1,
            height: 0.3,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: new THREE.Color(0x6666ff)
        });

        // Text
        this.text = new ThreeMeshUI.Text({
            content: "Click Me",
            fontSize: 0.15
        });

        this.button.add(this.text);
        this.container.add(this.button);
    }

    setupEvents() {
        window.addEventListener('click', (event) => this.onClick(event));
        window.addEventListener('mousemove', (event) => this.onHover(event));
    }

    setText(content) {
        this.text.set({ content });
    }

    setAudioHandler(audioHandler) {
        this.audioHandler = audioHandler;
    }

    getMouse(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    onClick(event) {
        this.getMouse(event);

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObject(this.button, true);

        if (intersects.length > 0) {
            this.button.set({
                backgroundColor: new THREE.Color(0xff0000)
            });
            
            // Play door sound if audio handler is available
            if (this.audioHandler) {
                this.audioHandler.playDoorSound();
            }
            
            this.clickCallback();
        }
    }

    onHover(event) {
        this.getMouse(event);

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObject(this.button, true);

        if (intersects.length > 0) {
            this.button.set({
                backgroundColor: new THREE.Color(0x9999ff)
            });
        } else {
            this.button.set({
                backgroundColor: new THREE.Color(0x6666ff)
            });
        }
    }
}