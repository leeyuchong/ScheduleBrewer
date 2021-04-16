import { makeStyles } from '@material-ui/core'
import React, { useState, useEffect } from 'react'
import ChipGroup from './ChipGroup'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Accordion from '@material-ui/core/Accordion';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import Box from '@material-ui/core/Box';
import Chip from '@material-ui/core/Chip';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';

function SearchFilters(props) {
    const [filterSelected, setFilterSelected] = useState(false)

    // const booleanFields = [["writingSem", "Writing Sem"], ["yearLong", "Year Long"], ["quant", "Quantitative"], ["lang", "Language"], ["specialPerm", "Special Permission"]]
    // [value, label]
    const useStyles = makeStyles((theme) => ({
        ...theme.spreadThis,
        heading: {
            fontSize: theme.typography.pxToRem(15),
            fontWeight: theme.typography.fontWeightRegular,
          },
      }));
    const classes = useStyles()
    const fields = {
        gradeOption: [["NR", "NRO"], ["SU", "SU"]],
        courseFormat: [["CLS", "Class"], ["INT", "Intensive"], ["OTH", "Other"]],
        units: [[0.5, "0.5 units"], [1, "1 unit"], [1.5, "1.5 units"]],
        day: [["M", "Mon"], ["T", "Tue"], ["W", "Wed"], ["R", "Thur"], ["F", "Fri"]],
        writingSem: [[true, "Writing Sem"]], 
        yearLong: [[true, "Year Long"]],
        quant: [[true, "Quantitative"]],
        lang: [[true, "Language"]],
        specialPerm: [[true, "Special Permission"]]
    }

    const handleChipClick = (fieldName, value) => {
        let newValue = props.formValues[fieldName] === "" ? value : ""
        props.setFormValues({
            ...props.formValues, 
            [fieldName]: newValue
        })
    }

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
            props.formValues.day !== ""
        )
    }, [props.formValues])
    
    const getLabel = (fieldName, fieldValue) => {
        const selected = fields[fieldName].filter((option) => {
            return(option[0] === fieldValue)
        })
        return selected[0][1]
    }

    return (
        <Box px={0} mt={0.5}>
            <Accordion className={classes.componentBackground}>
                <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="filters"
                id="search-filters"
                >
                <Box display="flex" flexDirection="row" flexWrap="wrap" alignItems="center">
                    <Typography className={classes.heading}>Filters:&nbsp;</Typography>
                    {filterSelected ? 
                        <Box display="flex" flexDirection="row" flexWrap="wrap">
                            {Object.entries(fields).map(([fieldName, value]) => {
                            if(props.formValues[fieldName]!=""){
                                return(
                                    <Box mx={0.1}>
                                        <Chip 
                                            label={getLabel(fieldName, props.formValues[fieldName])} 
                                            clickable 
                                            variant="default"
                                            id={value} 
                                            onClick={(event) => {
                                                event.stopPropagation()
                                                handleChipClick(fieldName, props.formValues[fieldName])
                                            }}
                                            onDelete = {(event) => {
                                                event.stopPropagation()
                                                handleChipClick(fieldName, props.formValues[fieldName])
                                            }}
                                        />
                                    </Box>
                                )
                            }
                            else{
                                return(<div></div>)
                            }
                            })}
                        </Box> 
                     : 
                    <Typography className={classes.heading}><em>No filters selected</em></Typography>
                }
                </Box>
                </AccordionSummary>
                <AccordionDetails>
                    <Box display="flex" flexDirection="row" flexWrap="wrap" >
                        {Object.entries(fields).map(([fieldName, options]) => {
                            if(props.formValues[fieldName]===""){
                                return(
                                    <div>
                                        <Box mx={1} my={0.4}>
                                            <ChipGroup 
                                                field={fieldName}
                                                options={options}
                                                handleClick={handleChipClick}
                                            /> 
                                        </Box>
                                        <Divider orientation="vertical" flexItem/>
                                    </div>
                                )
                            }
                            else{
                                return(<div></div>)
                            }
                        })}
                    </Box>
                </AccordionDetails>
            </Accordion>
        </Box>
    )
}

export default SearchFilters