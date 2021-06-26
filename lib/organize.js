const fs = require('fs').promises;
const path = require('path');
const mime = require('mime');

const episodeParser = require('episode-parser')
const anitomy = require('anitomy-js')
const ptn = require('parse-torrent-name');

async function getFiles(dir) {
    const subdirs = await fs.readdir(dir);

    const files = await Promise.all(subdirs.map(async (subdir) => {
        const res = path.resolve(dir, subdir);
        return (await fs.stat(res)).isDirectory() ? getFiles(res) : res;
    }));

    return files.reduce((a, f) => a.concat(f), []);
}

async function isMediaFile(filePath) {
    const mimeType = mime.getType(filePath);
    let isMedia = false;

    if (mimeType) {
        isMedia = mimeType.indexOf("video") == 0;
    }
    return isMedia;
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

        return mediaInfo;
    }

    // Second method https://github.com/erengy/anitomy
    const anitomyParse = await anitomy.parse(fileName)
    if (anitomyParse && anitomyParse.anime_title && anitomyParse.episode_number) {
        // console.log("anitomyParse", anitomyParse);

        mediaInfo.name = anitomyParse.anime_title;
        mediaInfo.season = anitomyParse.season || "00";
        mediaInfo.episode = anitomyParse.episode_number;

        return mediaInfo;
    }

    console.log("failed to determine media data", fileName);
    return null;
}

function formatSeriesPath(targetDir, { name, season, episode }, fileExtension) {

    const targetPath = path.join(
        targetDir,
        `${name}`,
        `Season ${season}`,
        `Episode ${episode}${fileExtension}`
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
    getFiles,
    isMediaFile,
    isMovieOrSeries,
    determineSeriesInfo,
    formatSeriesPath,
    createSymlink,
};
