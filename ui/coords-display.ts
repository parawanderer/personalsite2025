import { Camera } from "three";
import './coords-display.css' assert { type: "css" };

const DIGITS_CUTOFF = 4;

interface Pos {
    x: string;
    y: string;
    z: string;
}

export class CoordsDisplay {
    private coordsOverlay: HTMLDivElement;
    private camera: Camera;
    private lastPos: Pos|null = null;

    constructor(camera: Camera) {
        this.camera = camera;

        this.coordsOverlay = document.createElement("div");
        this.coordsOverlay.id = "coords";
        this.coordsOverlay.innerHTML = `X:?, Y:?, Z:?`;
        this.coordsOverlay.classList.add("coords");

        document.body.appendChild(this.coordsOverlay);
    }

    public update(): void {
        const cameraPos: Pos = this.cameraToPos();

        if (!this.isNew(cameraPos)) return;

        this.coordsOverlay.innerHTML = this.makePosString();

        this.lastPos = cameraPos;
    }

    private cameraToPos(): Pos {
        return {
            x: this.camera.position.x.toFixed(DIGITS_CUTOFF),
            y: this.camera.position.y.toFixed(DIGITS_CUTOFF),
            z: this.camera.position.z.toFixed(DIGITS_CUTOFF)
        };
    }

    private isNew(pos: Pos): boolean {
        if (this.lastPos == null)
            return true;

        return this.lastPos.x !== pos.x
                || this.lastPos.y !== pos.y
                || this.lastPos.z !== pos.z;
    }

    private makePosString(): string {
        return `X:${this.camera.position.x.toFixed(DIGITS_CUTOFF)}, Y:${this.camera.position.y.toFixed(DIGITS_CUTOFF)}, Z:${this.camera.position.z.toFixed(DIGITS_CUTOFF)}`;
    }
}