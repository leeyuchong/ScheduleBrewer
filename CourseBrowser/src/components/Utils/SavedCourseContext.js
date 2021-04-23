import React, { useState, useEffect } from 'react'
import Cookies from 'js-cookie'
import randomColor from 'randomcolor'

const SavedCourseContext = React.createContext([{}, () => {}])
const sessionID = Cookies.get('sessionid')

const SavedCourseProvider = (props) => {
    const [savedCourses, setSavedCourses] = useState({})
    useEffect(() => {
        if(sessionID!==undefined){
            fetch("https://schedulebrewer.ml/getCSRF/", {
                method: 'GET',
                credentials: 'include'
            })
            .then(
                fetch("https://schedulebrewer.ml/api/get-saved-courses", {
                    credentials: 'include',
                    method: 'GET',
                    // mode: 'cors',
                    headers: {
                        'X-CSRFToken': Cookies.get('csrftoken'),
                        'authorization': sessionID
                    }
                }).then(response => response.json()).then(data => {
                    let responseCourses = {}
                    data.forEach(course => 
                        responseCourses[course.courseID] = {
                            ...course, 
                            blockColor: randomColor({
                                luminosity: 'light',
                                format: 'rgbArray'
                            })
                        },
                    )
                    setSavedCourses(responseCourses)
                })
            ).catch(error => {
                console.log("Error, failed to load courses: ", error)
              })
        }
    }, [])
    return (
        <SavedCourseContext.Provider value={[savedCourses, setSavedCourses]}>
            {props.children}
        </SavedCourseContext.Provider>
    )
}

export { SavedCourseContext, SavedCourseProvider }
