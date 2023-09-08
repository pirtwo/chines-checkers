import * as PIXI from "pixi.js";
import Scene from "./scene";
import app from "../index";
import Board from "../board";
import Player from "../player";
import Button from "../view/button";
import Panel from "../modal/tutorial-modal";
import {
    COLOR_PALETTE
} from "../color-palette";

export default class TutorialScene extends Scene {
    constructor(sceneManager, tween) {
        super("tutorial");

        let ctx = null;
        let tileset = app.loader.resources.tileset.textures;
        let sounds = app.loader.resources.sounds.sound;

        this.sceneManager = sceneManager;
        this.tween = tween;
        this.currStep = 1;

        // add game board background
        // ctx = new PIXI.Graphics();
        // ctx.beginFill(0xfff8cd);
        // ctx.drawCircle(0, 0, 370);
        // ctx.endFill();
        // this.boardBackground = new PIXI.Sprite(app.renderer.generateTexture(ctx));
        // this.boardBackground.width = 370;
        // this.boardBackground.height = 450;
        // this.boardBackground.position.set(0, 0);
        // this.addChild(this.boardBackground);

        // create game board
        this.board = new Board({
            tween: tween,
            sounds: sounds,
            textures: {
                pegs: {
                    "red": tileset["orb_red.png"],
                    "blue": tileset["orb_blue.png"],
                    "yellow": tileset["orb_yellow.png"],
                },
                spot: tileset["spot.png"],
                indicator: tileset["indicator.png"]
            }
        });
        this.board.container.position.set(app.screen.width / 2, 30);
        this.addChild(this.board.container);


        this.player = new Player({
            type: "human",
            color: "red",
            triangle: "D"
        });

        this.opponent1 = new Player({
            type: "human",
            color: "blue",
            triangle: "A"
        });

        this.opponent2 = new Player({
            type: "human",
            color: "yellow",
            triangle: "F"
        });

        this.board
            .setPlayers([this.player, this.opponent1, this.opponent2])
            .setPlayer(this.player)
            .setTurn(this.player);

        // create back button
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
            this.transOut().then(() => {
                this.hide();
                this.sceneManager.find("menu").show().transIn();
            });
        };
        this.addChild(this.backBtn);

        // create pointer
        this.pointer = new PIXI.Sprite(tileset["pointer.png"]);
        this.pointer.scale.set(0.7);
        this.pointer.visible = false;
        this.addChild(this.pointer);

        // create tutorial guid panel
        this.panel = new Panel(this.tween);
        this.addChild(this.panel);


        // tutorial logic happens here
        this.board.onMoveExecuted = () => {
            if (this.currStep === 4) {
                this.panel.nextBtn.visible = true;
            } else if (this.currStep === 5) {
                if (this.board.state.find(n => n.x === 0 && n.y === 4).peg === "D") {
                    this.panel.nextBtn.visible = true;
                } else {
                    this.loadStep(5);
                }
            } else if (this.currStep === 7) {
                if (this.board.state.find(n => n.x === -2 && n.y === 2).peg === "D") {
                    this.panel.nextBtn.visible = true;
                } else {
                    this.loadStep(7);
                }
            } else if (this.currStep === 8) {
                if (this.board.state.find(n => n.x === -1 && n.y === 1).peg === "D") {
                    this.panel.nextBtn.visible = true;
                } else {
                    this.loadStep(8);
                }
            } else if (this.currStep === 9) {
                if (this.board.checkWin(this.player)) {
                    this.panel.nextBtn.visible = true;
                } else {
                    this.loadStep(9);
                }
            }
        }

        this.panel.nextBtn.pointerTapCallback = () => {
            // hide panel
            sounds.play("click");
            this.panel.transOut(10).then(() => {
                this.panel.hide();
                this.currStep++;
                this.loadStep(this.currStep);
            });
        };

