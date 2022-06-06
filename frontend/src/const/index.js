import { Dvr, Link } from "@mui/icons-material";

import store from "./store";
import theme from "./theme";

const ROUTES = {
    series: "/series",
    links: "/links",
    actions: "/actions",
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
    {
        name: "Actions",
        icon: <Link />,
        route: ROUTES.actions,
    },
];

export { ROUTES, NAV_ITEMS, store, theme };
