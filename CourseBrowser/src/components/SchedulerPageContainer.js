import React from 'react'
import SchedulerTable from './Scheduler/SchedulerTable'
import SavedCourseDetailsContainer from './Scheduler/SavedCourseDetailsContainer'
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

function SchedulerPageContainer() {
    return (
        <div>
            <Typography>Best viewed in landscape mode</Typography>
            <Grid
                container
                justify="center"
            >
                <Grid
                    item
                    xs={12}
                    md={11}
                >
                    <SchedulerTable />
                    <SavedCourseDetailsContainer/>
                </Grid>
            </Grid>
        </div>
    )
}

export default SchedulerPageContainer
