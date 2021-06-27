const fs = require('fs').promises;
const path = require('path');

const {
    runOrganize,
    getFiles,
    isAllowedFile,
    isMovieOrSeries,
    determineMediaInfo,
    formatSeriesPath,
    createSymlink,
} = require('../lib/organize')

const configArray = require('../config.example.json');

async function performFileTests(testDataPath, configObject) {
    try {
        const fileData = await fs.readFile(testDataPath);
        const parsedTestFileData = JSON.parse(fileData);

        const testResults = await Promise.all(parsedTestFileData.map(async testFilePath => {

            const parsedPath = path.parse(testFilePath);

            const fileIsMedia = await isAllowedFile(testFilePath, configObject);

            const movieOrSeries = await isMovieOrSeries(parsedPath);

            const fileMediaInfo = await determineMediaInfo(parsedPath.name, movieOrSeries)

            return {
                isAllowedFile: fileIsMedia,
                movieOrSeries: movieOrSeries,
                fileMediaInfo: fileMediaInfo,
            };

        }));

        return testResults;

    } catch (error) {
        console.log("error", error);
    }
}

test('isAllowedFile', async () => {
    let testResult;

    testResult = await isAllowedFile("yhjkjk.tmp", configArray[0]);
    expect(testResult).toBe(false);

    testResult = await isAllowedFile("fstgdh.mkv", configArray[0]);
    expect(testResult).toBe(true);

    testResult = await isAllowedFile("hrthwthaesrthaewthg", configArray[0]);
    expect(testResult).toBe(null);

    testResult = await isAllowedFile("", configArray[0]);
    expect(testResult).toBe(null);
});

test('isMovieOrSeries', async () => {
    let testResult;

    testResult = await isMovieOrSeries(path.parse("Get.Rich.Or.Die.Tryin.2005.1080p.BluRay.REMUX.AVC.TrueHD.5.1-UnKn0wn.mkv"));
    expect(testResult).toBe("movie");

    testResult = await isMovieOrSeries(path.parse("Invincible.2021.S01E08.Where.I.Really.Come.From.1080p.AMZN.WEB-DL.DDP5.1.H.264-NTb.mkv"));
    expect(testResult).toBe("series");

    testResult = await isMovieOrSeries("");
    expect(testResult).toBe(null);

});

test('run movie file tests', () => {
    return performFileTests("./test/data/test-movies.json", configArray[1])
        .then(data => {

            for (const result in data) {
                if (data[result].isAllowedFile) {

                    expect(data[result].movieOrSeries).toBe("movie");
                }
            }


        });
});

test('run series file tests', () => {
    return performFileTests("./test/data/test-series.json", configArray[0])
        .then(data => {

            for (const result in data) {
                if (data[result].isAllowedFile) {

                    expect(data[result].movieOrSeries).toBe("series");
                }
            }


        });
});
