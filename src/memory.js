const Storage = require("./storage");

class Memory {
    constructor(storageFileLocation) {
        this.storageFileLocation = storageFileLocation;

        this.store = new Storage(storageFileLocation);
    }

    async loadStore() {
        await this.store.load();
        this.linkFiles = this.store.get("linkFiles") || {};
    }

    findLink(linkPath) {
        if (this.linkFiles.hasOwnProperty(linkPath)) {
            const foundLink = this.linkFiles[linkPath];
            return foundLink;
        }

        return null;
    }

    createLink(linkPath, sourcePath, metaData) {
        this.linkFiles[linkPath] = {
            linkPath,
            sourcePath,
            metaData,
            createdAt: Date.now()
        };

        this.updateStore();
    }

    deleteLink(linkPath) {
        this.linkFiles[linkPath] = undefined;
        delete this.linkFiles[linkPath];

        this.updateStore();
    }

    findLinkWithSource(sourcePath) {
        for (const linkPath in this.linkFiles) {
            if (this.linkFiles[linkPath].sourcePath === sourcePath) {
                return this.linkFiles[linkPath];
            }
        }
        return null;
    }

    updateStore() {
        this.store.put("linkFiles", this.linkFiles);
    }
}

module.exports = Memory;
