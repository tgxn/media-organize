const fs = require("fs").promises;
const path = require("path");
const hound = require("hound");

const episodeParser = require("episode-parser");
const anitomy = require("anitomy-js");
const ptn = require("parse-torrent-name");

const stringTemplate = require("string-template");
const Case = require("case");

const Spinnies = require("spinnies");
const cliSpinners = require("cli-spinners");

const spinnies = new Spinnies({
    spinner: cliSpinners.arc,
    succeedColor: "white",
    succeedPrefix: "✔",
    failColor: "white",
});

const Memory = require("./memory");
const Config = require("./config");

class Organize {
    constructor(configLocations) {
        this.configArray = [];
        this.storageObject = null;

        this.config = new Config(configLocations.config);
        this.memory = new Memory(configLocations.storage);
    }

    async loadConfig() {
        try {
            this.configArray = await this.config.loadAndValidateConfig();
        } catch (errors) {
            console.error("Config Errors Found", errors);
        }
        try {
            await this.memory.loadStore();
        } catch (errors) {
            console.error("Error loading storage");
        }
    }

    async organizeAll() {
        for (const index in this.configArray) {
            const layer = new OrganizerLayer(this, index);
            await layer.organizeDirectory();
        }
    }

    async registerWatchers() {
        spinnies.add("watcher", { text: "Starting watchers..." });
        for (const index in this.configArray) {
            const configData = this.configArray[index];

            const layer = new OrganizerLayer(this, index);

            const { directories } = configData;

            for (const index in directories) {
                const scanDir = path.resolve(directories[index]);
                spinnies.add(`watcher-${index}-${index}`, {
                    text: `Watching "${scanDir}"...`,
                });

                const watcher = hound.watch(scanDir);
                watcher.on("create", (file, stats) => layer.onFileCreated(file, stats));
                watcher.on("delete", (file) => layer.onFileDeleted(file));
            }
        }

        spinnies.succeed("watcher", { text: `Watchers started OK!` });
    }
}

class OrganizerLayer {
    constructor(organizeParent, configIndex) {
        this.configIndex = configIndex;

        this.memory = organizeParent.memory;
        this.configData = organizeParent.configArray[configIndex];

        this.directories = this.configData.directories;
        this.targetPath = this.configData.targetPath;
    }

    async onFileCreated(file, stats) {
        console.log(`File Created: "${file}".`);

        await this.organizeDirectory();
    }

    async onFileDeleted(file) {
        console.log(`File Deleted: "${file}".`);

        const linkExists = this.memory.findLinkWithSource(file);
        if (linkExists) {
            console.log("Remove Link:", linkExists.linkPath);

            try {
                await fs.unlink(linkExists.linkPath);
                this.memory.deleteLink(linkExists.linkPath);
            } catch (error) {
                console.log("failed to unlink", linkExists.linkPath, error.toString());
            }
        }
    }

    async organizeDirectory() {
        spinnies.add(this.configIndex, {
            text: `Running Config ${this.configIndex} (${this.directories.length} directories)`,
        });

        if (this.configData.hasOwnProperty("enabled") && this.configData.enabled === false) {
            spinnies.fail(this.configIndex, {
                text: `Config ${this.configIndex} is disabled! (${this.directories.length} directories)`,
            });
            return "disabled";
        }

        let directoryPromises = [];

        for (const index in this.directories) {
            const scanDir = path.resolve(this.directories[index]);

            directoryPromises.push(
                this.getFiles(scanDir).then(async (files) => {
                    spinnies.add(scanDir, { text: `Organizing ${scanDir}...` });

                    const results = await Promise.all(
                        files.map(async (filePath) => {
                            const parsedPath = path.parse(filePath);

                            const fileIsMedia = await this.isAllowedFile(filePath);

                            if (fileIsMedia) {
                                const movieOrSeries = await this.isMovieOrSeries(parsedPath);

                                if (this.configData.hasOwnProperty("strictType")) {
                                    if (movieOrSeries !== this.configData.strictType) {
                                        console.log("wrong media type, ignoring", movieOrSeries);
                                        return false;
                                    }
                                }

                                const fileMediaInfo = await this.determineMediaInfo(
                                    parsedPath.name,
                                    movieOrSeries,
                                );

                                if (fileMediaInfo) {
                                    const targetLinkPath = this.formatSeriesPath(fileMediaInfo, parsedPath);
                                    await this.createSymlink(filePath, targetLinkPath, fileMediaInfo);
                                }
                            }
                        }),
                    );

                    await (function sleep(ms) {
                        return new Promise((resolve) => {
                            setTimeout(resolve, ms);
                        });
                    })(1200);

                    spinnies.succeed(scanDir, {
                        text: `Organized "${scanDir}"! (${results.length} files)`,
                    });
                }),
            );
        }

        const resolvedPromises = await Promise.all(directoryPromises);

        spinnies.succeed(this.configIndex, {
            text: `Config ${this.configIndex} completed! (${this.directories.length} directories)`,
        });

        return resolvedPromises;
    }

    async getFiles(dir) {
        const subdirs = await fs.readdir(dir);

        const files = await Promise.all(
            subdirs.map(async (subdir) => {
                const res = path.resolve(dir, subdir);
                return (await fs.stat(res)).isDirectory() ? this.getFiles(res) : res;
            }),
        );

        return files.reduce((a, f) => a.concat(f), []);
    }

