import React from "react";

import { styled } from "@mui/material/styles";

import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import CardActions from "@mui/material/CardActions";
import SourceIcon from "@mui/icons-material/Source";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import MetaFields from "./MetaFields.jsx";
import TagChips from "./TagChips.jsx";

const ExpandMore = styled((props: any) => {
    const { expand, ...other } = props;
    return <IconButton {...other} />;
})(({ theme, expand }) => ({
    transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
    marginLeft: "auto",
    transition: theme.transitions.create("transform", {
        duration: theme.transitions.duration.shortest,
    }),
}));

type Props = {
    key: any;
    item: any;
};

const SeriesCard: React.FC<Props> = (props) => {
    const [expanded, setExpanded] = React.useState(false);

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    return (
        <Card sx={{ minWidth: 275, mb: 1 }}>
            <CardHeader
                action={<TagChips metaData={props.item.metaData} />}
                title={`Season ${props.item.metaData.season} / Episode ${props.item.metaData.episode}`}
                subheader={
                    <React.Fragment>
                        <ExpandMore
                            expand={expanded}
                            aria-label="settings"
                            onClick={handleExpandClick}
                            aria-expanded={expanded}>
                            <ExpandMoreIcon />
                        </ExpandMore>
                        {props.item.metaData.fileName}
                    </React.Fragment>
                }
            />
            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <CardContent>
                    <MetaFields metaData={props.item.metaData} />
                </CardContent>
                {/* <CardActions style={{ width: "100%", textAlign: "right" }} disableSpacing>
                    <TagChips metaData={props.item.metaData} />
                </CardActions> */}
            </Collapse>
        </Card>
    );
};

export default SeriesCard;
