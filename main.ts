
import {
    Clock,
    Color,
    FogExp2,
    PerspectiveCamera,
    Scene,
    SRGBColorSpace,
    Vector3,
    WebGLRenderer,
    CineonToneMapping,
    LoadingManager
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
    DEBUG,
    CAMERA_ABOUT_ME_X,
    CAMERA_ABOUT_ME_Y,
    CAMERA_ABOUT_ME_Z,
    CAMERA_ABOUT_ME_DIRECTION_X,
    CAMERA_ABOUT_ME_DIRECTION_Y,
    CAMERA_ABOUT_ME_DIRECTION_Z,
    CAMERA_ABOUT_ME_POS,
    CAMERA_ABOUT_ME_DIR,
    CAMERA_CONTACT_POS,
    CAMERA_CONTACT_DIR,
    CAMERA_HOME_POS,
    CAMERA_HOME_DIR,
    DUST_CENTER,
    ROTATING_DUST_CENTER
} from './constants';
import { WallsFactory } from './environment/walls';
import { GenericObjectFactory } from './environment/factory';
import { InteractionManager } from './interact';
import { WaterFactory } from './environment/water';
import { DustFactory } from './environment/dust-particles';
import { Scheduler } from './entity/animated-entity';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass';
import { DebugInfoDisplay } from './ui/debug-info';
import { ForegroundManager } from './ui/foreground-manager';
import { moveCameraTo } from './animate/camera';
import { FilmPass } from './postprocessing/filmpass';

(async () => { // <- stupid hack to allow using "await" in this body

let width = window.innerWidth;
let height = window.innerHeight;

// clock
const clock = new Clock();

// scene
const scene: Scene = new Scene();
scene.background = new Color(FOG_COLOR);
scene.fog = new FogExp2(FOG_COLOR, FOG_INTENSITY);

// asset loading crap
const handleGraphicsLoading = (url: string, loaded: number, total: number): void => {
    console.log(`Loading file: ${url} (${loaded}/${total})`);
};

const handleGraphicsLoaded = (): void => {
    console.log("All assets loaded.");
};
const loadingMgr = new LoadingManager();
loadingMgr.onProgress = handleGraphicsLoading;
loadingMgr.onLoad = handleGraphicsLoaded;

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
const factory = new GenericObjectFactory(loadingMgr, scene);
const dustFactory = new DustFactory(loadingMgr, scene, camera);


// background pane
const pane = factory.makeGlassPane(0xffffff);
pane.position.set(CAMERA_INITIAL_X, CAMERA_INITIAL_Y, CAMERA_INITIAL_Z-1);

// cube light
const cubeLight = factory.makeObjectLight(0, 0, 0, 20, CUBE_LIGHT_COLOR);

// background light
const ambientLight = factory.makeAmbientLight();

// skySpot (directional)
const skySpot = factory.makeSkySpotLight();

// light sources
const skyDiffuseLight1 = factory.makeSkyDiffuseLight(0, 10, -8, 400);
const skyDiffuseLight2 = factory.makeSkyDiffuseLight(0, 8, 0, 800);


// skybox
const sky = factory.makeSkybox(SKY_TEXTURE);

// water
const water = new WaterFactory(loadingMgr, scene).makeWater(WATER_TEXTURE, -ROW_LENGTH_Z/2);
scheduler.add(water);

// walls
const walls = await new WallsFactory(loadingMgr, scene).makeWalls(CAMERA_INITIAL_Z);
scheduler.add(walls);

// particles
const dust1 = dustFactory.makeDust(TEXTURE_PARTICLE_CYAN, DUST_CENTER.clone(), DUST_RADIUS, DUST_AMOUNT_CYAN, DUST_SIZE_CYAN, DUST_SPAWN_INITIALLY);
scheduler.add(dust1);
const dust2 = dustFactory.makeDust(TEXTURE_PARTICLE_RED, DUST_CENTER.clone(), DUST_RADIUS, DUST_AMOUNT_RED, DUST_SIZE_RED, DUST_SPAWN_INITIALLY);
scheduler.add(dust2);

const rotatingParticles1 = dustFactory.makeRotatingDust(TEXTURE_PARTICLE_CYAN, ROTATING_DUST_CENTER.clone(), 0.5, DUST_AMOUNT_CYAN, DUST_SIZE_CYAN);
scheduler.add(rotatingParticles1);
const rotatingParticles2 = dustFactory.makeRotatingDust(TEXTURE_PARTICLE_RED, ROTATING_DUST_CENTER.clone(), 0.5, DUST_AMOUNT_RED, DUST_SIZE_RED);
scheduler.add(rotatingParticles2);


// debug-related UI elements
const debugInfoUI = new DebugInfoDisplay(DEBUG, camera);


// effects
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new FilmPass(clock, 0.4));
//composer.addPass(new SMAAPass()); // <- (doesn't look good)
const fxaaPass = new ShaderPass(FXAAShader); // <- surprisingly it looks better
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
fgMngr.setHomeCallback(() => moveCameraTo(camera, CAMERA_HOME_POS.clone(), CAMERA_HOME_DIR.clone()));
fgMngr.setAboutMeCallback(() => moveCameraTo(camera, CAMERA_ABOUT_ME_POS.clone(), CAMERA_ABOUT_ME_DIR.clone()));
fgMngr.setContactCallback(() => moveCameraTo(camera, CAMERA_CONTACT_POS.clone(), CAMERA_CONTACT_DIR.clone()));


})();