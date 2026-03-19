/*
Copyright [2026] [Rupam Debnath]
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
*/

import * as THREE from 'three';
//import GUI from 'lil-gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Sky } from 'three/examples/jsm/Addons.js';
import { CSS3DRenderer } from 'three/addons/renderers/CSS3DRenderer.js';
import PlayerController from './PlayerController.js';
import House from './House.js';
import ThreeMeshUI from 'three-mesh-ui';
import AudioHandler from './AudioHandler.js';
import VideoHandler from './VideoHandler.js';

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

//Screen-space controls helper
const controlsHelper = document.createElement('div');
controlsHelper.className = 'controls-helper';
controlsHelper.innerHTML = `
    <h3>Controls</h3>
    <p>Use W, A, S, D to control the fox.</p>
    <p>Use the joystick in case of phone browser.</p>
    <p>Hold Shift to sprint.</p>
    <p>Click the blue buttons with the mouse to interact.</p>
    <button class="controls-music-toggle" id="music-toggle-btn" type="button">Music: ON</button>
`;
document.body.appendChild(controlsHelper);

//For mobile controls joystick and run
const mobileControls = document.createElement('div');
mobileControls.className = 'mobile-controls';
mobileControls.innerHTML = `
    <div class="mobile-joystick" id="mobile-joystick" aria-label="Movement joystick">
        <div class="mobile-joystick-knob" id="mobile-joystick-knob"></div>
    </div>
    <button class="mobile-btn mobile-btn-run" type="button" id="mobile-run-btn">Run</button>
`;
document.body.appendChild(mobileControls);

const isTouchDevice =
    ('ontouchstart' in window) ||
    (navigator.maxTouchPoints > 0) ||
    window.matchMedia('(pointer: coarse)').matches;

if (isTouchDevice) {
    mobileControls.classList.add('is-visible');
}

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

//CSS3D Renderer for videos
const css3dRenderer = new CSS3DRenderer();
css3dRenderer.setSize(window.innerWidth, window.innerHeight);
css3dRenderer.domElement.className = 'css3d-layer';
document.body.appendChild(css3dRenderer.domElement);

//Audio Handler
const audioHandler = new AudioHandler(scene, camera, './audio/nightsound');
audioHandler.loadBackgroundMusic('./audio/nightsound');
audioHandler.loadDoorSound('./audio/door');

const musicToggleButton = document.getElementById('music-toggle-btn');

if (musicToggleButton) {
    const updateMusicButtonLabel = () => {
        musicToggleButton.textContent = audioHandler.isBackgroundMusicPlaying() ? 'Music: ON' : 'Music: OFF';
    };

    musicToggleButton.addEventListener('click', async () => {
        await audioHandler.toggleBackgroundMusic();
        updateMusicButtonLabel();
    });

    // Sync label after load/autoplay resolves.
    setTimeout(updateMusicButtonLabel, 400);
}

//*
//Videos
//
const videoHandler1 = new VideoHandler(scene, camera, { renderer: css3dRenderer });
videoHandler1.addYouTubeScreen({
    videoId: 'OkSgA-h6T_g',
    position: new THREE.Vector3(-5, 1, 0),
    rotation: { x: 0, y: 0, z: 0 },
    width: 1280,
    height: 720,
    worldScale: 0.0025,
    mute: 1
});
videoHandler1.addText(renderer, `- This is a VR experience simulating Excavator
    - Custom hardware using Arduino Inputs
    - Data Analytics using JSON files and python scripts
    - NWH Vehicle Physics plugin for Unity
    - Meta Quest 2 integration`);

const videoHandler2 = new VideoHandler(scene, camera, { renderer: css3dRenderer });
videoHandler2.addYouTubeScreen({
    videoId: 'z5sBe9x4MQ4',
    position: new THREE.Vector3(5, 1, 0),
    rotation: { x: 0, y: 0, z: 0 },
    width: 1280,
    height: 720,
    worldScale: 0.0025,
    mute: 1
});
videoHandler2.addText(renderer, `- A VR experience on Meta Quest 2
    - APK build as required by Quest Store submission
    - World Canvas UI for VR interactions
    - Firebase backend for user analytics`);

const videoHandler3 = new VideoHandler(scene, camera, { renderer: css3dRenderer });
videoHandler3.addYouTubeScreen({
    videoId: 'kt3lBWyDWr4',
    position: new THREE.Vector3(-20, 1, 0),
    rotation: { x: 0, y: 60, z: 0 },
    width: 1280,
    height: 720,
    worldScale: 0.0025,
    mute: 1
});
videoHandler3.addText(renderer, `- A VR experience on Meta Quest 2
    - Windows build with wired Quest Link and Air Link support
    - Thrustmaster hardware for gears, steering wheel and pedals
    - Vehicle Navigation system using waypoints and minimap RenderTexture
    - State system for instructions in order and triggering events`);

