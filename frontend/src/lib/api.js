import axios from "axios";
import { Buffer } from "buffer";

import { getBackendURL, getBackendAuth } from "../config";

const MediaClient = axios.create({
    baseURL: getBackendURL(),
    timeout: 15000,
    headers: {
        Authorization: "Basic " + Buffer.from(getBackendAuth()).toString("base64")
    }
});

export const getSeries = async () => {
    const resp = await MediaClient.get("series");

    console.log(resp);

    return resp;
};
