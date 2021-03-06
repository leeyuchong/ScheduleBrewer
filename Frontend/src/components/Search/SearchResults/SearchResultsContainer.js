import React, { useState, useEffect } from "react";
import ResultItemComponent from "./ResultItemComponent";
import Pagination from "@material-ui/lab/Pagination";
import Cookies from "js-cookie";
import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core";
import LinearProgress from "@material-ui/core/LinearProgress";
import Typography from "@material-ui/core/Typography";

function SearchResultsContainer(props) {
  // PROPS:
  //  searchURL: String of the current search url
  //  openLoginDialog: Function to open a dialogue and ask the user to login

  const useStyles = makeStyles((theme) => ({
    root: {
      width: "100%",
      "& > * + *": {
        marginTop: theme.spacing(2),
      },
    },
  }));
  const pageSize = 10;
  const [results, setResults] = useState([]);
  const [numPages, setNumPages] = useState(0);
  const [currPage, setCurrPage] = useState(1);
  const [csrfToken, setCSRFToken] = useState(Cookies.get("csrftoken"));
  const [isLoading, setIsLoading] = useState(true);
  const classes = useStyles();
  useEffect(() => {
    setCurrPage(1);
    fetch(props.searchURL)
      .then((response) => {
        setIsLoading(true);
        return response.json();
      })
      .then((data) => {
        setResults(data.results);
        setNumPages(data.count);
        setIsLoading(false);
      });
  }, [props.searchURL]);
  useEffect(() => {
    fetch(`/getCSRF/`, {
      method: "GET",
      credentials: "include",
    }).then((response) => {
      setCSRFToken(Cookies.get("csrftoken"));
    });
  }, [csrfToken]);
  const onPageChange = (event, value) => {
    setCurrPage(value);
    fetch(props.searchURL + `&page=${value}`)
      .then((response) => response.json())
      .then((data) => {
        setResults(data.results);
      });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <div>
      {isLoading ? (
        <div>
          <LinearProgress className={classes.root} color="secondary" />
        </div>
      ) : (
        <div>
          <Box borderRadius={4}>
            {results.map((course) => (
              <ResultItemComponent
                key={course.courseID}
                course={course}
                csrfToken={csrfToken}
                openLoginDialog={props.openLoginDialog}
              />
            ))}
          </Box>
          <Box display="flex" justifyContent="center" mt={1}>
            <Pagination
              count={Math.ceil(numPages / pageSize)}
              onChange={onPageChange}
              page={currPage}
            />
          </Box>
          <Box display="flex" justifyContent="center" mt={1}>
            {results.length == 0 ? (
              <Typography className={classes.heading}>
                <em>There are no matches for your search</em>
              </Typography>
            ) : (
              <Typography className={classes.heading}>
                <em>Good luck choosing your classes!</em>
              </Typography>
            )}
          </Box>
        </div>
      )}
    </div>
  );
}

export default SearchResultsContainer;
