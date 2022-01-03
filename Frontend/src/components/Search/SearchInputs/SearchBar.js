import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Select from "@material-ui/core/Select";
import Box from "@material-ui/core/Box";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import { useMediaQuery, useTheme } from "@material-ui/core";
import DoubleArrowIcon from "@material-ui/icons/DoubleArrow";

function SearchBar(props) {
  // PROPS:
  //  setFormValues: Function to change the form values that is sent to the server
  //  formValues: Current form values that the user has input

  const theme = useTheme();
  const useStyles = makeStyles((theme) => ({
    ...theme.spreadThis,
    selectEmpty: {
      marginTop: theme.spacing(2),
    },
    heading: {
      fontSize: theme.typography.pxToRem(15),
      fontWeight: theme.typography.fontWeightRegular,
    },
    root: {
      display: "flex",
      justifyContent: "center",
      flexWrap: "wrap",
      "& > *": {
        margin: theme.spacing(0.5),
      },
    },
  }));

  const courseCodes = JSON.parse(
    document.getElementById("course_codes").textContent
  );

  const classes = useStyles();
  const [textField, setTextField] = useState("");
  const [deptField, setDeptField] = useState("");
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name === "department") {
      setDeptField(value);
    } else {
      setTextField(value);
    }
  };
  const handleSubmit = (event) => {
    event.preventDefault();
    props.setFormValues({
      ...props.formValues,
      department: deptField,
      searchTerms: textField,
    });
  };
  return (
    <div>
      <form noValidate autoComplete="off" onSubmit={handleSubmit}>
        <Box display="flex">
          <Box m={0.5} ml={0}>
            <FormControl
              variant="outlined"
              color="secondary"
              className={classes.componentBackground}
            >
              <InputLabel id="department-label">Dept</InputLabel>
              <Select
                native
                labelId="Department"
                name="department"
                id="department"
                value={deptField}
                onChange={handleInputChange}
                label="Department"
              >
                <option aria-label="Any" value="" />
                {courseCodes.map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box flexGrow={1} m={0.5}>
            <TextField
              id="search-bar"
              name="searchTerms"
              label="Search"
              type="text"
              value={textField}
              onChange={handleInputChange}
              variant="outlined"
              fullWidth
              color="secondary"
              className={classes.componentBackground}
            />
          </Box>
          <Box display="flex" m={0.5} mr={0}>
            <Button variant="contained" type="submit" color="secondary">
              {useMediaQuery(theme.breakpoints.only("xs")) ? (
                <DoubleArrowIcon />
              ) : (
                "Submit"
              )}
            </Button>
          </Box>
        </Box>
      </form>
    </div>
  );
}

export default SearchBar;
