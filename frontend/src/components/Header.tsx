import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";

import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";

import HomeIcon from "@mui/icons-material/Home";
import AdbIcon from "@mui/icons-material/Adb";

import { Link } from "react-router-dom";
import { makeStyles } from "tss-react/mui";

import { NAV_ITEMS } from "../const";

const useStyles = makeStyles()((theme) => ({
    appBar: {
        background: theme.palette.primary.dark,
        color: theme.palette.secondary.light,
    },
    title: {
        mr: 2,
        display: "flex",
        fontFamily: "monospace",
        fontWeight: 700,
        letterSpacing: ".3rem",
        color: "inherit",
    },
}));

const Header = () => {
    const { classes } = useStyles();

    return (
        <AppBar position="fixed" className={classes.appBar} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <Toolbar>
                <IconButton
                    size="large"
                    edge="start"
                    color="inherit"
                    aria-label="menu"
                    component={Link}
                    to={"/"}
                    sx={{ mr: 2 }}>
                    <HomeIcon />
                </IconButton>

                <Typography variant="h6" noWrap component="a" className={classes.title}>
                    Media Organize
                </Typography>

                <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
                    {NAV_ITEMS.map((item) => (
                        <Button
                            key={item.route}
                            // onClick={handleCloseNavMenu}
                            component={Link}
                            to={item.route}
                            sx={{ my: 2, color: "white", display: "block" }}>
                            {item.name}
                        </Button>
                    ))}
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header;
