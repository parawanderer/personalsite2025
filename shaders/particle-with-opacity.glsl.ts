import { toFileName } from "./util";

const fileName = toFileName(import.meta.url);

// TRACKS: https://github.com/mrdoob/three.js/blob/master/src/renderers/shaders/ShaderLib/meshbasic.glsl.js


export const vertexPars = /* glsl */`
// Custom extension: ${fileName}

attribute float instanceOpacity;
varying float customOpacity;

// END Custom extension: ${fileName}
`;


export const vertex = /* glsl */`
// Custom extension: ${fileName}

customOpacity = instanceOpacity;

// END Custom extension: ${fileName}
`;


export const fragmentPars = /* glsl */`
// Custom extension: ${fileName}

varying float customOpacity;

// END Custom extension: ${fileName}
`;


export const fragment = /* glsl */`
// Custom extension: ${fileName}

gl_FragColor.a = gl_FragColor.a * customOpacity;

// END Custom extension: ${fileName}
`;