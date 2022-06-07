const path = require("path");
const express = require("express");

// const WebSocket = require("ws");
const { WebSocketServer } = require("ws");
const socket = require("socket.io");

const { Worker, isMainThread, parentPort, workerData } = require("worker_threads");

const cors = require("cors");
const basicAuth = require("express-basic-auth");
const compression = require("compression");

const Memory = require("../src/memory");
const Config = require("../src/config");

class Server {
    constructor(configLocations) {
        this.config = new Config(configLocations.config);
        this.memory = new Memory(configLocations.storage);

        this.app = express();
        this.app.use(cors());
        this.app.use(
            basicAuth({
                users: { admin: "secure" },
                challenge: true,
                realm: "MediaOrganize",
            })
        );
        this.app.use(compression());
    }

    async startWorker(workerTask, workerData, onMessage) {
        return new Promise((resolve, reject) => {
            const worker = new Worker(`./src/tasks/${workerTask}.js`, { workerData });
            worker.on("message", onMessage);
            worker.on("error", reject);
            worker.on("exit", (code) => {
                if (code === 0) resolve(code);
                if (code !== 0) reject(new Error(`stopped with  ${code} exit code`));
            });
        });
    }

    getSeriesList() {
        const series = {};

        for (const linkPath in this.memory.linkFiles) {
            const mediaName = this.memory.linkFiles[linkPath].metaData.name;

            if (!series.hasOwnProperty(mediaName)) {
                series[mediaName] = [];
            }

            series[mediaName].push(this.memory.linkFiles[linkPath]);
        }

        const ordered = Object.keys(series)
            .sort()
            .reduce((obj, key) => {
                obj[key] = series[key];
                return obj;
            }, {});

        return ordered;
    }

    async start() {
        try {
            await this.memory.loadStore();
        } catch (error) {
            console.error("Error loading storage", error);
        }

        this.app.use(
            express.static(path.join("frontend/build"), {
                dotfiles: "ignore",
                etag: false,
            })
        );

        this.app.use("/api", this.apiRoutes());

        this.server = this.app.listen(3500);

        this.createSocketServer();
    }

    createSocketServer() {
        const wss = new WebSocketServer({
            server: this.server,
            path: "/socket",
        });

        wss.on("connection", function connection(ws) {
            console.log("Client connected");

            ws.on("message", function incoming(message) {
                console.log(`received: ${message}`);
                const parsed = JSON.parse(message);

                if (parsed.type === "ping") {
                    ws.send(JSON.stringify({ type: "pong", time: parsed.time }));
                }

                // ws.send(message);
            });
        });
        // const io = socket(this.server, {
        //     // path: "/ws",
        // });
        // io.path("/socket/");
        // this.app.set("socketio", io);

        // const websocketServer = new WebSocket.Server({
        //     noServer: true,
        //     path: "/ws",
        // });

        // expressServer.on("upgrade", (request, socket, head) => {
        //     websocketServer.handleUpgrade(request, socket, head, (websocket) => {
        //         websocketServer.emit("connection", websocket, request);
        //     });
        // });

        // websocketServer.on("connection", function connection(websocketConnection, connectionRequest) {
        //     const [_path, params] = connectionRequest?.url?.split("?");
        //     const connectionParams = queryString.parse(params);

        //     // NOTE: connectParams are not used here but good to understand how to get
        //     // to them if you need to pass data with the connection to identify it (e.g., a userId).
        //     console.log(connectionParams);

        //     websocketConnection.on("message", (message) => {
        //         const parsedMessage = JSON.parse(message);
        //         console.log(parsedMessage);
        //         websocketConnection.send(JSON.stringify({ message: "There be gold in them thar hills." }));
        //     });
        // });

        // return websocketServer;
    }

    actionRoutes() {
        const router = express.Router();

        router.get("/organize", async (req, res, next) => {
            const resuolt = await this.startWorker("organizeAll", { name: "test" }, (message) => {
                res.write(JSON.stringify(message) + "\n");
            });
            res.write(JSON.stringify(resuolt));
            return res.end();
        });

        return router;
    }

    apiRoutes() {
        const router = express.Router();

        router.use("/action", this.actionRoutes());

        router.get("/config", async (req, res, next) => {
            const configArray = await this.config.loadAndValidateConfig();
            return res.json(configArray);
        });

        router.get("/series", async (req, res, next) => {
            const seriesList = this.getSeriesList();
            return res.json(seriesList);
        });

        router.get("/links", async (req, res, next) => {
            return res.json(this.memory.linkFiles);
        });

        router.get("/:linkPath", async (req, res, next) => {
            return res.send("Received a GET HTTP method");
        });

        return router;
    }
}

module.exports = Server;
