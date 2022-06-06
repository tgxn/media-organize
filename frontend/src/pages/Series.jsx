import React, { Component } from "react";
import { connect } from "react-redux";

import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import Layout from "../components/Layout";
import Drawer from "../components/Drawer";

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
            <Layout>
                <Toolbar />
                <Drawer />
                <pre>{this.props.seriesData != null ? "true" : "false"}</pre>

                <Box sx={{ p: 3 }}>{this.props.seriesData != null && this.seriesList()}</Box>
            </Layout>
        );
    }
}

const mapStateToProps = (state) => ({
    seriesData: state.apiReducer.series
});

const mapDispatchToProps = {
    fetchSeries
};

export default connect(mapStateToProps, mapDispatchToProps)(Series);
