import {
    Container,
    Graphics,
    Sprite
} from "pixi.js";
import app from ".";

export default class Board {
    constructor({
        tween,
        textures,
        sounds,
        onTurnChanged,
        onMoveExecuted,
        options = {
            pegSize: 35,
            spotSize: 45,
            spotPadding: 27,
            indicatorSize: 45,
            indicatorsColor: 0xee6f57,
            indicatorAlpha: 0.8,
            connectionsWidth: 2,
            connectionsColor: 0x070d59,
        }
    }) {
        this.state = [];
        this.mode = null;
        this.tween = tween;
        this.hasHints = true;
        this.player = null;
        this.players = [];
        this.playerTurn = null;
        this.locked = false;

        // drawing components
        this.textures = textures;
        this.container = new Container();
        this.spots = new Container();
        this.lines = new Sprite(null);
        this.pegs = new Container();
        this.indicators = new Container();
        this.pegs.sortableChildren = true;
        this.container.addChild(
            this.lines, this.spots, this.indicators, this.pegs);

        // sounds
        this.sounds = sounds;

        // options
        this.options = options;

        // callbacks        
        this.onTurnChanged = onTurnChanged;
        this.onMoveExecuted = onMoveExecuted;

        this.initState().setup(this.options);
    }

    /**
     * initialize the game state (creates grid of spots for chinese checkers board).
     */
    initState() {
        /**
         * this function creates a grid of spots for
         * chinese checkers board. points starts from 
         * (x:0, y:0) and each row of the grid equaly 
         * devided related to Y axies. Distance between 
         * spots in X axe is 2 and in Y axe is 1. below 
         * is example of spots positions in the grid:
         * 
         *          .    (0,0)   .
         *        (-1,1)   .   (1,1)
         * (-2,2)   .    (0,2)   .   (2,2)                
         * 
         */

        let currIdx = 0;
        this.state = [];

        for (let i = 0; i < ROWS.length; i++) {
            let spotCount = ROWS[i];
            let x = i > 0 ? -spotCount + 1 : 0;
            let y = i;

            for (let j = 0; j < spotCount; j++) {
                let spot = new Spot(x, y, this);

                // find related triangle for current spot
                Object.keys(TRIANGLES).forEach(t => {
                    if (TRIANGLES[t].indexes.indexOf(currIdx) > -1) {
                        spot.triangle = t;
                    }
                });

                this.state.push(spot);
                x += 2;
                currIdx++;
            }
        }

        return this;
    }

    setState(state) {
        // clear current state
        this.state.map(n => {
            n.peg = null;
        });

        // clear all peg sprites
        this.pegs.removeChildren(0);

        // update board state
        for (let i = 0; i < state.length; i++) {
            let curr = state[i];
            let spot = this.state.find(n => n.x === curr.x && n.y === curr.y);
            let player = this.players.find(p => p.triangle === curr.peg);
            spot.peg = curr.peg;

            let peg = new Sprite(this.textures.pegs[player.color]);
            peg.width = this.options.pegSize;
            peg.height = this.options.pegSize;
            peg.name = player.triangle;
            peg.spot = spot;
            peg.anchor.set(0.5);
            peg.position.set(spot.sprite.x, spot.sprite.y);
            peg.zIndex = 3;

            // make user pegs interactive
            if (player === this.player) {
                peg.interactive = true;
                peg.buttonMode = true;
                peg.on("pointertap", () => {
                    if (this.locked)
                        return;

                    this.hideHints();
                    peg.spot.indicator.visible = true;

                    if (this.player === this.playerTurn) {
                        this.sounds.play("peg_select");
                        this.player.select(peg);
                        if (this.hasHints) {
                            this.showHints(peg.spot);
                        }
                    }
                });
            }

            this.pegs.addChild(peg);
        }

        return this;
    }

