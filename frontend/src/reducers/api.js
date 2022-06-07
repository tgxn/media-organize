import { getSeries, getPath } from "../lib/api";
import { getSocket } from "../lib/socket";

export const ACTIONS = {
    FETCH_SERIES: "FETCH_SERIES",
    FETCH_LINKS: "FETCH_LINKS",

    ORGANIZE_STATUS: "ORGANIZE_STATUS",
    ORGANIZE_DATA: "ORGANIZE_DATA",
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
            type: ACTIONS.ORGANIZE_STATUS,
            payload: "started",
        });

        const socket = getSocket();

        socket.onmessage = function message(event) {
            var message = JSON.parse(event.data);

            switch (message.type) {
                case "pong":
                    console.info(`Round-trip time: ${Date.now() - message.time} ms`);
                    break;
                case "organizeStatus":
                    dispatch({
                        type: ACTIONS.ORGANIZE_STATUS,
                        payload: {
                            status: message.status,
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

    organizeStatus: false,
    organizeData: null,
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
        case ACTIONS.ORGANIZE_STATUS:
            console.log("ORGANIZE_STATUS", payload);
            return {
                ...state,
                organizeStatus: payload,
            };
        case ACTIONS.ORGANIZE_DATA:
            console.log("ORGANIZE_DATA", payload);
            state.organizeData = state.organizeData.push(payload);
            return {
                ...state,
            };

        default:
            return state;
    }
};

export default apiReducer;
