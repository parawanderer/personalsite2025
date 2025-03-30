import { FirstPersonControls } from "three/addons/controls/FirstPersonControls";


export class InteractionManager {
    private isMovementToggleAllowed: boolean = false;

    constructor(private controls: FirstPersonControls) {
        this.controls.enabled = false;
        document.addEventListener("keypress", (event) => {
            if (!this.isMovementToggleAllowed) return;

            if (event.code == "Space") {
                this.controls.enabled = !this.controls.enabled;
                console.log("Toggling movement enabled state to: ", this.controls.enabled);
            }
        });
    }

    public update(delta: number): void {
        this.controls.update(delta);
    }

    public setAllowToggle(isAllowed: boolean) {
        this.isMovementToggleAllowed = isAllowed;
    }

    public setMovementEnabled(isEnabled: boolean) {
        this.controls.enabled = isEnabled;
    }
}