import Stats from 'three/addons/libs/stats.module.js';
import { CoordsDisplay } from './coords-display';
import { Camera } from 'three';

export class DebugInfoDisplay {
    private stats?: Stats;
    private coords?: CoordsDisplay;

    constructor(private enabled: boolean, camera: Camera) {
        if (enabled) {
            this.stats = new Stats();
            document.body.appendChild(this.stats.dom);

            this.coords = new CoordsDisplay(camera);
        }
    }

    public update() {
        if (!this.enabled) return;

        this.stats!.update();
        this.coords!.update();
    }
}