const path = require("path");
const hound = require("hound");

const spinnies = require("./spinnies");

const Memory = require("./memory");
const Config = require("./config");

const OrganizerLayer = require("./layer");

class Organize {
    constructor(configLocations) {
        this.configArray = [];
        this.storageObject = null;

        this.config = new Config(configLocations.config);
        this.memory = new Memory(configLocations.storage);
    }

    async loadConfig() {
        try {
            this.configArray = await this.config.loadAndValidateConfig();
        } catch (errors) {
            console.error("Config Errors Found", errors);
        }
        try {
            await this.memory.loadStore();
        } catch (errors) {
            console.error("Error loading storage");
        }
    }

    async organizeAll() {
        for (const index in this.configArray) {
            const layer = new OrganizerLayer(this, index);
            await layer.organizeDirectory();
        }
    }

    async registerWatchers() {
        spinnies.add("watcher", { text: "Starting watchers..." });
        for (const index in this.configArray) {
            const configData = this.configArray[index];

            const layer = new OrganizerLayer(this, index);

            const { directories } = configData;

            for (const index in directories) {
                const scanDir = path.resolve(directories[index]);
                spinnies.add(`watcher-${index}-${index}`, {
                    text: `Watching "${scanDir}"...`
                });

                const watcher = hound.watch(scanDir);
                watcher.on("create", (file, stats) => layer.onFileCreated(file, stats));
                watcher.on("delete", (file) => layer.onFileDeleted(file));
            }
        }

        spinnies.succeed("watcher", { text: `Watchers started OK!` });
    }
}

module.exports = Organize;
