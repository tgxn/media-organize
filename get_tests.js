const fs = require("fs").promises;
const path = require("path");

const dir = "../complete/binge/";

const { getFiles } = require("./lib/organize");

const scanDir = path.resolve(dir);

getFiles(scanDir)
    .then((files) => {
        return Promise.all(
            files.map(async (filePath) => {
                return filePath.replace(scanDir + path.sep, "");
            })
        );
    })

    .then(async (fileData) => {
        let data = JSON.stringify(fileData);
        await fs.writeFile(`test/data/test-${Date.now()}.json`, data);
    });
