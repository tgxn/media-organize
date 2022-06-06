import { Routes, Route, Navigate } from "react-router-dom";

import { ROUTES } from "./constants";

import Series from "./pages/Series";

function App() {
    return (
        <Routes>
            <Route path="/" exact element={<Navigate to={ROUTES.series} replace />} />
            <Route exact path={ROUTES.series} element={<Series />} />
        </Routes>
    );
}

export default App;
