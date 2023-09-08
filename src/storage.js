export default class GameStorage {
    constructor(name) {
        this.name = name;
        this.storage = window.localStorage;
    }

    init(data = {}) {
        if (this.storage.getItem(this.name) === null) {
            this.storage.setItem(this.name, JSON.stringify(data));
        }
    }

    getItem(key) {
        return JSON.parse(this.storage.getItem(this.name))[key];
    }

    setItem(key, value) {
        let data = JSON.parse(this.storage.getItem(this.name));
        
        data[key] = value;
        this.storage.setItem(this.name, JSON.stringify(data));

        return true;
    }
}