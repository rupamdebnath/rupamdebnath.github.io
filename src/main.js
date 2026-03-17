import * as THREE from 'three';
import GUI from 'lil-gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Sky } from 'three/examples/jsm/Addons.js';
import ModelHandler from './ModelHandler.js';

const scene = new THREE.Scene();
const gui = new GUI();

//Sky
const sky = new Sky();
sky.material.uniforms['turbidity'].value = 10;
sky.material.uniforms['rayleigh'].value = 3;
sky.material.uniforms['mieCoefficient'].value = 0.1;
sky.material.uniforms['mieDirectionalG'].value = 0.95;
sky.material.uniforms['sunPosition'].value.set(7, -0.4, -15);
sky.scale.setScalar(100);
scene.add(sky);

//Fox Model
const player = new ModelHandler(scene, './models/Fox.glb', (model) => {
    model.scale.setScalar(0.01);
    model.position.set(0, 0, 5);
    model.rotation.y = Math.PI; 
});

//Canvas
const canvas = document.querySelector('canvas.webgl');

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

//House Container
const house = new THREE.Group();
scene.add(house);

//wall Texture
const wallColorTexture = textureLoader.load('./textures/wall/castle_brick_broken_06_1k/castle_brick_broken_06_diff_1k.jpg');
const wallARMTexture = textureLoader.load('./textures/wall/castle_brick_broken_06_1k/castle_brick_broken_06_arm_1k.jpg');
const wallNormalTexture = textureLoader.load('./textures/wall/castle_brick_broken_06_1k/castle_brick_broken_06_nor_gl_1k.jpg');
wallColorTexture.colorSpace = THREE.SRGBColorSpace;

//Walls
const walls = new THREE.Mesh(
    new THREE.BoxGeometry(4, 2.5, 4),
    new THREE.MeshStandardMaterial({ 
        map: wallColorTexture,
        aoMap: wallARMTexture,
        roughnessMap: wallARMTexture,
        metalnessMap: wallARMTexture,
        normalMap: wallNormalTexture
    })
);
walls.position.y = 2.5 / 2;
house.add(walls);

//Roof Texture
const roofColorTexture = textureLoader.load('./textures/roof/roof_slates_02_1k/roof_slates_02_diff_1k.jpg');
const roofARMTexture = textureLoader.load('./textures/roof/roof_slates_02_1k/roof_slates_02_arm_1k.jpg');
const roofNormalTexture = textureLoader.load('./textures/roof/roof_slates_02_1k/roof_slates_02_nor_gl_1k.jpg');
roofColorTexture.colorSpace = THREE.SRGBColorSpace;

roofColorTexture.repeat.set(3, 1);
roofARMTexture.repeat.set(3, 1);
roofNormalTexture.repeat.set(3, 1);
roofColorTexture.wrapS = THREE.RepeatWrapping;
roofARMTexture.wrapS = THREE.RepeatWrapping;
roofNormalTexture.wrapS = THREE.RepeatWrapping;
//Roof
const roof = new THREE.Mesh(
    new THREE.ConeGeometry(3.5, 1, 4),
    new THREE.MeshStandardMaterial({ 
        map: roofColorTexture,
        aoMap: roofARMTexture,
        roughnessMap: roofARMTexture,
        metalnessMap: roofARMTexture,
        normalMap: roofNormalTexture
    })
);
roof.position.y = 2.5 + 0.5;
roof.rotation.y = Math.PI / 4;
house.add(roof);

//Door texture
const doorAlphaTexture = textureLoader.load('./textures/door/alpha.jpg');
const doorColorTexture = textureLoader.load('./textures/door/color.jpg');
const doorAOTexture = textureLoader.load('./textures/door/ambientOcclusion.jpg');
const doorRoughnessTexture = textureLoader.load('./textures/door/roughness.jpg');
const doorMetalnessTexture = textureLoader.load('./textures/door/metalness.jpg');
const doorNormalTexture = textureLoader.load('./textures/door/normal.jpg');
const doorHeightTexture = textureLoader.load('./textures/door/height.jpg');
doorColorTexture.colorSpace = THREE.SRGBColorSpace;

//Door
const door = new THREE.Mesh(
    new THREE.PlaneGeometry(2.2, 2.2),
    new THREE.MeshStandardMaterial({ 
        alphaMap: doorAlphaTexture,
        transparent: true,
        map: doorColorTexture,
        aoMap: doorAOTexture,
        roughnessMap: doorRoughnessTexture,
        metalnessMap: doorMetalnessTexture,
        displacementMap: doorHeightTexture,
        normalMap: doorNormalTexture
    })
);
door.position.z = 2 + 0.01;
door.position.y = 1;
house.add(door);

//Bush Texture
const bushColorTexture = textureLoader.load('./textures/bush/leaves_forest_ground_1k/leaves_forest_ground_diff_1k.jpg');
const bushARMTexture = textureLoader.load('./textures/bush/leaves_forest_ground_1k/leaves_forest_ground_arm_1k.jpg');
const bushNormalTexture = textureLoader.load('./textures/bush/leaves_forest_ground_1k/leaves_forest_ground_nor_gl_1k.jpg');
bushColorTexture.colorSpace = THREE.SRGBColorSpace;

