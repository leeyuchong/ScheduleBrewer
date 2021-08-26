import React from "react";
import { makeStyles } from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";

function SavedCourseDetail(props) {
  // PROPS:
  //  course: Object of the course information
  //  deleteCourse: Function to delete a course from the UserCourses table

  const boxColor = props.course.blockColor;
  const threshold =
    (boxColor[0] * 299 + boxColor[1] * 587 + boxColor[2] * 114) / 1000;
  const useStyles = makeStyles((theme) => ({
    ...theme.spreadThis,
    detail: {
      background: props.course.offered
        ? `rgb(${boxColor[0]}, ${boxColor[1]}, ${boxColor[2]}, 0.85)`
        : "repeating-linear-gradient(45deg,#bc6360,#bc6360 10px,#984646 10px,#984646 20px)",
      color: threshold >= 128 ? "#000" : "#fff",
      borderLeft: props.course.offered
        ? `4px solid rgb(${boxColor[0]}, ${boxColor[1]}, ${boxColor[2]})`
        : "4px solid #bc6360",
      // textDecorationLine: props.course.offered ? 'none' : 'line-through'
    },
    heading: {
      fontSize: theme.typography.pxToRem(15),
      fontWeight: theme.typography.fontWeightBold,
    },
  }));
  const classes = useStyles();

  return (
    <Box my={1}>
      <Paper className={classes.detail}>
        <Box p={1}>
          <Grid container justify="space-between" spacing={0}>
            <Grid
              item
              xs={9}
              style={{
                textDecorationLine: props.course.offered
                  ? "none"
                  : "line-through",
              }}
            >
              <Grid container direction="column" spacing={0}>
                <Grid item xs>
                  <Typography className={classes.heading} align="left">
                    {props.course.courseID} - {props.course.title}
                  </Typography>
                </Grid>
                <Grid item xs>
                  <Typography variant="subtitle2" align="left">
                    {props.course.d1} {props.course.time1}
                    {props.course.d2
                      ? ` | ${props.course.d2} ${props.course.time2}`
                      : null}
                    {props.course.instructor
                      ? ` | ${props.course.instructor}`
                      : null}
                    {` | ${props.course.format}`}
                    {` | ${props.course.units} ${
                      props.course.units === 1 ? "unit" : "units"
                    }`}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
            <Box
              display="flex"
              component={Grid}
              item
              xs
              justifyContent="flex-end"
              alignItems="center"
              style={{ textDecorationLine: "none" }}
            >
              <Button
                variant="outlined"
                // classes={{
                //     root: threshold >= 128 ? classes.blackButton : classes.whiteButton,
                //     label: classes.detailButton
                // }}
                className={
                  threshold >= 128 ? classes.blackButton : classes.whiteButton
                }
                startIcon={<DeleteIcon />}
                onClick={(event) => {
                  props.deleteCourse(props.course.courseID);
                }}
                align="right"
                // style={{textDecorationLine: 'none'}}
              >
                Delete
              </Button>
            </Box>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
}

export default SavedCourseDetail;
