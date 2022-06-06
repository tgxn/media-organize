import React, { Component } from "react";

import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

import HighQualityIcon from "@mui/icons-material/HighQuality";
import PeopleIcon from "@mui/icons-material/People";
import CodeIcon from "@mui/icons-material/Code";
import SourceIcon from "@mui/icons-material/Source";

const TypoWrapper = ({ children }) => (
    <Typography variant="body2" gutterBottom>
        {children}
    </Typography>
);

class MetaFields extends Component {
    render() {
        const metaData = this.props.metaData;
        return (
            <Box component="main" sx={{ marginRight: "auto" }}>
                {metaData.name && <TypoWrapper>Name: {metaData.name}</TypoWrapper>}
                {metaData.classifier && <TypoWrapper>Classifier: {metaData.classifier}</TypoWrapper>}
                {metaData.nameOptYear && <TypoWrapper>NameOptYear: {metaData.nameOptYear}</TypoWrapper>}
                <Typography>
                    <pre>{JSON.stringify(metaData, null, 4)}</pre>
                </Typography>
            </Box>
        );
    }
}

export default MetaFields;
