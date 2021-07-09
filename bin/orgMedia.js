#!/usr/bin/env node

const logger = require("../lib/logger");
const { addConsoleTransport, addFileTransport } = require("../lib/logger");

const Organize = require("../lib/organize");

const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

yargs(hideBin(process.argv))
    .option("c", {
        alias: "config",
        default: "~/.orgMedia/config.json",
        describe: "config.json file location",
        type: "string"
    })
    .option("s", {
        alias: "storage",
        default: "~/.orgMedia/storage.json",
        describe: "storage.json file location",
        type: "string"
    })
    .option("l", {
        alias: "log",
        default: false,
        describe: "log directory path"
    })
    .option("q", {
        alias: "quiet",
        type: "boolean",
        default: false,
        describe: "hide console log output"
    })
    .command({
        command: "$0",
        aliases: ["run"],
        desc: "run media organization",
        handler: run
    })
    .command({
        command: "watch",
        aliases: ["w"],
        desc: "start media watchers",
        handler: watch
    }).argv;

function getConfigFromArgv(argv) {
    const configLocations = {
        config: argv.config,
        storage: argv.storage
    };

    addConsoleTransport({
        level: argv.quiet ? "error" : "info"
    });

    if (argv.log) {
        addFileTransport(argv.log);
    }

    logger.info("data file paths", configLocations);
    return configLocations;
}

async function run(argv) {
    const organizer = new Organize(getConfigFromArgv(argv));
    await organizer.loadConfig();
    await organizer.organizeAll();
}

async function watch(argv) {
    const organizer = new Organize(getConfigFromArgv(argv));
    await organizer.loadConfig();
    await organizer.registerWatchers();
}
