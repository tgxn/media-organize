import React, { Component } from "react";
import { connect } from "react-redux";

import Toolbar from "@mui/material/Toolbar";

import Layout from "../components/Layout";
import Drawer from "../components/Drawer";

import { fetchLinks } from "../reducers/api";

class Links extends Component {
    componentDidMount() {
        if (!this.props.linksData) this.props.fetchLinks();
    }

    render() {
        return (
            <Layout>
                <Toolbar />
                <Drawer />
                <pre>{JSON.stringify(this.props.linksData, null, 4) || "false"}</pre>
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
