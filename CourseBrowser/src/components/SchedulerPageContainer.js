import React from 'react';
import SchedulerTable from './Scheduler/SchedulerTable';
import SavedCourseDetailsContainer from './Scheduler/SavedCourseDetailsContainer';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { Box } from '@material-ui/core';

function SchedulerPageContainer() {
    return (
        <div>
            <Box
                component={Typography}
                display={{ sm: 'block', md: 'none' }}
            >
                Best viewed in landscape mode
            </Box>
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
    );
}

export default SchedulerPageContainer;
