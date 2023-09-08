import {
    Container,
    Graphics,
    Sprite,
    Text
} from "pixi.js";
import app from "..";
import Button from "../view/button";
import Timer from "../view/timer";
import Scene from "./scene";
import Player from "../player";
import BotPlayer from "../bot";
import textStyleFactory from "../text-style";
import PlayerAvatar from "../view/player-avatar";
import {
    COLOR_PALETTE
} from "../color-palette";
import {
    shuffle
} from "../lib/utils";

export default class MatchMakingScene extends Scene {
    constructor(sceneManager, tween) {
        super("matchMaking");

        this.tween = tween;
        this.sceneManager = sceneManager;
        this.playerAvatars = new Container();

        let tileset = app.loader.resources.tileset.textures;
        let sounds = app.loader.resources.sounds.sound;

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
            sounds.play("click");
            this.stopFinding();
            this.transOut(10).then(() => {
                this.hide();
                this.sceneManager.find("menu").show().transIn(10);
            });
        };
        this.addChild(this.backBtn);

        // create text
        let textStyle = textStyleFactory("smallText");
        textStyle.fontSize = 30;
        textStyle.lineHeight = 35;
        textStyle.align = "center";
        textStyle.wordWrap = true;
        textStyle.wordWrapWidth = 400;
        this.messagebox = new Text("0 player found, looking for more", textStyle);

        // create timer
        let timerStyle = textStyleFactory("largeText");
        timerStyle.align = "center";
        timerStyle.wordWrap = true;
        timerStyle.wordWrapWidth = 150;
        timerStyle.letterSpacing = 2;
        this.timer = new Timer();
        this.timer.textbox.style = timerStyle;

        // create circles
        this.circle = new Container();
        let ctx = new Graphics();
        ctx.beginFill(COLOR_PALETTE["color-1"]);
        ctx.lineStyle(15, COLOR_PALETTE["color-4"]);
        ctx.drawCircle(0, 0, 250);
        ctx.endFill();
        this.center = ctx;

        ctx = new Graphics();
        ctx.beginFill(COLOR_PALETTE["color-3"]);
        ctx.drawCircle(0, 0, 240);
        ctx.endFill();
        this.background = ctx;

        this.circle.addChild(this.background, this.center, this.messagebox, this.timer);
        this.messagebox.position.set(-this.messagebox.width / 2, -this.messagebox.height / 2 - 30);
        this.timer.position.set(-this.timer.width / 2, 15);

        this.circle.position.set(app.screen.width / 2, app.screen.height / 2);
        this.addChild(this.playerAvatars, this.circle);

        // set tweens
        this.background.alpha = 0.01;
        this.tween.pulse(this.background, 60, 0.25);
        this.tween.breathe(this.background, 1.2, 1.2, 60);
    }

    findMatch() {
        let playerFound = 1;

        this.timer.clear();
        this.playerAvatars.removeChildren(0);

        colyseus.joinOrCreate('cc_room').then(room => {
            room.state.players.onAdd = () => {
                playerFound++;
                let playerAvatar = new PlayerAvatar({
                    name: "Guest",
                    pictureURL: "/assets/images/player.png"
                });
                this.addAvatar(playerAvatar);
            }

            // set timer for 30 sec
            this.timer.setTrigger(0, 10, () => {
                this.timer.pause();
                if (playerFound > 2) {
                    this.startMultiplayer();
                } else {
                    this.startBotMatch();
                }
            });
            this.timer.start();

        }).catch(error => {
            this.setMessage("connection error, starting bot match ...");
            this.startBotMatch();
        });
    }

    stopFinding() {
        this.timer.clear();
    }

    startBotMatch() {
        let bots = [],
            botNum = 5,
            colors = shuffle(PLAYER_COLORS.slice()),
            positions = shuffle(PLAYER_POSITIONS.slice());

        this.playerAvatars.removeChildren(0);

        // create players
        let player = new Player({
            type: "human",
            color: colors.pop(),
            triangle: positions.pop(),
            picture: "/assets/images/player.png"
        });

        // create bots
        for (let i = 0; i < botNum; i++) {
            bots.push(new BotPlayer({
                name: `BOT ${i+1}`,
                color: colors.pop(),
                triangle: positions.pop(),
                boardManager: this.board,
                picture: "/assets/images/bot.png"
            }));
        }

        let players = [player, ...bots];
        players = players.sort((a, b) => a.triangle < b.triangle ? -1 : 1);

        for (let i = 0; i < players.length; i++) {
            const curr = players[i];

            let avatar = new PlayerAvatar({
                name: curr.name,
                pictureURL: curr.picture
            });

            setTimeout(() => {
                this.addAvatar(avatar);
            }, i * 1000);
        }

        // got to game scene
        this.tween.wait(6000).then(() => {
            this.transOut(10).then(() => {
                let game = this.sceneManager.find("game");
                game.init()
                    .show()
                    .transIn(10)
                    .then(() => {
                        game.newSinglePlayer(player, bots);
                    });
                this.timer.clear();
                this.hide();
            });
        });
    }

    startMultiplayer() {
        this.transOut(10).then(() => {
            let game = this.sceneManager.find("game");
            game.init()
                .show()
                .transIn(10)
                .then(() => {
                    game.newMultiPlayer(room, players);
                });
            this.timer.clear();
            this.hide();
        });
    }

    addAvatar(avatar) {
        let x, y,
            paddingX = 200,
            paddingY = 400;

        this.playerAvatars.addChild(avatar);
        avatar.position.set(
            app.screen.width / 2 - avatar.width / 2,
            app.screen.height / 2 - avatar.height / 2);

        for (let i = 0; i < this.playerAvatars.children.length; i++) {
            const curr = this.playerAvatars.getChildAt(i);

            if (i < 3) {
                x = (i * paddingX) + (app.screen.width / 2 - paddingX);
                y = app.screen.height / 2 - paddingY;
            } else {
                x = (i - 3) * paddingX + (app.screen.width / 2 - paddingX);
                y = app.screen.height / 2 + paddingY;
            }

            this.tween.slide(curr, x - curr.width / 2, y - curr.height / 2, 10);
        }
    }

    setMessage(msg) {
        this.messagebox.text = msg;
        this.messagebox.position.set(
            -this.messagebox.width / 2, -this.messagebox.height / 2 - 30);
    }
}


const PLAYER_POSITIONS = ["A", "B", "C", "D", "E", "F"];
const PLAYER_COLORS = ["red", "black", "pink", "blue", "green", "yellow"];