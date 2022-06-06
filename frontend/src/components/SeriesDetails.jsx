import React from "react";
import { connect } from "react-redux";

import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

import SeriesCard from "./SeriesCard";

import { useLocation } from "react-router-dom";

import { NAV_ITEMS } from "../const";

const SeriesDetails = (props) => {
    const location = useLocation();

    if (props.seriesKey === null) return <Box>nothing selected</Box>;

    const sortIntoSeasons = (series) => {
        const seasons = {};
        series.forEach((item) => {
            let ss = item.metaData.season;
            if (!ss) ss = 0;

            if (!seasons[ss]) {
                seasons[ss] = [];
            }

            seasons[ss].push(item);
        });
        return seasons;
    };

    const seasons = sortIntoSeasons(props.seriesData[props.seriesKey]);
    console.log("123", seasons);

    return (
        <Box>
            <Typography variant="h3" gutterBottom component="div">
                {props.seriesKey}
            </Typography>
            {Object.keys(seasons).map((season) => {
                console.log("season", season, seasons[season]);
                return (
                    <React.Fragment>
                        <h3>Season {season}</h3>
                        {seasons[season].map((item, index) => {
                            return <SeriesCard key={index} season={season} item={item} />;
                        })}
                    </React.Fragment>
                );
            })}
        </Box>
    );
};

const mapStateToProps = (state) => ({
    seriesData: state.apiReducer.series,
});

export default connect(mapStateToProps)(SeriesDetails);
