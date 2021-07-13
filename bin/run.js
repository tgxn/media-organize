const Organize = require("../lib/organize");

async function run() {
    const organizer = new Organize();
    await organizer.loadConfig({
        dataPathString: "./data",
        enableFileLogs: false,
        quietConsole: false
    });

    await organizer.organizeAll();
}

run();
