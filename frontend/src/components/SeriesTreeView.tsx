import React, { Component } from "react";
import { connect } from "react-redux";

import PropTypes from "prop-types";

import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import InboxIcon from "@mui/icons-material/Inbox";
import DraftsIcon from "@mui/icons-material/Drafts";

import TreeView from "@mui/lab/TreeView";
import TreeItem, { treeItemClasses } from "@mui/lab/TreeItem";

import MailIcon from "@mui/icons-material/Mail";
import DeleteIcon from "@mui/icons-material/Delete";
import Label from "@mui/icons-material/Label";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import InfoIcon from "@mui/icons-material/Info";
import ForumIcon from "@mui/icons-material/Forum";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";

function SeriesTreeView(props: any) {
    const [selectedIndex, setSelectedIndex] = React.useState(1);

    const handleListItemClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, index: number) => {
        setSelectedIndex(index);
    };

    return (
        <List component="nav" aria-label="main mailbox folders">
            {props.seriesData && Object.keys(props.seriesData).map((series, index) => {
                // console.log(series, index, this.props.seriesData[series]);
                return (
                    <ListItemButton
                        selected={selectedIndex === index}
                        onClick={(event) => handleListItemClick(event, index)}>
                        <ListItemIcon>
                            <InboxIcon />
                        </ListItemIcon>
                        <ListItemText primary={series} />
                    </ListItemButton>
                );
            })}
        </List>
    );
}

const mapStateToProps = (state: any) => ({
    seriesData: state.apiReducer.series
});

export default connect(mapStateToProps)(SeriesTreeView);
