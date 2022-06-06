import store from "./store";
import theme from "./theme";

const ROUTES = {
    series: "/series",
    links: "/links",
};

const NAV_ITEMS = [
    {
        name: "Series",
        icon: "dashboard",
        route: ROUTES.series,
    },
    {
        name: "Links",
        icon: "dashboard",
        route: ROUTES.links,
    },
];

export { ROUTES, NAV_ITEMS, store, theme };
