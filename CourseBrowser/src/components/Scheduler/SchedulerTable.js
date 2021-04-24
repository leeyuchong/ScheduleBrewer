import React, {useState, useEffect, useRef, useContext, useLayoutEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { SavedCourseContext } from '../Utils/SavedCourseContext'
import DayColumn from './DayColumn';

function SchedulerTable(props) {
    const useStyles = makeStyles((theme) => ({
        ...theme.spreadThis,
        tableBodyCells:{
            paddingLeft: 7,
            paddingRight: 7,
        },
        tableAllCells: {
            paddingTop: 11,
            paddingBottom: 11,
            borderTopWidth: "0px", 
            borderRightWidth: "0px",
            borderBottomWidth: "1px",
            borderLeftWidth: "1px",
            borderColor: "rgb(171, 171, 171, 0.5)",
            borderStyle: "solid",
        },
        tableRightBorder: {
            borderRightWidth: "1px"
        },
        eventSpace:{
            paddingLeft: 0,
            paddingRight: 0,
        },
    }));
    const minTableRange = [1000, 1500]
    const [savedCourses, setSavedCourses] = useContext(SavedCourseContext)
    const [monBlocks, setMonBlocks] = useState([])
    const [tueBlocks, setTueBlocks] = useState([])
    const [wedBlocks, setWedBlocks] = useState([])
    const [thurBlocks, setThurBlocks] = useState([])
    const [friBlocks, setFriBlocks] = useState([])
    const [tableRange, setTableRange] = useState(minTableRange)

    function createTimes(start, end){
        let retArray = []
        const end12 = end/100
        for(let i=start/100; i<=end12; i+=1){
            let time=""
            if(i<12){
                time+=`${i}am`
            }
            else if(i===12){
                time+=`${i}pm`
            }
            else{
                time+=`${i-12}pm`
            }
            retArray.push(time)
        }
        return retArray
    }
      
    const days=["Mon", "Tue", "Wed", "Thur", "Fri"]      
    const classes = useStyles();

    const [width, setWidth] = useState(0)
    const timeTableRef = useRef(null)

    useLayoutEffect(() => {
        setWidth(timeTableRef.current.offsetWidth);
        function handleResize() {
            setWidth(timeTableRef.current.offsetWidth);
        }
        window.addEventListener("resize", handleResize);
        handleResize();
        return () => window.removeEventListener("resize", handleResize);        
      }, [savedCourses]);
    //   var buttonIsVisible = window.visualViewport.width < window.Width;

    // Load all courses that are in the context
    useEffect(() => {
        let tempMonBlocks = []
        let tempTueBlocks = []
        let tempWedBlocks = []
        let tempThurBlocks = []
        let tempFriBlocks = []
        let tempTableRange = [...minTableRange]
        for(const value of Object.values(savedCourses)){
            for(let i=1; i<3; i++){ //d1 and d2 
                if(value[`d${i}`] != null && value[`d${i}`].length > 0){
                    for(let day of value[`d${i}`]){
                        tempTableRange = [Math.min(tempTableRange[0], value[`starttime${i}`]), Math.max(tempTableRange[1], value[`endtime${i}`])]
                        if(day==="M"){
                                tempMonBlocks = insertBlock(
                                    tempMonBlocks, 
                                    value, 
                                    value[`starttime${i}`], 
                                    value[`duration${i}`], 
                                    value[`endtime${i}`]
                                )
                        }
                        if(day==="T"){
                            tempTueBlocks = insertBlock(
                                tempTueBlocks, value, value[`starttime${i}`], value[`duration${i}`], value[`endtime${i}`])
                        }
                        if(day==="W"){
                            tempWedBlocks = insertBlock(tempWedBlocks, value, value[`starttime${i}`], value[`duration${i}`], value[`endtime${i}`])
                        }
                        if(day==="R"){
                            tempThurBlocks = insertBlock(tempThurBlocks, value, value[`starttime${i}`], value[`duration${i}`], value[`endtime${i}`])
                        }
                        if(day==="F"){
                            tempFriBlocks = insertBlock(tempFriBlocks, value, value[`starttime${i}`], value[`duration${i}`], value[`endtime${i}`])
                        }                    
                    }    
                }
            }
        }
        tempTableRange = [Math.floor(tempTableRange[0]/100)*100, Math.floor(tempTableRange[1]/100)*100]
        setMonBlocks(tempMonBlocks)
        setTueBlocks(tempTueBlocks)
        setWedBlocks(tempWedBlocks)
        setThurBlocks(tempThurBlocks)
        setFriBlocks(tempFriBlocks)
        setTableRange(tempTableRange)
    }, [savedCourses])

    function insertBlock(currClusters, newBlock, newBlockStartTime, newBlockDuration, newBlockEndTime){
        let newClusters= JSON.parse(JSON.stringify(currClusters))// Cluster, ie array of objects
        const newBlockInfo = {
            courseID: newBlock.courseID,
            startTime: newBlockStartTime, 
            endTime: newBlockEndTime,
            duration: newBlockDuration,
            blockColor: newBlock.blockColor,
        }
        const insertAt = findInsertToClusterIdx(newClusters, newBlockStartTime, newBlockDuration, newBlockEndTime)
        
        if(insertAt[0]){
            // overlap
            if(insertAt[1].length===1){
                //only overlap with one cluster
                if(newClusters[insertAt[1]].lanes.length===1){
                    // only one lane in cluster                    
                    newClusters[insertAt[1]].lanes.splice(findLaneInsertPos(newClusters[insertAt[1]].lanes, newBlockStartTime), 0, [newBlockInfo])
                    newClusters[insertAt[1]].startTime = Math.min(newClusters[insertAt[1]].startTime, newBlockStartTime)
                    newClusters[insertAt[1]].endTime = Math.max(newClusters[insertAt[1]].endTime, newBlockEndTime)
                }
                else{
                    // more than one lane in cluster, decide which lane to put it in
                    const currentLanes = newClusters[insertAt[1]].lanes
                    let found = false
                    for(let i=0;i<currentLanes.length;i++){
                        if(!(checkOverlap(currentLanes[i], newBlockStartTime, newBlockDuration, newBlockEndTime))){
                            newClusters[insertAt[1]].lanes[i].splice(findCourseInsertPos(newClusters[insertAt[1]].lanes[i],newBlockStartTime),0,newBlockInfo)
                            newClusters[insertAt[1]].startTime = Math.min(newClusters[insertAt[1]].startTime, newBlockStartTime)
                            newClusters[insertAt[1]].endTime = Math.max(newClusters[insertAt[1]].endTime, newBlockEndTime)
                            found=true
                            break
                        }
                    }
                    if(!found){
                        // overlap with all lanes, insert a new lane. 
                        newClusters[insertAt[1]].lanes.splice(findLaneInsertPos(newClusters[insertAt[1]].lanes, newBlockStartTime), 0, [newBlockInfo])
                        newClusters[insertAt[1]].startTime = Math.min(newClusters[insertAt[1]].startTime, newBlockStartTime)
                        newClusters[insertAt[1]].endTime = Math.max(newClusters[insertAt[1]].endTime, newBlockEndTime)
                    }
                }
            }
            else{
                // overlap with multiple clusters. Merge these clusters together
                const clustersToMerge=insertAt[1]// Array of stuff to merge e.g. [1,2]
                let finalCluster = newClusters[clustersToMerge[0]]
                clustersToMerge.slice(1).forEach(clusterToMerge => {
                    newClusters[clusterToMerge].lanes.forEach((lane, index) => {
                        lane.forEach(course => {
                          if(index<finalCluster.lanes.length){
                              finalCluster.lanes[index].push(course)
                          }
                          else{
                              finalCluster.lanes.push([course])
                          }
                            finalCluster.startTime = Math.min(finalCluster.startTime, course.startTime)
                            finalCluster.endTime = Math.max(finalCluster.endTime, course.endTime)
                        })
                    })
                })
                finalCluster.lanes.push([newBlock])
                finalCluster.startTime = Math.min(finalCluster.startTime, newBlockStartTime)
                finalCluster.endTime = Math.max(finalCluster.endTime, newBlock.endTime)
                newClusters.splice(clustersToMerge[0], clustersToMerge.length, finalCluster)
            }
        }
        else{
            // No overlap, create a new cluster of 1 course
            newClusters.splice(insertAt[1], 0, {
                startTime: newBlockStartTime,
                endTime: newBlockEndTime,
                lanes: [[newBlockInfo]]
            })
        }
        return newClusters
    }

    // look through all the clusters and find overlap
    function findInsertToClusterIdx(clusters, newBlockStartTime, newBlockDuration, newBlockEndTime){
        let retVal = [false, 0] // [overlap?, insertAtIndex]
        for(let i=0; i<clusters.length; i++){
            if(newBlockEndTime < clusters[i].startTime){
                // new block ends before cluster start. Stop searching.
                if(retVal[0]){
                    break
                }
                return [false, i]
            }
            else if(newBlockStartTime >= clusters[i].endTime){
                // new block starts after cluster end. Check next cluster
                retVal = [false, i]
                continue
            }
            else if (newBlockStartTime >= clusters[i].startTime || newBlockEndTime > clusters[i].startTime){
                // new block starts before cluster end but after cluster start OR new block ends after cluster starts but but starts before cluster starts
                if(retVal[0]){
                    retVal[1].push(i)
                }
                else{
                    retVal=[true, [i]]
                }
            }
        }
        if(!retVal[0]){retVal[1]+=1}
        return retVal
    }

    function findLaneInsertPos(lanes, startTime){
      let i = 0
      for(;i<lanes.length;i++){
        if(lanes[i][0].startTime>startTime){
          break
        }
      }
      return i
      }
    
    function findCourseInsertPos(courses, startTime){
      let i = 0
      for(;i<courses.length;i++){
        if(courses[i].startTime>startTime){
          break
        }
      }
      return i
      }
    
    function checkOverlap(lane, startTime, duration, endTime){
        // const endTime = getEndTime(startTime, duration)
        for(let i=0; i<lane.length; i++){
          if((startTime >= lane[i].startTime && startTime < lane[i].endTime) || (endTime > lane[i].startTime && endTime <= lane[i].endTime)){
              return true
            }
        }
        return false
    }

    return (
        <Box mt={0.5}>
            <div style={{position: "absolute", width: width}}>
                <Grid container spacing={0}>
                    <Grid item xs={1}/>
                    <Grid item xs key={"Mon"} id={"Mon"} className={classes.eventSpace}><DayColumn dayBlock={monBlocks} minTime={tableRange[0]/100}/></Grid>
                    <Grid item xs key={"Tue"} id={"Tue"} className={classes.eventSpace}><DayColumn dayBlock={tueBlocks} minTime={tableRange[0]/100}/></Grid>
                    <Grid item xs key={"Wed"} id={"Wed"} className={classes.eventSpace}><DayColumn dayBlock={wedBlocks} minTime={tableRange[0]/100}/></Grid>
                    <Grid item xs key={"Thur"} id={"Thur"} className={classes.eventSpace}><DayColumn dayBlock={thurBlocks} minTime={tableRange[0]/100}/></Grid>
                    <Grid item xs key={"Fri"} id={"Fri"} className={classes.eventSpace}><DayColumn dayBlock={friBlocks} minTime={tableRange[0]/100}/></Grid>
                </Grid>
            </div>
            <div ref={timeTableRef} className={`${classes.componentBackground}`}>
                <Grid container spacing={0} style={{textAlign:"center"}}>
                    <Grid item xs={1} className={`${classes.tableHeaderCells} ${classes.tableAllCells}`} style={{borderTopWidth: "1px"}}></Grid>
                    {days.map((day) => 
                        <Grid item xs className={ `${day !== "Fri" ? null : classes.tableRightBorder} ${classes.tableHeaderCells} ${classes.tableAllCells}`} style={{borderTopWidth: "1px"}}>{day}</Grid>
                    )}
                </Grid>
                {createTimes(tableRange[0], tableRange[1]).map((time, idx) => 
                    <Grid container spacing={0}>
                        <Grid item xs={1} className={`${classes.tableAllCells}`}>
                            <Typography variant="body2" align="center">{time}</Typography>
                        </Grid>
                        {days.map((day) => 
                            <Grid item xs className={`${day !== "Fri" ? null : classes.tableRightBorder} ${classes.tableAllCells}`}></Grid>
                        )}
                    </Grid>
                )}
            </div>
        </Box>
    )
}

export default SchedulerTable
