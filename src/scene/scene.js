import * as PIXI from "pixi.js";

export default class Scene extends PIXI.Container {
    constructor(name = undefined) {
        super();
        this.sceneName = name;
        this.paused = false;
        this.visible = false;

        this.onOpenedCallback = null;
        this.onClosedCallback = null;
    }

    show() {
        this.visible = true;
        return this;
    }

    hide() {
        this.visible = false;
        return this;
    }

    pause() {
        this.paused = true;
        return this;
    }

    resume() {
        this.paused = false;
        return this;
    }

    transIn(speed = 30) {
        return new Promise(resolve => {
            let t = this.tween.fadeIn(this, speed);
            t.onComplete = () => {
                resolve();
            }
            if (this.onOpenedCallback)
                this.onOpenedCallback();
        });
    }

    transOut(speed = 30) {
        return new Promise(resolve => {
            let t = this.tween.fadeOut(this, speed);
            t.onComplete = () => {
                resolve();
            }
            if (this.onClosedCallback)
                this.onClosedCallback();
        });
    }
}