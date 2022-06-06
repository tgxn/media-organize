import { ReactNode } from "react";

import { makeStyles } from 'tss-react/mui';

import Header from "./Header";
import Toolbar from "@mui/material/Toolbar";
import Box  from "@mui/material/Box";

const useStyles = makeStyles()((theme) => ({
    root: {
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh"
    },
    container: {
        display: "flex",
        flex: 1
    },
    main: {
        flex: 1
    }
}));

type Props = {
    children: NonNullable<ReactNode>
};

const Layout: React.FC<Props> = ({ children }) => {
    const { classes } = useStyles();
    
    return (
        
            <Box className={classes.root}>
                <Header />
                <Toolbar />
                <Box className={classes.container}>
                    
                    <Box className={classes.main}>{children}</Box>
                </Box>
            </Box >

    );
};

export default Layout;
