const { Worker, isMainThread, parentPort, workerData } = require("node:worker_threads");

const Organize = require("../organize");

async function run() {
    parentPort.postMessage({ state: "start" });
    console.log(isMainThread, workerData);
    // const organizer = new Organize();
    // await organizer.loadConfig({
    //     dataPathString: "./data",
    //     enableFileLogs: false,
    //     quietConsole: false,
    // });

    // await organizer.organizeAll();

    parentPort.postMessage({ state: "done" });
}

run();
