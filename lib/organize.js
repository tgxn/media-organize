const path = require("path");
const hound = require("hound");

const logger = require("./logger");

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
        logger.info("run organizeAll()");

        for (const index in this.configArray) {
            const layer = new OrganizerLayer(this, index);
            await layer.organizeDirectory();
        }
    }

    async registerWatchers() {
        logger.info("Starting watchers...");

        for (const index in this.configArray) {
            const configData = this.configArray[index];

            const layer = new OrganizerLayer(this, index);

            const { directories } = configData;

            for (const index in directories) {
                const scanDir = path.resolve(directories[index]);
                logger.info(`Watching "${scanDir}"...`);

                const watcher = hound.watch(scanDir);
                watcher.on("create", (file, stats) => layer.onFileCreated(file, stats));
                watcher.on("delete", (file) => layer.onFileDeleted(file));
            }
        }

        logger.info(`Watchers started OK!`);
    }
}

module.exports = Organize;
