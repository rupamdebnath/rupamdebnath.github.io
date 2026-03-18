import * as THREE from 'three';
//import GUI from 'lil-gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Sky } from 'three/examples/jsm/Addons.js';
import ButtonHandler from './ButtonHandler.js';
import PlayerController from './PlayerController.js';
import House from './House.js';
import ThreeMeshUI from 'three-mesh-ui';
import TextHandler from './TextHandler.js';

const scene = new THREE.Scene();
//const gui = new GUI();

//Sky
const sky = new Sky();
sky.material.uniforms['turbidity'].value = 10;
sky.material.uniforms['rayleigh'].value = 3;
sky.material.uniforms['mieCoefficient'].value = 0.1;
sky.material.uniforms['mieDirectionalG'].value = 0.95;
sky.material.uniforms['sunPosition'].value.set(7, -0.4, -15);
sky.scale.setScalar(100);
scene.add(sky);

//Canvas
const canvas = document.querySelector('canvas.webgl');

//Screen-space controls helper (always visible)
const controlsHelper = document.createElement('div');
controlsHelper.className = 'controls-helper';
controlsHelper.innerHTML = `
    <h3>Controls</h3>
    <p>Use W, A, S, D to control the fox.</p>
    <p>Hold Shift to sprint.</p>
    <p>Click the blue buttons with the mouse to interact.</p>
`;
document.body.appendChild(controlsHelper);

const contactOverlay = document.createElement('div');
contactOverlay.className = 'contact-overlay';
contactOverlay.innerHTML = `
    <div class="contact-overlay-card" role="dialog" aria-modal="true" aria-label="Contact links">
        <button class="contact-overlay-close" type="button" aria-label="Close contact overlay">Close</button>
        <h3>Contact</h3>
        <a href="https://www.linkedin.com/in/devrupam" target="_blank" rel="noopener noreferrer">Open LinkedIn Profile</a>
    </div>
`;
document.body.appendChild(contactOverlay);

const closeContactOverlayButton = contactOverlay.querySelector('.contact-overlay-close');
const closeContactOverlay = () => {
    contactOverlay.classList.remove('is-visible');
};

if (closeContactOverlayButton) {
    closeContactOverlayButton.addEventListener('click', closeContactOverlay);
}

//Texture Loader
const textureLoader = new THREE.TextureLoader();
const floorAlphaTexture = textureLoader.load('./textures/floor/alpha.jpg');
const floorColorTexture = textureLoader.load('./textures/floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_diff_1k.jpg');
const floorARMTexture = textureLoader.load('./textures/floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_arm_1k.jpg');
const floorNormalTexture = textureLoader.load('./textures/floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_nor_gl_1k.jpg');
const floorDisplacementTexture = textureLoader.load('./textures/floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_disp_1k.jpg');

floorColorTexture.colorSpace = THREE.SRGBColorSpace;

floorColorTexture.repeat.set(8, 8);
floorARMTexture.repeat.set(8, 8);
floorNormalTexture.repeat.set(8, 8);
floorDisplacementTexture.repeat.set(8, 8);

floorColorTexture.wrapS = THREE.RepeatWrapping;
floorARMTexture.wrapS = THREE.RepeatWrapping;
floorNormalTexture.wrapS = THREE.RepeatWrapping;
floorDisplacementTexture.wrapS = THREE.RepeatWrapping;

floorColorTexture.wrapT = THREE.RepeatWrapping;
floorARMTexture.wrapT = THREE.RepeatWrapping;
floorNormalTexture.wrapT = THREE.RepeatWrapping;
floorDisplacementTexture.wrapT = THREE.RepeatWrapping;

//Floor
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100, 100, 100),
    new THREE.MeshStandardMaterial({ 
        alphaMap: floorAlphaTexture,
        transparent: true,
        map: floorColorTexture,
        aoMap: floorARMTexture,
        roughnessMap: floorARMTexture,
        metalnessMap: floorARMTexture,
        normalMap: floorNormalTexture,
        displacementMap: floorDisplacementTexture,
        displacementScale: 0.3,
        displacementBias: -0.2
    })
);
scene.add(floor);
floor.rotation.x = - Math.PI * 0.5; 

//Light
const ambientLight = new THREE.AmbientLight('#86cdff', 0.275); // White light, full intensity
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2); // White light, full intensity
directionalLight.position.set(3, 2, -50);
directionalLight.target.position.set(0, 0, 0);
scene.add(directionalLight.target);
scene.add(directionalLight);

//Circling lights
const clight1 = new THREE.PointLight('#8800ff', 6);
const clight2 = new THREE.PointLight('#ff0088', 6);
const clight3 = new THREE.PointLight('#ff0000', 6);
scene.add(clight1, clight2, clight3);

// Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

//Camera
const camera = new THREE.PerspectiveCamera( 75, sizes.width / sizes.height, 0.1, 1000 );
scene.add( camera );

//ShadowMapping
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
directionalLight.shadow.camera.top = 35;
directionalLight.shadow.camera.right = 35;
directionalLight.shadow.camera.bottom = -35;
directionalLight.shadow.camera.left = -35;
directionalLight.shadow.camera.near = 1;
directionalLight.shadow.camera.far = 80;

//Fog
scene.fog = new THREE.FogExp2('#02343f', 0.01);

