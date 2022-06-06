import { Routes, Route, Navigate } from "react-router-dom";

import { ROUTES } from "./const";

import Series from "./pages/Series";
import Links from "./pages/Links";
import Actions from "./pages/Actions";

function App() {
    return (
        <Routes>
            <Route path="/" exact element={<Navigate to={ROUTES.series} replace />} />
            <Route exact path={ROUTES.series} element={<Series />} />
            <Route exact path={ROUTES.links} element={<Links />} />
            <Route exact path={ROUTES.actions} element={<Actions />} />
        </Routes>
    );
}

export default App;
