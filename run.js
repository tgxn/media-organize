const { Organize } = require("./lib/organize");

const configFile = require("./config.json");

async function run() {
    const organizer = new Organize(configFile);
    await organizer.organizeAll();
}

run();
