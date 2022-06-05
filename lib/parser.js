const path = require("path");

const logger = require("./logger");

const episodeParser = require("episode-parser");
const anitomy = require("anitomy-js");
const ptn = require("parse-torrent-name");

class Parser {
    static async isMovieOrSeries(filePath) {
        const parsedPath = path.parse(filePath);

        if (filePath === "" || !parsedPath) {
            return null;
        }

        const parseFileName = ptn(parsedPath.base);
        const anitomyParse = await anitomy.parse(parsedPath.name);

        let determination = null;
        if (parseFileName) {
            if (
                (parseFileName.hasOwnProperty("episode") &&
                    parseFileName.episode &&
                    parseFileName.hasOwnProperty("season") &&
                    parseFileName.season) ||
                (anitomyParse.hasOwnProperty("episode_number") &&
                    anitomyParse.episode_number &&
                    anitomyParse.hasOwnProperty("anime_title") &&
                    anitomyParse.anime_title)
            ) {
                determination = "series";
            } else if (
                parseFileName.hasOwnProperty("year") ||
                parseFileName.hasOwnProperty("resolution") ||
                parseFileName.hasOwnProperty("title")
            ) {
                determination = "movie";
            }
        }

        return determination;
    }

    static async determineMediaInfo(filePath, fileType) {
        const parsedPath = path.parse(filePath);

        if (!filePath || !parsedPath || filePath === "" || !fileType) {
            return null;
        }

        const mediaInfo = {
            fileName: parsedPath.name,
            name: null,
            year: null,
            quality: null,
            source: null,
            codec: null,
            season: null,
            episode: null,
            classifier: null
        };

        if (fileType == "series") {
            // First method https://github.com/tregusti/episode-parser
            const parsedEpisode = episodeParser(parsedPath.base);
            if (parsedEpisode && parsedEpisode.show && parsedEpisode.season && parsedEpisode.episode) {
                logger.debug("parsedEpisode", parsedEpisode);

                mediaInfo.name = parsedEpisode.show;
                mediaInfo.season = parsedEpisode.season;
                mediaInfo.episode = parsedEpisode.episode;

                mediaInfo.year = parsedEpisode.year; // 2013
                mediaInfo.quality = parsedEpisode.quality; // '720p'
                mediaInfo.source = parsedEpisode.source; // 'hdtv'
                mediaInfo.codec = parsedEpisode.codec; // 'x264'
                mediaInfo.group = parsedEpisode.group; // 'STALKERS'

                mediaInfo.classifier = "episode-parser";
                return mediaInfo;
            }

            // Second method https://github.com/skiptirengu/anitomy-js
            const anitomyParse = await anitomy.parse(parsedPath.name);
            if (anitomyParse && anitomyParse.anime_title && anitomyParse.episode_number) {
                logger.debug("anitomyParse", anitomyParse);

                mediaInfo.name = anitomyParse.anime_title;
                mediaInfo.season = anitomyParse.season || "00";
                mediaInfo.episode = anitomyParse.episode_number;

                mediaInfo.quality = anitomyParse.video_resolution; // 1280x720
                mediaInfo.source = anitomyParse.source; // "BD"
                mediaInfo.codec = anitomyParse.video_term; // "x264"
                mediaInfo.group = anitomyParse.release_group; // 'tlacatlc6'

                mediaInfo.classifier = "anitomy-js";
                return mediaInfo;
            }
        } else if (fileType == "movie") {
            // Movies method https://github.com/jzjzjzj/parse-torrent-name
            const parseTorrentName = ptn(parsedPath.base);
            if (
                parseTorrentName.hasOwnProperty("year") ||
                parseTorrentName.hasOwnProperty("resolution") ||
                parseTorrentName.hasOwnProperty("title")
            ) {
                logger.debug("parseTorrentName", parseTorrentName);

                mediaInfo.name = parseTorrentName.title; // 'The Staying Alive'

                mediaInfo.year = parseTorrentName.year; // 2014
                mediaInfo.quality = parseTorrentName.resolution; // '1080p'
                mediaInfo.codec = parseTorrentName.codec; // 'x264'
                mediaInfo.group = parseTorrentName.group; // 'YIFY'

                mediaInfo.classifier = "parse-torrent-name";
                return mediaInfo;
            }
        }

        logger.error(`failed to determine media data: ${filePath}`, filePath, parsedPath, fileType);
        return null;
    }
}
module.exports = Parser;
