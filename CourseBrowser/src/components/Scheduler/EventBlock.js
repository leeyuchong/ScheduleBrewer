import React, {useState, useRef, useEffect, useContext } from 'react';
import { makeStyles } from '@material-ui/core';
import { SavedCourseContext } from '../Utils/SavedCourseContext'
import Tooltip from '@material-ui/core/Tooltip';
import Box from '@material-ui/core/Box';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

function EventBlock(props) {
    // PROPS: 
    //  course: Object of the course information 
    //  dayBlock: Array of blocks for that day
    //  minTime: The time that the scheduler starts with. Default is 10am

    const [topOffset, setTopOffset] = useState(0);
    const elementRef = useRef(null);
    const boxColor = props.course.blockColor;
    const startTime = (Math.floor(props.course.startTime/100)+(props.course.startTime%100)/60);
    const topValue = 43 + (startTime-props.minTime)*42 + ((startTime-props.minTime)) - topOffset;
    const useStyles = makeStyles((theme) => ({
        eventBlock: {
            position: 'relative',
            top: `${topValue}px`,
            height: `${(props.course.duration/60)*43}px`,
            backgroundColor: `rgb(${boxColor[0]}, ${boxColor[1]}, ${boxColor[2]}, 0.85)`,
            color: (((boxColor[0] * 299) + (boxColor[1] * 587) + (boxColor[2] * 114)) / 1000) >= 128 ? '#000' : '#fff',
            borderLeft: `4px solid rgb(${boxColor[0]}, ${boxColor[1]}, ${boxColor[2]})`
        },
        paper: {
            position: 'relative',
            padding: theme.spacing(1),
            backgroundColor: theme.palette.background.paper,
            top: `${topValue}px`
        },
    }));
    const classes = useStyles();
    useEffect(() => {
        setTopOffset(elementRef.current.offsetTop);
      }, [props.dayBlock]);

    const [savedCourses, setSavedCourses] = useContext(SavedCourseContext);
    const [open, setOpen] = React.useState(false);
    const handleTooltipClose = () => {
      setOpen(false);
    };
    const handleTooltipOpen = () => {
      setOpen(true);
    };
    
    return (
        <Box ref={elementRef}>
            {savedCourses[props.course.courseID] ? (
                <ClickAwayListener onClickAway={handleTooltipClose}>
                    <Tooltip
                        title={
                            <React.Fragment className={classes.paper}>
                                <Typography color="inherit" variant="subtitle2">
                                    {savedCourses[props.course.courseID].title}
                                </Typography>
                                <Typography variant="caption">
                                    {`${savedCourses[props.course.courseID].instructor} | ${savedCourses[props.course.courseID].format}$`}
                                </Typography>
                                <br></br>
                                <Typography variant="caption">
                                    {`${props.course.startTime} - ${props.course.endTime}`}
                                </Typography>
                            </React.Fragment>
                        }
                        arrow
                        onClose={handleTooltipClose}
                        open={open}
                    >
                        <Paper 
                            className={classes.eventBlock} 
                            align="left" 
                            pl={1} 
                            onClick={handleTooltipOpen} 
                            onMouseEnter={handleTooltipOpen} 
                            onMouseLeave={handleTooltipClose}
                        >
                            <Box ml={0.5}>
                                <Typography variant="caption" align="left">
                                    {props.course.courseID}
                                </Typography>
                            </Box>
                        </Paper>
                    </Tooltip>
                </ClickAwayListener>
            ) : ( 
                null
            )}
        </Box>
    );
}

export default EventBlock;
