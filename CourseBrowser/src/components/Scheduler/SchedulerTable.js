import React, {
  useState,
  useEffect,
  useRef,
  useContext,
  useLayoutEffect,
} from "react";
import { makeStyles } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { SavedCourseContext } from "../Utils/SavedCourseContext";
import DayColumn from "./DayColumn";
import AlertDialog from "./AlertDialog";

function SchedulerTable() {
  const useStyles = makeStyles((theme) => ({
    ...theme.spreadThis,
    tableBodyCells: {
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
      borderRightWidth: "1px",
    },
    eventSpace: {
      paddingLeft: 0,
      paddingRight: 0,
    },
  }));
  const minTableRange = [1000, 1500];
  const [savedCourses, setSavedCourses] = useContext(SavedCourseContext);
  const [monBlocks, setMonBlocks] = useState([]);
  const [tueBlocks, setTueBlocks] = useState([]);
  const [wedBlocks, setWedBlocks] = useState([]);
  const [thurBlocks, setThurBlocks] = useState([]);
  const [friBlocks, setFriBlocks] = useState([]);
  const [tableRange, setTableRange] = useState(minTableRange);
  const [openAlert, setOpenAlert] = useState(false);
  const handleClose = () => {
    setOpenAlert(false);
  };
  function createTimes(start, end) {
    let retArray = [];
    const end12 = end / 100;
    for (let i = start / 100; i <= end12; i += 1) {
      let time = "";
      if (i < 12) {
        time += `${i}am`;
      } else if (i === 12) {
        time += `${i}pm`;
      } else {
        time += `${i - 12}pm`;
      }
      retArray.push(time);
    }
    return retArray;
  }

  const days = ["Mon", "Tue", "Wed", "Thur", "Fri"];
  const classes = useStyles();

  const [width, setWidth] = useState(0);
  const timeTableRef = useRef(null);

  useLayoutEffect(() => {
    setWidth(timeTableRef.current.offsetWidth);
    function handleResize() {
      setWidth(timeTableRef.current.offsetWidth);
    }
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [savedCourses]);

  // Load all courses that are in the context
  useEffect(() => {
    let tempMonBlocks = [];
    let tempTueBlocks = [];
    let tempWedBlocks = [];
    let tempThurBlocks = [];
    let tempFriBlocks = [];
    let tempTableRange = [...minTableRange];
    for (const value of Object.values(savedCourses)) {
      if (!value.offered) {
        setOpenAlert(true);
      }
      for (let i = 1; i < 3; i++) {
        //d1 and d2
        if (value[`d${i}`] != null && value[`d${i}`].length > 0) {
          for (let day of value[`d${i}`]) {
            tempTableRange = [
              Math.min(tempTableRange[0], value[`starttime${i}`]),
              Math.max(tempTableRange[1], value[`endtime${i}`]),
            ];
            if (day === "M") {
              tempMonBlocks = insertBlock(
                tempMonBlocks,
                value,
                value[`starttime${i}`],
                value[`duration${i}`],
                value[`endtime${i}`]
              );
            }
            if (day === "T") {
              tempTueBlocks = insertBlock(
                tempTueBlocks,
                value,
                value[`starttime${i}`],
                value[`duration${i}`],
                value[`endtime${i}`]
              );
            }
            if (day === "W") {
              tempWedBlocks = insertBlock(
                tempWedBlocks,
                value,
                value[`starttime${i}`],
                value[`duration${i}`],
                value[`endtime${i}`]
              );
            }
            if (day === "R") {
              tempThurBlocks = insertBlock(
                tempThurBlocks,
                value,
                value[`starttime${i}`],
                value[`duration${i}`],
                value[`endtime${i}`]
              );
            }
            if (day === "F") {
              tempFriBlocks = insertBlock(
                tempFriBlocks,
                value,
                value[`starttime${i}`],
                value[`duration${i}`],
                value[`endtime${i}`]
              );
            }
          }
        }
      }
    }
    tempTableRange = [
      Math.floor(tempTableRange[0] / 100) * 100,
      Math.floor(tempTableRange[1] / 100) * 100,
    ];
    setMonBlocks(tempMonBlocks);
    setTueBlocks(tempTueBlocks);
    setWedBlocks(tempWedBlocks);
    setThurBlocks(tempThurBlocks);
    setFriBlocks(tempFriBlocks);
    setTableRange(tempTableRange);
  }, [savedCourses]);

  // Insert an event block into the day
  // ARGS:
  //  currClusters: Array of javascript objects. Each object is a cluster. A
  //                cluster is a group of courses that overlap. A cluster has
  //                the keys: starttime, endtime, lanes. starttime is the
  //                starttime of the earliest course in the cluster. endtime
  //                is the endtime of the latest course in the cluster.
  //                Lanes is an array of arrays. The inner arrays represent
  //                lanes, where each lane contains courses that do not overlap.
  //                If the courses overlap, then they are put in separate lanes.
  //
  //  newBlock: A javascript object containing the course details
  //  newBlockStartTime, newBlockDuration, newBlockEndTime: integers, 24-hr format
  function insertBlock(
    currClusters,
    newBlock,
    newBlockStartTime,
    newBlockDuration,
    newBlockEndTime
  ) {
    let newClusters = JSON.parse(JSON.stringify(currClusters));
    const newBlockInfo = {
      courseID: newBlock.courseID,
      startTime: newBlockStartTime,
      endTime: newBlockEndTime,
      duration: newBlockDuration,
      blockColor: newBlock.blockColor,
      offered: newBlock.offered,
    };
    const insertAt = findInsertToClusterIdx(
      newClusters,
      newBlockStartTime,
      newBlockEndTime
    );

    // Course overlaps with another course in the day.
    if (insertAt[0]) {
      //only overlap with one cluster
      if (insertAt[1].length === 1) {
        // only one lane in cluster
        if (newClusters[[insertAt[1][0]]].lanes.length === 1) {
          // Insert the new block into a new lane.
          newClusters[[insertAt[1][0]]].lanes.splice(
            findLaneInsertPos(
              newClusters[[insertAt[1][0]]].lanes,
              newBlockStartTime
            ),
            0,
            [newBlockInfo]
          );
          // Determine the new cluster start and end times
          newClusters[[insertAt[1][0]]].startTime = Math.min(
            newClusters[[insertAt[1][0]]].startTime,
            newBlockStartTime
          );
          newClusters[[insertAt[1][0]]].endTime = Math.max(
            newClusters[[insertAt[1][0]]].endTime,
            newBlockEndTime
          );
        } else {
          // more than one lane in cluster, decide which lane it can
          // go in without overlap
          const currentLanes = newClusters[[insertAt[1][0]]].lanes;
          // Signal that indicates whether a place has been found
          // for the new course
          let found = false;
          for (let i = 0; i < currentLanes.length; i++) {
            // No overlap with any course in this lane. Insert the
            // new course in this lane
            if (
              !checkOverlap(currentLanes[i], newBlockStartTime, newBlockEndTime)
            ) {
              newClusters[[insertAt[1][0]]].lanes[i].splice(
                // Find the position within the lane to insert
                // the course
                findCourseInsertPos(
                  newClusters[[insertAt[1][0]]].lanes[i],
                  newBlockStartTime
                ),
                0,
                newBlockInfo
              );
              // Determine the new cluster start and end times
              newClusters[[insertAt[1][0]]].startTime = Math.min(
                newClusters[[insertAt[1][0]]].startTime,
                newBlockStartTime
              );
              newClusters[[insertAt[1][0]]].endTime = Math.max(
                newClusters[[insertAt[1][0]]].endTime,
                newBlockEndTime
              );
              found = true;
              break;
            }
          }
          // Overlap with all lanes, insert a new lane.
          if (!found) {
            newClusters[[insertAt[1][0]]].lanes.splice(
              findLaneInsertPos(
                newClusters[[insertAt[1][0]]].lanes,
                newBlockStartTime
              ),
              0,
              [newBlockInfo]
            );
            // Determine the new cluster start and end times
            newClusters[[insertAt[1][0]]].startTime = Math.min(
              newClusters[[insertAt[1][0]]].startTime,
              newBlockStartTime
            );
            newClusters[[insertAt[1][0]]].endTime = Math.max(
              newClusters[[insertAt[1][0]]].endTime,
              newBlockEndTime
            );
          }
        }
      }
      // Overlap with multiple clusters. Merge these clusters together
      else {
        // Array of indexes of the clusters to merge e.g. [1,2]
        // NOTE: These clusters do not overlap
        const clustersToMerge = insertAt[1];
        // finalCluster is a cluster (object) that contains the first
        // cluster in the array of clusters to merge
        let finalCluster = newClusters[clustersToMerge[0]];
        // Splice to skip the first element since its already included
        // in finalCluster. For each cluster to merge
        clustersToMerge.slice(1).forEach((clusterToMerge) => {
          // For each lane in the cluster to merge
          newClusters[clusterToMerge].lanes.forEach((lane, index) => {
            // For each course in each lane
            lane.forEach((course) => {
              // Insert the course into the lane number that it
              // had in its old cluster. Since the clusters did
              // not overlap, courses in the same lane will not
              // overlap here. If the old lane number exceeds
              // the lane numbers in finalCluster, make a new
              // lane
              if (index < finalCluster.lanes.length) {
                finalCluster.lanes[index].push(course);
              } else {
                finalCluster.lanes.push([course]);
              }
              // Determine the new cluster start and end times
              finalCluster.startTime = Math.min(
                finalCluster.startTime,
                course.startTime
              );
              finalCluster.endTime = Math.max(
                finalCluster.endTime,
                course.endTime
              );
            });
          });
        });
        // Insert the new course in a new lane
        finalCluster.lanes.push([newBlockInfo]);
        // Determine the new cluster start and end times
        finalCluster.startTime = Math.min(
          finalCluster.startTime,
          newBlockStartTime
        );
        finalCluster.endTime = Math.max(finalCluster.endTime, newBlockEndTime);
        // Place the modified cluster back and remove the cluster that
        // got merged
        newClusters.splice(
          clustersToMerge[0],
          clustersToMerge.length,
          finalCluster
        );
      }
    }
    // No overlap, create a new cluster of 1 course
    else {
      newClusters.splice(insertAt[1][0], 0, {
        startTime: newBlockStartTime,
        endTime: newBlockEndTime,
        lanes: [[newBlockInfo]],
      });
    }
    return newClusters;
  }

  // Look through all the clusters and find overlap
  // Returns a 2-element array of the form:
  //      [overlap?: boolean, insertAtIndex: array]
  //          If no overlap, insertAtIndex is a one-element array with the
  //          index to insert the new block at. If overlap, insertAtIndex
  //          is a multi-element array specifying which clusters the new block
  //          overlaps with
  function findInsertToClusterIdx(
    clusters,
    newBlockStartTime,
    newBlockEndTime
  ) {
    let retVal = [false, [0]]; // [overlap?, insertAtIndex]
    for (let i = 0; i < clusters.length; i++) {
      // new block ends before current cluster start. Stop searching.
      if (newBlockEndTime < clusters[i].startTime) {
        // If there is overlap
        if (retVal[0]) {
          break;
        }
        // If there is no overlap
        return [false, [i]];
      }
      // new block starts after cluster end. Check next cluster
      else if (newBlockStartTime >= clusters[i].endTime) {
        retVal = [false, [i]];
        continue;
      }
      // new block starts before cluster end but after cluster start
      // OR new block ends after cluster starts but starts before
      // cluster starts
      else if (
        newBlockStartTime >= clusters[i].startTime ||
        newBlockEndTime > clusters[i].startTime
      ) {
        // If already overlapped with another cluster, add the index of
        // the new cluster into the array of indexes of overlapped
        // clusters
        if (retVal[0]) {
          retVal[1].push(i);
        }
        // If not already overlapped with another cluster, create the
        // array of indexes of overlapped clusters
        else {
          retVal = [true, [i]];
        }
      }
    }
    // If it reaches here, that means that a new cluster should be created
    // at the end of the clusters array, after the last index.
    if (!retVal[0]) {
      retVal[1][0] += 1;
    }
    return retVal;
  }

  function findLaneInsertPos(lanes, startTime) {
    let i = 0;
    for (; i < lanes.length; i++) {
      // lanes[i] is the lane number. [0] indexes into the first course
      // in the lane which is the earliest course in the lane.
      // If the lane's start time is after the current start time,
      // no overlap possible, break. Else keep searching.
      if (lanes[i][0].startTime > startTime) {
        break;
      }
    }
    return i;
  }

  // Find the position within the lane to insert the course
  function findCourseInsertPos(courses, startTime) {
    let i = 0;
    for (; i < courses.length; i++) {
      if (courses[i].startTime > startTime) {
        break;
      }
    }
    return i;
  }

  // Check if there is overlap with any course in the lane. True if overlap.
  // False if no overlap.
  function checkOverlap(lane, startTime, endTime) {
    for (let i = 0; i < lane.length; i++) {
      if (
        (startTime >= lane[i].startTime && startTime < lane[i].endTime) ||
        (endTime > lane[i].startTime && endTime <= lane[i].endTime)
      ) {
        return true;
      }
    }
    return false;
  }

  return (
    <Box mt={0.5}>
      {/* The event blocks are positioned above (z-axis) the actual grid */}
      <div style={{ position: "absolute", width: width }}>
        <Grid container spacing={0}>
          <Grid item xs={1} />
          <Grid item xs key={"Mon"} id={"Mon"} className={classes.eventSpace}>
            <DayColumn dayBlock={monBlocks} minTime={tableRange[0] / 100} />
          </Grid>
          <Grid item xs key={"Tue"} id={"Tue"} className={classes.eventSpace}>
            <DayColumn dayBlock={tueBlocks} minTime={tableRange[0] / 100} />
          </Grid>
          <Grid item xs key={"Wed"} id={"Wed"} className={classes.eventSpace}>
            <DayColumn dayBlock={wedBlocks} minTime={tableRange[0] / 100} />
          </Grid>
          <Grid item xs key={"Thur"} id={"Thur"} className={classes.eventSpace}>
            <DayColumn dayBlock={thurBlocks} minTime={tableRange[0] / 100} />
          </Grid>
          <Grid item xs key={"Fri"} id={"Fri"} className={classes.eventSpace}>
            <DayColumn dayBlock={friBlocks} minTime={tableRange[0] / 100} />
          </Grid>
        </Grid>
      </div>
      {/* The actual grid with day and time labels: */}
      <div ref={timeTableRef} className={`${classes.componentBackground}`}>
        <Grid container spacing={0} style={{ textAlign: "center" }}>
          <Grid
            item
            xs={1}
            className={`${classes.tableHeaderCells} ${classes.tableAllCells}`}
            style={{ borderTopWidth: "1px" }}
          ></Grid>
          {days.map((day) => (
            <Grid
              key={day}
              item
              xs
              className={`${day !== "Fri" ? null : classes.tableRightBorder} ${
                classes.tableHeaderCells
              } ${classes.tableAllCells}`}
              style={{ borderTopWidth: "1px" }}
            >
              {day}
            </Grid>
          ))}
        </Grid>
        {createTimes(tableRange[0], tableRange[1]).map((time, idx) => (
          <Grid key={idx} container spacing={0}>
            <Grid item xs={1} className={`${classes.tableAllCells}`}>
              <Typography variant="body2" align="center">
                {time}
              </Typography>
            </Grid>
            {days.map((day) => (
              <Grid
                key={day}
                item
                xs
                className={`${
                  day !== "Fri" ? null : classes.tableRightBorder
                } ${classes.tableAllCells}`}
              ></Grid>
            ))}
          </Grid>
        ))}
      </div>
      <AlertDialog open={openAlert} handleClose={handleClose} />
    </Box>
  );
}

export default SchedulerTable;
