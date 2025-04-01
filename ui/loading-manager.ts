import { LoadingManager as ThreeLoadingManger } from "three";
import { getByIdOrThrow } from "../utils/document";

const HIDING = "hiding";
const WAIT_BEFORE_HIDDEN_MS = 1000;
const HIDDEN = "hidden";

// https://threejs.org/docs/#api/en/loaders/managers/LoadingManager
export class LoadingManager extends ThreeLoadingManger {
    private loadingOverlay: HTMLDivElement;
    private loadingText: HTMLDivElement;


    constructor() {
        super();
        // use our custom implementations:
        this.onProgress = this._onProgress;
        this.onLoad = this._onLoad;
        this.onStart = this._onStart;
        this.onError = this._onError;

        this.loadingText = getByIdOrThrow("loadingText");
        this.loadingOverlay = getByIdOrThrow("loadingOverlay");
    }

    private _onProgress(url: string, loaded: number, total: number): void {
        const text = `Loading files (${loaded}/${total})`;
        console.log(text);
        this.loadingText.innerHTML = text;
    }

    private _onLoad(): void {
        console.log(`All assets loaded.`);
        this.loadingOverlay.classList.add(HIDING);
        setTimeout(() => {
            this.loadingOverlay.classList.add(HIDDEN);
        }, WAIT_BEFORE_HIDDEN_MS);
    }

    private _onStart(url: string, loaded: number, total: number): void {
        console.log( 'Started loading file: ' + url + '.\nLoaded ' + loaded + ' of ' + total + ' files.' );
    }

    private _onError(url: string): void {
        console.log( 'There was an error loading ' + url );
    }
}