        this.panel.exitBtn.pointerTapCallback = () => {
            sounds.play("click");
            this.transOut().then(() => {
                this.hide();
                this.sceneManager.find("menu").show().transIn();
            });
        }
    }

    init() {
        this.currStep = 1;
        this.pointer.visible = false;
        this.panel.nextBtn.visible = true;
        this.panel.exitBtn.visible = false;
        this.panel.position.set(
            app.screen.width / 2 - this.panel.body.width / 2, app.screen.height);

        this.board
            .setState([])
            .setPlayers([this.player, this.opponent1, this.opponent2])
            .setPlayer(this.player)
            .setTurn(this.player);
            
        this.board.hasHints = true;
        this.board.hideHints();
        
        return this;
    }

    loadStep(key) {
        let step = TUTORIAL_DATA[`${key}`];

        this.panel.setTitle(step.title);
        this.panel.setTextArea(step.text);
        this.pointer.visible = step.hasPointer;
        this.panel.nextBtn.visible = step.hasNextBtn;
        this.panel.exitBtn.visible = step.hasFinishBtn;

        this.board.setTurn(this.board.players.find(n => n.triangle === step.player));
        if (step.boardState)
            this.board.setState(step.boardState);

        if (step.hasPointer) {
            if (this.pointer.tween)
                this.tween.removeTween(this.pointer.tween);

            this.pointer.position.set(step.pointerPosition.x, step.pointerPosition.y);
            this.pointer.tween = this.tween.slide(
                this.pointer,
                step.pointerTarget.x,
                step.pointerTarget.y,
                step.pointerSpeed ? step.pointerSpeed : 30,
                "smoothstep", true);
        }

        this.tween.wait(500).then(() => {
            this.panel.show().transIn(10);
        });
    }

    update() {
        this.board.update();
    }
}


