export default class SceneManager {
    constructor(container) {
        this.scenes = [];
        this.container = container;
    }

    push(scene) {
        this.scenes.push(scene);
        this.container.addChild(scene);
        return this;
    }

    pop(scene) {
        this.scenes.pop();
        this.container.removeChild(scene);
        return this;
    }

    find(name) {
        return this.scenes.find(scene => scene.sceneName === name);
    }

    onResize() {
        for (let i = 0; i < this.scenes.length; i++) {
            const scene = this.scenes[i];
            if (scene.onResize)
                scene.onResize();
        }
    }

    update(delta) {
        for (let i = 0; i < this.scenes.length; i++) {
            const scene = this.scenes[i];
            if (scene.visible && !scene.paused && scene.update)
                scene.update(delta);
        }
    }
}