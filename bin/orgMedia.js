#!/usr/bin/env node

const { Organize } = require("../lib/organize");

const configFile = require("../config.json");

const argv = require("yargs/yargs")(process.argv.slice(2)).argv;

if (argv.w) {
    watch();
} else {
    run();
}

async function run() {
    const organizer = new Organize(configFile);
    await organizer.organizeAll();
}

async function watch() {
    const organizer = new Organize(configFile);
    await organizer.registerWatchers();
}
