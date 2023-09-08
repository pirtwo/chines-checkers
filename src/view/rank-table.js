import app from "..";
import Medal from "./medal";
import textStyleFactory from "../text-style";
import {
    Container,
    Graphics,
    Sprite,
    Text,
} from "pixi.js";
import {
    COLOR_PALETTE
} from "../color-palette";

export default class RankTable extends Container {
    constructor() {
        super();
    }

    fill(players) {
        this.removeChildren(0);
        for (let i = 0; i < players.length; i++) {
            const player = players[i];
            let row = new TableRow(player.name, player.rank);
            row.position.set(0, i * 110);

            if (player.rank === 1)
                row.medal.gold();
            else
                row.medal.normal();

            this.addChild(row);
        }
    }
}

class TableRow extends Container {
    constructor(playerName, playerRank) {
        super();

        let ctx = new Graphics();
        ctx.beginFill(COLOR_PALETTE["color-1"]);
        ctx.lineStyle(3, 0xd7d7d7);
        ctx.drawRoundedRect(0, 0, 520, 70, 100);
        ctx.endFill();
        this.background = new Sprite(app.renderer.generateTexture(ctx));
        this.addChild(this.background);

        this.medal = new Medal();
        this.medal.rank.text = `${playerRank}`;
        this.medal.position.set(20, 30);
        this.addChild(this.medal);

        this.textbox = new Text(playerName, textStyleFactory("mediumText"));
        this.textbox.position.set(70, 7);
        this.addChild(this.textbox);
    }
}