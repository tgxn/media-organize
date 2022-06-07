import AssignmentIcon from "@mui/icons-material/Assignment";
import Link from "@mui/icons-material/Link";
import Dvr from "@mui/icons-material/Dvr";

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
        icon: <AssignmentIcon />,
        route: ROUTES.actions,
    },
];

export { ROUTES, NAV_ITEMS, store, theme };
