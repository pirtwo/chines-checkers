import Sound from "pixi-sound";
import Scene from "./scene";
import app from "../index";
import Board from "../board";
import Button from "../view/button";
import PlayerAvatar from "../view/player-avatar";
import BotMatch from "../botmatch";
import {
    Container,
} from "pixi.js";
import {
    COLOR_PALETTE
} from "../color-palette";


export default class GameScene extends Scene {
    constructor(sceneManager, tween) {
        super("game");

        let tileset = app.loader.resources.tileset.textures;
        this.sounds = app.loader.resources.sounds.sound;

        this.tween = tween;
        this.sceneManager = sceneManager;

        // players avatar
        this.avatarCnt = new Container();

        // create back to home button
        this.backBtn = new Button({
            color: COLOR_PALETTE["color-3"],
            width: 70,
            height: 70,
            icon: tileset["icon_home.png"],
            iconWidth: 50,
            iconHeight: 50
        });
        this.backBtn.position.set(30, 30);
        this.backBtn.pointerTapCallback = () => {
            this.sounds.play("click");
            this.transOut(10).then(() => {
                this.hide();
                this.sceneManager.find("menu").show().transIn(10);
            });
        };

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
            this.sounds.play("click");

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

        // create game board
        this.board = new Board({
            tween: tween,
            sounds: this.sounds,
            textures: {
                pegs: {
                    "red": tileset["orb_red.png"],
                    "black": tileset["orb_black.png"],
                    "pink": tileset["orb_pink.png"],
                    "blue": tileset["orb_blue.png"],
                    "green": tileset["orb_green.png"],
                    "yellow": tileset["orb_yellow.png"],
                },
                spot: tileset["spot.png"],
                indicator: tileset["indicator.png"]
            }
        });

        this.board.container.position.set(
            app.screen.width / 2,
            app.screen.height / 2 - this.board.container.height / 2 - 50);

        this.addChild(
            this.board.container,
            this.avatarCnt,
            this.backBtn,
            this.soundBtn);

        this.onOpenedCallback = () => {
            this.soundBtn.icon.texture =
                window.gameStorage.getItem("audio") ?
                tileset["icon_audioOn.png"] : tileset["icon_audioOff.png"];
        }
    }

    init() {
        this.board.hideHints();
        this.avatarCnt.removeChildren(0);
        return this;
    }

    newSinglePlayer(player, bots) {
        this.createAvatars([player, ...bots]);
        this.board.hasHints = window.gameStorage.getItem("hint");
        let botmatch = new BotMatch(this.board);

        botmatch.onWinCallback = () => {
            sceneManager
                .find("playerWinModal")
                .show()
                .showWinner(player.name, player.picture)
                .transIn(10);
            this.sounds.play("win");
        }

        botmatch.onLoseCallback = (players) => {
            sceneManager
                .find("playerLoseModal")
                .show()
                .showRanks(players)
                .transIn(10);
            this.sounds.play("lose");
        }

        botmatch.start(player, bots);
    }

    newMultiPlayer(room, players) {

    }

    createAvatars(players) {
        for (let i = 0; i < players.length; i++) {
            let player = players[i];
            let avatar = new PlayerAvatar({
                name: player.name,
                pictureURL: player.picture
            });
            player.avatar = avatar;
            avatar.position.set(
                AVATAR_POSITIONS[player.triangle].x - avatar.width / 2,
                AVATAR_POSITIONS[player.triangle].y - avatar.height / 2);
            this.avatarCnt.addChild(avatar);
        }
    }

    update() {
        this.board.update();
    }
}

const AVATAR_POSITIONS = {
    "A": {
        x: 360,
        y: 100
    },
    "B": {
        x: 620,
        y: 280
    },
    "C": {
        x: 620,
        y: 880
    },
    "D": {
        x: 360,
        y: 1080
    },
    "E": {
        x: 100,
        y: 880
    },
    "F": {
        x: 100,
        y: 280
    },
}