    /**
     * creates the board graphics and sprites.
     * @param {object} options 
     */
    setup(options) {
        let ctx,
            lines = new Container(),
            offsetX = 0,
            offsetY = 10,
            spotPaddingX = options.spotPadding,
            spotPaddingY = spotPaddingX * 1.7;

        // create game board
        for (let i = 0; i < this.state.length; i++) {
            let spot = this.state[i];

            // create spots
            let sp = new Sprite(this.textures.spot);
            sp.width = options.spotSize;
            sp.height = options.spotSize;
            sp.anchor.set(0.5);
            sp.zIndex = 1;
            sp.position.set(
                spot.x * spotPaddingX + offsetX,
                spot.y * spotPaddingY + offsetY);
            sp.interactive = true;
            sp.buttonMode = true;
            sp.on("pointertap", () => {
                this.hideHints();
                if (this.player === this.playerTurn &&
                    this.player.pegInHand &&
                    spot.isEmpty()
                ) {
                    this.move(this.player.pegInHand, spot);
                }
            });
            this.spots.addChild(sp);
            spot.sprite = sp;

            // create hint indicator
            let indicator = new Sprite(this.textures.indicator);
            indicator.spot = spot;
            indicator.tint = options.indicatorsColor;
            indicator.width = options.indicatorSize;
            indicator.height = options.indicatorSize;
            indicator.alpha = options.indicatorAlpha;
            indicator.zIndex = 2;
            indicator.anchor.set(0.5);
            indicator.position.set(sp.x, sp.y);
            indicator.visible = false;
            this.indicators.addChild(indicator);
            spot.indicator = indicator;

            // connect current spot to its left, 
            // bottom left and bottom right spots.
            ctx = new Graphics();
            if (this.isSpotExist(spot.x + 2, spot.y)) {
                ctx.beginFill(options.connectionsColor);
                ctx.lineStyle(options.connectionsWidth, options.connectionsColor);
                ctx.moveTo(sp.x, sp.y);
                ctx.lineTo(sp.x + spotPaddingX * 2, sp.y);
                ctx.endFill();
            }
            if (this.isSpotExist(spot.x - 1, spot.y + 1)) {
                ctx.beginFill(options.connectionsColor);
                ctx.lineStyle(options.connectionsWidth, options.connectionsColor);
                ctx.moveTo(sp.x, sp.y);
                ctx.lineTo(sp.x - spotPaddingX, sp.y + spotPaddingY);
                ctx.endFill();
            }
            if (this.isSpotExist(spot.x + 1, spot.y + 1)) {
                ctx.beginFill(options.connectionsColor);
                ctx.lineStyle(options.connectionsWidth, options.connectionsColor);
                ctx.moveTo(sp.x, sp.y);
                ctx.lineTo(sp.x + spotPaddingX, sp.y + spotPaddingY);
                ctx.endFill();
            }
            this.lines.addChild(ctx);
        }

        this.lines.texture = app.renderer.generateTexture(lines)
    }

    /**
     * creates new game with current players and sets
     * each players pegs position to player triangle.
     */
    newGame() {
        // reset board state
        this.state.map(n => {
            n.peg = null;
        });

        // clear all peg sprites from last game
        this.pegs.removeChildren(0);

        // create new pegs for players
        for (let i = 0; i < this.players.length; i++) {
            const player = this.players[i];
            const indexes = TRIANGLES[player.triangle].indexes;

            for (let j = 0; j < indexes.length; j++) {
                const spot = this.state[indexes[j]];
                spot.peg = player.triangle;

                let peg = new Sprite(this.textures.pegs[player.color]);
                peg.width = this.options.pegSize;
                peg.height = this.options.pegSize;
                peg.name = spot.triangle;
                peg.spot = spot;
                peg.anchor.set(0.5);
                peg.position.set(spot.sprite.x, spot.sprite.y);
                peg.zIndex = 3;

                // make user pegs interactive
                if (player === this.player) {
                    peg.interactive = true;
                    peg.buttonMode = true;
                    peg.on("pointertap", () => {
                        if (this.locked)
                            return;

                        this.hideHints();
                        peg.spot.indicator.visible = true;

                        if (this.player === this.playerTurn) {
                            this.sounds.play("peg_select");
                            this.player.select(peg);
                            if (this.hasHints) {
                                this.showHints(peg.spot);
                            }
                        }
                    });
                }

                this.pegs.addChild(peg);
            }
        }
    }

