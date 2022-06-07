const { Worker, isMainThread, parentPort, workerData } = require("node:worker_threads");

async function run() {
    parentPort.postMessage({ state: "start" });
    console.log(isMainThread, workerData);

    // const Organize = require("../organize");

    // const organizer = new Organize();
    // await organizer.loadConfig({
    //     dataPathString: "./data",
    //     enableFileLogs: false,
    //     quietConsole: false,
    // });

    // await organizer.organizeAll();

    parentPort.postMessage({ state: "done", result: { foo: "bar" } });
}

if (!isMainThread) {
    run();
}
