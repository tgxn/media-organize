const path = require('path');
const hound = require('hound')

const { directories, targetPath } = require('./config.json');

for (const index in directories) {
    const scanDir = path.resolve(directories[index]);

    const watcher = hound.watch(scanDir)
    console.log("Watching:", scanDir);

    watcher.on('create', function (file, stats) {
        console.log(file + ' was created')
    });

    watcher.on('change', function (file, stats) {
        console.log(file + ' was changed')
    });

    watcher.on('delete', function (file) {
        console.log(file + ' was deleted')
    });
}