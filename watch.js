const Organize = require('./lib/organize')

async function run() {
    let organizer = new Organize();
    await organizer.registerWatchers();
}

run();
