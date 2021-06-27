const {
    runOrganize
} = require('./lib/organize')

const { configArray } = require('./lib/config');

for (const index in configArray) {
    const configData = configArray[index];

    runOrganize(configData)
        .then(files => {
            console.log(`${index} complete`, files);
        });

}
