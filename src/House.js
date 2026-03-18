import * as THREE from 'three';
import ButtonHandler from './ButtonHandler.js';
import TextHandler from './TextHandler.js';

export default class House {
    static sharedResources = null;

    constructor(scene, options = {}) {
        this.scene = scene;
        this.textureLoader = options.textureLoader || new THREE.TextureLoader();
        this.shared = House.getSharedResources(this.textureLoader);
        this.position = options.position || new THREE.Vector3(0, 0, 0);
        this.camera = options.camera || null;
        this.renderer = options.renderer || null;
        this.audioHandler = options.audioHandler || null;

        this.infoButton = null;
        this.infoText = null;
        this.pendingButtonText = null;
        this.pendingTextContent = null;

        const rotation = options.rotation || new THREE.Euler(0, 0, 0);
        this.rotation = this.normalizeRotation(rotation);

        this.house = new THREE.Group();
        this.walls = null;
        this.roof = null;
        this.door = null;
        this.bushes = [];
        this.doorLight = null;

        this.init();
    }

    init() {
        this.createWalls();
        this.createRoof();
        this.createDoor();
        this.createBushes();
        this.createDoorLight();

        this.house.position.copy(this.position);
        this.house.rotation.copy(this.rotation);
        this.scene.add(this.house);

        this.createDefaultInfoUI();
    }

    normalizeRotation(rotation) {
        if (rotation && rotation.isEuler) {
            // Respect explicit Euler values from main.js exactly as provided.
            return rotation.clone();
        }

        // For plain objects, use degree values for easy manual placement.
        return new THREE.Euler(
            THREE.MathUtils.degToRad(rotation.x || 0),
            THREE.MathUtils.degToRad(rotation.y || 0),
            THREE.MathUtils.degToRad(rotation.z || 0)
        );
    }

    resolveCamera() {
        if (this.camera) {
            return this.camera;
        }

        this.camera = this.scene.children.find((child) => child.isCamera) || null;
        return this.camera;
    }

    createDefaultInfoUI() {
        if (this.infoButton && this.infoText) {
            return;
        }

        const camera = this.resolveCamera();
        if (!camera) {
            return;
        }

        const buttonWorldPosition = this.toWorldPosition(new THREE.Vector3(0, 2, 2.05));
        const textWorldPosition = this.toWorldPosition(new THREE.Vector3(0, 2.5, 3));
        const worldRotationDeg = this.toWorldRotationDeg({ x: 0, y: 0, z: 0 });

        this.infoButton = new ButtonHandler(
            this.scene,
            camera,
            this.renderer,
            buttonWorldPosition,
            worldRotationDeg
        );

        if (this.audioHandler) {
            this.infoButton.setAudioHandler(this.audioHandler);
        }

        this.infoText = new TextHandler(
            this.scene,
            camera,
            this.renderer,
            textWorldPosition,
            worldRotationDeg
        );

        this.infoText.close();
        this.infoButton.clickCallback = () => {
            this.infoText.open();
        };

        if (this.pendingButtonText !== null) {
            this.infoButton.setText(this.pendingButtonText);
        }

        if (this.pendingTextContent !== null) {
            this.infoText.setText(this.pendingTextContent);
        }
    }

    toWorldPosition(localPosition) {
        return localPosition.clone().applyEuler(this.rotation).add(this.position);
    }

    toWorldRotationDeg(localRotationDeg) {
        return {
            x: THREE.MathUtils.radToDeg(this.rotation.x) + (localRotationDeg.x || 0),
            y: THREE.MathUtils.radToDeg(this.rotation.y) + (localRotationDeg.y || 0),
            z: THREE.MathUtils.radToDeg(this.rotation.z) + (localRotationDeg.z || 0)
        };
    }

    setButtonText(content) {
        this.pendingButtonText = content;
        if (!this.infoButton) {
            this.createDefaultInfoUI();
        }

        if (this.infoButton) {
            this.infoButton.setText(content);
        }
    }

    setTextContent(content) {
        this.pendingTextContent = content;
        if (!this.infoText) {
            this.createDefaultInfoUI();
        }

        if (this.infoText) {
            this.infoText.setText(content);
        }
    }

