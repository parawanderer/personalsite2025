import { LoadingManager, Cache, ImageLoader as ThreeImageLoader } from "three";

// https://threejs.org/docs/#api/en/loaders/FileLoader
Cache.enabled = true;

/**
 * Technically, these are bytes with range 0-255
 */
export interface RGBA {
    r: number;
    g: number;
    b: number;
    a: number;
}

export class ImageLoader {
    constructor(private loadingMgr: LoadingManager) {}

    public loadImage(src: string) {
        return new ThreeImageLoader(this.loadingMgr).loadAsync(src);
    }

    public static extractPixelsPNG(imageData: ImageData, x: number, y: number): RGBA {
        const index = ImageLoader.pixelPosOffsetPNG(imageData.width, x, y);

        const r = imageData.data[index];
        const g = imageData.data[index + 1];
        const b = imageData.data[index + 2];
        const a = imageData.data[index + 3];

        return { r, g, b, a };
    }

    public static pixelPosOffsetPNG(width: number, x: number, y: number): number {
        return x * (width * 4) + y * 4;
    }
}
