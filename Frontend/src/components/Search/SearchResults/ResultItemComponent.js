import React, { useContext, useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import BadgeRect from "../../BadgeRect/BadgeComponent";
import Button from "@material-ui/core/Button";
import AddBoxIcon from "@material-ui/icons/AddBox";
import Grid from "@material-ui/core/Grid";
import DeleteIcon from "@material-ui/icons/Delete";
import { SavedCourseContext } from "../../Utils/SavedCourseContext";
import randomColor from "randomcolor";
import createDOMPurify from "dompurify";
import Box from "@material-ui/core/Box";
import Cookies from "js-cookie";

const useStyles = makeStyles((theme) => ({
  ...theme.spreadThis,
  root: {
    width: "100%",
    textAlign: "left",
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightBold,
  },
}));

function ResultItemComponent(props) {
  // PROPS:
  //  csrfToken: The csrf token from the Django server
  //  course: Object of the course details
  //  openLoginDialog: Function to open a dialogue and ask the user to login

  const classes = useStyles();
  const [savedCourses, setSavedCourses] = useContext(SavedCourseContext);
  const [isCourseSaved, setIsCourseSaved] = useState(false);
  const DOMPurify = createDOMPurify(window);
  const saveCourse = (courseID) => {
    if (Cookies.get("sessionid") !== undefined) {
      const url = `/api/save-course`;
      let selectedCourse = new FormData();
      selectedCourse.set("course", courseID);
      fetch(url, {
        credentials: "include",
        method: "POST",
        mode: "cors",
        headers: {
          // 'Accept': 'application/json',
          // 'Content-Type': 'application/json',
          "X-CSRFToken": props.csrfToken,
          authorization: Cookies.get("sessionid"),
        },
        body: selectedCourse,
      })
        .then((result) => {
          if (result.status === 200) {
            setSavedCourses((state) => ({
              ...state,
              [courseID]: {
                ...props.course,
                blockColor: randomColor({
                  luminosity: "light",
                  format: "rgbArray",
                }),
              },
            }));
          }
        })
        .catch((error) => {
          console.log("Error, failed to save course: ", error);
        });
    } else {
      props.openLoginDialog();
    }
  };

  const deleteCourse = (courseID) => {
    const url = `/api/delete-course/${courseID}/`;
    fetch(url, {
      credentials: "include",
      method: "DELETE",
      mode: "cors",
      headers: {
        "X-CSRFToken": props.csrfToken,
        authorization: Cookies.get("sessionid"),
      },
    })
      .then((result) => {
        if (result.status === 200) {
          let prevSavedCourses = { ...savedCourses };
          delete prevSavedCourses[courseID];
          setSavedCourses(prevSavedCourses);
          setIsCourseSaved(false);
        }
      })
      .catch((error) => {
        console.log("Error, failed to delete course: ", error);
      });
  };

  useEffect(() => {
    setIsCourseSaved(savedCourses.hasOwnProperty(props.course.courseID));
  }, [props.course.courseID, savedCourses]);

  return (
    <Accordion
      TransitionProps={{ unmountOnExit: true }}
      key={props.course.courseID}
      elevation={3}
      className={classes.componentBackground}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls={props.course.courseID}
        id={`accord-${props.course.courseID}`}
      >
        <Grid container justify="space-between" spacing={0}>
          <Grid item xs={8} sm={9}>
            <Grid container direction="column" spacing={0}>
              <Box mr={1}>
                <Typography className={classes.heading} align="left">
                  {props.course.courseID} - {props.course.title}
                </Typography>
              </Box>
              <Box mr={0} pr={0} style={{ textAlign: "left" }}>
                {props.course.requests !== null ? (
                  <BadgeRect
                    content={`Req: ${props.course.requests}`}
                    badgeStyle={
                      props.course.requests < props.course.max_enr
                        ? "badgeGreen"
                        : "badgeRed"
                    }
                  />
                ) : (
                  <BadgeRect
                    content={`Avail: ${props.course.avl}`}
                    badgeStyle={
                      props.course.avl > 0 ? "badgeGreen" : "badgeRed"
                    }
                  />
                )}
                {props.course.gm !== null ? (
                  <BadgeRect content={props.course.gm} badgeStyle="badgeBlue" />
                ) : null}
                <BadgeRect
                  content={props.course.format}
                  badgeStyle="badgeLightBlue"
                />
                <BadgeRect
                  content={props.course.division}
                  badgeStyle="badgeGrey"
                />
                <BadgeRect
                  content={`${props.course.units} ${
                    props.course.units === 1 ? "unit " : "units "
                  }`}
                  badgeStyle="badgeBrown"
                />
                {props.course.yl === 1 ? (
                  <BadgeRect content="Year Long" badgeStyle="badgePink" />
                ) : null}
                {props.course.fr === 1 ? (
                  <BadgeRect content="Writing Sem" badgeStyle="badgeOrange" />
                ) : null}
                {props.course.la === 1 ? (
                  <BadgeRect content="Language" badgeStyle="badgePurple" />
                ) : null}
                {props.course.qa === 1 ? (
                  <BadgeRect content="Quantitative" badgeStyle="badgeYellow" />
                ) : null}
                {props.course.prereq ? (
                  <BadgeRect content="Prereq" badgeStyle="badgeTeal" />
                ) : null}
                {props.course.xlist !== null ? (
                  <BadgeRect
                    content={props.course.xlist}
                    badgeStyle="badgeGrey"
                  />
                ) : null}
              </Box>
              <Grid container>
                <Grid item xs>
                  <Typography variant="subtitle2" align="left">
                    {props.course.d1} {props.course.time1}
                    {props.course.d2
                      ? ` | ${props.course.d2} ${props.course.time2}`
                      : null}
                    {props.course.instructor
                      ? ` | ${props.course.instructor}`
                      : null}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid
            item
            xs
            style={{
              alignItems: "center",
              justifyContent: "space-between",
              display: "flex",
            }}
          >
            <div></div>
            <Button
              variant="outlined"
              color="secondary"
              className={classes.saveButton}
              startIcon={isCourseSaved ? <DeleteIcon /> : <AddBoxIcon />}
              onClick={(event) => {
                event.stopPropagation();
                isCourseSaved
                  ? deleteCourse(props.course.courseID)
                  : saveCourse(props.course.courseID);
              }}
              align="right"
            >
              {isCourseSaved ? "Del" : "Save"}
            </Button>
          </Grid>
        </Grid>
      </AccordionSummary>
      <AccordionDetails>
        <Typography align="left">
          {props.course.sp === 1 ? (
            <span>
              <b>Special permission required</b> |{" "}
            </span>
          ) : null}
          <b> Max = {props.course.max_enr} </b> |{" "}
          <b>Enrolled = {props.course.enr} </b>
          {props.course.wl !== 0 ? (
            <span>
              {" "}
              | <b> Waitlist = {props.course.wl} </b>
            </span>
          ) : null}
          {props.course.limits !== null ? (
            <span>
              {" "}
              | <b> Course Limits = {props.course.limits} </b>
            </span>
          ) : null}
          {props.course.notes !== null ? (
            <span>
              <br />
              {props.course.notes}
            </span>
          ) : null}
          <br />
          <div
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(props.course.description),
            }}
          />
        </Typography>
      </AccordionDetails>
    </Accordion>
  );
}

export default ResultItemComponent;
