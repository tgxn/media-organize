const fs = require('fs').promises;
const path = require('path');

const dir = "../complete/binge/";

async function getFiles(dir) {
    const subdirs = await fs.readdir(dir);

    const files = await Promise.all(subdirs.map(async (subdir) => {
        const res = path.resolve(dir, subdir);
        return (await fs.stat(res)).isDirectory() ? getFiles(res) : res;
    }));

    return files.reduce((a, f) => a.concat(f), []);
}

const scanDir = path.resolve(dir);

getFiles(scanDir)

    .then(files => {
        return files.map((filePath) => {
            return filePath.replace(scanDir + path.sep, "");
        })
    })

    .then(async fileData => {
        let data = JSON.stringify(fileData);
        await fs.writeFile(`test/data/test-${Date.now()}.json`, data);
    })
