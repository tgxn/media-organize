import { Theme } from "@mui/material/styles";
import { makeStyles } from "tss-react/mui";

import Drawer from "@mui/material/Drawer";
import Toolbar from "@mui/material/Toolbar";

const useStyles = makeStyles()((theme: Theme) => ({
    drawer: {
        width: 450,
        flexShrink: 0,
        background: "#D8DCD6",
        boxSizing: "border-box",
        position: "relative",
    },
}));

const CustomDrawer = (props: any) => {
    const { classes } = useStyles();
    return (
        <Drawer
            variant="permanent"
            classes={{
                paper: classes.drawer,
            }}>
            <Toolbar />
            {props.element}
        </Drawer>
    );
};

export default CustomDrawer;
