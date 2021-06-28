const Storage = require("./storage");
const { constructor } = require("parse-torrent-name/core");

const storageLocation = "./data/storage.json";

function isObject(obj) {
    return Object.prototype.toString.call(obj) === "[object Object]";
}

class Store {
    constructor() {
        this.store = new Storage(storageLocation);

        this.loadStore();
    }

    loadStore() {
        this.linkFiles = this.store.get("linkFiles") || {};
    }

    findLink(linkPath) {
        this.loadStore();

        if (this.linkFiles.hasOwnProperty(linkPath)) {
            const foundLink = this.linkFiles[linkPath];
            // console.log("found link!", foundLink);
            return foundLink;
        }

        return null;
    }

    createLink(linkPath, sourcePath, metaData) {
        this.loadStore();

        this.linkFiles[linkPath] = {
            linkPath,
            sourcePath,
            metaData,
        };

        this.updateStore();
    }

    deleteLink(linkPath) {
        this.loadStore();

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

module.exports = Store;
