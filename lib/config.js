const { validate } = require('jsonschema');
const configFile = require('../config.json');

let configObject = [];

// load
if (Array.isArray(configFile)) {
    configObject = configFile;
}

else if (typeof configFile === 'object' && configFile !== null) {
    configObject = [configFile];
}

// validate
const arraySchema = {
    "type": "array",
    "items": {
        "properties": {
            "enabled": { "type": "boolean" },
            "linkSubtitles": { "type": "boolean" },
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
const validSchema = validate(configObject, arraySchema);

if (validSchema.errors.length !== 0) {
    console.log("Config Errors Found", validSchema);
    throw new Error(validSchema.errors);
}

module.exports = {
    configArray: configObject,
};