    createWalls() {
        this.walls = new THREE.Mesh(
            this.shared.geometries.wall,
            this.shared.materials.wall
        );
        this.walls.position.y = 2.5 / 2;
        this.house.add(this.walls);
    }

    createRoof() {
        this.roof = new THREE.Mesh(
            this.shared.geometries.roof,
            this.shared.materials.roof
        );
        this.roof.position.y = 2.5 + 0.5;
        this.roof.rotation.y = Math.PI / 4;
        this.house.add(this.roof);
    }

    createDoor() {
        this.door = new THREE.Mesh(
            this.shared.geometries.door,
            this.shared.materials.door
        );
        this.door.position.z = 2 + 0.01;
        this.door.position.y = 1;
        this.house.add(this.door);
    }

    createBushes() {
        const bushData = [
            { pos: [1.8, 0.2, 2.2], scale: 0.5, rotX: -0.75, rotZ: 0 },
            { pos: [2.5, 0.2, 2.4], scale: 0.3, rotX: 0, rotZ: 0.97 },
            { pos: [-2.5, 0.2, 2.2], scale: 0.4, rotX: 0, rotZ: 1.598 },
            { pos: [-3.1, 0.2, 2.4], scale: 0.3, rotX: 2.68, rotZ: 0.83 },
            { pos: [-2, 0.1, 2.3], scale: 0.25, rotX: -1, rotZ: 0 }
        ];

        bushData.forEach((entry) => {
            const bush = new THREE.Mesh(this.shared.geometries.bush, this.shared.materials.bush);
            bush.position.set(entry.pos[0], entry.pos[1], entry.pos[2]);
            bush.scale.setScalar(entry.scale);
            bush.rotation.x = entry.rotX;
            bush.rotation.z = entry.rotZ;
            this.house.add(bush);
            this.bushes.push(bush);
        });
    }

    static getSharedResources(textureLoader) {
        if (House.sharedResources) {
            return House.sharedResources;
        }

        const textures = House.loadTextures(textureLoader);

        const materials = {
            wall: new THREE.MeshStandardMaterial({
                map: textures.wallColor,
                aoMap: textures.wallARM,
                roughnessMap: textures.wallARM,
                metalnessMap: textures.wallARM,
                normalMap: textures.wallNormal
            }),
            roof: new THREE.MeshStandardMaterial({
                map: textures.roofColor,
                aoMap: textures.roofARM,
                roughnessMap: textures.roofARM,
                metalnessMap: textures.roofARM,
                normalMap: textures.roofNormal
            }),
            door: new THREE.MeshStandardMaterial({
                alphaMap: textures.doorAlpha,
                transparent: true,
                map: textures.doorColor,
                aoMap: textures.doorAO,
                roughnessMap: textures.doorRoughness,
                metalnessMap: textures.doorMetalness,
                displacementMap: textures.doorHeight,
                normalMap: textures.doorNormal
            }),
            bush: new THREE.MeshStandardMaterial({
                color: '#ccffcc',
                map: textures.bushColor,
                aoMap: textures.bushARM,
                roughnessMap: textures.bushARM,
                metalnessMap: textures.bushARM,
                normalMap: textures.bushNormal
            })
        };

        const geometries = {
            wall: new THREE.BoxGeometry(4, 2.5, 4),
            roof: new THREE.ConeGeometry(3.5, 1, 4),
            door: new THREE.PlaneGeometry(2.2, 2.2),
            bush: new THREE.SphereGeometry(1, 16, 16)
        };

        House.sharedResources = { textures, materials, geometries };
        return House.sharedResources;
    }

