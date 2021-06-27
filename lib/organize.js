const fs = require('fs').promises;
const path = require('path');

const mime = require('mime');
const episodeParser = require('episode-parser')
const anitomy = require('anitomy-js')
const ptn = require('parse-torrent-name');

const stringTemplate = require("string-template")
const Case = require("case")

async function runOrganize(configObject) {

    const { directories, targetPath } = configObject;

    if (configObject.hasOwnProperty("enabled") && configObject.enabled === false) {
        return "disabled";
    }

    for (const index in directories) {
        const scanDir = path.resolve(directories[index]);

        return getFiles(scanDir)
            .then(files => {
                files.map(async (filePath) => {
                    const fileInfo = path.parse(filePath);

                    const fileIsMedia = await isAllowedFile(fileInfo, configObject);
                    if (fileIsMedia) {
                        const movieOrSeries = isMovieOrSeries(filePath);
                        if (movieOrSeries == "series") {
                            const fileMediaInfo = await determineSeriesInfo(fileInfo.name);

                            if (fileMediaInfo) {
                                const { name, season, episode } = fileMediaInfo;

                                const targetLinkPath = formatSeriesPath({ name, season, episode }, targetPath, fileInfo, configObject);
                                console.log(filePath, targetLinkPath);

                                //await createSymlink(filePath, targetLinkPath)
                            }
                        } else {
                            console.log("is not a series", filePath, movieOrSeries);
                        }

                    }

                })
            })
    }

}

async function getFiles(dir) {
    const subdirs = await fs.readdir(dir);

    const files = await Promise.all(subdirs.map(async (subdir) => {
        const res = path.resolve(dir, subdir);
        return (await fs.stat(res)).isDirectory() ? getFiles(res) : res;
    }));

    return files.reduce((a, f) => a.concat(f), []);
}

async function isAllowedFile(fileInfo, configObject) {
    let allowedFile = false;

    const fileExt = fileInfo.ext.replace(".", "");

    const isInArray = (extensionsArray, fileExtension) => {
        let found = false;
        for (const item of extensionsArray) {
            if (item.indexOf(fileExtension) !== -1) {
                found = true;
            }

        }
        return found;
    };

    if (configObject.hasOwnProperty("allowedExtensions") && configObject.allowedExtensions.length !== 0) {
        if (isInArray(configObject.allowedExtensions, fileExt)) {
            allowedFile = true;
        }
    } else {
        allowedFile = true;
    }

    if (configObject.hasOwnProperty("ignoredExtensions") && isInArray(configObject.ignoredExtensions, fileExt)) {
        allowedFile = false;
    }

    return allowedFile;
}

function isMovieOrSeries(fileName) {
    const parseFileName = ptn(fileName);

    let determination = null;
    if (parseFileName) {
        if (parseFileName.hasOwnProperty("episode") || parseFileName.hasOwnProperty("season")) {
            determination = "series";
        }

        else if (parseFileName.hasOwnProperty("year")) {
            determination = "movie";
        }
    }

    return determination;
}

async function determineSeriesInfo(fileName) {

    const mediaInfo = {
        name: null,
        year: null,
        quality: null,
        source: null,
        codec: null,
        season: null,
        episode: null,
    };

    // First method https://github.com/tregusti/episode-parser
    const parsedEpisode = episodeParser(fileName);
    if (parsedEpisode && parsedEpisode.show && parsedEpisode.season && parsedEpisode.episode) {
        // console.log("parsedEpisode", parsedEpisode);

        mediaInfo.name = parsedEpisode.show;
        mediaInfo.season = parsedEpisode.season;
        mediaInfo.episode = parsedEpisode.episode;

        mediaInfo.year = parsedEpisode.year; // 2013
        mediaInfo.quality = parsedEpisode.quality; // '720p'
        mediaInfo.source = parsedEpisode.source; // 'hdtv'
        mediaInfo.codec = parsedEpisode.codec; // 'x264'
        mediaInfo.group = parsedEpisode.group; // 'STALKERS'

        return mediaInfo;
    }

    // Second method https://github.com/skiptirengu/anitomy-js
    const anitomyParse = await anitomy.parse(fileName)
    if (anitomyParse && anitomyParse.anime_title && anitomyParse.episode_number) {
        // console.log("anitomyParse", anitomyParse);

        mediaInfo.name = anitomyParse.anime_title;
        mediaInfo.season = anitomyParse.season || "00";
        mediaInfo.episode = anitomyParse.episode_number;

        mediaInfo.quality = anitomyParse.video_resolution; // 1280x720
        mediaInfo.source = anitomyParse.source; // "BD"
        mediaInfo.codec = anitomyParse.video_term; // "x264"
        mediaInfo.group = parsedEpisode.release_group; // 'tlacatlc6'

        return mediaInfo;
    }

    console.log("failed to determine media data", fileName);
    return null;
}

function formatSeriesPath(targetMetadata, targetDir, fileInfo, configObject) {

    const { targetFormat } = configObject;

    // apply episode case format
    if (configObject.hasOwnProperty("seriesCaseFormat") && Case.hasOwnProperty(configObject.seriesCaseFormat)) {
        targetMetadata.name = Case[configObject.seriesCaseFormat](targetMetadata.name);
    }

    // apoply year to name format
    targetMetadata.nameOptYear = targetMetadata.name;
    if (targetMetadata.hasOwnProperty("year")) {
        targetMetadata.nameOptYear = `${targetMetadata.name} (${targetMetadata.year})`;
    }


    const formatPathName = stringTemplate(targetFormat, {
        ...targetMetadata,
        extension: fileInfo.ext.replace(".", "")
    });

    const savePath = path.normalize(formatPathName);
    console.log("determines file path", savePath);

    const targetPath = path.join(
        targetDir,
        savePath,
    );

    return targetPath;
}

async function createSymlink(filePath, linkPath) {
    await fs.mkdir(path.dirname(linkPath), { recursive: true })

    try {
        await fs.symlink(filePath, linkPath);

    } catch (error) {
        console.log("failed to create symlinek", error);
    }
}

module.exports = {
    runOrganize,
    getFiles,
    isAllowedFile,
    isMovieOrSeries,
    determineSeriesInfo,
    formatSeriesPath,
    createSymlink,
};