    /**
     * returns adjacent spots of the spot.
     * @param {Spot} spot 
     */
    getAdjacent(spot) {
        return [
            this.state.find(s => s.x === spot.x - 2 && s.y === spot.y),
            this.state.find(s => s.x === spot.x + 2 && s.y === spot.y),
            this.state.find(s => s.x === spot.x - 1 && s.y === spot.y - 1),
            this.state.find(s => s.x === spot.x + 1 && s.y === spot.y - 1),
            this.state.find(s => s.x === spot.x - 1 && s.y === spot.y + 1),
            this.state.find(s => s.x === spot.x + 1 && s.y === spot.y + 1),
        ].filter(n => n != undefined);
    }

    /**
     * returns all possible routes from src spot for player.
     * @param {Spot} src 
     */
    getRoutes(player, src) {
        let curr,
            open = [],
            closed = [],
            routes = [];

        src.parent = null;
        open.push(src);

        while (open.length > 0) {
            curr = open.pop();

            if (curr != src)
                routes.push(curr);

            curr.getAdjacent().forEach(adj => {
                if (curr === src && adj.isEmpty()) {
                    adj.parent = curr;
                    routes.push(adj);
                }
                if (!adj.isEmpty()) {
                    let dest = curr.jump(adj);
                    if (dest && dest.isEmpty() && closed.indexOf(dest) === -1) {
                        dest.parent = curr;
                        open.push(dest);
                    }
                }
            });
            closed.push(curr);
        }

        /**
         * apply some rules to the routes in hand:
         * 
         * rule: If the peg is in home it can't move out of the home.
         * rule: peg can't stay in other player's triangle or its home.
         */

        let home = this.getHomeTriangle(player.triangle);

        if (src.triangle === home.name) {
            routes = routes.filter(r => r.triangle === home.name);
        }

        return routes.filter(r =>
            r.triangle == null ||
            r.triangle == player.triangle ||
            r.triangle == home.name ||
            !this.players.find(p => p.triangle === r.triangle ||
                this.getHomeTriangle(p.triangle).name === r.triangle));
    }

    /**
     * extracts each spot in the route from src to dest.
     * @param {Spot} route 
     */
    extractSteps(route) {
        let currStep = route,
            steps = [];

        while (currStep != null) {
            steps.unshift(currStep);
            currStep = currStep.parent;
        }

        return steps;
    }

    /**
     * checks to see the Spot with x and y exists in game state array.
     * @param {number} x 
     * @param {number} y 
     */
    isSpotExist(x, y) {
        return this.state.find(n => n.x === x && n.y === y) != undefined;
    }

    /**
     * moves a peg from spot A to spot B.
     * @param {Spot} spotA 
     * @param {Spot} spotB 
     */
    move(peg, des) {
        let src = peg.spot;
        let route = this.getRoutes(this.playerTurn, src).find(n => n === des);

        if (src != des && des.isEmpty() && route != null) {
            src.peg = null;
            peg.spot = des;
            des.peg = peg.name;

            let steps = this.extractSteps(route).map(n => {
                return [n.sprite.x, n.sprite.y]
            });

            peg.zIndex = 100;
            this.locked = true; // lock the board till peg animation is finished

            let moveCount = 0;
            this.tween.walkPath(
                peg, steps, (steps.length - 1) * 20, "smoothstep", false, false, 100,
                () => {
                    this.sounds.play("peg_move");
                    moveCount++;
                    if (moveCount === steps.length - 1) {
                        peg.zIndex = 3;
                        this.locked = false;
                        if (this.onMoveExecuted)
                            this.onMoveExecuted(this.playerTurn);
                    }
                }
            );
        }
    }

    /**
     * assigns the turn to next player.
     */
    nextTurn() {
        let currPlayerIdx = this.players.indexOf(this.playerTurn);
        this.playerTurn = currPlayerIdx + 1 >= this.players.length ?
            this.players[0] : this.players[currPlayerIdx + 1];

        if (this.onTurnChanged)
            this.onTurnChanged(this.playerTurn);

        return this.playerTurn;
    }

    /**
     * checks win conditions for the player. returns true
     * if all empty spots in home triangle is captured 
     * by player.
     * 
     * @param {object} player 
     */
    checkWin(player) {
        let oppTri = this.getHomeTriangle(player.triangle);
        let triSpots = this.state.filter((v, i) => oppTri.indexes.indexOf(i) > -1);

        return triSpots.some(n => n.peg === player.triangle) && triSpots.every(n => !n.isEmpty());
    }

