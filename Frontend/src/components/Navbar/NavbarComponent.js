import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import Tooltip from "@material-ui/core/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import Brightness7Icon from "@material-ui/icons/Brightness7";
import Brightness4Icon from "@material-ui/icons/Brightness4";
import VisibilityIcon from "@material-ui/icons/Visibility";
import VisibilityOffIcon from "@material-ui/icons/VisibilityOff";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import CalendarTodayIcon from "@material-ui/icons/CalendarToday";
import SearchIcon from "@material-ui/icons/Search";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import Cookies from "js-cookie";

function Navbar(props) {
  // PROPS:
  // currentPage: Whether the page was "default" or "scheduler". "default"
  //              is for both the scheduler and the search and "scheduler"
  //              is for just the search section on the page
  // handleChange: A function to handle change from one page to another
  // toggleTheme: A function to toggle the theme between dark and light mode

  const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    title: {
      flexGrow: 1,
      textAlign: "left",
    },
    popover: {
      pointerEvents: "none",
    },
    popoverText: {
      padding: theme.spacing(1),
    },
  }));
  const classes = useStyles();
  const togglePage = () => {
    if (props.currentPage === "default") {
      props.handleChange("scheduler");
    } else {
      props.handleChange("default");
    }
  };
  // For the side bar in mobile
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const authLink = (event) => {
    window.location.href = `${process.env.HOSTNAME}/saml/?${
      Cookies.get("sessionid") === undefined ? "sso" : "slo"
    }`;
  };

  return (
    <AppBar position="static">
      <Toolbar variant="dense">
        <Grid
          container
          display="flex"
          justify="space-between"
          alignItems="center"
        >
          <Box component={Grid} item display={{ xs: "none", md: "block" }}>
            <Button
              color="inherit"
              onClick={togglePage}
              startIcon={
                props.currentPage === "default" ? (
                  <VisibilityOffIcon />
                ) : (
                  <VisibilityIcon />
                )
              }
            >
              {props.currentPage === "default" ? "Hide Search" : "Show Search"}
            </Button>
          </Box>
          <Grid item>
            <Typography variant="h6" className={classes.title}>
              {JSON.parse(document.getElementById("site_title").textContent)}
            </Typography>
          </Grid>
          <Box component={Grid} item display={{ xs: "none", sm: "block" }}>
            <Box display="flex">
              <Box>
                <Tooltip
                  title={`Toggle ${
                    props.prefersDarkMode ? "Light" : "Dark"
                  } Mode`}
                  arrow
                >
                  <Button
                    onClick={props.toggleTheme}
                    aria-haspopup="true"
                    color="inherit"
                  >
                    {props.prefersDarkMode ? (
                      <Brightness7Icon />
                    ) : (
                      <Brightness4Icon />
                    )}
                  </Button>
                </Tooltip>
              </Box>
              <Box>
                <Box
                  component={Button}
                  display={{ sm: "block", md: "none" }}
                  color="inherit"
                  onClick={togglePage}
                >
                  {props.currentPage === "default" ? "Scheduler" : "Search"}
                </Box>
              </Box>
              <Box>
                <Button color="inherit" onClick={authLink}>
                  {Cookies.get("sessionid") === undefined ? "Login" : "Logout"}
                </Button>
              </Box>
            </Box>
          </Box>
          <Box
            component={Grid}
            item
            display={{ xs: "block", sm: "none" }}
            color="secondary"
          >
            <IconButton
              aria-label="more"
              aria-controls="menu"
              aria-haspopup="true"
              onClick={handleClick}
              color="inherit"
            >
              <MoreVertIcon />
            </IconButton>
            <Menu
              id="menu"
              anchorEl={anchorEl}
              keepMounted
              open={open}
              onClose={handleClose}
            >
              <MenuItem
                onClick={() => {
                  handleClose();
                  togglePage();
                }}
              >
                {props.currentPage === "default" ? (
                  <Box display="flex">
                    <Box pr={1}>
                      <CalendarTodayIcon color="secondary" />
                    </Box>
                    <Box>
                      <Typography color="secondary">Scheduler</Typography>
                    </Box>
                  </Box>
                ) : (
                  <Box display="flex">
                    <Box pr={1}>
                      <SearchIcon color="secondary" />
                    </Box>
                    <Box>
                      <Typography color="secondary">Search</Typography>
                    </Box>
                  </Box>
                )}
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleClose();
                  props.toggleTheme();
                }}
              >
                {props.prefersDarkMode ? (
                  <Box display="flex">
                    <Box pr={1}>
                      <Brightness7Icon color="secondary" />
                    </Box>
                    <Box>
                      <Typography color="secondary">Light Mode</Typography>
                    </Box>
                  </Box>
                ) : (
                  <Box display="flex">
                    <Box pr={1}>
                      <Brightness4Icon color="secondary" />
                    </Box>
                    <Box>
                      <Typography color="secondary">Dark Mode</Typography>
                    </Box>
                  </Box>
                )}
              </MenuItem>
              <MenuItem
                onClick={() => {
                  authLink();
                }}
              >
                <Box display="flex">
                  <Box pr={1}>
                    <ExitToAppIcon color="secondary" />
                  </Box>
                  <Box>
                    <Typography color="secondary">
                      {Cookies.get("sessionid") === undefined
                        ? "Login"
                        : "Logout"}
                    </Typography>
                  </Box>
                </Box>
              </MenuItem>
            </Menu>
          </Box>
        </Grid>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
