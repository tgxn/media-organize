const path = require('path');

const {
    getFiles,
    isMediaFile,
    isMovieOrSeries,
    determineSeriesInfo,
    formatSeriesPath,
    createSymlink
} = require('./lib/organize')

const scanDirList = [
    "../complete/",
];

const targetDir = "../sorted-media";

for (const index in scanDirList) {
    const scanDir = path.resolve(scanDirList[index]);

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

                        const targetPath = formatSeriesPath(targetDir, { name, season, episode }, fileInfo.ext);
                        console.log(filePath, targetPath);

                        //await createSymlink(filePath, targetPath)
                    }

                } else {
                    console.log("unknown file wtf???!!!", movieOrSeries);
                }

            })

        })

}
