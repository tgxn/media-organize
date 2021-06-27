const fs = require('fs').promises;
const path = require('path');

const episodeParser = require('episode-parser')
const anitomy = require('anitomy-js')
const ptn = require('parse-torrent-name');

const stringTemplate = require("string-template")
const Case = require("case")

async function runOrganize(configObject, storageObject) {

    const { directories, targetPath } = configObject;

    if (configObject.hasOwnProperty("enabled") && configObject.enabled === false) {
        return "disabled";
    }

    let directoryPromises = [];

    for (const index in directories) {
        const scanDir = path.resolve(directories[index]);

        directoryPromises.push(
            getFiles(scanDir)
                .then(files => {
                    return Promise.all(files.map(async (filePath) => {
                        const parsedPath = path.parse(filePath);

                        const fileIsMedia = await isAllowedFile(filePath, configObject);
                        if (fileIsMedia) {
                            const movieOrSeries = await isMovieOrSeries(parsedPath);

                            if (configObject.hasOwnProperty("strictType")) {
                                if (movieOrSeries !== configObject.strictType) {
                                    console.log("wrong media type, ignoring", movieOrSeries,);
                                    return false;
                                }
                            }

                            const fileMediaInfo = await determineMediaInfo(parsedPath.name, movieOrSeries);

                            if (fileMediaInfo) {
                                const { name, season, episode } = fileMediaInfo;

                                const targetLinkPath = formatSeriesPath({ name, season, episode }, targetPath, parsedPath, configObject);

                                await createSymlink(filePath, targetLinkPath, storageObject)
                            }

                        }

                    }))
                })
        )
    }

    return Promise.all(directoryPromises);
}

async function getFiles(dir) {
    const subdirs = await fs.readdir(dir);

    const files = await Promise.all(subdirs.map(async (subdir) => {
        const res = path.resolve(dir, subdir);
        return (await fs.stat(res)).isDirectory() ? getFiles(res) : res;
    }));

    return files.reduce((a, f) => a.concat(f), []);
}

async function isAllowedFile(filePath, configObject) {
    const fileInfo = path.parse(filePath);

    if (!fileInfo.ext) {
        return null;
    }

    const fileExt = fileInfo.ext.replace(".", "");

    let allowedFile = false;

    const isInArray = (extensionsArray, fileExtension) => {
        let found = false;
        for (const item of extensionsArray) {

            if (item.toLowerCase().indexOf(fileExtension.toLowerCase()) !== -1) {
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

async function isMovieOrSeries(parsedPath) {
    if (parsedPath.name == null || parsedPath.name == "") { return null }

    const fileName = parsedPath.name;
    // console.error(parsedPath);

    const parseFileName = ptn(fileName);
    const anitomyParse = await anitomy.parse(fileName)

    let determination = null;


    if (parseFileName) {
        if ((parseFileName.hasOwnProperty("episode") && parseFileName.hasOwnProperty("season")) || (anitomyParse.hasOwnProperty("episode_number") && anitomyParse.hasOwnProperty("anime_title"))) {
            determination = "series";
        }

        else if (parseFileName.hasOwnProperty("year") || parseFileName.hasOwnProperty("resolution") || parseFileName.hasOwnProperty("title")) {
            determination = "movie";
        }
    }

    return determination;
}

async function determineMediaInfo(fileName, typeDetermination) {

    const mediaInfo = {
        name: null,
        year: null,
        quality: null,
        source: null,
        codec: null,
        season: null,
        episode: null,
    };

    if (typeDetermination == "series") {
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
            mediaInfo.group = anitomyParse.release_group; // 'tlacatlc6'

            return mediaInfo;
        }

    } else if (typeDetermination == "movie") {

        // Movies method https://github.com/jzjzjzj/parse-torrent-name
        const parseTorrentName = ptn(fileName);
        if (parseTorrentName.hasOwnProperty("year") || parseTorrentName.hasOwnProperty("resolution") || parseTorrentName.hasOwnProperty("title")) {
            // console.log("parseTorrentName", parseTorrentName);

            mediaInfo.name = parseTorrentName.title; // 'The Staying Alive'

            mediaInfo.year = parseTorrentName.year; // 2014
            mediaInfo.quality = parseTorrentName.resolution; // '1080p'
            mediaInfo.codec = parseTorrentName.codec; // 'x264'
            mediaInfo.group = parseTorrentName.group; // 'YIFY'

            return mediaInfo;
        }

    }

    console.log("failed to determine media data", fileName, typeDetermination);
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

    const targetPath = path.join(
        targetDir,
        savePath,
    );

    return targetPath;
}

async function createSymlink(filePath, linkPath, storageObject) {

    try {
        // create containing folder
        await fs.mkdir(path.dirname(linkPath), { recursive: true });

        // existing symlink?
        let updateSymlink = false;
        if (storageObject.hasOwnProperty(filePath)) {
            const existingLink = storageObject[filePath];

            if (existingLink.hasOwnProperty("linkPath") && existingLink.linkPath !== linkPath) { // different links
                try {
                    await fs.unlink(existingLink.linkPath);
                } catch (error) {
                    console.log("failed to unlink", existingLink.linkPath);
                }
                updateSymlink = true;
            }

        } else {
            updateSymlink = true;
        }

        if (updateSymlink) {
            try {
                console.log("Creating Linkage:", filePath, linkPath);
                await fs.symlink(filePath, linkPath);
            } catch (error) {
                console.log("failed to link", filePath, linkPath);
            }
        }

        storageObject[filePath] = { linkPath };

    } catch (error) {
        console.log("failed to create symlinek", error);
    }
}

module.exports = {
    runOrganize,
    getFiles,
    isAllowedFile,
    isMovieOrSeries,
    determineMediaInfo,
    formatSeriesPath,
    createSymlink,
};
