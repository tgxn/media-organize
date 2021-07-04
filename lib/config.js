const fs = require("fs").promises;
const path = require("path");
const { homedir } = require("os");

const { validate } = require("jsonschema");

const configDataSchema = {
    type: "object",
    properties: {
        enabled: { type: "boolean" },
        linkSubtitles: { type: "boolean" },
        useHighestQuality: { type: "boolean" },
        directories: {
            type: "array",
            items: [{ type: "string" }]
        },
        allowedExtensions: {
            type: "array",
            items: [{ type: "string" }]
        },
        ignoredExtensions: {
            type: "array",
            items: [{ type: "string" }]
        },
        subtitleExtensions: {
            type: "array",
            items: [{ type: "string" }]
        },
        allowedSize: {
            type: "array",
            items: [{ type: "number" }],
            minItems: 1,
            maxItems: 2
        },
        targetPath: { type: "string" },
        seriesCaseFormat: { type: "string" },
        strictType: { type: "string" },
        targetFormat: { type: "string" }
    },
    required: ["directories", "targetPath", "targetFormat"],
    additionalProperties: false
};

class TaskConfig {
    constructor(taskConfigData) {
        this.configData = taskConfigData;

        const validSchema = validate(this.configData, configDataSchema);

        if (validSchema.errors.length !== 0) {
            throw validSchema.errors;
        }
    }

    getProperty(propertyName, defaultValue) {
        if (Object.prototype.hasOwnProperty.call(this.configData, propertyName)) {
            return this.configData[propertyName];
        }
        return defaultValue || null;
    }

    // boolean
    get enabled() {
        return this.getProperty("enabled", false);
    }
    get linkSubtitles() {
        return this.getProperty("linkSubtitles", false);
    }
    get useHighestQuality() {
        return this.getProperty("useHighestQuality", false);
    }

    // Array
    get directories() {
        return this.getProperty("directories");
    }
    get allowedExtensions() {
        return this.getProperty("allowedExtensions", []);
    }
    get ignoredExtensions() {
        return this.getProperty("ignoredExtensions", []);
    }
    get subtitleExtensions() {
        return this.getProperty("subtitleExtensions", []);
    }
    get allowedSize() {
        return this.getProperty("allowedSize");
    }

    // String
    get targetPath() {
        return this.getProperty("targetPath");
    }
    get seriesCaseFormat() {
        return this.getProperty("seriesCaseFormat", false);
    }
    get strictType() {
        return this.getProperty("strictType");
    }
    get targetFormat() {
        return this.getProperty("targetFormat");
    }
}

class Config {
    constructor(configPath) {
        if (configPath.indexOf("~/") == 0) {
            configPath = configPath.replace("~", homedir());
        }
        this.configPath = path.resolve(configPath);

        this.configArray = [];
    }

    async loadAndValidateConfig() {
        // create containing folder
        await fs.mkdir(path.dirname(this.configPath), { recursive: true });

        let parsedConfigFileData;
        try {
            await fs.access(this.configPath);
            const configFileData = await fs.readFile(this.configPath);
            parsedConfigFileData = JSON.parse(configFileData);
        } catch (error) {
            await fs.writeFile(this.configPath, "[]", { overwrite: false });
            parsedConfigFileData = [];
        }

        try {
            if (Array.isArray(parsedConfigFileData)) {
                this.configArray = parsedConfigFileData.map((configData) => new TaskConfig(configData));
            } else if (typeof parsedConfigFileData === "object" && parsedConfigFileData !== null) {
                this.configArray = [new TaskConfig(parsedConfigFileData)];
            }
        } catch (error) {
            throw error;
        }

        return this.configArray;
    }
}

module.exports = Config;
