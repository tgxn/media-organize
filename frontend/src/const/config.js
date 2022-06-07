export const getBackendURL = () => {
    return process.env.REACT_APP_BACKEND_URL || "http://localhost:8080/api/";
};

export const getBackendWS = () => {
    return process.env.REACT_APP_BACKEND_WS || "ws://localhost:8080/ws/";
};

export const getBackendAuth = () => {
    return process.env.REACT_APP_BACKEND_AUTH || "admin:secure";
};
