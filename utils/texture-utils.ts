import { Texture, TextureLoader, Wrapping } from "three";

const TEXTURE_CACHE = new Map();

export interface TextureOptions {
    wrapS?: Wrapping;
    wrapT?: Wrapping;
    colorSpace?: string;
}

export const getTexture = (pathToTexture: string, options?: TextureOptions): Texture => {
    if (TEXTURE_CACHE.has(pathToTexture)) {
        return TEXTURE_CACHE.get(pathToTexture);
    }

    const texture = new TextureLoader().load(pathToTexture);

    if (options) {
        if (options.wrapS) texture.wrapS = options.wrapS;
        if (options.wrapT) texture.wrapT = options.wrapT;
        if (options.colorSpace) texture.colorSpace = options.colorSpace;
    }

    TEXTURE_CACHE.set(pathToTexture, texture);
    return texture;
};

export interface PBRMaterial {
    map: Texture;
    normalMap?: Texture;
    displacementMap?: Texture;
    specularColorMap?: Texture;
    aoMap?: Texture;
}

export const PLACEHOLDER = '${PLACEHOLDER}';

const DIFFUSE = 'diffuse';
const NORMAL = 'normal';
const SPECULAR = 'specular';
const AO = 'ao';
const DISPLACEMENT = 'displacement';


export const getPBRMaterialTextures = (basePathPattern: string, options?: TextureOptions) : PBRMaterial => {
    if (!basePathPattern.includes(PLACEHOLDER)) {
        throw new Error(`input string basePathPattern = '${basePathPattern}' did not contain \${PLACEHOLDER} anywhere within it!`);
    }

    const map: Texture = getTexture(basePathPattern.replace(PLACEHOLDER, DIFFUSE), options);
    const normalMap: Texture = getTexture(basePathPattern.replace(PLACEHOLDER, NORMAL));
    const specularColorMap: Texture = getTexture(basePathPattern.replace(PLACEHOLDER, SPECULAR));
    const aoMap: Texture = getTexture(basePathPattern.replace(PLACEHOLDER, AO));
    const displacementMap: Texture = getTexture(basePathPattern.replace(PLACEHOLDER, DISPLACEMENT));

    const ret = {
        map,
        normalMap,
        specularColorMap,
        aoMap,
        displacementMap
    };

    //console.log(ret);

    return ret;
}