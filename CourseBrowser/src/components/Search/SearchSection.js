import React, { useState } from "react"
import SearchInputsContainer from "./SearchInputs/SearchInputsContainer"
import SearchResults from './SearchResults/SearchResultsContainer'
import Box from '@material-ui/core/Box';

function SearchSection(props) {
    const [searchURL, setSearchURL] = useState("https://schedulebrewer.ml/api/search/?")
    return (
        <Box >
            <SearchInputsContainer setSearchURL={setSearchURL}/>
            <br/>
            <SearchResults searchURL={searchURL} setNumberSearchResults={props.setNumberSearchResults}/>
        </Box>
    )
}

export default SearchSection
