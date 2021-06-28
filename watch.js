const { Organize } = require('./lib/organize')

const configFile = require('./config.json');

async function run() {
    let organizer = new Organize(configFile);
    await organizer.registerWatchers();
}

run();
