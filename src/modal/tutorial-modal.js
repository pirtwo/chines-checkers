import app from "..";
import Modal from "./modal";
import Button from "../view/button";
import textStyleFactory from "../text-style";
import {
    Text
} from "pixi.js";
import {
    COLOR_PALETTE
} from "../color-palette";

export default class TutorialModal extends Modal {
    constructor(tween) {
        super({
            name: "tutorialModal",
            width: 600,
            height: 350,
            tween: tween,
            hasBackdrop: false,
            options: {
                backdropSpeed: 10,
                backdropColor: 0x000000,
                backgroundColor: COLOR_PALETTE["color-1"],
                backgroundTexture: null,
                positionInX: 0,
                positionInY: 0,
                positionOutX: 0,
                positionOutY: app.screen.height + 300,
            }
        });

        // create panel title
        this.title = new Text("title", textStyleFactory("titleMedium"));
        this.title.position.set(
            this.width / 2 - this.title.width / 2, 15);
        this.body.addChild(this.title);

        // create panel text area
        let style = textStyleFactory("smallText");
        style.wordWrap = true;
        style.wordWrapWidth = this.body.width - 30;
        this.textArea = new Text("text", style);
        this.textArea.position.set(20, this.title.y + this.title.height + 15);
        this.body.addChild(this.textArea);

        // create next buttton
        this.nextBtn = new Button({
            color: COLOR_PALETTE["color-3"],
            text: "NEXT",
            width: 129.5,
            height: 70,
            textStyle: textStyleFactory("buttonMedium")
        });
        this.nextBtn.position.set(
            this.body.width - this.nextBtn.width - 20,
            this.body.height - this.nextBtn.height - 20);
        this.body.addChild(this.nextBtn);

        // create finish button
        this.exitBtn = new Button({
            color: COLOR_PALETTE["color-3"],
            text: "Exit",
            width: 129.5,
            height: 70,
            textStyle: textStyleFactory("buttonMedium")
        });
        this.exitBtn.position.set(
            this.body.width - this.exitBtn.width - 20,
            this.body.height - this.exitBtn.height - 20);
        this.body.addChild(this.exitBtn);

        this.options.positionInX = app.screen.width / 2 - this.body.width / 2;
        this.options.positionInY = app.screen.height - this.body.height - 120;
        this.options.positionOutX = app.screen.width / 2 - this.body.width / 2;
        this.options.positionOutY = app.screen.height;

        this.position.set(this.options.positionOutX, this.options.positionOutY);
    }

    setTitle(value) {
        this.title.text = value;
        this.title.position.set(this.body.width / 2 - this.title.width / 2, 15);
    }

    setTextArea(value) {
        this.textArea.text = value;
    }
}