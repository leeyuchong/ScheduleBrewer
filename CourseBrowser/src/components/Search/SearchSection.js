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

function SearchSection(props) {
    const [searchURL, setSearchURL] = useState("https://schedulebrewer.ml/api/search/?")
    const [open, setOpen] = React.useState(false);
    const handleClickOpen = () => {
        setOpen(true);
      };
      const handleClose = () => {
        setOpen(false);
      };
      const authLink = (event) => {
        window.location.href = 'https://schedulebrewer.ml/saml/?sso'
      }
    return (
        <div>
            <Box>
                <SearchInputsContainer setSearchURL={setSearchURL}/>
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
