import app from "../index";
import Modal from "./modal";
import textStyleFactory from "../text-style";
import {
    Container,
    Sprite,
    Text
} from "pixi.js";
import {
    COLOR_PALETTE
} from "../color-palette";

export default class PortraitLockModal extends Modal {
    constructor(tween) {
        super({
            name: "portraitLockModal",
            width: 600,
            height: 800,
            tween: tween,
            options: {
                backdropSpeed: 10,
                backdropColor: 0x000000,
                backgroundColor: COLOR_PALETTE["color-1"],
                backgroundTexture: null,
                positionInX: 0,
                positionInY: 0,
                positionOutX: 0,
                positionOutY: -app.screen.height,
            }
        });

        let tileset = app.loader.resources.tileset.textures;


        this.icon = new Sprite(tileset["portrait-lock.png"]);
        this.icon.scale.set(1);
        this.icon.position.set(this.body.width / 2 - this.icon.width / 2, 150);

        let textStyle = textStyleFactory("mediumText");
        textStyle.wordWrap = true;
        textStyle.wordWrapWidth = 450;
        textStyle.align = "center";
        this.message = new Text(
            "Please change your phone orientation to portrait", textStyle);

        this.message.position.set(
            this.body.width / 2 - this.message.width / 2, 400);

        this.body.addChild(this.icon, this.message);
    }
}