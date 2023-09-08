import {
    TextStyle
} from "pixi.js";
import {
    COLOR_PALETTE
} from "./color-palette";

const FONT_FAMILY = "Bungee";

export default function textStyleFactory(style) {
    switch (style) {
        case "logo":
            return new TextStyle({
                fontFamily: FONT_FAMILY,
                fontSize: 115,
                fontStyle: 'normal',
                fontWeight: 'bold',
                padding: 20,
                align: 'center',
                fill: [0xffffff, COLOR_PALETTE["color-5"]],
                stroke: '#4a1850',
                strokeThickness: 5,
                dropShadow: true,
                dropShadowColor: '#000000',
                dropShadowBlur: 4,
                dropShadowAngle: Math.PI / 6,
                dropShadowDistance: 6,
                wordWrap: true,
                wordWrapWidth: 400,
            });
        case "titleMedium":
            return new TextStyle({
                fontFamily: FONT_FAMILY,
                fontSize: 60,
                fontStyle: 'normal',
                fontWeight: 'bold',
                padding: 10,
                align: 'center',
                fill: [0xffffff, COLOR_PALETTE["color-5"]],
                stroke: '#4a1850',
                strokeThickness: 5,
                dropShadow: true,
                dropShadowColor: '#000000',
                dropShadowBlur: 4,
                dropShadowAngle: Math.PI / 6,
                dropShadowDistance: 6,
                wordWrap: true,
                wordWrapWidth: 400,
            });
        case "buttonLarge":
            return new TextStyle({
                fontFamily: FONT_FAMILY,
                fontSize: 45,
                fill: 0xf6f5f5,
                align: "left",
                stroke: '#4a1850',
                strokeThickness: 0,
            });
        case "buttonMedium":
            return new TextStyle({
                fontFamily: FONT_FAMILY,
                fontSize: 30,
                fill: 0xf6f5f5,
                align: "left",
                stroke: '#4a1850',
                strokeThickness: 0,
            });
        case "largeText":
            return new TextStyle({
                fontFamily: FONT_FAMILY,
                fontSize: 70,
                fill: COLOR_PALETTE["color-0"],
                align: "left",
                stroke: '#4a1850',
                strokeThickness: 3,
                wordWrap: true,
                wordWrapWidth: 500,
            });
        case "mediumText":
            return new TextStyle({
                fontFamily: FONT_FAMILY,
                fontSize: 50,
                lineHeight: 60,
                fill: COLOR_PALETTE["color-0"],
                align: "left",
                stroke: '#4a1850',
                strokeThickness: 2
            });
        case "smallText":
            return new TextStyle({
                fontFamily: FONT_FAMILY,
                fontSize: 25,
                lineHeight: 35,
                fill: COLOR_PALETTE["color-0"],
                align: "left",
                stroke: '#4a1850',
                strokeThickness: 1
            });
        default:
            throw Error(`Invalid style: ${style} for font`);
    }
}