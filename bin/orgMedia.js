#!/usr/bin/env node

const { Organize } = require("../lib/organize");

const yargs = require("yargs");

yargs
    .option("c", {
        alias: "config",
        default: "~/.orgMedia/config.json",
        describe: "Config file location",
        type: "string",
    })
    .option("s", {
        alias: "storage",
        default: "~/.orgMedia/storage.json",
        describe: "Storage file location",
        type: "string",
    })
    .command({
        command: "$0",
        aliases: ["run"],
        desc: "run media organization",
        handler: run,
    })
    .command({
        command: "watch",
        aliases: ["w"],
        desc: "start media watchers",
        handler: watch,
    }).argv;

function getConfigFromArgv(argv) {
    const configLocations = {
        config: argv.config,
        storage: argv.storage,
    };
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