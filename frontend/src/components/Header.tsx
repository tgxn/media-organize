import React, { useState } from "react";

import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";

import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";

import HomeIcon from "@mui/icons-material/Home";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

import { Link, useLocation } from "react-router-dom";

import { NAV_ITEMS } from "../const";

type Props = {
    loading: boolean;
};

const Header: React.FC<Props> = ({ loading = null }) => {
    const location = useLocation();
    return (
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <Toolbar>
                <IconButton size="large" component={Link} to={"/"} sx={{ mr: 2 }}>
                    <HomeIcon />
                </IconButton>

                <Typography noWrap variant="h6" sx={{ mr: 5 }}>
                    Media Organize
                </Typography>

                <Box sx={{ flexGrow: 1, display: "flex" }}>
                    {NAV_ITEMS.map((item) => (
                        <Button
                            variant={location.pathname == item.route ? "contained" : "outlined"}
                            startIcon={item.icon}
                            key={item.route}
                            component={Link}
                            to={item.route}
                            sx={{ mr: 2, color: "white" }}>
                            {item.name}
                        </Button>
                    ))}
                </Box>

                <IconButton color="inherit" edge="end">
                    {loading && <CircularProgress size={20} />}
                    {!loading && <CheckCircleOutlineIcon />}
                </IconButton>
            </Toolbar>
        </AppBar>
    );
};

export default Header;
