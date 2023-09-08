import app from "../index";
import Modal from "./modal";
import Button from "../view/button";
import Banner from "../view/banner";
import textStyleFactory from "../text-style";
import {
    COLOR_PALETTE
} from "../color-palette";
import RankTable from "../view/rank-table";

export default class PlayerLoseModal extends Modal {
    constructor(sceneManager, tween) {
        super({
            name: "playerLoseModal",
            width: 600,
            height: 1100,
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

        // create banner
        this.banner = new Banner();
        this.banner.setTitle("GAME OVER");
        this.banner.position.set(this.body.width / 2 - this.banner.width / 2, 0);

        this.table = new RankTable();

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

        this.body.addChild(this.banner, this.backBtn, this.table);
    }

    showRanks(players) {
        this.table.fill(players);
        this.table.position.set(
            this.body.width / 2 - this.table.width / 2,
            this.body.height / 2 - this.table.height / 2 - 20);
        return this;
    }
}