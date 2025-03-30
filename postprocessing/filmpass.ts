import { Clock, WebGLRenderer, WebGLRenderTarget } from 'three';
import { FilmPass as ThreeFilmPass } from 'three/addons/postprocessing/FilmPass.js';

const UPDATE_GRAIN_EVERY_MS = 1000/60;
const SLOWNESS = 600;
const UPDATE_BY = 1/SLOWNESS;

/**
 * Compatibility with high refresh rate monitors...
 */
export class FilmPass extends ThreeFilmPass {
    private lastUpdateTime: number = 0;

    constructor(private clock: Clock, intensity: number = 0.5, grayscale: boolean = false) {
        super(intensity, grayscale);
    }


    /**
     * Tracks: https://github.com/mrdoob/three.js/blob/b3cb0cd0d6066f7054a76b90904486e40031c2ce/examples/jsm/postprocessing/FilmPass.js#L17
     */
    public render(renderer: WebGLRenderer, writeBuffer: WebGLRenderTarget, readBuffer: WebGLRenderTarget, deltaTime: number, maskActive: boolean): void {
        if (this.clock.oldTime - this.lastUpdateTime >= UPDATE_GRAIN_EVERY_MS) {
            super.render(renderer, writeBuffer, readBuffer, UPDATE_BY, maskActive);
            this.lastUpdateTime = this.clock.oldTime;
        }
    }
}