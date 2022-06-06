import { Routes, Route, Navigate } from "react-router-dom";

import { ROUTES } from "./const";

import Series from "./pages/Series";
import Links from "./pages/Links";

function App() {
    return (
        <Routes>
            <Route path="/" exact element={<Navigate to={ROUTES.series} replace />} />
            <Route exact path={ROUTES.series} element={<Series />} />
            <Route exact path={ROUTES.links} element={<Links />} />
        </Routes>
    );
}

export default App;
