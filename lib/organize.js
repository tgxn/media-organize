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
            logger.error("Config Errors Found", errors);
        }
        try {
            await this.memory.loadStore();
        } catch (errors) {
            logger.error("Error loading storage");
        }

        if (this.configArray.length == 0) {
            logger.error(`there are no organize configs defined!`);
        }
    }

    async organizeAll() {
        logger.info(`organizing ${this.configArray.length} config(s)...`);

        for (const index in this.configArray) {
            const layer = new OrganizerLayer(this, index);
            await layer.organizeDirectory();
        }
    }

    async registerWatchers() {
        logger.info(`starting watchers with ${this.configArray.length} config(s)...`);

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
