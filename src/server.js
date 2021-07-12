const path = require("path");
const express = require("express");
const exphbs = require("express-handlebars");

const Memory = require("../lib/memory");
const Config = require("../lib/config");

class Server {
    constructor(configLocations) {
        this.config = new Config(configLocations.config);
        this.memory = new Memory(configLocations.storage);

        this.app = express();
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

        // const seriesList = this.getSeriesList();

        this.app.use(
            express.static(path.join(__dirname, "public"), {
                dotfiles: "ignore",
                etag: false,
                // extensions: ["htm", "html"],
                index: false
            })
        );

        this.hbs = exphbs.create({
            helpers: {
                json: function (context) {
                    return JSON.stringify(context, null, 4);
                }
            },
            extname: ".hbs"
        });

        this.app.engine("hbs", this.hbs.engine);
        this.app.set("view engine", "hbs");

        this.app.get("/", (req, res, next) => {
            res.render("list", {
                fileLinks: this.memory.linkFiles,
                seriesList: this.getSeriesList()
            });
        });

        this.app.get("/:linkPath", function (req, res, next) {
            res.render("link", {});
        });

        this.app.listen(3500);
    }
}

module.exports = Server;
