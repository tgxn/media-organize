const fs = require('fs').promises;
const path = require('path');
const { validate } = require('jsonschema');

// const Spinner = require('./spinner');

const storageLocation = './data/storage.json';

async function loadStorageObject() {

    try {
        await fs.stat(storageLocation);
    } catch (error) {
        await fs.mkdir(path.dirname(storageLocation), { recursive: true, overwrite: false });
        await fs.writeFile(storageLocation, "{}", { overwrite: false });
    }

    const storageData = await fs.readFile(storageLocation);
    const parsedStorage = JSON.parse(storageData);

    // spinner.succeed("Loaded storage object");

    return parsedStorage;
}

async function setStorageObject(storageObject, filePath, pathData) {
    storageObject[filePath] = pathData;
    return storageObject;
}

async function saveStorageObject(storageObject) {
    // spinner.start('Saving storage object');
    const stringStorage = JSON.stringify(storageObject);
    const savedFile = await fs.writeFile(storageLocation, stringStorage, { overwrite: true });
    // spinner.succeed("Saved storage object");
    return savedFile;
}

module.exports = {
    loadStorageObject,
    setStorageObject
};
