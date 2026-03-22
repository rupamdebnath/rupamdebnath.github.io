import * as THREE from 'three';
//import GUI from 'lil-gui';
import ModelHandler from './ModelHandler.js';

export default class PropsPlacement {
    constructor(scene) {
        this.scene = scene;
        this.loadProps();
    }

    loadProps() {
        //const gui = new GUI();
        //Props
        const fence1 = new ModelHandler(this.scene, './models/props/Fence1.glb', (model) => {
            model.position.set(2, -2.2, 2.5);
            model.scale.setScalar(0.1);
        });

        const fence2 = new ModelHandler(this.scene, './models/props/Fence2.glb', (model) => {
            model.position.set(0, -3.5, 14);
            model.scale.setScalar(0.1);
        });

        const campfire = new ModelHandler(this.scene, './models/props/Campfire1.glb', (model) => {
            model.position.set(4.3, -3, 6.5);
            model.scale.setScalar(0.1);
        });

        const tree1 = new ModelHandler(this.scene, './models/props/Thintree1.glb', (model) => {
            model.position.set(-20.5, 6, 4.8);
            model.scale.setScalar(0.1);
        });

        const tree2 = new ModelHandler(this.scene, './models/props/Thintree2.glb', (model) => {
            model.position.set(20.5, -17, 16);
            model.scale.setScalar(0.1);
        });

        const tree3 = new ModelHandler(this.scene, './models/props/Pinetree1.glb', (model) => {
            model.position.set(10.5, 6, 16);
            model.scale.setScalar(0.1);
        });

        const tree4 = new ModelHandler(this.scene, './models/props/Pinetree2.glb', (model) => {
            model.position.set(-25.5, 8, -16);
            model.scale.setScalar(0.1);
        });

        const tree5 = new ModelHandler(this.scene, './models/props/Pinetree3.glb', (model) => {
            model.position.set(25, 9, -16);
            model.scale.setScalar(0.1);
            /*
            gui.add(model.position, 'x', -100, 100, 0.1).name('Fence X');
            gui.add(model.position, 'y', -100, 100, 0.1).name('Fence Y');
            gui.add(model.position, 'z', -100, 100, 0.1).name('Fence Z');*/
        });

        const tree6 = new ModelHandler(this.scene, './models/props/Pinetree4.glb', (model) => {
            model.position.set(42, 8.8, -20);
            model.scale.setScalar(0.1);
        });

        const stump1 = new ModelHandler(this.scene, './models/props/TreeStump1.glb', (model) => {
            model.position.set(5, 6.7, 5);
            model.scale.setScalar(0.1);
        });

        const stump2 = new ModelHandler(this.scene, './models/props/TreeStump2.glb', (model) => {
            model.position.set(-5, 6.6, 2);
            model.scale.setScalar(0.1);
        });

        const stump3 = new ModelHandler(this.scene, './models/props/TreeStump3.glb', (model) => {
            model.position.set(20, 9, -30);
            model.scale.setScalar(0.1);
        });

        const stump4 = new ModelHandler(this.scene, './models/props/TreeStump4.glb', (model) => {
            model.position.set(0, 12.8, -38);
            model.scale.setScalar(0.1);
        });

        const log1 = new ModelHandler(this.scene, './models/props/Log1.glb', (model) => {
            model.position.set(10, 6.5, 3);
            model.scale.setScalar(0.1);
        });

        const log2 = new ModelHandler(this.scene, './models/props/Log2.glb', (model) => {
            model.position.set(-10, 6.5, 4);
            model.scale.setScalar(0.1);
        });

        const log3 = new ModelHandler(this.scene, './models/props/Log3.glb', (model) => {
            model.position.set(20, 9, -30);
            model.scale.setScalar(0.1);
        });

        const log4 = new ModelHandler(this.scene, './models/props/Log4.glb', (model) => {
            model.position.set(0, 12.8, -38);
            model.scale.setScalar(0.1);
        });

        const log5 = new ModelHandler(this.scene, './models/props/Log5.glb', (model) => {
            model.position.set(0, 12.8, -38);
            model.scale.setScalar(0.1);
        });
    }
}