const path = require('path');
const hound = require('hound')

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

        const { directories, targetPath } = configData;

        for (const index in directories) {
            const scanDir = path.resolve(directories[index]);

            const watcher = hound.watch(scanDir)
            console.log("Watching:", scanDir);

            watcher.on('create', async (file, stats) => {
                console.log(file + ' was created')

                await runOrganize(configData, storageObject)
                    .then(() => {
                        console.log(`${index} complete`);
                    });

            });

            watcher.on('delete', async (file) => {
                console.log(file + ' was deleted')

            });
        }
    }

    await saveStorageObject(storageObject);
}

run();
