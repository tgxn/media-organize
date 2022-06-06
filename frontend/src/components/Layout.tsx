import { ReactNode } from "react";

import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";

import Header from "./Header";

type Props = {
    children: NonNullable<ReactNode>;
};

const Layout: React.FC<Props> = ({ children }) => {
    return (
        <Box>
            <Header />
            <Box>
                <Toolbar />
                <Box>{children}</Box>
            </Box>
        </Box>
    );
};

export default Layout;
