import app from "../index";
import TextInput from "pixi-text-input";
import {
    Container,
    Graphics,
    Sprite,
    Text,
    Texture
} from "pixi.js";
import textStyleFactory from "../text-style";
import {
    COLOR_PALETTE
} from "../color-palette";
import Medal from "./medal";

const
    FRAME_WITH = 7,
    FRAME_RADIUS = 50,
    PICTURE_WIDTH = 100,
    PICTURE_HEIGHT = 100,
    TEXTBOX_WIDTH = 150,
    TEXTBOX_HEIGHT = 50;

export default class PlayerAvatar extends Container {
    constructor({
        name = "",
        pictureURL = "",
        hasTextbox = false
    }) {
        super();

        // create frame for player picture
        let ctx = new Graphics()
        ctx.lineStyle(FRAME_WITH, 0xffffff);
        ctx.drawCircle(0, 0, FRAME_RADIUS);
        ctx.endFill();
        this.frame = new Sprite(app.renderer.generateTexture(ctx));
        this.frame.tint = 0xd3d3d3;
        this.frame.anchor.set(0.5);
        this.frame.position.set(TEXTBOX_WIDTH / 2, FRAME_RADIUS);

        this.picture = this._generatePicture(null);
        this.picture.anchor.set(0.5, 0);
        this.picture.position.set(TEXTBOX_WIDTH / 2, 0);

        // create textbox background
        ctx = new Graphics();
        ctx.beginFill(0xffffff);
        ctx.lineStyle(5, 0xd3d3d3);
        ctx.drawRoundedRect(0, 0, TEXTBOX_WIDTH, TEXTBOX_HEIGHT, 20);
        ctx.endFill();
        this.textboxBg = new Sprite(app.renderer.generateTexture(ctx));
        this.textboxBg.position.set(0, FRAME_RADIUS * 2 - 20);

        // textbox container with mask 
        if (hasTextbox) {
            /**
             * if we have a textbox on avatar then create a dom
             * element, if not just create a text with player name.
             */
            this.textbox = new TextInput({
                input: {
                    fontFamily: 'Bungee',
                    fontSize: '25px',
                    padding: '0px',
                    width: '135px',
                    color: '#000000',
                }
            });
            this.textbox.substituteText = false;
            this.textbox.maxLength = 12;
            this.textbox.on('keydown', keycode => {
                if (keycode === 13 || keycode === 27)
                    this.textbox.blur();
                // TODO: save name to storage
            });

            // lose the focus when player clicks other than textbox
            window.addEventListener("pointerdown", e => {
                if (e.target != this.textbox._dom_input)
                    this.textbox.blur();
            });

        } else {
            this.textbox = new Text(name, textStyleFactory("smallText"));
        }
        this.textbox.position.set(10, FRAME_RADIUS * 2 - 10);

        this.medal = new Medal();
        this.medal.position.set(120, 60);
        this.medal.visible = false;

        this.addChild(
            this.picture,
            this.frame,
            this.textboxBg,
            this.textbox,
            this.medal);

        if (pictureURL) this.setPicture(pictureURL);
    }

    setPicture(url) {
        Texture.fromURL(url).then(texture => {
            this.removeChildAt(0);
            this.addChildAt(this._generatePicture(texture), 0);
        }).catch(error => {
            console.log(error);
        });
    }

    setName(value) {
        this.textbox.text = value;
    }

    setHighlight(value) {
        if (value)
            this.frame.tint = COLOR_PALETTE["color-2"];
        else
            this.frame.tint = 0xd3d3d3;
    }

    showRank(value) {
        this.medal.rank.text = `${value}`;
        this.medal.visible = true;
        if (value === 1)
            this.medal.gold();
        else
            this.medal.normal();
    }

    _generatePicture(texture) {
        let mask = new Graphics();
        mask.beginFill(0);
        mask.lineStyle(FRAME_WITH, 0);
        mask.drawCircle(0, 0, FRAME_RADIUS);
        mask.endFill();
        mask.position.set(
            FRAME_RADIUS + FRAME_WITH / 2, FRAME_RADIUS + FRAME_WITH / 2);

        let picture = new Sprite(texture);
        picture.width = PICTURE_WIDTH;
        picture.height = PICTURE_HEIGHT;
        picture.anchor.set(0.5);
        picture.position.set(
            FRAME_RADIUS + FRAME_WITH / 2, FRAME_RADIUS + FRAME_WITH / 2);

        let cnt = new Container();
        cnt.addChild(picture, mask);
        cnt.mask = mask;

        let sp = new Sprite(app.renderer.generateTexture(cnt));
        sp.anchor.set(0.5, 0);
        sp.position.set(TEXTBOX_WIDTH / 2, 0);

        return sp;
    }
}