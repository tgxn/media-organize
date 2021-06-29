const fs = require("fs").promises;
const path = require("path");

const Queue = require("queue-promise");

class Storage {
    constructor(filename) {
        if (!filename) {
            throw new Error("Storage requires path to a storage file");
        }

        this.filename = filename;
        this.tempFilename = `${filename}.bak`;
        this.backupFilename = `${filename}.tmp`;

        this.queue = new Queue({
            concurrent: 1,
            interval: 10,
        });

        this.store = {};
    }

    get(key, defaultValue) {
        if (typeof key !== "string") {
            throw new Error("key must be a string");
        }

        if (this.store.hasOwnProperty(key)) {
            return this.store[key];
        }

        return defaultValue || undefined;
        // return this._getDeep(key.split("."), defaultValue);
    }

    put(key, value) {
        if (typeof key !== "string") {
            throw new Error("key must be a string");
        }

        if (typeof value === undefined) {
            throw new Error("value must be defined");
        }

        this.store[key] = value;
        this.queue.enqueue(this.persistData.bind(this));
    }

    remove(key) {
        if (typeof key !== "string") {
            throw new Error("key must be a string");
        }

        delete this.store[key];
        this.queue.enqueue(this.persistData.bind(this));
    }

    async persistData() {
        const _data = JSON.stringify(this.store);

        await this._fileMustNotExist(this.tempFilename);
        await this._fileMustNotExist(this.backupFilename);

        await this._doBackup();

        await this.writeData(this.tempFilename, _data);
        await fs.rename(this.tempFilename, this.filename);

        await this._fileMustNotExist(this.backupFilename);
    }

    async writeData(filename, data) {
        await fs.writeFile(filename, Buffer.from(data));
        // // promise?
        // var _fd;

        // // Runs the tasks array of functions in series, each passing their results to the next in the array.
        // // However, if any of the tasks pass an error to their own callback, the next function is not executed, and the main callback is immediately called with the error.
        // async.waterfall(
        //     [
        //         async.apply(fs.open, filename, "w"),

        //         function (fd, cb) {
        //             _fd = fd;
        //             var buf = Buffer.from(data);
        //             var offset = 0;
        //             var position = 0;

        //             fs.write(fd, buf, offset, buf.length, position, cb);
        //         },

        //         function (written, buf, cb) {
        //             fs.fsync(_fd, cb);
        //         },

        //         function (cb) {
        //             fs.close(_fd, cb);
        //         },
        //     ],
        //     function (err) {
        //         cb(err);
        //     },
        // );
    }

    async _doBackup() {
        try {
            await fs.access(this.filename);
            await fs.rename(this.filename, this.backupFilename);
        } catch (error) {} // file doesn't exist or couldn't be renamed
    }

    async load() {
        let data = {};

        await this._resolvePath();

        try {
            const fileData = await fs.readFile(this.filename);
            data = JSON.parse(fileData);
        } catch (e) {
            if (e.code !== "ENOENT") {
                throw e;
            }
        }
        this.store = data;
        return data;
    }

    async _fileMustNotExist(file) {
        try {
            await fs.access(file);
            await fs.unlink(file);
        } catch (error) {} // file doesn't exist or couldn't be unlinked
    }

    async _resolvePath() {
        await fs.mkdir(path.dirname(this.filename), { recursive: true });
    }
}

module.exports = Storage;