bushColorTexture.repeat.set(2, 1);
bushARMTexture.repeat.set(2, 1);
bushNormalTexture.repeat.set(2, 1);
bushColorTexture.wrapS = THREE.RepeatWrapping;
bushARMTexture.wrapS = THREE.RepeatWrapping;
bushNormalTexture.wrapS = THREE.RepeatWrapping;

//Bushes
const bushGeometry = new THREE.SphereGeometry(1, 16, 16);
const bushMaterial = new THREE.MeshStandardMaterial({
    color: '#ccffcc',
    map: bushColorTexture,
    aoMap: bushARMTexture,
    roughnessMap: bushARMTexture,
    metalnessMap: bushARMTexture,
    normalMap: bushNormalTexture
});

const bush1 = new THREE.Mesh(bushGeometry, bushMaterial);
bush1.position.set(1.8, 0.2, 2.2);
bush1.scale.setScalar(0.5);
bush1.rotation.x = -0.75;
house.add(bush1);

const bush2 = new THREE.Mesh(bushGeometry, bushMaterial);
bush2.position.set(2.5, 0.2, 2.4);
bush2.scale.setScalar(0.3);
bush2.rotation.z = 0.97;
house.add(bush2);
const bush3 = new THREE.Mesh(bushGeometry, bushMaterial);
bush3.position.set(-2.5, 0.2, 2.2);
bush3.scale.setScalar(0.4);
bush3.rotation.z = 1.598;
house.add(bush3);
const bush4 = new THREE.Mesh(bushGeometry, bushMaterial);
bush4.position.set(-3.1, 0.2, 2.4);
bush4.scale.setScalar(0.3);
bush4.rotation.x = 2.68;
bush4.rotation.z = 0.83;
house.add(bush4);
const bush5 = new THREE.Mesh(bushGeometry, bushMaterial);
bush5.position.set(-2, 0.1, 2.3);
bush5.scale.setScalar(0.25);
bush5.rotation.x = -1;
house.add(bush5);

/*
const graveColorTexture = textureLoader.load('./textures/graves/plastered_stone_wall_1k/plastered_stone_wall_diff_1k.jpg');
const graveARMTexture = textureLoader.load('./textures/graves/plastered_stone_wall_1k/plastered_stone_wall_arm_1k.jpg');
const graveNormalTexture = textureLoader.load('./textures/graves/plastered_stone_wall_1k/plastered_stone_wall_nor_gl_1k.jpg');
graveColorTexture.colorSpace = THREE.SRGBColorSpace;

//Graves
const graveGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.2);
const graveMaterial = new THREE.MeshStandardMaterial({
    color: 'gray',
    map: graveColorTexture,
    aoMap: graveARMTexture,
    roughnessMap: graveARMTexture,
    metalnessMap: graveARMTexture,
    normalMap: graveNormalTexture
});
const graves = new THREE.Group();

for(let i = 0; i < 40; i++)
{
    const angle = Math.random() * Math.PI * 2;
    const radius = 5 + Math.random() * 4;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;

    const grave = new THREE.Mesh(graveGeometry, graveMaterial);
    grave.position.set(x, 0.1, z);
    grave.rotation.set(
        (Math.random() - 0.5) * 0.4, // Random rotation around X-axis
        (Math.random() - 0.5) * 0.4, // Random rotation around Y-axis
        (Math.random() - 0.5) * 0.4  // Random rotation around Z-axis
    );
    grave.scale.setScalar(0.4 + Math.random() * 0.5); // Random scale between 0.6 and 1
    graves.add(grave);
}
scene.add(graves);
*/

//Light
const ambientLight = new THREE.AmbientLight('#86cdff', 0.275); // White light, full intensity
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // White light, full intensity
directionalLight.position.set(3, 2, -8);
scene.add(directionalLight);

const doorLight = new THREE.PointLight('#ff7d46', 5);
doorLight.position.set(0, 2.2, 2.5);
house.add(doorLight);

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
directionalLight.shadow.mapSize.width = 256;
directionalLight.shadow.mapSize.height = 256;
directionalLight.shadow.camera.top = 8;
directionalLight.shadow.camera.right = 8;
directionalLight.shadow.camera.bottom = -8;
directionalLight.shadow.camera.left = -8;
directionalLight.shadow.camera.near = 1;
directionalLight.shadow.camera.far = 20;

//Fog
scene.fog = new THREE.FogExp2('#02343f', 0.08);

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

camera.position.z = 10;

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
walls.castShadow = true;
walls.receiveShadow = true;
roof.castShadow = true;
floor.receiveShadow = true;
/*
for (const grave of graves.children) {
    grave.castShadow = true;
    grave.receiveShadow = true;
}*/

//light rotation
const radius = 5; 
const speed = 0.001; 

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
    renderer.render( scene, camera );
}
renderer.setAnimationLoop( animate );