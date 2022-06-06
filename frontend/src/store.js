import { configureStore } from "@reduxjs/toolkit";
import thunk from "redux-thunk";

import apiReducer from "./reducers/api";

export default configureStore({
    reducer: { apiReducer },
    middleware: [thunk]
});
