import app from "../index";
import Modal from "./modal";
import Banner from "../view/banner";
import Button from "../view/button";
import textStyleFactory from "../text-style";
import PlayerAvatar from "../view/player-avatar";
import {
    COLOR_PALETTE
} from "../color-palette";

export default class PlayerWinModal extends Modal {
    constructor(sceneManager, tween) {
        super({
            name: "playerWinModal",
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

        let sounds = app.loader.resources.sounds.sound;

        this.sceneManager = sceneManager;

        // create panel banner
        this.banner = new Banner();
        this.banner.setTitle("YOU WON");
        this.banner.position.set(this.body.width / 2 - this.banner.width / 2, -20);

        this.winnerAvatar = new PlayerAvatar({
            name: "",
            pictureURL: "",
            hasTextbox: false
        });
        this.winnerAvatar.scale.set(1.5);
        this.winnerAvatar.position.set(
            this.body.width / 2 - this.winnerAvatar.width / 2,
            this.body.height / 2 - this.winnerAvatar.height / 2 - 50);

        // create back button
        this.backBtn = new Button({
            color: COLOR_PALETTE["color-3"],
            text: "BACK TO MENU",
            width: 320,
            height: 120,
            textStyle: textStyleFactory("buttonMedium"),
        });
        this.backBtn.position.set(
            this.body.width / 2 - this.backBtn.width / 2,
            this.body.height - 200);
        this.backBtn.pointerTapCallback = () => {
            sounds.play("click");
            this.transOut(10).then(() => {
                this.hide();

                this.sceneManager.find("game")
                    .hide();

                this.sceneManager.find("menu")
                    .show()
                    .transIn(60);
            });
        };

        this.body.addChild(this.banner, this.backBtn, this.winnerAvatar);
    }

    showWinner(name, pictureURL) {
        this.winnerAvatar.setName(name);
        this.winnerAvatar.setPicture(pictureURL);
        this.winnerAvatar.showRank(1);
        return this;
    }
}