import React, { Component } from "react";
import { connect } from "react-redux";

import Toolbar from "@mui/material/Toolbar";

import Layout from "../components/Layout";
import Drawer from "../components/Drawer";

import { fetchSeries } from "../reducers/api";

class Series extends Component {
    componentDidMount() {
        this.props.fetchSeries();
    }

    render() {
        return (
            <Layout>
                <Toolbar />
                <Drawer />
                <pre>{JSON.stringify(this.props.seriesData, null, 4) || "false"}</pre>
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
