const path = require("path");
const express = require("express");

const cors = require("cors");
const basicAuth = require("express-basic-auth");
const compression = require("compression");

const Memory = require("../src/memory");
const Config = require("../src/config");

class Server {
    constructor(configLocations) {
        this.config = new Config(configLocations.config);
        this.memory = new Memory(configLocations.storage);

        this.app = express();
        this.app.use(cors());
        this.app.use(
            basicAuth({
                users: { admin: "secure" },
                challenge: true,
                realm: "MediaOrganize"
            })
        );
        this.app.use(compression());
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

        this.app.get("/config", async (req, res, next) => {
            const configArray = await this.config.loadAndValidateConfig();
            return res.json(configArray);
        });

        this.app.get("/series", async (req, res, next) => {
            const seriesList = this.getSeriesList();
            return res.json(seriesList);
        });

        this.app.get("/links", async (req, res, next) => {
            return res.json(this.memory.linkFiles);
        });

        this.app.get("/:linkPath", async (req, res, next) => {
            return res.send("Received a GET HTTP method");
        });

        this.app.listen(3500);
    }
}

module.exports = Server;
