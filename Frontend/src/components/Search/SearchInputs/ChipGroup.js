import React from "react";
import Box from "@material-ui/core/Box";
import Chip from "@material-ui/core/Chip";

function ChipGroup(props) {
  // PROPS:
  //  field: The name of the field, ie gradeOption, courseFormat, units, day
  //  options: Array of options for the field. Each option is an array of the form [value, name]
  //  handleClick: A function to handle the chip click and change the formValues. Takes in the value
  return (
    <Box display="flex">
      {props.options.map((option) => (
        <Box key={option[0]} mx={0.1}>
          <Chip
            label={option[1]}
            clickable
            variant="outlined"
            id={option[0].toString()}
            onClick={() => props.handleClick(props.field, option[0])}
          />
        </Box>
      ))}
    </Box>
  );
}

export default ChipGroup;
