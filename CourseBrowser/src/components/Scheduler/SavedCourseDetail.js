import React from 'react';
import { makeStyles } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';

function SavedCourseDetail(props) {
    // PROPS: 
    //  course: Object of the course information 
    //  deleteCourse: Function to delete a course from the UserCourses table

    const boxColor = props.course.blockColor;
    const threshold = ((boxColor[0] * 299) + (boxColor[1] * 587) + (boxColor[2] * 114)) / 1000;
    const useStyles = makeStyles((theme) => ({
        ...theme.spreadThis,
        detail: {
            backgroundColor: `rgb(${boxColor[0]}, ${boxColor[1]}, ${boxColor[2]}, 0.8)`,
            color: threshold >= 128 ? '#000' : '#fff',
            borderLeft: `4px solid rgb(${boxColor[0]}, ${boxColor[1]}, ${boxColor[2]})`    
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
                        <Grid item xs={9}>
                            <Grid container direction="column" spacing={0}>
                                <Grid item xs>
                                    <Typography className={classes.heading} align="left"> 
                                        {props.course.courseID} - {props.course.title} 
                                    </Typography>
                                </Grid>
                                <Grid item xs>
                                    <Typography variant="subtitle2" align="left">
                                        {props.course.d1} {props.course.time1} 
                                        {props.course.d2 ? ` | ${props.course.d2} ${props.course.time2}` : null}
                                        {props.course.instructor ? ` | ${props.course.instructor}` : null}
                                        {` | ${props.course.format}`}
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
                        >
                            <Button
                                variant="outlined"
                                className={threshold >= 128 ? classes.blackButton : classes.whiteButton}
                                startIcon={<DeleteIcon />}
                                onClick={(event) => {
                                    props.deleteCourse(props.course.courseID)
                                }}
                                align="right"
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