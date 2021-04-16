import React from 'react'
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Tooltip from '@material-ui/core/Tooltip';
import Brightness7Icon from '@material-ui/icons/Brightness7';
import Brightness4Icon from '@material-ui/icons/Brightness4';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';

function Navbar(props) {
  const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    title: {
      flexGrow: 1,
      textAlign: "left"
    },
    popover: {
      pointerEvents: 'none',
    },
    popoverText: {
      padding: theme.spacing(1),
    }
  }));
  const classes = useStyles();

  const togglePage = () => {
    if (props.currentPage === "default") {
      props.handleChange("scheduler")
    }
    else {
      props.handleChange("default")
    }
  }
  return (
    <AppBar position="static">
      <Toolbar>
        <Grid container display="flex" justify="space-between">
          <Box component={Grid} item display={{ sm: 'none', md: 'block' }}>
            <Button
              display={{ sm: 'none', md: 'block' }}
              color="inherit"
              onClick={togglePage}
              startIcon={props.currentPage === "default" ? <VisibilityOffIcon /> : <VisibilityIcon />}
            >
              {props.currentPage === "default" ? "Hide Search" : "Show Search"}
            </Button>
          </Box>
          <Grid item>
            <Typography variant="h6" className={classes.title}>
              Fall 2021
            </Typography>
          </Grid>
          <Grid item>
            <Box display="flex">
              <Box>
                <Box
                  component={Button}
                  display={{ sm: 'block', md: 'none' }}
                  color="inherit"
                  onClick={togglePage}
                >
                  {props.currentPage === "default" ? "Scheduler" : "Search"}
                </Box>
              </Box>
              <Box>
                <Tooltip title={`Toggle ${props.prefersDarkMode ? "Light" : "Dark"} Mode`} arrow>
                  <Button onClick={props.toggleTheme}
                    aria-haspopup="true"
                    color="inherit"
                    title="Testing"
                  >
                    {props.prefersDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                  </Button>
                </Tooltip>
              </Box>
              <Box>
                <Button color="inherit">Login</Button>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Toolbar>
    </AppBar>
  )
}


export default Navbar
