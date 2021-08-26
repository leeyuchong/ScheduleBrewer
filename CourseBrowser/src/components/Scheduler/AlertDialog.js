import React from "react";
import Alert from "@material-ui/lab/Alert";
import Box from "@material-ui/core/Box";
import Modal from "@material-ui/core/Modal";
import { makeStyles } from "@material-ui/core";

function AlertDialog(props) {
  console.log("A", props.open);
  const useStyles = makeStyles((theme) => ({
    alertDialog: {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: 400,
      bgcolor: "background.paper",
      border: "2px solid #000",
      boxShadow: 24,
      p: 4,
    },
  }));
  const classes = useStyles();
  return (
    <div>
      <Modal
        open={props.open}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <Box className={classes.alertDialog}>
          <Alert severity="error" onClose={props.handleClose}>
            One or more of your courses are no longer offered. Please delete
            them from your schedule.
          </Alert>
        </Box>
      </Modal>
    </div>
  );
}

export default AlertDialog;
