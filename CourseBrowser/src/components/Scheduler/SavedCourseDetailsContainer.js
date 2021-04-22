import Cookies from 'js-cookie'
import React, { useContext } from 'react'
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
    return (
        <div>
            {savedCourses && Object.values(savedCourses).map(course => 
                <SavedCourseDetail course={course} deleteCourse={deleteCourse}/>    
            )}
        </div>
    )
}

export default SavedCourseDetailsContainer
