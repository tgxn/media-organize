const fs = require('fs').promises;
const path = require('path');

const {
    getFiles,
    isMediaFile,
    isMovieOrSeries,
    determineSeriesInfo,
    formatSeriesPath,
    createSymlink
} = require('../lib/organize')

async function performFileTests() {
    try {
        const testFiles = await getFiles("./test/data");

        testFiles.map(async testDataFile => {
            const fileData = await fs.readFile(testDataFile);
            const parsedTestFileData = JSON.parse(fileData);

            parsedTestFileData.map(async testFilePath => {



                const fileInfo = path.parse(testFilePath);

                const fileIsMedia = await isMediaFile(testFilePath);
                const movieOrSeries = isMovieOrSeries(testFilePath);

                if (fileIsMedia && movieOrSeries == "series") {
                    // console.log("movieOrSeries", testFilePath, movieOrSeries);

                    const fileMediaInfo = await determineSeriesInfo(fileInfo.name)
                    console.log("test", fileInfo.name, fileMediaInfo);

                    assert.notEqual(fileMediaInfo, null);
                }

            });

        });
    } catch (error) {
        console.log("error", error);
    }
}


test('isMediaFile', (done) => {

    const test1 = isMovieOrSeries("Get.Rich.Or.Die.Tryin.2005.1080p.BluRay.REMUX.AVC.TrueHD.5.1-UnKn0wn");
    expect(test1).toBe("movie");

    const test2 = isMovieOrSeries("Invincible.2021.S01E08.Where.I.Really.Come.From.1080p.AMZN.WEB-DL.DDP5.1.H.264-NTb");
    expect(test2).toBe("series");

    const test3 = isMovieOrSeries("");
    expect(test3).toBe(null);

    done();
});


test('run dynamic file tests', () => {
    return performFileTests()
        .then(data => {


            expect(1 + 2).toBe(3);
        });
});
