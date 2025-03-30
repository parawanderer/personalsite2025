import { InteractionManager } from "../interact";
import { getByIdOrThrow } from "../utils/document";

import { TITLE_HOME, TITLE_ABOUT_ME, TITLE_CONTACT } from '../constants';


const ANIMATE_APPEAR = 'animate-appear';

const PANEL_SHOWN = "panel-shown";
const SHOW = "show";
const FLIPPED = "flipped";
const HIDDEN = "hidden";
const NO_DISPLAY = "no-display";

const addClones = (element: Element) => {
    const clone1 = element.cloneNode(true) as Element;
    clone1.removeAttribute('id');
    const spanTop = document.createElement('span');
    spanTop.classList.add('clone-1');
    spanTop.appendChild(clone1);

    element.parentElement!.prepend(spanTop);

    const clone2 = element.cloneNode(true) as Element;
    clone2.removeAttribute('id');
    const spanBottom = document.createElement('span');
    spanBottom.classList.add('clone-2');
    spanBottom.appendChild(clone2);

    element.parentElement!.append(spanBottom);
};


export class ForegroundManager {
    private readonly homeButton: HTMLButtonElement;
    private onPressHomeButtonCallback?: () => void;

    private readonly aboutMeButton: HTMLButtonElement;
    private onPressAboutMeButtonCallback?: () => void;

    private readonly contactButton: HTMLButtonElement;
    private onPressContactButtonCallback?: () => void;

    private readonly logo: HTMLDivElement;
    private readonly hiddenPanel: HTMLDivElement;
    private readonly freeFlightButton: HTMLButtonElement;
    private readonly freeFlightUi: HTMLDivElement;
    private readonly freeFlightUiHints: HTMLDivElement;
    private readonly returnFromFreeFlightButton: HTMLButtonElement;

    private isFreeFlight: boolean = false;

    private isUiSwitching: boolean = false;

    constructor(private interactionManager: InteractionManager) {
        this.logo = getByIdOrThrow('logo');
        getByIdOrThrow('logo-img').parentElement!.addEventListener("click", () => this.onPressHome());

        this.hiddenPanel = getByIdOrThrow('hiddenPanel');
        this.freeFlightButton = getByIdOrThrow("freeFlightButton");
        this.freeFlightUi = getByIdOrThrow("freeFlightUi");
        this.freeFlightUiHints = getByIdOrThrow("controlsHintsUi");
        this.returnFromFreeFlightButton = getByIdOrThrow("returnFromFreeFlight");

        this.homeButton = getByIdOrThrow('homeButton');
        this.aboutMeButton = getByIdOrThrow('aboutMeButton');
        this.contactButton = getByIdOrThrow('contactButton');

        this.homeButton.parentElement!.addEventListener("click", () => this.onPressHome());

        this.aboutMeButton.parentElement!.addEventListener("click", () => this.onPressAboutMe());

        this.contactButton.parentElement!.addEventListener("click", () => this.onPressContact());

        this.freeFlightButton.parentElement!.addEventListener("click", () => this.handleFreeFlight());
        this.returnFromFreeFlightButton.parentElement!.addEventListener("click", () => this.handleFreeFlight());

        document.title = TITLE_HOME;
    }

    private handleFreeFlight(): void {
        if (this.isUiSwitching) return;
        this.isUiSwitching = true;

        this.isFreeFlight = !this.isFreeFlight;

        const toBeEdited = document.querySelectorAll(".hideable-ui");
        if (this.isFreeFlight) {
            for (const element of toBeEdited) {
                element.classList.add(HIDDEN);
            }

            setTimeout(() => {
                for (const element of toBeEdited) {
                    element.classList.add(NO_DISPLAY);
                }
                this.freeFlightUi.classList.remove(NO_DISPLAY);
                this.freeFlightUiHints.classList.remove(NO_DISPLAY);

                this.interactionManager.setMovementEnabled(true);
                this.interactionManager.setAllowToggle(true);

                // add to end of event queue
                setTimeout(() => {
                    this.freeFlightUi.classList.add(SHOW);
                    this.freeFlightUiHints.classList.add(SHOW)
                    this.isUiSwitching = false;
                }, 10);
            }, 2000);

        } else {
            for (const element of toBeEdited) {
                element.classList.remove(NO_DISPLAY);
            }
            this.freeFlightUi.classList.remove(SHOW);
            this.freeFlightUiHints.classList.remove(SHOW);

            this.interactionManager.setMovementEnabled(false);
            this.interactionManager.setAllowToggle(false);

            setTimeout(() => {
                for (const element of toBeEdited) {
                    element.classList.remove(HIDDEN);
                }

                setTimeout(() => {
                    this.freeFlightUi.classList.add(NO_DISPLAY);
                    this.freeFlightUiHints.classList.add(NO_DISPLAY);
                    this.isUiSwitching = false;
                }, 2000);

            }, 2000);
        }
    }

    private onPressHome() {
        console.log("Clicked home button!");

        this.logo.classList.remove(PANEL_SHOWN);
        this.hiddenPanel.classList.remove(SHOW);

        document.title = TITLE_HOME;

        if (!this.onPressHomeButtonCallback) return;
        this.onPressHomeButtonCallback();
    }

    private onPressAboutMe() {
        console.log("Clicked about me button!");

        this.logo.classList.add(PANEL_SHOWN);
        this.hiddenPanel.classList.add(SHOW);
        this.hiddenPanel.classList.remove(FLIPPED);

        document.title = TITLE_ABOUT_ME;

        if (!this.onPressAboutMeButtonCallback) return;
        this.onPressAboutMeButtonCallback();
    }

    private onPressContact() {
        console.log("Clicked contact button!");

        this.logo.classList.add(PANEL_SHOWN);
        this.hiddenPanel.classList.add(SHOW);
        this.hiddenPanel.classList.add(FLIPPED);

        document.title = TITLE_CONTACT;

        if (!this.onPressContactButtonCallback) return;
        this.onPressContactButtonCallback();
    }


    public init() {
        ForegroundManager.addGlitchEffect();
        ForegroundManager.handleAnimateIn();
    }

    public setAboutMeCallback(callback: () => void) {
        this.onPressAboutMeButtonCallback = callback;
    }

    public setHomeCallback(callback: () => void) {
        this.onPressHomeButtonCallback = callback;
    }

    public setContactCallback(callback: () => void) {
        this.onPressContactButtonCallback = callback;
    }

    private static addGlitchEffect() {
        const targets = document.querySelectorAll(".glitch");
        for (const target of targets) {
            addClones(target!.firstElementChild!);
        }
    }

    private static handleAnimateIn() {
        setTimeout(() => {
            for (const item of document.querySelectorAll(".logo-primary.animate-appear")) {
                item.classList.remove(ANIMATE_APPEAR);

                item.parentElement!.classList.add("glitch");
                addClones(item);
            }

        }, 1000);

        setTimeout(() => {
            for (const item of document.querySelectorAll(".name-title.animate-appear")) {
                item.classList.remove(ANIMATE_APPEAR);
            }

        }, 1500);

        setTimeout(() => {
            for (const item of document.querySelectorAll(".button.animate-appear")) {
                item.classList.remove(ANIMATE_APPEAR);

                item.parentElement!.classList.add("glitch");
                addClones(item);
            }

        }, 1500);

        setTimeout(() => {
            for (const item of document.querySelectorAll(".side-button.animate-appear")) {
                item.classList.remove(ANIMATE_APPEAR);

                item.parentElement!.classList.add("glitch");
                addClones(item);
            }
        }, 1750);
    }
}