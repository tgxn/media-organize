const fs = require("fs").promises;
const path = require("path");

const stringTemplate = require("string-template");
const Case = require("case");

const spinnies = require("./spinnies");

const Parser = require("./parser");

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

    async shouldCreateLink(filePath, linkPath, metaData) {
        let updateSymlink = false;

        const searchLink = this.memory.findLink(linkPath);
        if (searchLink) {
            if (searchLink.sourcePath !== filePath) {
                // different source files

                if (
                    this.configData.hasOwnProperty("useHighestQuality") &&
                    this.configData.useHighestQuality === true &&
                    metaData.hasOwnProperty("quality")
                ) {
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
                            console.log("Found better episode!", existingQualityInteger, newQualityInteger);
                            updateSymlink = true;
                        }
                    } else if (Number.isInteger(newQualityInteger)) {
                        // old had no quality
                        updateSymlink = true;
                    }
                }
            }
        } else {
            // console.log("no old link!");
            updateSymlink = true;
        }
        return updateSymlink;
    }

    async organizeDirectory() {
        spinnies.add(this.configIndex, {
            text: `Running Config ${this.configIndex} (${this.directories.length} directories)`
        });

        if (this.configData.hasOwnProperty("enabled") && this.configData.enabled === false) {
            spinnies.fail(this.configIndex, {
                text: `Config ${this.configIndex} is disabled! (${this.directories.length} directories)`
            });
            return "disabled";
        }

        let directoryPromises = [];

        for (const index in this.directories) {
            const scanDir = path.resolve(this.directories[index]);

            directoryPromises.push(
                this.getFiles(scanDir)
                    .then(async (files) => {
                        spinnies.add(scanDir, { text: `Organizing ${scanDir}...` });

                        const results = await Promise.all(
                            files.map(async (filePath) => {
                                const parsedPath = path.parse(filePath);

                                const nameParser = new Parser(filePath);

                                const fileIsMedia = await this.isAllowedFile(filePath);

                                if (fileIsMedia) {
                                    const movieOrSeries = await nameParser.isMovieOrSeries();

                                    if (this.configData.hasOwnProperty("strictType")) {
                                        if (movieOrSeries !== this.configData.strictType) {
                                            console.log("wrong media type, ignoring", movieOrSeries);
                                            return false;
                                        }
                                    }

                                    const fileMediaInfo = await nameParser.determineMediaInfo();

                                    const targetLinkPath = this.formatSeriesPath(fileMediaInfo, parsedPath);

                                    const updateSymlink = await this.shouldCreateLink(
                                        filePath,
                                        targetLinkPath,
                                        fileMediaInfo
                                    );

                                    if (updateSymlink) {
                                        this.memory.createLink(targetLinkPath, filePath, fileMediaInfo);

                                        return targetLinkPath;
                                    }
                                }
                                return false;
                            })
                        );

                        return results;
                    })

                    .then((array) => Array.from(new Set(array))) // dedupe
                    .then(async (files) => {
                        // console.log("files", files);
                        const results = await Promise.all(
                            files.map(async (createLink) => {
                                if (createLink) {
                                    const foundLink = this.memory.findLink(createLink);
                                    if (foundLink) {
                                        await this.createSymlink(
                                            foundLink.sourcePath,
                                            foundLink.linkPath,
                                            foundLink.metaData
                                        );
                                    }
                                }
                            })
                        );

                        spinnies.succeed(scanDir, {
                            text: `Organized "${scanDir}"! (${results.length} files)`
                        });
                    })
            );
        }

        const resolvedPromises = await Promise.all(directoryPromises);

        spinnies.succeed(this.configIndex, {
            text: `Config ${this.configIndex} completed! (${this.directories.length} directories)`
        });

        return resolvedPromises;
    }

    async getFiles(dir) {
        const subdirs = await fs.readdir(dir);

        const files = await Promise.all(
            subdirs.map(async (subdir) => {
                const res = path.resolve(dir, subdir);
                return (await fs.stat(res)).isDirectory() ? this.getFiles(res) : res;
            })
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
            extension: fileInfo.ext.replace(".", "")
        });

        const savePath = path.normalize(formatPathName);

        const formattedPath = path.join(targetPath, savePath);

        return formattedPath;
    }

    async createSymlink(filePath, linkPath) {
        try {
            // create containing folder
            await fs.mkdir(path.dirname(linkPath), { recursive: true });

            try {
                await fs.unlink(linkPath);
            } catch (error) {
            } finally {
                try {
                    await fs.symlink(filePath, linkPath);
                } catch (error) {
                    console.log("failed to link", filePath, linkPath, error.toString());
                }
            }
        } catch (error) {
            console.log("failed to create symlink", error.toString());
        }
    }
}

module.exports = OrganizerLayer;
