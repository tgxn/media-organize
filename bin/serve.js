const Server = require("../src/server");

const configLocations = {
    config: "./data/config.json",
    storage: "./data/storage.json"
};

async function serve() {
    const server = new Server(configLocations);
    await server.start();
}

serve();
