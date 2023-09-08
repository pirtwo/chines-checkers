import app from "../index";
import Modal from "./modal";
import Button from "../view/button";
import Checkbox from "../view/checkbox";
import textStyleFactory from "../text-style";
import {
    Container,
    Text
} from "pixi.js";
import {
    COLOR_PALETTE
} from "../color-palette";


export default class SettingModal extends Modal {
    constructor(tween) {
        super({
            name: "settingModal",
            width: 500,
            height: 500,
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

        let sounds = app.loader.resources.sounds.sound;

        // create panel title
        this.title = new Text("SETTINGS", textStyleFactory("titleMedium"));
        this.title.position.set(
            this.body.width / 2 - this.title.width / 2, 25);

        this.controlsCnt = new Container();

        this.hintLabel = new Text("HINTS", textStyleFactory("mediumText"));
        this.hintLabel.position.set(0, 0);
        this.hintCheckbox = new Checkbox({
            width: 35,
            height: 35,
            options: {
                boxColor: 0xffffff,
                boxLineColor: COLOR_PALETTE["color-0"],
                checkmarkColor: COLOR_PALETTE["color-3"]
            }
        });
        this.hintCheckbox.position.set(200, 10);
        this.hintCheckbox.pointerTapCallback = () => {
            sounds.play("switch");
            window.gameStorage.setItem("hint", this.hintCheckbox.value);
        }

        this.controlsCnt.addChild(this.hintLabel, this.hintCheckbox);
        this.controlsCnt.position.set(
            this.body.width / 2 - this.controlsCnt.width / 2,
            this.body.height / 2 - this.controlsCnt.height / 2);

        // create close button
        this.closeBtn = new Button({
            color: COLOR_PALETTE["color-3"],
            text: "CLOSE",
            width: 129.5,
            height: 70,
            textStyle: textStyleFactory("buttonMedium")
        });
        this.closeBtn.position.set(
            this.body.width / 2 - this.closeBtn.width / 2,
            this.body.height / 2 + 135);
        this.closeBtn.pointerTapCallback = () => {
            sounds.play("click");
            this.transOut(10).then(() => {
                this.hide()
            });
        };

        // load settings
        this.onOpenedCallback = () => {
            this.hintCheckbox.setValue(window.gameStorage.getItem("hint"));
        }

        // set body to interactive to capture
        // pointer down
        this.body.interactive = true;
        this.backdrop.on("pointertap", () => {
            this.transOut(10).then(() => {
                this.hide()
            });
        });

        this.body.addChild(
            this.title,
            this.controlsCnt,
            this.closeBtn);
    }
}