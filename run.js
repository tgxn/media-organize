const {
    runOrganize
} = require('./lib/organize')

const { configArray } = require('./lib/config');

const {
    loadStorageObject,
    saveStorageObject
} = require('./lib/storage');

async function run() {
    let storageObject = await loadStorageObject();

    for (const index in configArray) {
        const configData = configArray[index];

        await runOrganize(configData, storageObject)
            .then(() => {
                console.log(`${index} complete`);
            });

    }

    await saveStorageObject(storageObject);
}

run();
