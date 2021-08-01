const Organize = require("../lib/organize");

async function clean() {
    const organizer = new Organize();
    await organizer.loadConfig({
        dataPathString: "./data",
        enableFileLogs: false,
        quietConsole: false
    });

    await organizer.validateLinkTargets();
}

clean();
