import React, { Component } from "react";
import { connect } from "react-redux";

import Toolbar from "@mui/material/Toolbar";

import Layout from "../components/Layout";
import Drawer from "../components/Drawer";

import { fetchLinks } from "../reducers/api";

class Links extends Component {
    componentDidMount() {
        this.props.fetchLinks();
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
    seriesData: state.apiReducer.links
});

const mapDispatchToProps = {
    fetchLinks
};

export default connect(mapStateToProps, mapDispatchToProps)(Links);
