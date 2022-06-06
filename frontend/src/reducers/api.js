import { getSeries, getPath } from "../lib/api";

export const ACTIONS = {
    FETCH_SERIES: "FETCH_SERIES",
    FETCH_LINKS: "FETCH_LINKS"
};

export const fetchSeries = () => async (dispatch) => {
    try {
        const res = await getSeries();

        dispatch({
            type: ACTIONS.FETCH_SERIES,
            payload: res.data
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
            payload: res.data
        });
    } catch (err) {
        console.log(err);
    }
};

const initialState = {
    series: null,
    links: null
};

const apiReducer = (state = initialState, action) => {
    const { type, payload } = action;

    switch (type) {
        case ACTIONS.FETCH_SERIES:
            console.log("FETCH_SERIES", payload);
            return {
                ...state,
                series: payload
            };
        case ACTIONS.FETCH_LINKS:
            console.log("FETCH_LINKS", payload);
            return {
                ...state,
                links: payload
            };

        default:
            return state;
    }
};

export default apiReducer;
