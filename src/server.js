const path = require("path");
const express = require("express");

const basicAuth = require("express-basic-auth");

const Memory = require("../src/memory");
const Config = require("../src/config");

class Server {
    constructor(configLocations) {
        this.config = new Config(configLocations.config);
        this.memory = new Memory(configLocations.storage);

        this.app = express();
        this.app.use(
            basicAuth({
                users: { admin: "secure" },
                challenge: true,
                realm: "MediaOrganize"
            })
        );
    }

    getSeriesList() {
        const series = {};

        for (const linkPath in this.memory.linkFiles) {
            const mediaName = this.memory.linkFiles[linkPath].metaData.name;

            if (!series.hasOwnProperty(mediaName)) {
                series[mediaName] = [];
            }

            series[mediaName].push(this.memory.linkFiles[linkPath]);
        }

        const ordered = Object.keys(series)
            .sort()
            .reduce((obj, key) => {
                obj[key] = series[key];
                return obj;
            }, {});

        return ordered;
    }

    async start() {
        try {
            await this.memory.loadStore();
        } catch (error) {
            console.error("Error loading storage", error);
        }

        this.app.use(
            express.static(path.join("public"), {
                dotfiles: "ignore",
                etag: false
            })
        );

        // const seriesList = this.getSeriesList();

        this.app.get("/", (req, res, next) => {
            res.send("Received a GET HTTP method");
        });

        this.app.get("/:linkPath", function (req, res, next) {
            res.send("Received a GET HTTP method");
        });

        this.app.listen(3500);
    }
}

module.exports = Server;
