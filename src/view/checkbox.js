import {
    Container,
    Graphics,
    Sprite
} from "pixi.js";
import app from "..";

export default class Checkbox extends Container {
    constructor({
        width,
        height,
        value = false,
        pointerTapCallback,
        options = {
            boxColor: 0xffffff,
            boxLineColor: 0xefefef,
            checkmarkColor: 0x000000,
        }
    }) {
        super();

        this.value = value;
        this.pointerTapCallback = pointerTapCallback;

        let ctx = new Graphics();
        ctx.beginFill(options.boxColor);
        ctx.lineStyle(3, options.boxLineColor, 0.7);
        ctx.drawRoundedRect(0, 0, width, height, 5);
        ctx.endFill();
        this.box = new Sprite(app.renderer.generateTexture(ctx));
        this.addChild(this.box);

        ctx = new Graphics();
        ctx.beginFill(options.checkmarkColor);
        ctx.drawCircle(0, 0, 10);
        ctx.endFill();
        this.checkmark = new Sprite(app.renderer.generateTexture(ctx));
        this.checkmark.visible = this.value;
        this.checkmark.anchor.set(0.5);
        this.addChild(this.checkmark);
        this.checkmark.position.set(this.box.width / 2, this.box.height / 2);

        this.buttonMode = true;
        this.interactive = true;
        this.on('pointertap', () => {
            this.value = !this.value;
            this.checkmark.visible = this.value;
            if (this.pointerTapCallback)
                this.pointerTapCallback();
        });
    }

    setValue(value) {
        this.value = value;
        this.checkmark.visible = this.value;
        return this;
    }
}