import { ReactNode } from "react";

import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import LinearProgress from "@mui/material/LinearProgress";

import Header from "./Header";

type Props = {
    children: NonNullable<ReactNode>;
    loading: boolean;
};

const Layout: React.FC<Props> = ({ children, loading }) => {
    return (
        <Box>
            <Header loading={loading} />
            <Box>
                <Toolbar />
                <Box>{!loading ? children : <LinearProgress />}</Box>
            </Box>
        </Box>
    );
};

export default Layout;
