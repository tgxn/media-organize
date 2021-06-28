const { validate } = require('jsonschema');

function loadConfiguration(configFileData) {
    let configArray = [];

    // load
    if (Array.isArray(configFile)) {
        configArray = configFile;
    }

    else if (typeof configFile === 'object' && configFile !== null) {
        configArray = [configFile];
    }

    // validate
    const configArraySchema = {
        "type": "array",
        "items": {
            "properties": {
                "enabled": { "type": "boolean" },
                "linkSubtitles": { "type": "boolean" },
                "useHighestQuality": { "type": "boolean" },
                "directories": {
                    "type": "array",
                    "items": [
                        { "type": "string" },
                    ]
                },
                "allowedExtensions": {
                    "type": "array",
                    "items": [
                        { "type": "string" },
                    ]
                },
                "ignoredExtensions": {
                    "type": "array",
                    "items": [
                        { "type": "string" },
                    ]
                },
                "subtitleExtensions": {
                    "type": "array",
                    "items": [
                        { "type": "string" },
                    ]
                },
                "targetPath": { "type": "string" },
                "seriesCaseFormat": { "type": "string" },
                "strictType": { "type": "string" },
                "targetFormat": { "type": "string" }
            },
            "required": ["directories", "targetPath", "targetFormat"],
            "additionalProperties": false
        }
    };
    const validSchema = validate(configArray, configArraySchema);

    if (validSchema.errors.length !== 0) {
        console.log("Config Errors Found", validSchema);
        throw new Error(validSchema.errors);
    }
    return configArray;
}

module.exports = {
    loadConfiguration,
};
