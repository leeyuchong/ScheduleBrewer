import React, { useState } from "react"
import SearchInputsContainer from "./SearchInputs/SearchInputsContainer"
import SearchResults from './SearchResults/SearchResultsContainer'
import Box from '@material-ui/core/Box';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import IconButton from '@material-ui/core/IconButton';
import Collapse from '@material-ui/core/Collapse';
import CloseIcon from '@material-ui/icons/Close';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';

function SearchSection(props) {
    const [searchURL, setSearchURL] = useState("https://schedulebrewer.ml/api/search/?")
    const [open, setOpen] = useState(false);
    const [openAlert, setOpenAlert] = useState(true)
    const handleClickOpen = () => {
        setOpen(true);
      };
    const handleClose = () => {
        setOpen(false);
    };
    const authLink = (event) => {
        window.location.href = 'https://schedulebrewer.ml/saml/?sso'
    }
    const redirectToPreregSite = (event) => {
        window.location.href = 'https://aisapps.vassar.edu/prereg/'
    }
    return (
        <div>
            <Box>
                <SearchInputsContainer setSearchURL={setSearchURL}/>
                <br/>
                <Collapse in={openAlert}>
                    <Alert 
                        severity="warning"
                        action={
                            <IconButton
                            aria-label="close"
                            color="inherit"
                            size="small"
                            onClick={() => {
                                setOpenAlert(false);
                            }}
                            >
                            <CloseIcon fontSize="inherit" />
                            </IconButton>
                        }
                    >
                        <AlertTitle>
                            <Typography variant="body2">
                                ScheduleBrewer is a tool to help visualize various class schedules in preparation for pre-registration.
                            </Typography>
                        </AlertTitle>
                        <Typography variant="caption">
                            Saving a class does not mean you have registered for it. Remember to log in at <Link href="https://aisapps.vassar.edu/prereg/" onClick={redirectToPreregSite} style={{color: "#E88B00"}}>https://aisapps.vassar.edu/prereg/</Link> and formally register for your classes before preregistration ends.
                        </Typography>
                    </Alert>
                </Collapse>
                <br/>
                <SearchResults 
                    searchURL={searchURL} 
                    setNumberSearchResults={props.setNumberSearchResults} 
                    openLoginDialog={handleClickOpen}
                />
            </Box>
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="Login required"
                aria-describedby="Log in to save a course"
            >
                <DialogTitle id="login-dialog-title">{"Login Required"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="login-dialog-description">
                        Login to save a course to your schedule
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={authLink} color="primary">
                        Login
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}

export default SearchSection
