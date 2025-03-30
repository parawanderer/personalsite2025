import { Color, IUniform, WebGLProgramParametersWithUniforms, WebGLRenderer } from "three";

export interface CustomFogConfig {
    fogNearColor: number,
    fogFarColor: number,
    fogNoiseFreq: number,
    fogNoiseImpact: number,
    fogTime: number,
    fogNoiseSpeed: number,

    // shader config
    fogParsVert: string,
    fogVert: string,
    fogParsFrag: string,
    fogFrag: string
}

export class ShaderExtension {
    private params: WebGLProgramParametersWithUniforms|null = null;

    constructor(
        private uniformExtensions: {[uniform: string]: IUniform<any>},
        private fogParsVert: string,
        private fogVert: string,
        private fogParsFrag: string,
        private fogFrag: string
    ) {}

    public getUniforms() {
        return this.params?.uniforms;
    }

    public handle = (params: WebGLProgramParametersWithUniforms, renderer: WebGLRenderer) => {
        params.vertexShader = params.vertexShader
            .replace(`#include <fog_pars_vertex>`, this.fogParsVert)
            .replace(`#include <fog_vertex>`, this.fogVert);


        params.fragmentShader = params.fragmentShader
            .replace(`#include <fog_pars_fragment>`, this.fogParsFrag)
            .replace(`#include <fog_fragment>`, this.fogFrag);


        for (const key in this.uniformExtensions) {
            params.uniforms[key] = this.uniformExtensions[key];
        }

        this.params = params;
    }
}

/**
 * main reference for this: https://snayss.medium.com/three-js-fog-hacks-fc0b42f63386
 *
 * Mostly just includes personalised tweaks to get the visual effects I wanted
 */
export const customFogExtension = (conf: CustomFogConfig) => {

    /**
     * Refer to fogedits.glsl.ts
     */
    const uniformExtensions: {[uniform: string]: IUniform<any>} = {
        fogNearColor: { value: new Color(conf.fogNearColor) },
        fogFarColor: { value: new Color(conf.fogFarColor) },
        fogNoiseFreq: { value: conf.fogNoiseFreq },
        fogNoiseImpact: { value: conf.fogNoiseImpact },
        fogNoiseSpeed: { value: conf.fogNoiseSpeed },
        fogTime: { value: conf.fogTime }
    };

    return new ShaderExtension(
        uniformExtensions,
        conf.fogParsVert,
        conf.fogVert,
        conf.fogParsFrag,
        conf.fogFrag
    );
};