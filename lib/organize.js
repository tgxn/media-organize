const fs = require("fs").promises;
const path = require("path");
const hound = require("hound");
const { homedir } = require("os");

const logger = require("./logger");
const { addConsoleTransport, addFileTransport } = require("./logger");

const Memory = require("./memory");
const Config = require("./config");

const OrganizerLayer = require("./layer");

class Organize {
    constructor() {
        this.dataLocations = {};
        this.configArray = [];
        this.storageObject = null;
    }

    async loadConfig({ dataPathString, enableFileLogs, quietConsole }) {
        // a transport must be added first
        addConsoleTransport({
            level: quietConsole ? "error" : "info"
        });

        // resolve the provided data directory
        if (dataPathString.indexOf("~/") == 0) {
            dataPathString = dataPathString.replace("~", homedir());
        }
        const dataPath = path.resolve(dataPathString);

        // // ensure path exists..
        // const dir = path.join(__dirname, "upload");

        try {
            await fs.mkdir(dataPath, { recursive: true });
        } catch (error) {
            if (error.code === "EEXIST") {
                // Something already exists, but is it a file or directory?
                const lstat = await fs.lstat(dataPath);
                if (!lstat.isDirectory()) {
                    logger.error("data directory already exists and is a file!", dataPath, error);
                    throw error;
                }
            } else {
                logger.error("data directory could not be created!", error);
                throw error;
            }
        }

        this.dataLocations = {
            config: path.join(dataPath, "config.json"),
            storage: path.join(dataPath, "storage.json"),
            logsDir: path.join(dataPath, "logs/")
        };
        logger.info("data file paths", dataPath, this.dataLocations);

        if (enableFileLogs) {
            addFileTransport(this.dataLocations.logsDir);
        }

        try {
            this.config = new Config(this.dataLocations.config);
            this.configArray = await this.config.loadAndValidateConfig();
        } catch (errors) {
            logger.error("Config Errors Found", errors);
        }

        try {
            this.memory = new Memory(this.dataLocations.storage);
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

    async validateLinkTargets() {
        for (const linkPath in this.memory.linkFiles) {
            const sourcePath = this.memory.linkFiles[linkPath].sourcePath;

            let sourceExists = true;

            try {
                await fs.access(sourcePath);
            } catch (error) {
                if (error.code === "ENOENT") {
                    console.log("SOURCE FILE NO LONER EXISTS", sourcePath);
                    sourceExists = false;
                } else {
                    logger.error("some other error?!", error);
                    throw error;
                }
            }

            if (!sourceExists) {
                try {
                    await fs.unlink(linkPath);
                } catch (error) {
                    if (error.code === "ENOENT") {
                        logger.error("SYMLINK DOESN'T EVEN EXISTS!", error);
                        sourceExists = false;
                    } else {
                        logger.error("COULD NOT DELETE SYMLINK", error);
                        throw error;
                    }
                } finally {
                    this.memory.deleteLink(linkPath);
                }
            }
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