    /**
     * hides all hints.
     */
    hideHints() {
        this.state.forEach(spot => {
            spot.indicator.visible = false;
        });
    }

    /**
     * shows available moves to player.
     * @param {Spot} spot 
     */
    showHints(spot) {
        let destnations = this.getRoutes(this.playerTurn, spot);
        spot.indicator.visible = true;
        destnations.forEach(dest => {
            dest.indicator.visible = true;
        });
    }

    /**
     * returns the facing triangle of current triangle.
     * @param {string} triangle 
     */
    getHomeTriangle(triangle) {
        switch (triangle) {
            case "A":
                return TRIANGLES["D"];
            case "B":
                return TRIANGLES["E"];
            case "C":
                return TRIANGLES["F"];
            case "D":
                return TRIANGLES["A"];
            case "E":
                return TRIANGLES["B"];
            case "F":
                return TRIANGLES["C"];
            default:
                throw Error(`invalid triangle name ${triangle}.`);
        }
    }

    /**
     * sets the user.
     * @param {Player} value 
     */
    setPlayer(value) {
        this.player = value;
        return this;
    }

    /**
     * sets player turn.
     * @param {Player} value 
     */
    setTurn(value) {
        this.playerTurn = value;
        return this;
    }

    /**
     * sets list of players.
     * @param {Array} palyers 
     */
    setPlayers(value) {
        this.players = value;
        return this;
    }

    /**
     * sets game mode.
     * @param {string} value bot or multiplayer
     */
    setMode(value) {
        if (value != "bot" && value != "multiplayer")
            throw Error(`invalid game mode ${value}.`);
        this.mode = value;
    }

    update() {
        for (let i = 0; i < this.indicators.children.length; i++) {
            this.indicators.getChildAt(i).rotation += 0.01;
        }
    }
}

class Spot {
    constructor(x, y, board, triangle = null, peg = null) {
        this.x = x;
        this.y = y;
        this.peg = peg;
        this.board = board;
        this.triangle = triangle;
    }

    jump(over) {
        if (!this.isAdjacentWith(over))
            throw Error("can't jump over non adjacent spot");

        let dirX = Math.sign(over.x - this.x);
        let dirY = Math.sign(over.y - this.y);
        let dest = dirY === 0 ? {
            x: this.x + dirX * 4,
            y: this.y
        } : {
            x: this.x + dirX * 2,
            y: this.y + dirY * 2
        };

        return this.board.state.find(n => n.x === dest.x && n.y === dest.y);
    }

    isEmpty() {
        return this.peg === null;
    }

    isAdjacentWith(spot) {
        return this.getAdjacent().indexOf(spot) > -1;
    }

    getAdjacent() {
        return this.board.getAdjacent(this);
    }
}

/**
 * number of spots in each row of chinese checkers board
 */
const ROWS = [
    1, 2, 3, 4, 13, 12, 11, 10, 9, 10, 11, 12, 13, 4, 3, 2, 1
];

/**
 * indexes of spots related to each triangle on the board.
 * first triangle (A) is on position (0, 0) and the order 
 * of the rest is clockwise. 
 */
const TRIANGLES = {
    "A": {
        name: "A",
        peak: 0,
        indexes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    },
    "B": {
        name: "B",
        peak: 22,
        indexes: [19, 20, 21, 22, 32, 33, 34, 44, 45, 55],
    },
    "C": {
        name: "C",
        peak: 110,
        indexes: [74, 84, 85, 95, 96, 97, 107, 108, 109, 110],
    },
    "D": {
        name: "D",
        peak: 120,
        indexes: [111, 112, 113, 114, 115, 116, 117, 118, 119, 120],
    },
    "E": {
        name: "E",
        peak: 98,
        indexes: [65, 75, 76, 86, 87, 88, 98, 99, 100, 101],
    },
    "F": {
        name: "F",
        peak: 10,
        indexes: [10, 11, 12, 13, 23, 24, 25, 35, 36, 46],
    }
}