import {
    Container,
    Graphics,
    Sprite
} from "pixi.js";
import Scene from "../scene/scene";
import app from "../index";

export default class Modal extends Scene {
    constructor({
        width,
        height,
        name,
        tween,
        hasBackdrop = true,
        onOpenedCallback,
        onClosedCallback,
        options = {
            backdropSpeed: 10,
            backdropColor: 0x000000,
            backgroundColor: 0xffffff,
            backgroundTexture: null,
            positionInX,
            positionInY,
            positionOutX,
            positionOutY,
        }
    }) {
        super(name);

        this.modalWidth = width;
        this.modalHeight = height;
        this.tween = tween;
        this.options = options;
        this.body = new Container();
        this.onOpenedCallback = onOpenedCallback;
        this.onClosedCallback = onClosedCallback;

        let ctx = null;

        if (hasBackdrop) {
            ctx = new Graphics();
            ctx.beginFill(this.options.backdropColor);
            ctx.drawRect(0, 0, app.screen.width, app.screen.height);
            ctx.endFill();

            this.backdrop = new Sprite(app.renderer.generateTexture(ctx));
            this.backdrop.alpha = 0;
            this.backdrop.interactive = true;
            this.addChild(this.backdrop);
        }

        ctx = new Graphics();
        ctx.beginFill(this.options.backgroundColor);
        ctx.lineStyle(10, 0x000000, 0.12);
        ctx.drawRoundedRect(0, 0, this.modalWidth, this.modalHeight, 30);
        ctx.endFill();

        this.background = new Sprite(this.options.backgroundTexture ?
            this.options.backgroundTexture : app.renderer.generateTexture(ctx));
        this.background.width = this.modalWidth;
        this.background.height = this.modalHeight;

        this.body.addChild(this.background);
        this.body.position.set(
            hasBackdrop ? app.screen.width / 2 - this.body.width / 2 : 0,
            hasBackdrop ? app.screen.height / 2 - this.body.height / 2 : 0);

        this.addChild(this.body);
        this.position.set(this.options.positionOutX, this.options.positionOutY);
    }

    transIn(speed) {
        return new Promise(resolve => {
            let t1 = this.tween.slide(
                this, this.options.positionInX, this.options.positionInY, speed);
            t1.onComplete = () => {
                resolve();
            }
            if (this.onOpenedCallback)
                this.onOpenedCallback();
        });
    }

    transOut(speed) {
        return new Promise(resolve => {
            let t2 = this.tween.slide(
                this, this.options.positionOutX, this.options.positionOutY, speed);
            t2.onComplete = resolve;
            if (this.onClosedCallback)
                this.onClosedCallback();
        });
    }
}