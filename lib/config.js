const fs = require("fs").promises;
const path = require("path");
const { homedir } = require("os");

const { validate } = require("jsonschema");

const configArraySchema = {
    type: "array",
    items: {
        properties: {
            enabled: { type: "boolean" },
            linkSubtitles: { type: "boolean" },
            useHighestQuality: { type: "boolean" },
            directories: {
                type: "array",
                items: [{ type: "string" }],
            },
            allowedExtensions: {
                type: "array",
                items: [{ type: "string" }],
            },
            ignoredExtensions: {
                type: "array",
                items: [{ type: "string" }],
            },
            subtitleExtensions: {
                type: "array",
                items: [{ type: "string" }],
            },
            allowedSize: {
                type: "array",
                items: [{ type: "number" }],
                minItems: 1,
                maxItems: 2,
            },
            targetPath: { type: "string" },
            seriesCaseFormat: { type: "string" },
            strictType: { type: "string" },
            targetFormat: { type: "string" },
        },
        required: ["directories", "targetPath", "targetFormat"],
        additionalProperties: false,
    },
};

class Config {
    constructor(configFileLocation) {
        this.configFileLocation = configFileLocation;

        this.configArray = [];
    }

    async loadAndValidateConfig() {
        if (this.configFileLocation.indexOf("~/") == 0) {
            this.configFileLocation = this.configFileLocation.replace(
                "~",
                homedir(),
            );
        }

        const configPath = path.resolve(this.configFileLocation);
        console.log("Config location:", configPath);

        // create containing folder
        await fs.mkdir(path.dirname(configPath), { recursive: true });
        try {
            await fs.access(configPath);
            const configFileData = await fs.readFile(configPath);
            const parsedConfigFileData = JSON.parse(configFileData);

            if (Array.isArray(parsedConfigFileData)) {
                this.configArray = parsedConfigFileData;
            } else if (
                typeof parsedConfigFileData === "object" &&
                parsedConfigFileData !== null
            ) {
                this.configArray = [parsedConfigFileData];
            }
        } catch (error) {
            await fs.writeFile(configPath, "[]", { overwrite: false });
        }

        const validSchema = validate(this.configArray, configArraySchema);

        if (validSchema.errors.length !== 0) {
            console.log("Config Errors Found", validSchema);
            throw new Error(validSchema.errors);
        }

        return this.configArray;
    }
    get() {
        const internalKey = key;
        return this._state[internalKey];
    }
    set(value) {
        const internalKey = key;
        this._state[internalKey] = value;
    }
}

module.exports = Config;
