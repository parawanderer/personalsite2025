import { Clock, LoadingManager, PlaneGeometry, RepeatWrapping, Scene, TextureLoader, Vector3 } from "three";
import { Water as ThreeWater } from "three/addons/objects/Water";

import {
    CAMERA_INITIAL_Z,
    FOG_UPDATE_BY,
    FOG_UPDATE_EVERY_MS,
    PILLARS_FOG_FAR_COLOR,
    PILLARS_FOG_NEAR_COLOR,
    PILLARS_FOG_NOISE_FREQ,
    PILLARS_FOG_NOISE_IMPACT,
    PILLARS_FOG_NOISE_SPEED,
    ROW_LENGTH_X,
    ROW_LENGTH_Z,
    WALLS_OFFSET,
    WATER_COLOR,
    WATER_SUN_COLOR
} from "../constants";

import { AnimatedEntity } from "../entity/animated-entity";
import { customFogExtension, ShaderExtension } from "./animated-fog";
import { fogFrag, fogParsFrag, fogParsVert, fogVert } from "../shaders/water-fogedits.glsl";

const UPDATE_WATER_EVERY_MS = 1000/60;

const SLOWNESS = 600;
const UPDATE_BY = 1/SLOWNESS;


export class Water implements AnimatedEntity {
    private lastWaterUpdate: number = 0;
    private lastFogUpdate: number = 0;

    constructor(private water: ThreeWater, private fogShader: ShaderExtension) {}

    /**
     * Deals with higher than 60 FPS refresh rates... hopefully
     */
    public update(clock: Clock): void {
        if (clock.oldTime - this.lastWaterUpdate >= UPDATE_WATER_EVERY_MS) {
            this.water.material.uniforms['time'].value += UPDATE_BY;
            this.lastWaterUpdate = clock.oldTime;
        }

        const uniforms = this.fogShader.getUniforms();
        if (uniforms && clock.oldTime - this.lastFogUpdate >= FOG_UPDATE_EVERY_MS) {
            uniforms['fogTime'].value += FOG_UPDATE_BY;
            this.lastFogUpdate = clock.oldTime;
        }
    }
}

export class WaterFactory {
    constructor(private loadingMgr: LoadingManager, private scene: Scene) {}

    public makeWater(normalsPath: string, offsetZ: number): Water {
        const width = 2*ROW_LENGTH_X + 2*WALLS_OFFSET;
        const depth = CAMERA_INITIAL_Z + ROW_LENGTH_Z*2;

        const geometry = new PlaneGeometry(width, depth);

        const water = new ThreeWater(geometry, {
            textureWidth: 512,
            textureHeight: 512,
            waterNormals: new TextureLoader().load(normalsPath, (texture) => {
                texture.wrapS = texture.wrapT = RepeatWrapping;
            }),
            sunDirection: new Vector3(0, 10, -10),
            sunColor: WATER_SUN_COLOR,
            waterColor: WATER_COLOR,
            distortionScale: 0.25,
            fog: true,
        });

        const fogShader: ShaderExtension = customFogExtension({
            fogNearColor: PILLARS_FOG_NEAR_COLOR,
            fogFarColor: PILLARS_FOG_FAR_COLOR,
            fogNoiseFreq: PILLARS_FOG_NOISE_FREQ,
            fogNoiseImpact: PILLARS_FOG_NOISE_IMPACT,
            fogTime: 0,
            fogNoiseSpeed: PILLARS_FOG_NOISE_SPEED,
            fogFrag,
            fogParsFrag,
            fogParsVert,
            fogVert
        });

        water.receiveShadow = true;

        water.material.onBeforeCompile = fogShader.handle;

        water.position.x = 0;
        water.position.z = offsetZ + (-2*ROW_LENGTH_X)+3;
        water.position.y = -1;
        water.rotation.x = - Math.PI / 2;


        const waterUniforms = water.material.uniforms;
        waterUniforms['size'].value = 10;

        this.scene.add(water);

        return new Water(water, fogShader);
    }
}