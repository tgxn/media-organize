import { getSeries } from "../lib/api";

export const ACTIONS = {
    FETCH_SERIES: "FETCH_SERIES"
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

const initialState = {
    series: null
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

        default:
            return state;
    }
};

export default apiReducer;
