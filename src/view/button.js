import {
    Container,
    Graphics,
    Sprite,
    Text
} from "pixi.js";
import app from "..";


export default class Button extends Container {
    constructor({
        text,
        textStyle,
        color,
        width,
        height,
        icon,
        iconWidth,
        iconHeight,
        radius = 15,
        pointerTapCallback
    }) {
        super();

        this.pointerTapCallback = pointerTapCallback;

        let ctx = new Graphics();
        ctx.beginFill(color);
        ctx.drawRoundedRect(0, 0, width, height, radius);
        ctx.endFill();
        
        this.background = new Sprite(app.renderer.generateTexture(ctx));
        this.addChild(this.background);

        if (text) {
            this.text = new Text(text, textStyle);
            this.text.position.set(
                width / 2 - this.text.width / 2,
                height / 2 - this.text.height / 2);
            this.addChild(this.text);
        }

        if (icon) {
            this.icon = new Sprite(icon);
            this.icon.width = iconWidth;
            this.icon.height = iconHeight;
            this.icon.position.set(
                width / 2 - iconWidth / 2,
                height / 2 - iconHeight / 2);
            this.addChild(this.icon);
        }       

        this.interactive = true;
        this.buttonMode = true;
        this.on("pointertap", () => {
            if (this.pointerTapCallback)
                this.pointerTapCallback();
        });
    }
}