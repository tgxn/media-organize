const Organize = require("../src/organize");

async function run() {
    const organizer = new Organize();
    await organizer.loadConfig({
        dataPathString: "./data",
        enableFileLogs: true,
        quietConsole: false
    });

    await organizer.registerWatchers();
}

run();
