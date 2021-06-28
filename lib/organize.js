const fs = require('fs').promises;
const path = require('path');
const hound = require('hound')

const episodeParser = require('episode-parser')
const anitomy = require('anitomy-js')
const ptn = require('parse-torrent-name');

const stringTemplate = require("string-template")
const Case = require("case")

const { loadConfiguration } = require('./config');

const Spinnies = require('spinnies');
const cliSpinners = require('cli-spinners');

const {
    loadStorageObject
} = require('./storage');

class Organize {
    constructor() {
        this.storageObject = null;
        this.configArray = loadConfiguration();

        this.spinnies = new Spinnies({
            spinner: cliSpinners.arc,
            succeedColor: "white",
            succeedPrefix: "✔",
            failColor: "white",
        });
    }

    async loadStorage() {
        this.storageObject = await loadStorageObject();
    }

    async organizeAll() {
        for (const index in this.configArray) {
            const configData = this.configArray[index];

            await this.organizeDirectory(index);
        }
    }

    async registerWatchers() {
        this.spinnies.add('watcher', { text: 'Starting watchers...' });

        let watchingText = "";
        for (const index in this.configArray) {
            const configData = this.configArray[index];

            const { directories } = configData;

            if (directories.length == 1) {
                watchingText = `"${directories[0]}" for changes`;
            } else {
                watchingText = `${directories.length} directories for changes`;
            }

            for (const index in directories) {
                const scanDir = path.resolve(directories[index]);

                const watcher = hound.watch(scanDir)
                watcher.on('create', (file, stats) => this.onFileCreated(file, stats));
                watcher.on('delete', (file) => this.onFileDeleted(file));
            }
        }

        this.spinnies.update('watcher', { text: `Watching ${watchingText}...` });
    }

    async onFileCreated(file, stats) {
        console.log(file + ' was created')

        // await this.organize()
        //     .then(() => {
        //         console.log(`${index} complete`);
        //     });

    }

    async onFileDeleted(file) {
        console.log(file + ' was deleted')
    }

    async organizeDirectory(configIndex) {
        const configData = this.configArray[configIndex];
        const { directories, targetPath } = configData;

        this.spinnies.add(configIndex, { text: `Running Config ${configIndex} (${directories.length} directories)` });

        if (configData.hasOwnProperty("enabled") && configData.enabled === false) {
            this.spinnies.fail(configIndex, { text: `Config ${configIndex} is disabled! (${directories.length} directories)` });
            return "disabled";
        }

        let directoryPromises = [];

        for (const index in directories) {
            const scanDir = path.resolve(directories[index]);

            directoryPromises.push(
                this.getFiles(scanDir)
                    .then(async files => {
                        this.spinnies.add(scanDir, { text: `Organizing ${scanDir}...` });

                        const results = await Promise.all(files.map(async (filePath) => {
                            const parsedPath = path.parse(filePath);

                            const fileIsMedia = await this.isAllowedFile(filePath, configData);
                            if (fileIsMedia) {
                                const movieOrSeries = await this.isMovieOrSeries(parsedPath);

                                if (configData.hasOwnProperty("strictType")) {
                                    if (movieOrSeries !== configData.strictType) {
                                        console.log("wrong media type, ignoring", movieOrSeries,);
                                        return false;
                                    }
                                }

                                const fileMediaInfo = await this.determineMediaInfo(parsedPath.name, movieOrSeries);

                                if (fileMediaInfo) {
                                    const { name, season, episode } = fileMediaInfo;

                                    const targetLinkPath = this.formatSeriesPath({ name, season, episode }, parsedPath, configData);
                                    // await this.createSymlink(filePath, targetLinkPath, storageObject)
                                }

                            }
                        }));

                        await (function sleep(ms) {
                            return new Promise((resolve) => {
                                setTimeout(resolve, ms);
                            });
                        })(1200);

                        this.spinnies.succeed(scanDir, { text: `Organized "${scanDir}"! (${results.length} files)` });
                    })
            );
        }

        const resolvedPromises = await Promise.all(directoryPromises);

        this.spinnies.succeed(configIndex, { text: `Config ${configIndex} completed! (${directories.length} directories)` });

        return resolvedPromises;
    }

    async getFiles(dir) {
        const subdirs = await fs.readdir(dir);

        const files = await Promise.all(subdirs.map(async (subdir) => {
            const res = path.resolve(dir, subdir);
            return (await fs.stat(res)).isDirectory() ? this.getFiles(res) : res;
        }));

        return files.reduce((a, f) => a.concat(f), []);
    }

    async isAllowedFile(filePath, configObject) {
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

    async isMovieOrSeries(parsedPath) {
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

    async determineMediaInfo(fileName, typeDetermination) {

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

    formatSeriesPath(targetMetadata, fileInfo, configData) {
        const { targetFormat, targetPath } = configData;

        // apply episode case format
        if (
            configData.hasOwnProperty("seriesCaseFormat") &&
            Case.hasOwnProperty(configData.seriesCaseFormat)
        ) {
            targetMetadata.name = Case[configData.seriesCaseFormat](targetMetadata.name);
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

        const formattedPath = path.join(
            targetPath,
            savePath,
        );

        return formattedPath;
    }

    async createSymlink(filePath, linkPath, storageObject) {

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

}

module.exports = Organize;
