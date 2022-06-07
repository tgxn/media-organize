import { getSeries, getPath } from "../lib/api";
import { getSocket } from "../lib/socket";

export const ACTIONS = {
    FETCH_SERIES: "FETCH_SERIES",
    FETCH_LINKS: "FETCH_LINKS",

    ORGANIZE_STATE: "ORGANIZE_STATE",
    WSS_RTT: "WSS_RTT",
};

export const fetchSeries = () => async (dispatch) => {
    try {
        const res = await getSeries();

        dispatch({
            type: ACTIONS.FETCH_SERIES,
            payload: res.data,
        });
    } catch (err) {
        console.log(err);
    }
};

export const fetchLinks = () => async (dispatch) => {
    try {
        const res = await getPath("links");

        dispatch({
            type: ACTIONS.FETCH_LINKS,
            payload: res.data,
        });
    } catch (err) {
        console.log(err);
    }
};

export const organizeAll = () => async (dispatch) => {
    try {
        dispatch({
            type: ACTIONS.ORGANIZE_STATE,
            payload: { state: "started" },
        });

        const socket = getSocket();

        socket.send(JSON.stringify({ type: "startOrganize" }));

        socket.onmessage = function message(event) {
            var message = JSON.parse(event.data);

            switch (message.type) {
                case "pong":
                    console.info(`Round-trip time: ${Date.now() - message.time} ms`);
                    return dispatch({
                        type: ACTIONS.WSS_RTT,
                        payload: Date.now() - message.time,
                    });
                case "organizeState":
                    return dispatch({
                        type: ACTIONS.ORGANIZE_STATE,
                        payload: {
                            state: message.state,
                        },
                    });
            }
        };
    } catch (err) {
        console.log(err);
    }
};

const initialState = {
    series: null,
    links: null,
    wssRTT: 0,

    organizeState: null,
};

const apiReducer = (state = initialState, action) => {
    const { type, payload } = action;

    switch (type) {
        case ACTIONS.FETCH_SERIES:
            console.log("FETCH_SERIES", payload);
            return {
                ...state,
                series: payload,
            };
        case ACTIONS.FETCH_LINKS:
            console.log("FETCH_LINKS", payload);
            return {
                ...state,
                links: payload,
            };
        case ACTIONS.ORGANIZE_STATE:
            console.log("ORGANIZE_STATE", payload);
            return {
                ...state,
                organizeState: payload,
            };
        case ACTIONS.WSS_RTT:
            console.log("WSS_RTT", payload);
            return {
                ...state,
                wssRTT: payload,
            };

        default:
            return state;
    }
};

export default apiReducer;
