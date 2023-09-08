import {
    Container,
    Graphics,
    Sprite,
    Text,
} from "pixi.js";
import app from "..";
import textStyleFactory from "../text-style";

export default class Medal extends Container {
    constructor() {
        super();

        let tileset = app.loader.resources.tileset.textures;

        let ctx = new Graphics();
        ctx.beginFill(0xffffff);
        ctx.drawCircle(0, 0, 23);
        ctx.endFill();
        this.background = new Sprite(app.renderer.generateTexture(ctx));
        this.background.anchor.set(0.5);
        this.background.position.set(5, -5);
        this.addChild(this.background);

        this.medal = new Sprite(tileset["medal1.png"]);
        this.medal.tint = 0xcd7032;
        this.medal.scale.set(1.3);
        this.medal.anchor.set(0.5);
        this.medal.position.set(0, 0);
        this.addChild(this.medal);

        this.rank = new Text("3", textStyleFactory("smallText"));
        this.rank.position.set(-5, -25);
        this.addChild(this.rank);
    }

    gold() {
        this.medal.tint = 0xf3c623;
        return this;
    }

    normal() {
        this.medal.tint = 0xcd7032;
        return this;
    }
}