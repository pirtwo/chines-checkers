import * as PIXI from "pixi.js";
import * as Colyseus from "colyseus.js";
import Sound from "pixi-sound";
import Stats from "stats.js";
import Charm from "./lib/charm";
import GameStorage from "./storage";
import SceneManager from "./scene-manager";
import MenuScene from "./scene/menu";
import GameScene from "./scene/game";
import TutorialScene from "./scene/tutorial";
import MatchMakingScene from "./scene/match-making";
import SettingModal from "./modal/setting";
import PlayerWinModal from "./modal/player-win";
import PlayerLoseModal from "./modal/player-lose";
import PortraitLockModal from "./modal/portrait-lock";
import debounce from "lodash.debounce";
import {
    loadWebfonts,
    scaleToWindow,
    launchIntoFullscreen
} from "./lib/utils";

const app = new PIXI.Application({
    backgroundColor: 0x000000,
    width: 720,
    height: 1280,
    antialias: true,
    transparent: true
});

loadWebfonts(["Bungee"]);

function init() {
    document.body.appendChild(app.view);
    scaleToWindow(app.view);
    app.loader
        .add("tileset", "./assets/sprites/tileset.json")
        .add('sounds', './assets/sounds/sounds.mp3')
        .load(setup);
}

function setup(loader, resources) {
    let stats = new Stats();
    stats.showPanel(0);
    document.body.appendChild(stats.dom);

    // TODO: Attach the game and tween manager to global
    let endpoint = "ws://localhost:3553";
    let sounds = resources.sounds.sound;
    let tweenManager = new Charm(PIXI);
    let sceneManager = new SceneManager(app.stage);

    window.tweenManager = tweenManager;
    window.sceneManager = sceneManager;
    window.colyseus = new Colyseus.Client(endpoint);
    window.gameStorage = new GameStorage("chinese-checkers");
    window.gameStorage.init({
        playerName: "Guest",
        audio: true,
        hint: true
    });

    // create sound sprites
    sounds.addSprites({
        "click": {
            start: 0,
            end: 0.2
        },
        "switch": {
            start: 0.2,
            end: 0.4
        },
        "peg_select": {
            start: 0.4,
            end: 0.8
        },
        "peg_move": {
            start: 0.8,
            end: 1
        },
        "win": {
            start: 1,
            end: 4
        },
        "lose": {
            start: 4,
            end: 8.5
        },
        "music": {
            start: 8.5,
            end: 33,
            loop: true
        },
    });

    // create scenes and modals
    sceneManager.push(new MenuScene(sceneManager, tweenManager));
    sceneManager.push(new GameScene(sceneManager, tweenManager));
    sceneManager.push(new TutorialScene(sceneManager, tweenManager));
    sceneManager.push(new MatchMakingScene(sceneManager, tweenManager));
    sceneManager.push(new SettingModal(tweenManager));
    sceneManager.push(new PortraitLockModal(tweenManager));
    sceneManager.push(new PlayerWinModal(sceneManager, tweenManager));
    sceneManager.push(new PlayerLoseModal(sceneManager, tweenManager));
    sceneManager.find("menu").show();

    checkDeviceorientation(sceneManager);

    // make window fullscreen
    window.addEventListener("pointerdown", () => {
        if (document.fullscreenElement === null)
            launchIntoFullscreen(document.documentElement);
    });

    // scale app view on resize
    window.addEventListener('resize', debounce(() => {
        if (PIXI.utils.isMobile.any) {
            /**
             * on some devices when a virtual keyboard opens,
             * it changes the size of the screen, so we check
             * the input for focus, if it has focus we don't 
             * scale the app, also we don't show the portrait lock. 
             */
            if (document.querySelector("input") != document.activeElement) {
                scaleToWindow(app.view);
                checkDeviceorientation(sceneManager);
            }
        } else {
            /**
             * always scale on pc.
             */
            scaleToWindow(app.view);
        }
    }, 300));

    // game loop
    app.ticker.add((delta) => {
        stats.begin();

        // update game here
        tweenManager.update();
        sceneManager.update();

        stats.end();
    });
}

function checkDeviceorientation(sceneManager) {
    if (PIXI.utils.isMobile.any && window.innerWidth > window.innerHeight) {
        sceneManager.find("portraitLockModal")
            .show()
            .transIn(10);;
    } else {
        sceneManager.find("portraitLockModal")
            .transOut(10)
            .then(() => {
                sceneManager.find("portraitLockModal")
                    .hide();
            });
    }
}

init();

export default app;