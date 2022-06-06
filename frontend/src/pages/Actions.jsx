import React, { Component } from "react";
import { connect } from "react-redux";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

import Layout from "../components/Layout";

import { organizeAll } from "../reducers/api";

class Series extends Component {
    render() {
        return (
            <Layout loading={this.props.seriesData === null}>
                <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                    <Button variant="outlined" onClick={() => this.props.organizeAll()}>
                        organizeAll
                    </Button>

                    <pre>{JSON.stringify(this.props.organizeStatus, null, 2)}</pre>

                    <pre>{JSON.stringify(this.props.organizeData, null, 2)}</pre>
                </Box>
            </Layout>
        );
    }
}

const mapStateToProps = (state) => ({
    organizeStatus: state.apiReducer.organizeStatus,
    organizeData: state.apiReducer.organizeData,
});

const mapDispatchToProps = {
    organizeAll,
};

export default connect(mapStateToProps, mapDispatchToProps)(Series);
