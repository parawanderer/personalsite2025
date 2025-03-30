import { WebGLProgramParametersWithUniforms } from "three";

export const toFileName = (importMetaUrl: string) => {
    return new URL(importMetaUrl).pathname.split('/').pop();
}

export interface DynamicShaderModificationOptions {
    vertexPars?: OptionConfig;
    vertexMain?: OptionConfig;
    fragmentPars?: OptionConfig;
    fragmentMain?: OptionConfig;
}

export interface OptionConfig {
    insertAfter: string;
    content: string;
}

export const insertModifications = (shader: WebGLProgramParametersWithUniforms, options: DynamicShaderModificationOptions) => {
    if (options.vertexPars) {
        shader.vertexShader = handleReplace(shader.vertexShader, options.vertexPars);
    }
    if (options.vertexMain) {
        shader.vertexShader = handleReplace(shader.vertexShader, options.vertexMain);
    }
    if (options.fragmentPars) {
        shader.fragmentShader = handleReplace(shader.fragmentShader, options.fragmentPars);
    }
    if (options.fragmentMain) {
        shader.fragmentShader = handleReplace(shader.fragmentShader, options.fragmentMain);
    }
}

const handleReplace = (input: string, options: OptionConfig): string => {
    return input.replace(
        options.insertAfter,
        `${options.insertAfter}\n${options.content}`
    );
}