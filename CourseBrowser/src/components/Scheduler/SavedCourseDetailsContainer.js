import React, { useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { SavedCourseContext } from '../Utils/SavedCourseContext';
import SavedCourseDetail from './SavedCourseDetail';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';

function SavedCourseDetailsContainer() {
  const [savedCourses, setSavedCourses] = useContext(SavedCourseContext);
  const deleteCourse = (courseID) => {
    const url = `https://schedulebrewer.ml/api/delete-course/${courseID}/`;
    fetch(url, {
      credentials: 'include',
      method: 'DELETE',
      mode: 'cors',
      headers: {
        'X-CSRFToken': Cookies.get('csrftoken'),
        'authorization': Cookies.get('sessionid')
      },
    }).then(result => {
      if (result.status === 200) {
        let prevSavedCourses = { ...savedCourses }
        delete prevSavedCourses[courseID]
        setSavedCourses(prevSavedCourses)
      }
    }
    ).catch(error => {
      console.log("Error, failed to save course: ", error)
    });
  };
  const [classroomUnits, setClassroomUnits] = useState(0);
  const [intUnits, setIntUnits] = useState(0);
  const [otherUnits, setOtherUnits] = useState(0);
  useEffect(() => {
    let clsCount = 0;
    let intensiveCount = 0;
    let othCount = 0;
    Object.values(savedCourses).forEach(course => {
      if (course.format === "CLS") {
        clsCount += course.units;
      }
      else if (course.format == "INT") {
        intensiveCount += course.units;
      }
      else {
        othCount += course.units;
      }
    });
    setClassroomUnits(clsCount);
    setIntUnits(intensiveCount);
    setOtherUnits(othCount);
  }, [savedCourses]);

  return (
    <Box my={1}>
      <Box
        component={Typography}
        display={classroomUnits > 0 || intUnits > 0 || otherUnits > 0 ? 'block' : 'none'}
        align='left'
      >
        {"Units: "}
        {classroomUnits > 0 ? `Classroom - ${classroomUnits}` : null}
        {classroomUnits > 0 && (intUnits > 0 || otherUnits > 0) ? " | " : null}
        {intUnits > 0 ? `Intensive - ${intUnits}` : null}
        {intUnits > 0 && otherUnits > 0 ? " | " : null}
        {otherUnits > 0 ? `Other - ${otherUnits}` : null}
      </Box>
      {savedCourses && Object.values(savedCourses).map(course =>
        <SavedCourseDetail course={course} deleteCourse={deleteCourse} />
      )}
    </Box>
  );
}

export default SavedCourseDetailsContainer;