const TUTORIAL_DATA = {
    "1": {
        title: "WELCOME",
        text: "In this tutorial, you will learn the rules of Chinese Checkers. Click next to continue ...",
        boardState: [{
                x: 0,
                y: 0,
                peg: "A"
            },
            {
                x: -1,
                y: 1,
                peg: "A"
            },
            {
                x: 1,
                y: 1,
                peg: "A"
            },
            {
                x: -2,
                y: 2,
                peg: "A"
            },
            {
                x: 0,
                y: 2,
                peg: "A"
            },
            {
                x: 2,
                y: 2,
                peg: "A"
            },
            {
                x: -3,
                y: 3,
                peg: "A"
            },
            {
                x: -1,
                y: 3,
                peg: "A"
            },
            {
                x: 1,
                y: 3,
                peg: "A"
            },
            {
                x: 3,
                y: 3,
                peg: "A"
            },
            {
                x: 0,
                y: 16,
                peg: "D"
            },
            {
                x: -1,
                y: 15,
                peg: "D"
            },
            {
                x: 1,
                y: 15,
                peg: "D"
            },
            {
                x: -2,
                y: 14,
                peg: "D"
            },
            {
                x: 0,
                y: 14,
                peg: "D"
            },
            {
                x: 2,
                y: 14,
                peg: "D"
            },
            {
                x: -3,
                y: 13,
                peg: "D"
            },
            {
                x: -1,
                y: 13,
                peg: "D"
            },
            {
                x: 1,
                y: 13,
                peg: "D"
            },
            {
                x: 3,
                y: 13,
                peg: "D"
            },
        ],
        player: "",
        hasNextBtn: true,
        hasFinishBtn: false,
        hasPointer: false,
        pointerPosition: {
            x: 0,
            y: 0
        },
        pointerTarget: {
            x: 0,
            y: 0
        },
    },
    "2": {
        title: "PLAYERS",
        text: "Each player have 10 pices. Turns proceed clockwise around the board...",
        boardState: [{
                x: 0,
                y: 0,
                peg: "A"
            },
            {
                x: -1,
                y: 1,
                peg: "A"
            },
            {
                x: 1,
                y: 1,
                peg: "A"
            },
            {
                x: -2,
                y: 2,
                peg: "A"
            },
            {
                x: 0,
                y: 2,
                peg: "A"
            },
            {
                x: 2,
                y: 2,
                peg: "A"
            },
            {
                x: -3,
                y: 3,
                peg: "A"
            },
            {
                x: -1,
                y: 3,
                peg: "A"
            },
            {
                x: 1,
                y: 3,
                peg: "A"
            },
            {
                x: 3,
                y: 3,
                peg: "A"
            },
            {
                x: 0,
                y: 16,
                peg: "D"
            },
            {
                x: -1,
                y: 15,
                peg: "D"
            },
            {
                x: 1,
                y: 15,
                peg: "D"
            },
            {
                x: -2,
                y: 14,
                peg: "D"
            },
            {
                x: 0,
                y: 14,
                peg: "D"
            },
            {
                x: 2,
                y: 14,
                peg: "D"
            },
            {
                x: -3,
                y: 13,
                peg: "D"
            },
            {
                x: -1,
                y: 13,
                peg: "D"
            },
            {
                x: 1,
                y: 13,
                peg: "D"
            },
            {
                x: 3,
                y: 13,
                peg: "D"
            },
        ],
        player: "",
        hasNextBtn: true,
        hasFinishBtn: false,
        hasPointer: false,
        pointerPosition: {
            x: 0,
            y: 0
        },
        pointerTarget: {
            x: 0,
            y: 0
        },
    },
    "3": {
        title: "GOAL",
        text: "Race all your pieces into the opposite corner (Home)...",
        boardState: [{
                x: 0,
                y: 16,
                peg: "D"
            },
            {
                x: -1,
                y: 15,
                peg: "D"
            },
            {
                x: 1,
                y: 15,
                peg: "D"
            },
            {
                x: -2,
                y: 14,
                peg: "D"
            },
            {
                x: 0,
                y: 14,
                peg: "D"
            },
            {
                x: 2,
                y: 14,
                peg: "D"
            },
            {
                x: -3,
                y: 13,
                peg: "D"
            },
            {
                x: -1,
                y: 13,
                peg: "D"
            },
            {
                x: 1,
                y: 13,
                peg: "D"
            },
            {
                x: 3,
                y: 13,
                peg: "D"
            },
        ],
        player: "",
        hasNextBtn: true,
        hasFinishBtn: false,
        hasPointer: true,
        pointerPosition: {
            x: 250,
            y: 100
        },
        pointerTarget: {
            x: 260,
            y: 100
        },
    },
    "4": {
        title: "PIECES",
        text: "You can move a piece one step in any direction to an adjacent empty space. Move the red piece...",
        boardState: [{
            x: 0,
            y: 8,
            peg: "D"
        }],
        player: "D",
        hasNextBtn: false,
        hasFinishBtn: false,
        hasPointer: true,
        pointerPosition: {
            x: 200,
            y: 380
        },
        pointerTarget: {
            x: 210,
            y: 380
        },
    },
    "5": {
        title: "PIECES",
        text: "A piece can jump over it's adjacent to an empty space. Move the red piece to the pointer...",
        boardState: [{
                x: 1,
                y: 5,
                peg: "A"
            },
            {
                x: 0,
                y: 6,
                peg: "D"
            },
            {
                x: -1,
                y: 7,
                peg: "A"
            },
            {
                x: 0,
                y: 8,
                peg: "D"
            }
        ],
        player: "D",
        hasNextBtn: false,
        hasFinishBtn: false,
        hasPointer: true,
        pointerPosition: {
            x: 230,
            y: 400
        },
        pointerTarget: {
            x: 230,
            y: 200
        },
        pointerSpeed: 120,
    },
    "6": {
        title: "TRIANGLES",
        text: "Your pieces can't stay inside another player triangle or its opposite (Home) ...",
        boardState: [{
                x: 0,
                y: 0,
                peg: "A"
            },
            {
                x: -1,
                y: 1,
                peg: "A"
            },
            {
                x: 1,
                y: 1,
                peg: "A"
            },
            {
                x: -5,
                y: 5,
                peg: "A"
            },
            {
                x: 0,
                y: 4,
                peg: "A"
            },
            {
                x: 2,
                y: 2,
                peg: "A"
            },
            {
                x: -3,
                y: 3,
                peg: "A"
            },
            {
                x: -1,
                y: 3,
                peg: "A"
            },
            {
                x: 1,
                y: 3,
                peg: "A"
            },
            {
                x: 3,
                y: 3,
                peg: "A"
            },
            // yellow
            {
                x: -12,
                y: 4,
                peg: "F"
            },
            {
                x: -10,
                y: 4,
                peg: "F"
            },
            {
                x: -8,
                y: 4,
                peg: "F"
            },
            {
                x: -6,
                y: 4,
                peg: "F"
            },
            {
                x: -11,
                y: 5,
                peg: "F"
            },
            {
                x: -9,
                y: 5,
                peg: "F"
            },
            {
                x: -7,
                y: 5,
                peg: "F"
            },
            {
                x: 0,
                y: 8,
                peg: "F"
            },
            {
                x: -8,
                y: 6,
                peg: "F"
            },
            {
                x: -9,
                y: 7,
                peg: "F"
            },

            // yellow
            {
                x: 0,
                y: 16,
                peg: "D"
            },
            {
                x: -1,
                y: 15,
                peg: "D"
            },
            {
                x: 1,
                y: 15,
                peg: "D"
            },
            {
                x: -2,
                y: 14,
                peg: "D"
            },
            {
                x: 0,
                y: 14,
                peg: "D"
            },
            {
                x: 2,
                y: 14,
                peg: "D"
            },
            {
                x: -8,
                y: 8,
                peg: "D"
            },
            {
                x: -1,
                y: 13,
                peg: "D"
            },
            {
                x: 1,
                y: 13,
                peg: "D"
            },
            {
                x: 3,
                y: 13,
                peg: "D"
            },
        ],
        player: "",
        hasNextBtn: true,
        hasFinishBtn: false,
        hasPointer: false,
        pointerPosition: {
            x: 0,
            y: 0
        },
        pointerTarget: {
            x: 0,
            y: 0
        },
    },
    "7": {
        title: "TRIANGLES",
        text: "You can cross another player triangle or its home by moving in and out of it. Move the red piece to the pointer...",
        boardState: [{
                x: 0,
                y: 0,
                peg: "A"
            },
            {
                x: -1,
                y: 1,
                peg: "A"
            },
            {
                x: 1,
                y: 1,
                peg: "A"
            },
            {
                x: -5,
                y: 5,
                peg: "A"
            },
            {
                x: 0,
                y: 4,
                peg: "A"
            },
            {
                x: 2,
                y: 2,
                peg: "A"
            },
            {
                x: -3,
                y: 3,
                peg: "A"
            },
            {
                x: -1,
                y: 3,
                peg: "A"
            },
            {
                x: 1,
                y: 3,
                peg: "A"
            },
            {
                x: 3,
                y: 3,
                peg: "A"
            },
            // yellow
            {
                x: -12,
                y: 4,
                peg: "F"
            },
            {
                x: -10,
                y: 4,
                peg: "F"
            },
            {
                x: -8,
                y: 4,
                peg: "F"
            },
            {
                x: -6,
                y: 4,
                peg: "F"
            },
            {
                x: -11,
                y: 5,
                peg: "F"
            },
            {
                x: -9,
                y: 5,
                peg: "F"
            },
            {
                x: -7,
                y: 5,
                peg: "F"
            },
            {
                x: 0,
                y: 8,
                peg: "F"
            },
            {
                x: -8,
                y: 6,
                peg: "F"
            },
            {
                x: -9,
                y: 7,
                peg: "F"
            },

            // yellow
            {
                x: 0,
                y: 16,
                peg: "D"
            },
            {
                x: -1,
                y: 15,
                peg: "D"
            },
            {
                x: 1,
                y: 15,
                peg: "D"
            },
            {
                x: -2,
                y: 14,
                peg: "D"
            },
            {
                x: 0,
                y: 14,
                peg: "D"
            },
            {
                x: 2,
                y: 14,
                peg: "D"
            },
            {
                x: -8,
                y: 8,
                peg: "D"
            },
            {
                x: -1,
                y: 13,
                peg: "D"
            },
            {
                x: 1,
                y: 13,
                peg: "D"
            },
            {
                x: 3,
                y: 13,
                peg: "D"
            },
        ],
        player: "D",
        hasNextBtn: false,
        hasFinishBtn: false,
        hasPointer: true,
        pointerPosition: {
            x: 30,
            y: 390
        },
        pointerTarget: {
            x: 200,
            y: 110
        },
        pointerSpeed: 120
    },
    "8": {
        title: "HOME",
        text: "When your piece enters the opposite triangle (Home) it can't move out of it. Move the red piece to the pointer...",
        boardState: [{
                x: -3,
                y: 3,
                peg: "D"
            },
            {
                x: 0,
                y: 12,
                peg: "D"
            },
            {
                x: -1,
                y: 13,
                peg: "D"
            },
            {
                x: 1,
                y: 13,
                peg: "D"
            },
            {
                x: -2,
                y: 2,
                peg: "A"
            },
            {
                x: 0,
                y: 2,
                peg: "A"
            },
            {
                x: 0,
                y: 0,
                peg: "A"
            },
            {
                x: 0,
                y: 2,
                peg: "A"
            },
        ],
        player: "D",
        hasNextBtn: false,
        hasFinishBtn: false,
        hasPointer: true,
        pointerPosition: {
            x: 200,
            y: 60
        },
        pointerTarget: {
            x: 210,
            y: 60
        },
    },
    "9": {
        title: "WINING",
        text: "A player wins the game by capturing all empty spots in the opposite triangle (Home). Fill the only spot in home...",
        boardState: [{
                x: 0,
                y: 12,
                peg: "D"
            },
            {
                x: -1,
                y: 13,
                peg: "D"
            },
            {
                x: 1,
                y: 13,
                peg: "D"
            },
            {
                x: 1,
                y: 1,
                peg: "D"
            },
            {
                x: 2,
                y: 2,
                peg: "D"
            },
            {
                x: 0,
                y: 6,
                peg: "D"
            },
            {
                x: 0,
                y: 0,
                peg: "A"
            },
            {
                x: -1,
                y: 1,
                peg: "A"
            },
            {
                x: -2,
                y: 2,
                peg: "A"
            },
            {
                x: -3,
                y: 3,
                peg: "A"
            },
            {
                x: -1,
                y: 3,
                peg: "A"
            },
            {
                x: 1,
                y: 3,
                peg: "A"
            },
            {
                x: 3,
                y: 3,
                peg: "A"
            },
            {
                x: -1,
                y: 5,
                peg: "A"
            },
        ],
        player: "D",
        hasNextBtn: false,
        hasFinishBtn: false,
        hasPointer: true,
        pointerPosition: {
            x: 250,
            y: 300
        },
        pointerTarget: {
            x: 250,
            y: 120
        },
        pointerSpeed: 120
    },
    "10": {
        title: "AWSOME",
        text: "YOU WON. Now you are ready for a real game, go to the main menu, and play with BOT or other players out there. Good luck have fun.",
        boardState: null,
        player: "",
        hasNextBtn: false,
        hasFinishBtn: true,
        hasPointer: false,
        pointerPosition: {
            x: 0,
            y: 0
        },
        pointerTarget: {
            x: 0,
            y: 0
        },
    },
}