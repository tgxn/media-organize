import React, { Component } from "react";
import { connect } from "react-redux";

import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

import Layout from "../components/Layout";
import Drawer from "../components/Drawer";

import { fetchLinks } from "../reducers/api";

class Links extends Component {
    componentDidMount() {
        if (!this.props.linksData) this.props.fetchLinks();
    }

    render() {
        return (
            <Layout loading={this.props.linksData === null}>
                <Box component="main" sx={{ flexGrow: 0, position: "fixed" }}>
                    <Drawer element={<div />} />
                </Box>
                <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${450}px)` } }}>
                    <Toolbar />
                    <Typography paragraph>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
                        labore et dolore magna aliqua. Rhoncus dolor purus non enim praesent elementum facilisis leo
                        vel. Risus at ultrices mi tempus imperdiet. Semper risus in hendrerit gravida rutrum quisque non
                        tellus. Convallis convallis tellus id interdum velit laoreet id donec ultrices. Odio morbi quis
                        commodo odio aenean sed adipiscing. Amet nisl suscipit adipiscing bibendum est ultricies integer
                        quis. Cursus euismod quis viverra nibh cras. Metus vulputate eu scelerisque felis imperdiet
                        proin fermentum leo. Mauris commodo quis imperdiet massa tincidunt. Cras tincidunt lobortis
                        feugiat vivamus at augue. At augue eget arcu dictum varius duis at consectetur lorem. Velit sed
                        ullamcorper morbi tincidunt. Lorem donec massa sapien faucibus et molestie ac.
                    </Typography>
                    <pre>{JSON.stringify(this.props.linksData, null, 4) || "false"}</pre>
                </Box>
            </Layout>
        );
    }
}

const mapStateToProps = (state) => ({
    linksData: state.apiReducer.links,
});

const mapDispatchToProps = {
    fetchLinks,
};

export default connect(mapStateToProps, mapDispatchToProps)(Links);
