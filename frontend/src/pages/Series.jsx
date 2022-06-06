import React, { Component } from "react";
import { connect } from "react-redux";

import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import Layout from "../components/Layout";
import Drawer from "../components/Drawer";

import SeriesDetails from "../components/SeriesDetails";
import SeriesTreeView from "../components/SeriesTreeView";

import { fetchSeries } from "../reducers/api";

class Series extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedSeries: null,
        };
    }

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
                    <Drawer
                        element={
                            <SeriesTreeView
                                onChange={(seriesKey) => {
                                    this.setState({ selectedSeries: seriesKey });
                                }}
                            />
                        }
                    />
                </Box>
                <Box component="main" sx={{ flexGrow: 1, p: 3, marginLeft: "450px" }}>
                    <SeriesDetails seriesKey={this.state.selectedSeries} />
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
