import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core";
import ChipGroup from "./ChipGroup";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Accordion from "@material-ui/core/Accordion";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import Box from "@material-ui/core/Box";
import Chip from "@material-ui/core/Chip";
import Divider from "@material-ui/core/Divider";
import Typography from "@material-ui/core/Typography";
import Cookies from "js-cookie";

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
      ["IS", "Multi"],
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
    if (fieldName === "fitCurr" && Cookies.get("sessionid") === undefined) {
      props.openLoginDialog("fitCurr");
    } else {
      let newValue = props.formValues[fieldName] === "" ? value : "";
      props.setFormValues({
        ...props.formValues,
        [fieldName]: newValue,
      });
    }
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
        props.formValues.exIndCEL ||
        props.formValues.fitCurr
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
                        key={`detail-${fieldName}-${options}`}
                      />
                    </Box>
                    <Divider orientation="vertical" flexItem />
                  </div>
                );
              } else {
                return <div></div>;
              }
            })}
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}

export default SearchFilters;
