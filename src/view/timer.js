import {
    Container,
    Text
} from "pixi.js";

export default class Timer extends Container {
    constructor() {
        super();

        this.min = 0;
        this.sec = 0;
        this.paused = false;
        this.interval = null;
        this.trigger = null;
        this.textbox = new Text("00:00");
        this.addChild(this.textbox);
    }

    setTrigger(min, sec, callback) {
        this.trigger = {
            min,
            sec,
            callback
        }
    }

    clearTrigger() {
        this.trigger = null;
    }

    start() {
        this.interval = setInterval(() => {
            if (!this.paused) {
                this.sec++;

                if (this.sec >= 60) {
                    this.sec = 0;
                    this.min++;
                }

                if (this.min >= 60) {
                    this.min = 0;
                }

                this.textbox.text =
                    `${this.min < 10 ? `0${this.min}` : this.min}:${this.sec < 10 ? `0${this.sec}` : this.sec}`;

                if (this.trigger && this.trigger.min === this.min && this.trigger.sec === this.sec)
                    this.trigger.callback();
            }
        }, 1000);

        return this;
    }

    pause() {
        this.paused = true;
        return this;
    }

    resume() {
        this.paused = false;
        return this;
    }

    clear() {
        clearInterval(this.interval);
        this.sec = 0;
        this.min = 0;
        this.textbox.text = "00:00";
        this.paused = false;

        return this;
    }

}