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
    }
};

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

        try {
            await fs.access(this.configPath);
            const configFileData = await fs.readFile(this.configPath);
            const parsedConfigFileData = JSON.parse(configFileData);

            if (Array.isArray(parsedConfigFileData)) {
                this.configArray = parsedConfigFileData;
            } else if (typeof parsedConfigFileData === "object" && parsedConfigFileData !== null) {
                this.configArray = [parsedConfigFileData];
            }
        } catch (error) {
            await fs.writeFile(this.configPath, "[]", { overwrite: false });
        }

        const validSchema = validate(this.configArray, configArraySchema);

        if (validSchema.errors.length !== 0) {
            throw validSchema.errors;
        }

        return this.configArray;
    }
}

module.exports = Config;
