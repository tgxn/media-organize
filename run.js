const path = require('path');

const {
    getFiles,
    isMediaFile,
    isMovieOrSeries,
    determineSeriesInfo,
    formatSeriesPath,
    createSymlink
} = require('./lib/organize')

const { directories, targetPath } = require('./config.json');

for (const index in directories) {
    const scanDir = path.resolve(directories[index]);

    getFiles(scanDir)
        .then(files => {
            files.map(async (filePath) => {
                const fileInfo = path.parse(filePath);

                const fileIsMedia = await isMediaFile(filePath);
                const movieOrSeries = isMovieOrSeries(filePath);

                if (fileIsMedia && movieOrSeries == "series") {
                    const fileMediaInfo = await determineSeriesInfo(fileInfo.name);

                    if (fileMediaInfo) {
                        const { name, season, episode } = fileMediaInfo;

                        const targetLinkPath = formatSeriesPath(targetPath, { name, season, episode }, fileInfo.ext);
                        console.log(filePath, targetLinkPath);

                        //await createSymlink(filePath, targetLinkPath)
                    }

                } else {
                    console.log("unknown file wtf???!!!", movieOrSeries);
                }

            })

        })

}
