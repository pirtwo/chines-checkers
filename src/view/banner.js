import app from "..";
import textStyleFactory from "../text-style";
import {
    Container,
    Sprite,
    Text
} from "pixi.js";
import {
    COLOR_PALETTE
} from "../color-palette";

export default class Banner extends Container {
    constructor() {
        super();

        let tileset = app.loader.resources.tileset.textures;

        this.title = new Text("", textStyleFactory("titleMedium"));

        this.bannerBody = new Sprite(tileset["banner_body.png"]);
        this.bannerBody.tint = COLOR_PALETTE["color-2"];
        this.bannerBody.width = 400;
        this.bannerBody.height = 100;
        this.bannerBody.position.set(80, 0);

        this.bannerLeft = new Sprite(tileset["banner_left.png"]);
        this.bannerLeft.tint = 0xd5634e;
        this.bannerLeft.width = 100;
        this.bannerLeft.height = 100;
        this.bannerLeft.position.set(0, 10);

        this.bannerRight = new Sprite(tileset["banner_right.png"]);
        this.bannerRight.tint = 0xd5634e;
        this.bannerRight.width = 100;
        this.bannerRight.height = 100;
        this.bannerRight.position.set(460, 10);

        this.addChild(
            this.bannerLeft,
            this.bannerRight,
            this.bannerBody,
            this.title);
    }

    setTitle(value) {
        this.title.text = value;
        this.title.position.set(this.width / 2 - this.title.width / 2, 0);
    }
}