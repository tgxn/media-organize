const fs = require('fs').promises;
const path = require('path');

const assert = require('assert');

const { getFiles, isMovieOrSeries, isMediaFile, determineSeriesInfo, createSymlink } = require('../lib/organize')

async function performFileTests() {
    const testData = {};

    const testFiles = await getFiles("./test/data");

    testFiles.map(async testDataFile => {

        const fileData = await fs.readFile(testDataFile);
        const parsedTestFileData = JSON.parse(fileData);

        parsedTestFileData.map(async testFilePath => {

            try {

                const fileInfo = path.parse(testFilePath);

                const fileIsMedia = await isMediaFile(testFilePath);
                const movieOrSeries = isMovieOrSeries(testFilePath);

                if (fileIsMedia && movieOrSeries == "series") {
                    // console.log("movieOrSeries", testFilePath, movieOrSeries);

                    const fileMediaInfo = await determineSeriesInfo(fileInfo.name)
                    console.log("test", fileInfo.name, fileMediaInfo);

                    assert.notEqual(fileMediaInfo, null);
                }

            } catch (error) {
                console.log("error", error);


            }

        });

    });
}

performFileTests()