
import clsx from "clsx";

import { makeStyles } from 'tss-react/mui';
import { Theme } from "@mui/material/styles";

import Drawer from "@mui/material/Drawer";
import Toolbar from "@mui/material/Toolbar";

import SeriesTreeView from "./SeriesTreeView";

const drawerWidth = 450;

const useStyles = makeStyles()((theme: Theme) => ({
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    background: "#D8DCD6",
    boxSizing: 'border-box',
    position: "relative",
  }
}));

const CustomDrawer = () => {
  const { classes } = useStyles();

  return (
    <Drawer
      variant="permanent"
      classes={{
        paper: classes.drawer,
      }}
    >
        <Toolbar />
      <SeriesTreeView />
    </Drawer>
  );
};

export default CustomDrawer;