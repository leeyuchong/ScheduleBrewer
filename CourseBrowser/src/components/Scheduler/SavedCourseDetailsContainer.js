import { Box, Typography } from '@material-ui/core'
import Cookies from 'js-cookie'
import React, { useContext, useState, useEffect } from 'react'
import { SavedCourseContext } from '../Utils/SavedCourseContext'
import SavedCourseDetail from './SavedCourseDetail'

function SavedCourseDetailsContainer() {
    const [savedCourses, setSavedCourses] = useContext(SavedCourseContext)
    const deleteCourse = (courseID)=> {
        const url=`https://schedulebrewer.ml/api/delete-course/${courseID}/`
        fetch(url, {
          credentials: 'include',
          method: 'DELETE',
          mode: 'cors',
          headers: {
            'X-CSRFToken': Cookies.get('csrftoken'),
            'authorization': Cookies.get('sessionid')
          },
        }).then(result =>{
          if(result.status === 200){
            let prevSavedCourses = {...savedCourses}
            delete prevSavedCourses[courseID]
            setSavedCourses(prevSavedCourses)
          }
        }
        ).catch(error => {
          console.log("Error, failed to save course: ", error)
        })
    }
    const [classroomUnits, setClassroomUnits] = useState(0)
    const [intUnits, setIntUnits] = useState(0)
    const [otherUnits, setOtherUnits] = useState(0)
    useEffect(() => {
      let cls = 0
      let int = 0
      let oth = 0
      Object.values(savedCourses).forEach(course => {
        if(course.format==="CLS"){
          cls+=course.units
        }
        else if(course.format=="INT"){
          int+=course.units
        }
        else{
          oth+=course.units
        }
      })
      setClassroomUnits(cls)
      setIntUnits(int)
      setOtherUnits(oth)
    }, [savedCourses])
    return (
        <Box my={1}>
          <Typography align='left'>
            {"Units: "}
            {classroomUnits>0 ? `Classroom - ${classroomUnits}` : null} 
            {classroomUnits>0 && (intUnits>0 || otherUnits>0) ? " | " : null} 
            {intUnits>0 ? `Intensive - ${intUnits}` : null}
            {intUnits>0 && otherUnits>0 ? " | " : null} 
            {otherUnits>0 ? `Other - ${otherUnits}` : null}
          </Typography>
          {savedCourses && Object.values(savedCourses).map(course => 
              <SavedCourseDetail course={course} deleteCourse={deleteCourse}/>    
          )}
        </Box>
    )
}

export default SavedCourseDetailsContainer
