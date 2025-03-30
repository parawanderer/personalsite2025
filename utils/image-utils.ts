export const loadImage = (src: string) : Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = src;

        img.onload = () => resolve(img);
        img.onerror = (err) => reject(err);
    });
}

export const pixelPosOffsetPNG = (width: number, x: number, y: number): number => {
    return x * (width * 4) + y * 4;
}

/**
 * Technically, these are bytes with range 0-255
 */
export interface RGBA {
    r: number;
    g: number;
    b: number;
    a: number;
}

export const extractPixelsPNG = (imageData: ImageData, x: number, y: number): RGBA => {
    const index = pixelPosOffsetPNG(imageData.width, x, y);

    const r = imageData.data[index];
    const g = imageData.data[index + 1];
    const b = imageData.data[index + 2];
    const a = imageData.data[index + 3];

    return { r, g, b, a };
}