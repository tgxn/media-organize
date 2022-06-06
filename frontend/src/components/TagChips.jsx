import React, { Component } from "react";

import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";

import HighQualityIcon from "@mui/icons-material/HighQuality";
import PeopleIcon from "@mui/icons-material/People";
import CodeIcon from "@mui/icons-material/Code";
import SourceIcon from "@mui/icons-material/Source";

class TagChips extends Component {
    constructor(props) {
        super(props);

        this.chipSX = { mr: 1, borderRadius: 2 };
    }

    sourceChip(source) {
        if (!source) return null;
        switch (source) {
            case "BD":
            case "bluray":
                return <Chip sx={this.chipSX} icon={<SourceIcon />} label="BluRay" color="primary" />;
            case "dvd":
                return <Chip sx={this.chipSX} icon={<SourceIcon />} label="DVD" color="primary" />;
            case "webdl":
                return <Chip sx={this.chipSX} icon={<SourceIcon />} label="WEB-DL" color="success" />;
            case "hdtv":
                return <Chip sx={this.chipSX} icon={<SourceIcon />} label="HDTV" color="success" />;
            default:
                return <Chip icon={<SourceIcon />} sx={this.chipSX} label={`Unknown (${source})`} color="warning" />;
        }
    }
    groupChip(group) {
        if (!group) return null;
        return <Chip sx={this.chipSX} icon={<PeopleIcon />} label={group} />;
    }
    codecChip(codec) {
        if (!codec) return null;
        return <Chip sx={this.chipSX} icon={<CodeIcon />} label={codec} />;
    }
    qualityChip(quality) {
        if (!quality) return null;
        switch (quality) {
            case 480:
                return <Chip sx={this.chipSX} icon={<HighQualityIcon />} label="480p" color="warning" />;
            case "720p":
            case 720:
                return <Chip sx={this.chipSX} icon={<HighQualityIcon />} label="720p" color="primary" />;
            case "1080p":
            case "1920x1080":
            case 1080:
                return <Chip sx={this.chipSX} icon={<HighQualityIcon />} label="1080p" color="success" />;
            default:
                return (
                    <Chip sx={this.chipSX} icon={<HighQualityIcon />} label={`Unknown (${quality})`} color="warning" />
                );
        }
    }

    render() {
        return (
            <Box component="main" sx={{ marginRight: "auto" }}>
                {this.props.metaData.source && this.sourceChip(this.props.metaData.source)}
                {this.props.metaData.quality && this.qualityChip(this.props.metaData.quality)}
                {this.props.metaData.codec && this.codecChip(this.props.metaData.codec)}
                {this.props.metaData.group && this.groupChip(this.props.metaData.group)}
            </Box>
        );
    }
}

export default TagChips;
