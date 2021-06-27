const fs = require('fs').promises;
const path = require('path');
const { validate } = require('jsonschema');

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

    return parsedStorage;
}

async function setStorageObject(storageObject, filePath, pathData) {
    storageObject[filePath] = pathData;
    return storageObject;
}

async function saveStorageObject(storageObject) {
    const stringStorage = JSON.stringify(storageObject);
    return fs.writeFile(storageLocation, stringStorage, { overwrite: true });
}

module.exports = {
    loadStorageObject,
    setStorageObject,
    saveStorageObject
};
