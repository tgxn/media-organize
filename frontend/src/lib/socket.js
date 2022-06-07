import ReconnectingWebSocket from "reconnecting-websocket";

import { getBackendWS, getBackendAuth } from "../const/config";

let webSocket = null;
export const getSocket = () => {
    if (!webSocket) {
        webSocket = new ReconnectingWebSocket(getBackendWS());
        webSocket.timeoutInterval = 1500;

        webSocket.onopen = function open() {
            console.log("connected");
            webSocket.send(JSON.stringify({ type: "ping", time: Date.now() }));

            setInterval(() => {
                webSocket.send(JSON.stringify({ type: "ping", time: Date.now() }));
            }, 10000);
        };

        webSocket.onclose = function close() {
            console.log("disconnected");
        };
    }

    return webSocket;
};