clight1.shadow.mapSize.width = 256;
clight1.shadow.mapSize.height = 256;
clight1.shadow.camera.far = 10;

//Controls
const controls = new OrbitControls( camera, canvas );
controls.enableDamping = true; // Adds inertia to the controls

//Renderer
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize( sizes.width, sizes.height );
renderer.outputColorSpace = THREE.SRGBColorSpace;

//Resizing
window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
//shadows
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
directionalLight.castShadow = true;
floor.receiveShadow = true;

const rotDeg = (x = 0, y = 0, z = 0) => ({ x, y, z });

//Houses
const houses = [
    new House(scene, {
        textureLoader,
        position: new THREE.Vector3(0, 0, 0),
        rotation: rotDeg(0, 0, 0)
    }),
    new House(scene, {
        textureLoader,
        position: new THREE.Vector3(20, 0, 10),
        rotation: rotDeg(0, -60, 0)
    }),
    new House(scene, {
        textureLoader,
        position: new THREE.Vector3(-20, 0, 10),
        rotation: rotDeg(0, 60, 0)
    }),
        new House(scene, {
        textureLoader,
        position: new THREE.Vector3(20, 0, -10),
        rotation: rotDeg(0, -45, 0)
    }),
    new House(scene, {
        textureLoader,
        position: new THREE.Vector3(-20, 0, -10),
        rotation: rotDeg(0, 45, 0)
    })
];

houses.forEach((houseInstance) => {
    houseInstance.setShadows(true);
});

houses[0].setButtonText("About Me");
houses[0].setTextContent(`Hello! My name is Rupam Debnath. 
    Welcome to my World!
    

    I'm a 3D enthusiast with experience in Game Programming using Unity, C# and C++. 
    I was born and raised in India, currently living in Essen, Germany.
    I have been playing games since Super Mario on the NES in the 90s, continuing till date with consoles, PC and Oculus Quest VR.
    I have a strong passion for creating immersive 3D experiences and am currently exploring the capabilities of Three.js to bring my ideas to life.
    Check out the other houses for more details and background about me.`);

houses[1].setButtonText("Work Experience");
houses[1].setTextContent(`- Lead Unity Developer at RealityArc Systems, Bangalore, India (Aug 2025 - Feb 2026)
    - Unity XR Developer at CUSMAT Technologies, Bangalore, India (Dec 2022 - Jun 2024)
    - IT Support Engineer at Xtreme Productivity, Melbourne, Australia (Mar 2019 - Aug 2021)
    - Software Test Engineer at Infosys, Bangalore, India (Feb 2015 - Dec 2016)
    - Software Test Engineer at Laresen and Toubro Infotech, Pune, India (Jul 2012 - Dec 2014)`);

houses[2].setButtonText("Education");
houses[2].setTextContent(`- Bachelor's degree in Mechanical Engineering from Anna University, India
    - Master's degree in IT (Virtual and Augmented Reality specialization) from Deakin University, Melbourne, Australia
    - Currently pursuing the core curriculum of Computer Science at 42Berlin, Berlin, Germany`);

houses[3].setButtonText("Skills");
houses[3].setTextContent(`- Proficient in C, C#, C++, and JavaScript
- Experience with Unity for game development
- Familiarity with 3D modeling and animation.
- Git version control, including PlasticSCM for Unity`);

houses[4].setButtonText("Contact");
houses[4].setTextContent(`Email - rdebmail@gmail.com


    LinkedIn - https://www.linkedin.com/in/devrupam


    github - https://github.com/rupamdebnath`);

if (houses[4].infoButton && houses[4].infoText) {
    houses[4].infoButton.clickCallback = () => {
        houses[4].infoText.open();
        contactOverlay.classList.add('is-visible');
    };
}

let hasDisposedScene = false;

function disposeScene() {
    if (hasDisposedScene) {
        return;
    }
    hasDisposedScene = true;

    renderer.setAnimationLoop(null);

    houses.forEach((houseInstance) => {
        houseInstance.dispose();
    });
    House.releaseSharedResources();

    if (controlsHelper && controlsHelper.parentNode) {
        controlsHelper.parentNode.removeChild(controlsHelper);
    }

    if (contactOverlay && contactOverlay.parentNode) {
        contactOverlay.parentNode.removeChild(contactOverlay);
    }

    controls.dispose();
    renderer.dispose();
}

window.addEventListener('beforeunload', disposeScene);

//light rotation
const radius = 5; 
const speed = 0.001; 

//Fox Model
const player = new PlayerController(scene, camera, './models/Fox.glb', (model) => {
    model.scale.setScalar(0.01);
    model.position.set(0, -0.1, 6);
    model.rotation.y = Math.PI; 
});

const timer = new THREE.Timer()

function animate( time ) 
{
    timer.update(time);
    const deltaTime = timer.getDelta(); 
    controls.update();
    if (player) {
        player.update(deltaTime);
    }
    const angle = time * speed;
    clight1.position.x = Math.cos(angle) * radius;
    clight1.position.z = Math.sin(angle) * radius;
    clight1.position.y = 1 + Math.sin(angle * 2) * 0.5; // Vertical oscillation
    ThreeMeshUI.update();
    renderer.render( scene, camera );
}
renderer.setAnimationLoop( animate );