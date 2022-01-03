import React, { useContext } from "react";
import SavedCourseDetailsContainer from "./Scheduler/SavedCourseDetailsContainer";
import SchedulerTable from "./Scheduler/SchedulerTable";
import SearchSection from "./Search/SearchSection";
import { SavedCourseContext } from "./Utils/SavedCourseContext";
import Grid from "@material-ui/core/Grid";
import Hidden from "@material-ui/core/Hidden";

function DefaultPageContainer() {
  const [savedCourses, setSavedCourses] = useContext(SavedCourseContext);

  return (
    <Grid container spacing={1} className="wrapper">
      <Grid
        item
        xs={12}
        sm={12}
        md={Object.keys(savedCourses).length !== 0 ? 5 : 7}
      >
        <SearchSection />
      </Grid>
      <Grid item sm>
        <Hidden smDown>
          <SchedulerTable />
          <SavedCourseDetailsContainer />
        </Hidden>
      </Grid>
    </Grid>
  );
}

export default DefaultPageContainer;
