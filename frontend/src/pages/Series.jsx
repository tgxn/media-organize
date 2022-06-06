import React, { Component } from "react";
import { connect } from "react-redux";

import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import Layout from "../components/Layout";
import Drawer from "../components/Drawer";

import SeriesTreeView from "../components/SeriesTreeView";

import { fetchSeries } from "../reducers/api";

class Series extends Component {
    componentDidMount() {
        if (!this.props.seriesData) this.props.fetchSeries();
    }

    seriesList() {
        return Object.keys(this.props.seriesData).map((series, index) => {
            console.log(series, index, this.props.seriesData[series]);
            return (
                <Box key={index}>
                    <Typography variant="h6">{series}</Typography>
                    <Typography variant="body1">{this.props.seriesData[series].length}</Typography>
                </Box>
            );
        });
    }

    render() {
        return (
            <Layout loading={this.props.seriesData === null}>
                <Box component="main" sx={{ flexGrow: 0, position: "fixed" }}>
                    <Drawer element={<SeriesTreeView />} />
                </Box>
                <Box component="main" sx={{ flexGrow: 1, p: 3, marginLeft: "450px" }}>
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
                </Box>
            </Layout>
        );
    }
}

const mapStateToProps = (state) => ({
    seriesData: state.apiReducer.series,
});

const mapDispatchToProps = {
    fetchSeries,
};

export default connect(mapStateToProps, mapDispatchToProps)(Series);
