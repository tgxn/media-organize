import { Dvr, Link } from "@mui/icons-material";

import store from "./store";
import theme from "./theme";

const ROUTES = {
    series: "/series",
    links: "/links",
};

const NAV_ITEMS = [
    {
        name: "Series",
        icon: <Dvr />,
        route: ROUTES.series,
    },
    {
        name: "Links",
        icon: <Link />,
        route: ROUTES.links,
    },
];

export { ROUTES, NAV_ITEMS, store, theme };
