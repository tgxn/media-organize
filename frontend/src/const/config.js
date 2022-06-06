export const getBackendURL = () => {
    return process.env.REACT_APP_BACKEND_URL || "http://localhost:8080";
};

export const getBackendAuth = () => {
    return process.env.REACT_APP_BACKEND_AUTH || "admin:secure";
};
