import { Vector3 } from "three";
import { Color } from "./utils/color";

// show debug stuff
export const DEBUG = false;

export const TITLE_HOME = "Home";
export const TITLE_ABOUT_ME = "About Me";
export const TITLE_CONTACT = "Contact";


export const WALLS_OFFSET = 10;

export const ROW_LENGTH_Z = 60;
export const ROW_LENGTH_X = 8;
export const SCALE_FACTOR = 0.25;

// camera
export const CAMERA_INITIAL_X = 0;
export const CAMERA_INITIAL_Y = -0.53;
export const CAMERA_INITIAL_Z = 5.24;

export const CAMERA_SPEED = 2;
export const CAMERA_LOOK_SPEED = 0.2;


// camera:scene

export const CAMERA_HOME_POS = new Vector3(CAMERA_INITIAL_X, CAMERA_INITIAL_Y, CAMERA_INITIAL_Z);
export const CAMERA_HOME_DIR = new Vector3(CAMERA_INITIAL_X, CAMERA_INITIAL_Y, CAMERA_INITIAL_Z-1);

export const CAMERA_ABOUT_ME_X = -0.8113;
export const CAMERA_ABOUT_ME_Y = -0.5845;
export const CAMERA_ABOUT_ME_Z = 3.5314;
export const CAMERA_ABOUT_ME_DIRECTION_X = -3;
export const CAMERA_ABOUT_ME_DIRECTION_Y = -2;
export const CAMERA_ABOUT_ME_DIRECTION_Z = 0;
export const CAMERA_ABOUT_ME_POS = new Vector3(CAMERA_ABOUT_ME_X, CAMERA_ABOUT_ME_Y, CAMERA_ABOUT_ME_Z);
export const CAMERA_ABOUT_ME_DIR = new Vector3(CAMERA_ABOUT_ME_DIRECTION_X, CAMERA_ABOUT_ME_DIRECTION_Y, CAMERA_ABOUT_ME_DIRECTION_Z-1);

export const CAMERA_CONTACT_X = 0;
export const CAMERA_CONTACT_Y = 0;
export const CAMERA_CONTACT_Z = 10;
export const CAMERA_CONTACT_DIRECTION_X = 0;
export const CAMERA_CONTACT_DIRECTION_Y = 0;
export const CAMERA_CONTACT_DIRECTION_Z = 9;
export const CAMERA_CONTACT_POS = new Vector3(CAMERA_CONTACT_X, CAMERA_CONTACT_Y, CAMERA_CONTACT_Z);
export const CAMERA_CONTACT_DIR = new Vector3(CAMERA_CONTACT_DIRECTION_X, CAMERA_CONTACT_DIRECTION_Y, CAMERA_CONTACT_DIRECTION_Z);


// VISUALS
export const BACKGROUND_COLOR = Color.fromHex("#8dd1cd");

// fog
export const FOG_COLOR = Color.fromHex('#1c1c1c');
export const FOG_INTENSITY = 0.08;

export const FOG_UPDATE_EVERY_MS = 1000/60;
const FOG_SLOWNESS = 4800;
export const FOG_UPDATE_BY = 1/FOG_SLOWNESS;

// sky
export const AMBIENT_LIGHT_SKY_COLOR = Color.fromHex('#1d2f3a');
export const AMBIENT_LIGHT_GROUND_COLOR = Color.fromHex('#ffffff');
export const AMBIENT_LIGHT_INTENSITY = 10;
export const SKY_TEXTURE = 'nightsky_edit.jpg';

export const SPOTLIGHT_SKY_COLOR = Color.fromHex('#ffffff');
export const SPOTLIGHT_SKY_INTENSITY = 600;

export const POINTLIGHT_SKY_COLOR = Color.fromHex('#6f7477');

// water
export const WATER_TEXTURE = 'waternormals.jpg';
export const WATER_SUN_COLOR = Color.fromHex('#000000');
export const WATER_COLOR = Color.fromHex('#000000');


// pillars
export const PILLARS_GEOGRAPHY_MAP = 'fill_map.png';
// light is kind of inspired by this: https://www.dreamstime.com/abstract-digital-painting-beautiful-basalt-columns-fantasy-landscape-background-columnar-basalt-abstract-fantasy-image256455717
export const PILLARS_FOG_NEAR_COLOR = Color.fromHex("#ff6a00");
export const PILLARS_FOG_FAR_COLOR = Color.fromHex("#8dd1cd");
export const PILLARS_FOG_NOISE_FREQ = 0.26;
export const PILLARS_FOG_NOISE_IMPACT = 0.3;
export const PILLARS_FOG_NOISE_SPEED = 100;


// cube
export const CUBE_COLOR = Color.fromHex("#00ffdd");
export const CUBE_LIGHT_COLOR = Color.fromHex("#4bffe7");


// rings
export const RING_ONE_COLOR = Color.fromHex("#ffffff");
export const RING_TWO_COLOR = Color.fromHex("#fffbb5");

// particles
export const DUST_CAMERA_OFFSET_FRONT = -2;
export const DUST_RADIUS = 2;
export const DUST_SPAWN_INITIALLY = 1000;

export const TEXTURE_PARTICLE_CYAN = 'particle_small_cyan.png';
export const DUST_AMOUNT_CYAN = 300;
export const DUST_SIZE_CYAN = 0.01;

export const TEXTURE_PARTICLE_RED = 'particle_small_redish.png';
export const DUST_AMOUNT_RED = 400;
export const DUST_SIZE_RED = 0.005;

export const DUST_CENTER = new Vector3(0, 1, CAMERA_INITIAL_Z + DUST_CAMERA_OFFSET_FRONT);
export const ROTATING_DUST_CENTER = new Vector3(CAMERA_INITIAL_X, CAMERA_INITIAL_Y, CAMERA_INITIAL_Z-1.5);