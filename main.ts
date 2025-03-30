
import {
    Clock,
    Color,
    FogExp2,
    PerspectiveCamera,
    Scene,
    SRGBColorSpace,
    Vector3,
    WebGLRenderer,
    CineonToneMapping
} from 'three';
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

import {
    CAMERA_INITIAL_Z,
    ROW_LENGTH_Z,
    CAMERA_SPEED,
    WATER_TEXTURE,
    CAMERA_LOOK_SPEED,
    CAMERA_INITIAL_X,
    CAMERA_INITIAL_Y,
    FOG_COLOR,
    FOG_INTENSITY,
    TEXTURE_PARTICLE_CYAN,
    TEXTURE_PARTICLE_RED,
    DUST_AMOUNT_RED,
    DUST_AMOUNT_CYAN,
    DUST_SIZE_CYAN,
    DUST_SIZE_RED,
    DUST_RADIUS,
    CUBE_LIGHT_COLOR,
    SKY_TEXTURE,
    DUST_SPAWN_INITIALLY,
    DUST_CAMERA_OFFSET_FRONT,
    DEBUG
} from './constants';
import { createWalls } from './environment/walls';
import { makeAmbientLight, makeGlassPane, makeObjectLight, makeSkybox, makeSkyDiffuseLight, makeSkySpotLight } from './environment/factory';
import { InteractionManager } from './interact';
import { makeWater } from './environment/water';
import { createDust, createRotatingDust } from './environment/dust-particles';
import { Scheduler } from './entity/animated-entity';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass';
import { DebugInfoDisplay } from './ui/debug-info';
import { ForegroundManager } from './ui/foreground-manager';
import { moveCameraTo } from './animate/camera';

(async () => { // <- stupid hack to allow using "await" in this body

let width = window.innerWidth;
let height = window.innerHeight;

// clock
const clock = new Clock();

// scene
const scene: Scene = new Scene();
scene.background = new Color(FOG_COLOR);
scene.fog = new FogExp2(FOG_COLOR, FOG_INTENSITY);

// camera
const camera = new PerspectiveCamera(75, width / height, 0.1, 1000);
camera.position.x = CAMERA_INITIAL_X;
camera.position.y = CAMERA_INITIAL_Y;
camera.position.z = CAMERA_INITIAL_Z;


// renderer
const renderer = new WebGLRenderer();
renderer.setSize(width, height);
renderer.toneMapping = CineonToneMapping;
renderer.toneMappingExposure = 0.8;
renderer.shadowMap.enabled = true;
renderer.outputColorSpace = SRGBColorSpace;
document.body.appendChild(renderer.domElement);

// controls
const controls = new FirstPersonControls(camera, renderer.domElement);
controls.movementSpeed = CAMERA_SPEED;
controls.lookSpeed = CAMERA_LOOK_SPEED;
const interactionMgr = new InteractionManager(controls);

const scheduler = new Scheduler();




// background pane
const pane = makeGlassPane(scene, 0xffffff);
pane.position.set(CAMERA_INITIAL_X, CAMERA_INITIAL_Y, CAMERA_INITIAL_Z-1);

// cube light
const cubeLight = makeObjectLight(scene, 0, 0, 0, 20, CUBE_LIGHT_COLOR);

// background light
const ambientLight = makeAmbientLight(scene);

// skySpot (directional)
const skySpot = makeSkySpotLight(scene);

// light sources
const skyDiffuseLight1 = makeSkyDiffuseLight(scene, 0, 10, -8, 400);
const skyDiffuseLight2 = makeSkyDiffuseLight(scene, 0, 8, 0, 800);


// skybox
const sky = makeSkybox(scene, SKY_TEXTURE);

// water
const water = makeWater(scene, WATER_TEXTURE, -ROW_LENGTH_Z/2);
scheduler.add(water);

// walls
const walls = await createWalls(scene, CAMERA_INITIAL_Z);
scheduler.add(walls);

// particles
const dustCenter = new Vector3(0, 1, CAMERA_INITIAL_Z + DUST_CAMERA_OFFSET_FRONT);
const dust1 = createDust(scene, camera, TEXTURE_PARTICLE_CYAN, dustCenter, DUST_RADIUS, DUST_AMOUNT_CYAN, DUST_SIZE_CYAN, DUST_SPAWN_INITIALLY);
scheduler.add(dust1);
const dust2 = createDust(scene, camera, TEXTURE_PARTICLE_RED, dustCenter, DUST_RADIUS, DUST_AMOUNT_RED, DUST_SIZE_RED, DUST_SPAWN_INITIALLY);
scheduler.add(dust2);

const rotationParticlesCenter = new Vector3(CAMERA_INITIAL_X, CAMERA_INITIAL_Y, CAMERA_INITIAL_Z-1.5);
const rotatingParticles1 = createRotatingDust(
    scene, camera, TEXTURE_PARTICLE_CYAN, rotationParticlesCenter, 0.5, DUST_AMOUNT_CYAN, DUST_SIZE_CYAN);
scheduler.add(rotatingParticles1);
const rotatingParticles2 = createRotatingDust(
    scene, camera, TEXTURE_PARTICLE_RED, rotationParticlesCenter, 0.5, DUST_AMOUNT_RED, DUST_SIZE_RED);
scheduler.add(rotatingParticles2);


// debug-related UI elements
const debugInfoUI = new DebugInfoDisplay(DEBUG, camera);


// effects
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
// composer.addPass(new FilmPass(clock, 0.8));
//composer.addPass(new SMAAPass());
const fxaaPass = new ShaderPass(FXAAShader);
fxaaPass.uniforms['resolution'].value.set(1 / width, 1 / height);
composer.addPass(fxaaPass);
composer.addPass(new OutputPass());


const onWindowResize = () => {
    width = window.innerWidth;
    height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);

    fxaaPass.uniforms['resolution'].value.set(1 / width, 1 / height);
}
window.addEventListener('resize', onWindowResize);


const animate = () => {
    // render loop
    const delta = clock.getDelta();

    dust1.setPos(camera.position.clone());
    dust2.setPos(camera.position.clone());

    interactionMgr.update(delta);

    debugInfoUI.update();
    scheduler.doUpdates(clock);

    composer.render();
}
renderer.setAnimationLoop(animate);

const fgMngr = new ForegroundManager(interactionMgr);
fgMngr.init();

// some positions that look nice
fgMngr.setHomeCallback(() => {
    moveCameraTo(
        camera,
        new Vector3(CAMERA_INITIAL_X, CAMERA_INITIAL_Y, CAMERA_INITIAL_Z),
        new Vector3(CAMERA_INITIAL_X, CAMERA_INITIAL_Y, CAMERA_INITIAL_Z-1)
    );
});

fgMngr.setAboutMeCallback(() => {
    // hand-tweaked...
    moveCameraTo(
        camera,
        new Vector3(-0.8113, -0.5845, 3.5314),
        new Vector3(-3, -2, 0)
    );
});

fgMngr.setContactCallback(() => {
    moveCameraTo(
        camera,
        new Vector3(0, 0, 11),
        new Vector3(0, 0, 10)
    );
});

})();