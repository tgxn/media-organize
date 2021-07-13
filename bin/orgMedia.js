#!/usr/bin/env node

const Organize = require("../lib/organize");

const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

yargs(hideBin(process.argv))
    .option("d", {
        alias: "data",
        default: "~/.orgMedia",
        describe: "app data directory",
        type: "string"
    })
    .option("l", {
        alias: "log",
        type: "boolean",
        default: true,
        describe: "enable logging to data directory"
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

async function run(argv) {
    const organizer = new Organize();
    await organizer.loadConfig({
        dataPathString: argv.data,
        enableFileLogs: argv.log,
        quietConsole: argv.quiet
    });

    await organizer.organizeAll();
}

async function watch(argv) {
    const organizer = new Organize();
    await organizer.loadConfig({
        dataPathString: argv.data,
        enableFileLogs: argv.log,
        quietConsole: argv.quiet
    });

    await organizer.registerWatchers();
}
