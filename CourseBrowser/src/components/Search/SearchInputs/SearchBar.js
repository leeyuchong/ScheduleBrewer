import React, { useState } from "react";
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Select from '@material-ui/core/Select';
import Box from '@material-ui/core/Box';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import { useMediaQuery, useTheme } from "@material-ui/core";
import DoubleArrowIcon from '@material-ui/icons/DoubleArrow';

function SearchBar(props) {
    const theme = useTheme()
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
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            '& > *': {
              margin: theme.spacing(0.5),
            },
          },
      }));
      
    const courseCodes = ["AFRS", "AMCL", "AMST", "ANSO", "ANTH", "AFRS", "ART",
        "ARTH", "ARTS", "ASIA", "ASL", "ASTR", "BIOC", "BIOL", "BIPS", "CHEM", 
        "CHIN", "CHJA", "CLAN", "CLAS", "CLGR", "CLLA", "CLCS", "CMPU", "COGS",
        "CREO", "DANC", "DRAM", "ECON", "EDUC", "ENGL", "ENST", "ENVI", "ESCI",
        "ESSC", "FFS", "FILM", "FREN", "GEAN", "GEOG", "GEOL", "GERM", "GREK",
        "GRST", "HEBR", "HIND", "HISP", "HIST", "INDP", "INTD", "INTL", "IRSH",
        "ITAL", "JAPA", "JWST", "ASIA", "LALS", "LAST", "LATI", "MATH", "MEDS",
        "MRST", "MSDP", "MUSI", "NEUR", "PERS", "PHED", "PHIL", "PHYS", "POLI",
        "PORT", "PSYC", "PSYC", "RELI", "RUSS", "SOCI", "STS", "SWAH", "SWED",
        "TURK", "URBS", "VICT", "WMST", "YIDD"]
    
    const classes = useStyles();
    const [textField, setTextField] = useState("");
    const [deptField, setDeptField] = useState("");
    const handleInputChange = (event) => {
        const {name, value} = event.target;
        if(name==="department"){
            setDeptField(value);
        }
        else{
            setTextField(value);
        }
    }
    const handleSubmit = (event) => {
        event.preventDefault();
        props.setFormValues({
            ...props.formValues,
            department: deptField,
            searchTerms: textField,
        });
    }
    const xsScreen = useMediaQuery(theme.breakpoints.only('xs'));
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
                                <option aria-label="None" value=""/>
                                {courseCodes.map((code) => 
                                    <option value={code}>{code}</option>)}
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
                        <Button 
                            variant="contained" 
                            type="submit" 
                            color="secondary"
                        >
                            {xsScreen ? <DoubleArrowIcon/> : "Submit"}
                        </Button>
                    </Box>
                </Box>
            </form>
        </div>
    );
}

export default SearchBar;
