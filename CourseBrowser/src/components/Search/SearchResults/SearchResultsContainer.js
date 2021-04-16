import React, { useState, useEffect } from "react"
import ResultItemComponent from './ResultItemComponent'
import Pagination from '@material-ui/lab/Pagination';
import Cookies from 'js-cookie'
import Box from '@material-ui/core/Box';
import { makeStyles } from "@material-ui/core";
import LinearProgress from '@material-ui/core/LinearProgress';

// const searchURL = "http://127.0.0.1:8000/api/search?searchTerm=CMPU"

function SearchResultsContainer(props) {
    const useStyles = makeStyles((theme) => ({
        root: {
            width: '100%',
            '& > * + *': {
              marginTop: theme.spacing(2),
            },
        },
    }));
      
    const pageSize = 10
    const [results, setResults] = useState([])
    const [numPages, setNumPages] = useState(0)
    const [currPage, setCurrPage] = useState(1)
    const [csrfToken, setCSRFToken] = useState(Cookies.get('csrftoken'))
    const [isLoading, setIsLoading] = useState(true)
    const classes = useStyles()
    useEffect(() => {
        setCurrPage(1)
        fetch(props.searchURL).then(response => {
            setIsLoading(true)
            return response.json()
        }).then(data => {
            setResults(data.results)
            setNumPages(data.count)
            setIsLoading(false)
        })
    }, [props.searchURL])

    useEffect(() => {
        fetch("http://127.0.0.1:8000/getCSRF/", {
            method: 'GET',
            credentials: 'include'
        }).then(response => {
            setCSRFToken(Cookies.get('csrftoken'))
        })
    }, [csrfToken]) // delete this?

    const onPageChange = (event, value) => {
        setCurrPage(value)
        fetch(props.searchURL+`&page=${value}`).then(response => response.json()).then(data => {
            setResults(data.results)
        })
    }
    return (
        <div>
            {isLoading ? 
                <div>
                    <LinearProgress className={classes.root} color="secondary"/>
                </div>
                : 
                <div>
                    <Box borderRadius={4}>
                        {results.map((course) => <ResultItemComponent course={course} csrfToken={csrfToken} />)}
                    </Box>
                    <Box display="flex" justifyContent="center" mt={1}>
                        <Pagination count={Math.ceil(numPages/pageSize)} onChange={onPageChange} page={currPage}/>
                    </Box>
                </div>
            }
        </div>
    )
}

export default SearchResultsContainer