const videoHandler4 = new VideoHandler(scene, camera, { renderer: css3dRenderer });
videoHandler4.addYouTubeScreen({
    videoId: 'XO_xTD_JfwI',
    position: new THREE.Vector3(20, 1, 0),
    rotation: { x: 0, y: -60, z: 0 },
    width: 1280,
    height: 720,
    worldScale: 0.0025,
    mute: 1
});
videoHandler4.addText(renderer, `- Accurate Physics simulation of a crane system
    - Rigidbodies and Joints Used for realistic movement
    - Custom hardware using Arduino Inputs
    - Accuracy to real world physics was a key requirement`);

const videoHandler5 = new VideoHandler(scene, camera, { renderer: css3dRenderer });
videoHandler5.addYouTubeScreen({
    videoId: 'lzS9ngEzByA',
    position: new THREE.Vector3(10, 1, -4),
    rotation: { x: 0, y: -30, z: 0 },
    width: 1280,
    height: 720,
    worldScale: 0.0025,
    mute: 1
});
videoHandler5.addText(renderer, `- Realistic liquid simulation
    - Zebra Liquid plugin for Unity used for accurate fluid dynamics
    - Liquid should simulate read world molten metal pouring and filling of containers`);

const videoHandler6 = new VideoHandler(scene, camera, { renderer: css3dRenderer });
videoHandler6.addYouTubeScreen({
    videoId: 'CxssugdHCzc',
    position: new THREE.Vector3(-10, 1, -4),
    rotation: { x: 0, y: 30, z: 0 },
    width: 1280,
    height: 720,
    worldScale: 0.0025,
    mute: 1
});
videoHandler6.addText(renderer, `- A VR experience on Meta Quest 2
    - Realistic Screwdriver mechanics
    - Oculus SDK for hand tracking, grabbing and interactions
    - Object Snap mechanics`);

const videoHandler7 = new VideoHandler(scene, camera, { renderer: css3dRenderer });
videoHandler7.addYouTubeScreen({
    videoId: 'SNjSbJAKCgk',
    position: new THREE.Vector3(-15, 1, 5),
    rotation: { x: 0, y: 60, z: 0 },
    width: 1280,
    height: 720,
    worldScale: 0.0025,
    mute: 1
});
videoHandler7.addText(renderer, `- Wire Rope mechanics in VR
    - Obi Rope plugin for Unity used for realistic rope physics
    - Joints and Colliders for interactions with the rope
    - Real World Crane system simulation with accurate physics`);

const videoHandler8 = new VideoHandler(scene, camera, { renderer: css3dRenderer });
videoHandler8.addYouTubeScreen({
    videoId: 'RFiL0bO9kkg',
    position: new THREE.Vector3(15, 1, 5),
    rotation: { x: 0, y: -60, z: 0 },
    width: 1280,
    height: 720,
    worldScale: 0.0025,
    mute: 1
});
videoHandler8.addText(renderer, `- Perfect example of different joints in Unity
    - Realistic Crane Grabber mechanics
    - Similar to how a claw machine works in real life to grab toys
    - It was quite a challenging project to get the physics and interactions right`);

const videoHandler9 = new VideoHandler(scene, camera, { renderer: css3dRenderer });
videoHandler9.addYouTubeScreen({
    videoId: 'hL3WFsaw8Hg',
    position: new THREE.Vector3(10, 1, 15),
    rotation: { x: 0, y: -15, z: 0 },
    width: 1280,
    height: 720,
    worldScale: 0.0025,
    mute: 1
});
videoHandler9.addText(renderer, `- PC simulation of Dynapac Roller
    - A lot of custom Hardware was used
    - One Input changes multiple parameters of the machine
    - Hence, an Observer Architectural Pattern was used`);

const videoHandler10 = new VideoHandler(scene, camera, { renderer: css3dRenderer });
videoHandler10.addYouTubeScreen({
    videoId: '38lvDAo2Gkc',
    position: new THREE.Vector3(-10, 1, 15),
    rotation: { x: 0, y: 15, z: 0 },
    width: 1280,
    height: 720,
    worldScale: 0.0025,
    mute: 1
});
videoHandler10.addText(renderer, `- My very first 3D game in Unity, hence close to my heart
    - Although not the best in terms of graphics and gameplay, it was a great learning experience
    - It was made for Android phones with touch controls, hence the simple mechanics and graphics
    - State machine, basic Nav AI, Scriptable Objects were key features`);


