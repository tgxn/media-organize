import React from "react";
import { connect } from "react-redux";

import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Chip from "@mui/material/Chip";

import InboxIcon from "@mui/icons-material/Inbox";

function SeriesTreeView(props: any) {
    const [selectedIndex, setSelectedIndex] = React.useState(-1);

    const handleListItemClick = (
        event: React.MouseEvent<HTMLDivElement, MouseEvent>,
        index: number,
        series: string
    ) => {
        props.onChange(series);
        setSelectedIndex(index);
    };

    return (
        <List component="nav" aria-label="main mailbox folders">
            {props.seriesData &&
                Object.keys(props.seriesData).map((series, index) => {
                    return (
                        <ListItemButton
                            key={index}
                            selected={selectedIndex === index}
                            onClick={(event) => handleListItemClick(event, index, series)}>
                            <ListItemIcon>
                                <Chip size="small" label={props.seriesData[series].length} />
                            </ListItemIcon>
                            <ListItemText primary={series} />
                        </ListItemButton>
                    );
                })}
        </List>
    );
}

const mapStateToProps = (state: any) => ({
    seriesData: state.apiReducer.series,
});

export default connect(mapStateToProps)(SeriesTreeView);