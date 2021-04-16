import React from 'react'
import SchedulerTable from './Scheduler/SchedulerTable'
import SavedCourseDetailsContainer from './Scheduler/SavedCourseDetailsContainer'
import Grid from '@material-ui/core/Grid';

function SchedulerPageContainer() {
    return (
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
    )
}

export default SchedulerPageContainer
