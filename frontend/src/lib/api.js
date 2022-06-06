import axios from "axios";
import { Buffer } from "buffer";

const MediaClient = axios.create({
    baseURL: "http://localhost:3500/",
    timeout: 15000,
    headers: {
        Authorization: "Basic " + Buffer.from("admin:secure").toString("base64")
    }
});

export const getSeries = async () => {
    const resp = await MediaClient.get("series");

    console.log(resp);

    return resp;
};