    static loadTextures(textureLoader) {
        const textures = {
            wallColor: textureLoader.load('./textures/wall/castle_brick_broken_06_1k/castle_brick_broken_06_diff_1k.jpg'),
            wallARM: textureLoader.load('./textures/wall/castle_brick_broken_06_1k/castle_brick_broken_06_arm_1k.jpg'),
            wallNormal: textureLoader.load('./textures/wall/castle_brick_broken_06_1k/castle_brick_broken_06_nor_gl_1k.jpg'),
            roofColor: textureLoader.load('./textures/roof/roof_slates_02_1k/roof_slates_02_diff_1k.jpg'),
            roofARM: textureLoader.load('./textures/roof/roof_slates_02_1k/roof_slates_02_arm_1k.jpg'),
            roofNormal: textureLoader.load('./textures/roof/roof_slates_02_1k/roof_slates_02_nor_gl_1k.jpg'),
            doorAlpha: textureLoader.load('./textures/door/alpha.jpg'),
            doorColor: textureLoader.load('./textures/door/color.jpg'),
            doorAO: textureLoader.load('./textures/door/ambientOcclusion.jpg'),
            doorRoughness: textureLoader.load('./textures/door/roughness.jpg'),
            doorMetalness: textureLoader.load('./textures/door/metalness.jpg'),
            doorNormal: textureLoader.load('./textures/door/normal.jpg'),
            doorHeight: textureLoader.load('./textures/door/height.jpg'),
            bushColor: textureLoader.load('./textures/bush/leaves_forest_ground_1k/leaves_forest_ground_diff_1k.jpg'),
            bushARM: textureLoader.load('./textures/bush/leaves_forest_ground_1k/leaves_forest_ground_arm_1k.jpg'),
            bushNormal: textureLoader.load('./textures/bush/leaves_forest_ground_1k/leaves_forest_ground_nor_gl_1k.jpg')
        };

        textures.wallColor.colorSpace = THREE.SRGBColorSpace;
        textures.roofColor.colorSpace = THREE.SRGBColorSpace;
        textures.doorColor.colorSpace = THREE.SRGBColorSpace;
        textures.bushColor.colorSpace = THREE.SRGBColorSpace;

        textures.roofColor.repeat.set(3, 1);
        textures.roofARM.repeat.set(3, 1);
        textures.roofNormal.repeat.set(3, 1);
        textures.roofColor.wrapS = THREE.RepeatWrapping;
        textures.roofARM.wrapS = THREE.RepeatWrapping;
        textures.roofNormal.wrapS = THREE.RepeatWrapping;

        textures.bushColor.repeat.set(2, 1);
        textures.bushARM.repeat.set(2, 1);
        textures.bushNormal.repeat.set(2, 1);
        textures.bushColor.wrapS = THREE.RepeatWrapping;
        textures.bushARM.wrapS = THREE.RepeatWrapping;
        textures.bushNormal.wrapS = THREE.RepeatWrapping;

        return textures;
    }

    static releaseSharedResources() {
        if (!House.sharedResources) {
            return;
        }

        const { textures, materials, geometries } = House.sharedResources;

        Object.values(textures).forEach((texture) => {
            if (texture) {
                texture.dispose();
            }
        });

        Object.values(materials).forEach((material) => {
            if (material) {
                material.dispose();
            }
        });

        Object.values(geometries).forEach((geometry) => {
            if (geometry) {
                geometry.dispose();
            }
        });

        House.sharedResources = null;
    }

    createDoorLight() {
        this.doorLight = new THREE.PointLight('#ff7d46', 5);
        this.doorLight.position.set(0, 2.2, 2.5);
        this.house.add(this.doorLight);
    }

    setShadows(enabled = true) {
        if (this.walls) {
            this.walls.castShadow = enabled;
            this.walls.receiveShadow = enabled;
        }

        if (this.roof) {
            this.roof.castShadow = enabled;
        }

        if (this.door) {
            this.door.castShadow = enabled;
            this.door.receiveShadow = enabled;
        }

        this.bushes.forEach((bush) => {
            bush.castShadow = enabled;
            bush.receiveShadow = enabled;
        });
    }

    dispose() {
        if (this.infoButton && this.infoButton.container && this.infoButton.container.parent) {
            this.infoButton.container.parent.remove(this.infoButton.container);
        }

        if (this.infoText && this.infoText.container && this.infoText.container.parent) {
            this.infoText.container.parent.remove(this.infoText.container);
        }

        this.infoButton = null;
        this.infoText = null;

        if (this.doorLight) {
            this.house.remove(this.doorLight);
            this.doorLight.dispose();
            this.doorLight = null;
        }

        if (this.scene && this.house) {
            this.scene.remove(this.house);
        }

        this.bushes.length = 0;
        this.walls = null;
        this.roof = null;
        this.door = null;
        this.house = null;
    }
}