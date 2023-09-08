import app from "../index";
import Sound from "pixi-sound";
import Scene from "./scene";
import Button from "../view/button";
import textStyleFactory from "../text-style";
import PlayerAvatar from "../view/player-avatar";
import {
    Text,
    Container,
} from "pixi.js";
import {
    COLOR_PALETTE
} from "../color-palette";

export default class MenuScene extends Scene {
    constructor(sceneManager, tween) {
        super("menu");

        let tileset = app.loader.resources.tileset.textures;
        let sounds = app.loader.resources.sounds.sound;

        this.sceneManager = sceneManager;
        this.tween = tween;

        // create game logo
        this.logo = new Text("CHINESE CHECKERS", textStyleFactory("logo"));
        this.logo.position.set(
            app.screen.width / 2 - this.logo.width / 2,
            app.screen.height / 2 - this.logo.height / 2 - 250);

        // create player avatar
        this.playerAvatar = new PlayerAvatar({
            name: "Guest",
            pictureURL: "/assets/images/player.png",
            hasTextbox: true
        });
        this.playerAvatar.position.set(30, 30);
        this.playerAvatar.textbox.placeholder = "Name ...";

        // create sound button
        this.soundBtn = new Button({
            color: COLOR_PALETTE["color-3"],
            width: 70,
            height: 70,
            icon: tileset["icon_audioOn.png"],
            iconWidth: 50,
            iconHeight: 50
        });
        this.soundBtn.position.set(app.screen.width - this.soundBtn.width - 30, 30);
        this.soundBtn.pointerTapCallback = () => {
            sounds.play("click");

            let hasAudio = !window.gameStorage.getItem("audio");
            window.gameStorage.setItem("audio", hasAudio);

            if (hasAudio) {
                Sound.unmuteAll();
                this.soundBtn.icon.texture = tileset["icon_audioOn.png"];
            } else {
                Sound.muteAll();
                this.soundBtn.icon.texture = tileset["icon_audioOff.png"];
            }
        };

        // create menu button stack
        this.btnStackCnt = new Container();
        this.playBtn = new Button({
            color: COLOR_PALETTE["color-3"],
            text: "PLAY",
            width: 320,
            height: 120,
            textStyle: textStyleFactory("buttonLarge"),
        });
        this.playBtn.position.set(0, 0);
        this.playBtn.pointerTapCallback = () => {
            sounds.play("click");
            this.transOut(10).then(() => {
                let matchMaking = this.sceneManager.find("matchMaking");

                matchMaking.show()
                    .transIn(10)
                    .then(() => {
                        matchMaking.findMatch();
                    });

                this.hide();
            });
        }

        this.tutorialBtn = new Button({
            color: COLOR_PALETTE["color-3"],
            text: "TUTORIAL",
            width: 320,
            height: 120,
            textStyle: textStyleFactory("buttonLarge")
        });
        this.tutorialBtn.position.set(0, 170);
        this.tutorialBtn.pointerTapCallback = () => {
            sounds.play("click");
            this.transOut(10).then(() => {
                let tutorial = this.sceneManager.find("tutorial");
                tutorial.init()
                    .show()
                    .transIn(10)
                    .then(() => {
                        tutorial.loadStep(1);
                    });
                this.hide();
            });
        }

        this.settingBtn = new Button({
            color: COLOR_PALETTE["color-3"],
            text: "SETTINGS",
            width: 320,
            height: 120,
            textStyle: textStyleFactory("buttonLarge")
        });
        this.settingBtn.position.set(0, 340);
        this.settingBtn.pointerTapCallback = () => {
            sounds.play("click");
            this.sceneManager.find("settingModal").show().transIn(10);
        };

        this.btnStackCnt.addChild(this.playBtn, this.tutorialBtn, this.settingBtn);
        this.btnStackCnt.position.set(
            app.screen.width / 2 - this.btnStackCnt.width / 2, app.screen.height / 2);

        this.addChild(this.logo, this.btnStackCnt, this.soundBtn, this.playerAvatar);

        this.onOpenedCallback = () => {
            // load settings
            let hasAudio = window.gameStorage.getItem("audio");
            if (hasAudio)
                Sound.unmuteAll();
            else
                Sound.muteAll();

            this.soundBtn.icon.texture =
                window.gameStorage.getItem("audio") ?
                tileset["icon_audioOn.png"] :
                tileset["icon_audioOff.png"];

            this.playerAvatar.textbox.visible = true;
        }

        this.onClosedCallback = () => {
            this.playerAvatar.textbox.visible = false;
        }
    }
}