    async isAllowedFile(filePath) {
        const fileInfo = path.parse(filePath);

        if (!fileInfo.ext) {
            return null;
        }
        const fileExt = fileInfo.ext.replace(".", "");

        const isInArray = (extensionsArray, fileExtension) => {
            let found = false;
            for (const item of extensionsArray) {
                if (item.toLowerCase().indexOf(fileExtension.toLowerCase()) !== -1) {
                    found = true;
                }
            }
            return found;
        };

        // TODO: Should probably be filtered in `getFiles` to avoid the additional fs.stat.
        if (this.configData.hasOwnProperty("allowedSize") && Array.isArray(this.configData.allowedSize)) {
            const fileStat = await fs.stat(filePath);
            const fileSizeMB = Math.floor(fileStat.size / 1024000);

            const allowedSizeArray = this.configData.allowedSize;

            if (
                allowedSizeArray.length == 1 &&
                fileSizeMB < allowedSizeArray[0] // less than minimum size
            ) {
                return false;
            }

            if (
                allowedSizeArray.length == 2 &&
                fileSizeMB > allowedSizeArray[1] // more than maximum size
            ) {
                return false;
            }
        }

        let allowedFile = false;
        if (
            this.configData.hasOwnProperty("allowedExtensions") &&
            this.configData.allowedExtensions.length !== 0
        ) {
            if (isInArray(this.configData.allowedExtensions, fileExt)) {
                allowedFile = true;
            }
        } else {
            allowedFile = true;
        }

        if (
            this.configData.hasOwnProperty("ignoredExtensions") &&
            isInArray(this.configData.ignoredExtensions, fileExt)
        ) {
            allowedFile = false;
        }

        return allowedFile;
    }

    async isMovieOrSeries(parsedPath) {
        if (parsedPath.name == null || parsedPath.name == "") {
            return null;
        }

        const fileName = parsedPath.name;
        // console.error(parsedPath);

        const parseFileName = ptn(fileName);
        const anitomyParse = await anitomy.parse(fileName);

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
            const anitomyParse = await anitomy.parse(fileName);
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
            if (
                parseTorrentName.hasOwnProperty("year") ||
                parseTorrentName.hasOwnProperty("resolution") ||
                parseTorrentName.hasOwnProperty("title")
            ) {
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

    formatSeriesPath(targetMetadata, fileInfo) {
        const { targetFormat, targetPath } = this.configData;

        // apply episode case format
        if (
            this.configData.hasOwnProperty("seriesCaseFormat") &&
            Case.hasOwnProperty(this.configData.seriesCaseFormat)
        ) {
            targetMetadata.name = Case[this.configData.seriesCaseFormat](targetMetadata.name);
        }

        // apoply year to name format
        targetMetadata.nameOptYear = targetMetadata.name;
        if (targetMetadata.hasOwnProperty("year") && targetMetadata.year) {
            targetMetadata.nameOptYear = `${targetMetadata.name} (${targetMetadata.year})`;
        }

        const formatPathName = stringTemplate(targetFormat, {
            ...targetMetadata,
            extension: fileInfo.ext.replace(".", ""),
        });

        const savePath = path.normalize(formatPathName);

        const formattedPath = path.join(targetPath, savePath);

        return formattedPath;
    }

    async createSymlink(filePath, linkPath, metaData) {
        try {
            // create containing folder
            await fs.mkdir(path.dirname(linkPath), { recursive: true });

            // existing symlink?
            let updateSymlink = false;

            const searchLink = this.memory.findLink(linkPath);
            if (searchLink) {
                if (
                    searchLink.sourcePath !== filePath // only if target is different to existing
                ) {
                    // different source files

                    if (
                        this.configData.hasOwnProperty("useHighestQuality") &&
                        this.configData.useHighestQuality === true
                    ) {
                        let shouldReplaceLink = false;

                        if (metaData.hasOwnProperty("quality")) {
                            const newQualityInteger =
                                typeof metaData.quality === "string"
                                    ? metaData.quality.replace(/\D/g, "")
                                    : metaData.quality;

                            if (searchLink.metaData.hasOwnProperty("quality")) {
                                const existingQualityInteger =
                                    typeof searchLink.metaData.quality === "string"
                                        ? searchLink.metaData.quality.replace(/\D/g, "")
                                        : searchLink.metaData.quality;

                                if (
                                    Number.isInteger(existingQualityInteger) &&
                                    Number.isInteger(newQualityInteger) &&
                                    existingQualityInteger < newQualityInteger
                                ) {
                                    // more is better?
                                    console.log(
                                        "Found better episode!",
                                        existingQualityInteger,
                                        newQualityInteger,
                                    );
                                    shouldReplaceLink = true;
                                }
                            } else if (Number.isInteger(newQualityInteger)) {
                                shouldReplaceLink = true;
                            }
                        }

                        if (shouldReplaceLink) {
                            // check quality
                            try {
                                await fs.unlink(searchLink.linkPath);
                            } catch (error) {
                                console.log("failed to unlink", searchLink.linkPath, error.toString());
                            }

                            updateSymlink = true;
                        }
                    }
                }
            } else {
                updateSymlink = true;
            }

            if (updateSymlink) {
                try {
                    await fs.symlink(filePath, linkPath);
                } catch (error) {
                    console.log("failed to link", filePath, linkPath, error.toString());
                } finally {
                    this.memory.createLink(linkPath, filePath, metaData);
                }
            }
        } catch (error) {
            console.log("failed to create symlinek", error.toString());
        }
    }
}

module.exports = { Organize, OrganizerLayer };
