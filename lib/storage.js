// source https://github.com/amativos/node-storage
const fs = require('fs');
const async = require('async');
const mkdirp = require('mkdirp');

function isObject(obj) {
    return Object.prototype.toString.call(obj) === '[object Object]';
}

class Storage {

    constructor(filename) {
        if (!filename) {
            throw new Error('Storage requires path to a storage file');
        }

        this.filename = filename;
        this.tempFilename = filename + '.bak';
        this.backupFilename = filename + '.tmp';

        this.queue = async.queue((task, cb) => {
            this._persist((err) => {
                if (err) {
                    throw err;
                }

                cb();
            });
        });

        this.store = this._load();
        this._resolvePath();
    }

    get(key, defaultValue) {
        if (typeof key !== 'string') {
            throw new Error('key must be a string');
        }

        return this._getDeep(key.split('.'), defaultValue);
    }

    put(key, value) {
        if (typeof key !== 'string') {
            throw new Error('key must be a string');
        }

        this._setDeep(key.split('.'), value, false);
        this.queue.push();
    }

    remove(key) {
        if (typeof key !== 'string') {
            throw new Error('key must be a string');
        }

        this._setDeep(key.split('.'), undefined, true);
        this.queue.push();
    }

    _getDeep(path, defaultValue) {
        var storage = this.store;

        for (var i = 0; i < path.length; i++) {
            var p = path[i];

            if (!isObject(storage)) {
                throw new Error(path.slice(0, i).join('.') + ' is not an object');
            }

            if (!storage.hasOwnProperty(p)) {
                return defaultValue || undefined;
            }

            storage = storage[p];
        }

        return storage;
    }

    _setDeep(path, value, remove) {
        var storage = this.store;

        for (var i = 0; i < path.length; i++) {
            var p = path[i];

            if (!isObject(storage)) {
                throw new Error(path.slice(0, i).join('.') + ' is not an object');
            }

            if (i === path.length - 1) {
                setOrRemove(storage, p);
                return;
            }

            if (!storage.hasOwnProperty(p)) {
                storage[p] = {};
            }

            storage = storage[p];
        }

        function setOrRemove(obj, key) {
            if (remove) {
                delete obj[key];
            } else {
                obj[key] = value;
            }
        }
    }

    _persist(cb) {
        var self = this;
        var _data = JSON.stringify(self.store);

        async.series([
            async.apply(self._fileMustNotExist, self.tempFilename),
            async.apply(self._fileMustNotExist, self.backupFilename),
            async.apply(self._doBackup.bind(self)),
            async.apply(self.writeData, self.tempFilename, _data),
            async.apply(fs.rename, self.tempFilename, self.filename),
            async.apply(self._fileMustNotExist, self.backupFilename)
        ], cb);
    }

    writeData(filename, data, cb) {
        var _fd;

        async.waterfall([
            async.apply(fs.open, filename, 'w'),

            function (fd, cb) {
                _fd = fd;
                var buf = Buffer.from(data);
                var offset = 0;
                var position = 0;

                fs.write(fd, buf, offset, buf.length, position, cb);
            },

            function (written, buf, cb) {
                fs.fsync(_fd, cb);
            },

            function (cb) {
                fs.close(_fd, cb);
            }
        ], function (err) {
            cb(err);
        });
    }

    _doBackup(cb) {
        var self = this;

        fs.exists(self.filename, function (exists) {
            if (!exists) {
                return cb(null);
            }

            fs.rename(self.filename, self.backupFilename, cb);
        });
    }

    _load() {
        var data;

        try {
            data = JSON.parse(fs.readFileSync(this.filename));
        } catch (e) {
            if (e.code !== 'ENOENT') {
                throw e;
            }

            data = {};
        }

        return data;
    }

    _fileMustNotExist(file, cb) {
        fs.exists(file, function (exists) {
            if (!exists) {
                return cb(null);
            }

            fs.unlink(file, function (err) {
                return cb(err);
            });
        });
    }

    _resolvePath() {
        var _path = this.filename.split('/').slice(0, -1).join('/');

        if (_path) {
            mkdirp.sync(_path);
        }
    }
}

module.exports = Storage;
