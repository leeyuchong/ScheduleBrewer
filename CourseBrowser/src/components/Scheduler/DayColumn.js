import React from 'react';
import EventBlock from './EventBlock'
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';

function DayColumn(props) {
    // PROPS: 
    // dayBlock: Array of blocks for that day
    // minTime: The time that the scheduler starts with. Default is 10am

    return (
        <Box px={0.2}>
            {props.dayBlock.map((cluster, clusterIndex) =>
                <Grid key={clusterIndex} container spacing={0}>
                    {cluster.lanes.map((lane, laneIndex) =>
                        <Grid key={laneIndex} item xs zeroMinWidth>
                            <Grid
                                container
                                spacing={0}
                                direction="column"
                            >
                                {lane.map(course =>
                                    <Grid
                                        key={`lane_${course.courseID}`}
                                        item
                                        xs
                                        id={`block-${clusterIndex}-${laneIndex}-${course.courseID}`}
                                        zeroMinWidth
                                    >
                                        <EventBlock
                                            course={course}
                                            dayBlock={props.dayBlock}
                                            minTime={props.minTime}
                                        />
                                    </Grid>
                                )}
                            </Grid>
                        </Grid>
                    )}
                </Grid>
            )}
        </Box>
    );
}

export default DayColumn;
