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
            {!loading && (
                <Box>
                    <Toolbar />
                    <Box>{children}</Box>
                </Box>
            )}

            {loading && (
                <Box>
                    <Toolbar />
                    <Box>
                        <LinearProgress />
                    </Box>
                </Box>
            )}
        </Box>
    );
};

export default Layout;
