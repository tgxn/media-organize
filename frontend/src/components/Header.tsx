import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import Typography from "@mui/material/Typography";
// import { makeStyles, Theme } from "@mui/material/styles";

import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()((theme) => ({
  appBar: {
    background: theme.palette.primary.dark,
    color: theme.palette.secondary.light,
  },
  icon: {
    padding: theme.spacing(1),
  },
  title: {
    margin: "auto",
  },
}));

const Header = () => {
  const { classes } = useStyles();

  return (
    <AppBar position="fixed" className={classes.appBar} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>

        <Typography variant="h6" className={classes.title}>
          Header
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Header;