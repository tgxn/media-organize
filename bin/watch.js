const { addConsoleTransport } = require("../lib/logger");

const Organize = require("../lib/organize");

const configLocations = {
    config: "./config.json",
    storage: "./data/storage.json"
};

async function run() {
    const organizer = new Organize(configLocations);
    await organizer.loadConfig();
    await organizer.registerWatchers();
}

addConsoleTransport();
run();
