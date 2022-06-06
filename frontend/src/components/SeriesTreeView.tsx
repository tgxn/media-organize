import React from "react";
import { connect } from "react-redux";

import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";

import InboxIcon from "@mui/icons-material/Inbox";

function SeriesTreeView(props: any) {
    const [selectedIndex, setSelectedIndex] = React.useState(1);

    const handleListItemClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, index: number) => {
        setSelectedIndex(index);
    };

    return (
        <List component="nav" aria-label="main mailbox folders">
            {props.seriesData &&
                Object.keys(props.seriesData).map((series, index) => {
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
    seriesData: state.apiReducer.series,
});

export default connect(mapStateToProps)(SeriesTreeView);
