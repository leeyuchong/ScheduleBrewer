import React, { useState, useEffect } from "react";
import {
  makeStyles,
  // MenuItem,
  // Select,
  // InputLabel,
  // FormControl,
  // FormHelperText,
} from "@material-ui/core";
import ChipGroup from "./ChipGroup";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Accordion from "@material-ui/core/Accordion";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import Box from "@material-ui/core/Box";
import Select from "@material-ui/core/Select";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Chip from "@material-ui/core/Chip";
import Divider from "@material-ui/core/Divider";
import Typography from "@material-ui/core/Typography";

function SearchFilters(props) {
  // PROPS:
  //  setFormValues: Function to change the form values that is sent to the server
  //  formValues: Current form values that the user has input

  const [filterSelected, setFilterSelected] = useState(false);
  const useStyles = makeStyles((theme) => ({
    ...theme.spreadThis,
    heading: {
      fontSize: theme.typography.pxToRem(15),
      fontWeight: theme.typography.fontWeightRegular,
    },
    // roundedSelect: {
    //   borderRadius: "16px",
    //   height: "32px",
    //   position: "absolute",
    //   verticalAlign: "top",
    //   alignItems: "center",
    //   justifyContent: "center",
    //   boxSizing: "border-box",
    //   "&:focus": {
    //     background: "red",
    //   },
    //   // select: {
    //   //   "&:focus": {
    //   //     background: "red",
    //   //   },
    //   // },
    // },
    // fuck: {
    //   background: "none",
    //   "&:focus": {
    //     background: "red",
    //   },
    // },
    // roundedSelectText: {
    //   fontSize: "0.8125rem",
    //   marginTop: "-10px",
    //   "&.shrink": {
    //     marginTop: "0px",
    //   },
    // },
  }));
  const classes = useStyles();
  const fields = {
    gradeOption: [
      ["NR", "NRO"],
      ["SU", "SU"],
    ],
    courseFormat: [
      ["CLS", "Class"],
      ["INT", "Intensive"],
      ["OTH", "Other"],
    ],
    units: [
      [0.5, "0.5 units"],
      [1, "1 unit"],
      [1.5, "1.5 units"],
    ],
    day: [
      ["M", "Mon"],
      ["T", "Tue"],
      ["W", "Wed"],
      ["R", "Thur"],
      ["F", "Fri"],
    ],
    courseLength: [
      [2, "1st 6wk"],
      [3, "2nd 6wk"],
      [1, "Semester Long"],
    ],
    division: [
      ["AR", "Arts"],
      ["FL", "Lang & Lit"],
      ["SS", "Social"],
      ["NS", "Natural"],
      ["IS", "Multi"]
    ],
    writingSem: [[true, "Writing Sem"]],
    yearLong: [[true, "Year Long"]],
    quant: [[true, "Quantitative"]],
    lang: [[true, "Language"]],
    specialPerm: [[true, "Special Permission"]],
    exIndCEL: [[true, "Exclude Ind Study and CEL"]],
    fitCurr: [[true, "Fits my current schedule"]],
  };

  const handleChipClick = (fieldName, value) => {
    let newValue = props.formValues[fieldName] === "" ? value : "";
    props.setFormValues({
      ...props.formValues,
      [fieldName]: newValue,
    });
  };

  useEffect(() => {
    setFilterSelected(
      props.formValues.writingSem ||
        props.formValues.gradeOption !== "" ||
        props.formValues.yearLong ||
        props.formValues.quant ||
        props.formValues.lang ||
        props.formValues.specialPerm ||
        props.formValues.courseFormat !== "" ||
        props.formValues.units !== "" ||
        props.formValues.day !== "" ||
        props.formValues.courseLength !== "" ||
        props.formValues.division !== "" ||
        props.formValues.exIndCEL
    );
  }, [props.formValues]);

  const getLabel = (fieldName, fieldValue) => {
    const selected = fields[fieldName].filter((option) => {
      return option[0] === fieldValue;
    });
    return selected[0][1];
  };

  return (
    <Box px={0} mt={0.5}>
      <Accordion className={classes.componentBackground}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="filters"
          id="search-filters"
        >
          <Box
            display="flex"
            flexDirection="row"
            flexWrap="wrap"
            alignItems="center"
          >
            <Typography className={classes.heading}>Filters:&nbsp;</Typography>
            {filterSelected ? (
              <Box display="flex" flexDirection="row" flexWrap="wrap">
                {Object.entries(fields).map(([fieldName, value]) => {
                  if (props.formValues[fieldName] != "") {
                    return (
                      <Box key={value} mx={0.1}>
                        { props.formValues[fieldName] == "time" ?
                        (<Chip
                          {...<FormControl
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
                            </FormControl>}
                        />
                        ) : (
                        <Chip
                          label={getLabel(
                            fieldName,
                            props.formValues[fieldName]
                          )}
                          clickable
                          variant="default"
                          id={value}
                          onClick={(event) => {
                            event.stopPropagation();
                            handleChipClick(
                              fieldName,
                              props.formValues[fieldName]
                            );
                          }}
                          onDelete={(event) => {
                            event.stopPropagation();
                            handleChipClick(
                              fieldName,
                              props.formValues[fieldName]
                            );
                          }}
                        />
                        )}
                      </Box>
                    );
                  } else {
                    return <div></div>;
                  }
                })}
              </Box>
            ) : (
              <Typography className={classes.heading}>
                <em>No filters selected</em>
              </Typography>
            )}
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box display="flex" flexDirection="row" flexWrap="wrap">
            {Object.entries(fields).map(([fieldName, options]) => {
              if (props.formValues[fieldName] === "") {
                return (
                  <div key={fieldName}>
                    <Box mx={1} my={0.4}>
                      <ChipGroup
                        field={fieldName}
                        options={options}
                        handleClick={handleChipClick}
                      />
                    </Box>
                    <Divider orientation="vertical" flexItem />
                  </div>
                );
              } else {
                return <div></div>;
              }
            })}
            {/* <Box mx={1} my={0.4}>
              <FormControl variant="outlined" className={classes.roundedSelect}>
                <InputLabel
                  id="demo-simple-select-outlined-label"
                  // className={classes.roundedSelectText}
                  classes={{
                    root: classes.roundedSelectText,
                    shrink: "shrink",
                  }}
                >
                  Division
                </InputLabel>
                <Select
                  labelId="demo-simple-select-outlined-label"
                  id="demo-simple-select-outlined"
                  value=""
                  // onChange={handleChange}
                  label="Division"
                  // className={classes.roundedSelect}
                  InputProps={{
                    classes: { ".MuiInputBase-root": classes.roundedSelect },
                  }}
                  classes={{
                    root: classes.fuck,
                    focus: "focus",
                  }}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  <MenuItem value={10}>Ten</MenuItem>
                  <MenuItem value={20}>Twenty</MenuItem>
                  <MenuItem value={30}>Thirty</MenuItem>
                </Select>
              </FormControl>
            </Box> */}
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}

export default SearchFilters;