//Resizing
window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
    renderer.setSize(sizes.width, sizes.height);
    css3dRenderer.setSize(sizes.width, sizes.height);
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
        rotation: rotDeg(0, 0, 0),
        audioHandler
    }),
    new House(scene, {
        textureLoader,
        position: new THREE.Vector3(20, 0, 10),
        rotation: rotDeg(0, -60, 0),
        audioHandler
    }),
    new House(scene, {
        textureLoader,
        position: new THREE.Vector3(-20, 0, 10),
        rotation: rotDeg(0, 60, 0),
        audioHandler
    }),
        new House(scene, {
        textureLoader,
        position: new THREE.Vector3(20, 0, -10),
        rotation: rotDeg(0, -45, 0),
        audioHandler
    }),
    new House(scene, {
        textureLoader,
        position: new THREE.Vector3(-20, 0, -10),
        rotation: rotDeg(0, 45, 0),
        audioHandler
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
houses[3].setTextContent(`- Proficient in C, C#
- Intermediate knowledge of C++, JavaScript, Python
- Experience with Unity Engine for game development
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

    if (mobileControls && mobileControls.parentNode) {
        mobileControls.parentNode.removeChild(mobileControls);
    }

    controls.dispose();
    if (player && typeof player.dispose === 'function') {
        player.dispose();
    }
    audioHandler.dispose();
    videoHandler.dispose();
    renderer.dispose();
}

window.addEventListener('beforeunload', disposeScene);

//light rotation
const radius = 5; 
const speed = 0.001; 

//Fox Model
const player = new PlayerController(scene, camera, './models/Fox.glb', (model) => {
    model.scale.setScalar(0.01);
    model.position.set(0, -0.1, 15);
    model.rotation.y = Math.PI; 
}, {
    audioHandler,
    walkSoundPath: './audio/walk.mp3',
    runSoundPath: './audio/walk.mp3'
});

const joystickBase = document.getElementById('mobile-joystick');
const joystickKnob = document.getElementById('mobile-joystick-knob');
const mobileRunButton = document.getElementById('mobile-run-btn');

let joystickPointerId = null;

const resetJoystick = () => {
    player.setAnalogInput(0, 0);
    if (joystickKnob) {
        joystickKnob.style.transform = 'translate(-50%, -50%)';
    }
    joystickPointerId = null;
};

const updateJoystick = (event) => {
    if (!joystickBase || !joystickKnob) {
        return;
    }

    const rect = joystickBase.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const maxRadius = rect.width * 0.35;

    let dx = event.clientX - centerX;
    let dy = event.clientY - centerY;
    const distance = Math.hypot(dx, dy);

    if (distance > maxRadius) {
        const scale = maxRadius / distance;
        dx *= scale;
        dy *= scale;
    }

    const normalizedX = dx / maxRadius;
    const normalizedY = -dy / maxRadius;

    player.setAnalogInput(normalizedX, normalizedY);
    joystickKnob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
};

if (joystickBase) {
    joystickBase.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        joystickPointerId = event.pointerId;
        joystickBase.setPointerCapture(event.pointerId);
        updateJoystick(event);
    });

    joystickBase.addEventListener('pointermove', (event) => {
        if (event.pointerId !== joystickPointerId) {
            return;
        }
        event.preventDefault();
        updateJoystick(event);
    });

    const endJoystick = (event) => {
        if (event.pointerId !== joystickPointerId) {
            return;
        }
        event.preventDefault();
        resetJoystick();
    };

    joystickBase.addEventListener('pointerup', endJoystick);
    joystickBase.addEventListener('pointercancel', endJoystick);
    joystickBase.addEventListener('pointerleave', endJoystick);
}

if (mobileRunButton) {
    const setRunPressed = (pressed, event) => {
        event.preventDefault();
        player.setAnalogRun(pressed);
    };

    mobileRunButton.addEventListener('pointerdown', (event) => setRunPressed(true, event));
    mobileRunButton.addEventListener('pointerup', (event) => setRunPressed(false, event));
    mobileRunButton.addEventListener('pointercancel', (event) => setRunPressed(false, event));
    mobileRunButton.addEventListener('pointerleave', (event) => setRunPressed(false, event));
}

//Timer
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
    css3dRenderer.render( scene, camera );
}
renderer.setAnimationLoop( animate );