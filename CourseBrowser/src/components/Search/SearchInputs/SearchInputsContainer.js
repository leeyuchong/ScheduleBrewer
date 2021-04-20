import React, { useState, useEffect } from 'react'
import SearchBar from './SearchBar'
import SearchFilters from './SearchFilters'

function SearchInputsContainer(props) {
    const defaultValues = {
        searchTerms: "",
        department: "",
        writingSem: "",
        gradeOption: "",
        yearLong: "",
        quant: "",
        lang: "",
        specialPerm: "",
        courseFormat: "",
        units: "",
        day: "",
    }
    const [formValues, setFormValues] = useState(defaultValues)
    
    useEffect(() => {
        let url = "https://schedulebrewer.ml/api/search/?"
        let searchParams = new URLSearchParams()
        for(const [key, value] of Object.entries(formValues)){
            if(value){
                searchParams.append(key, value)
            }
        }
        props.setSearchURL(""+ url + searchParams.toString())
    }, [formValues])
    
    return (
        <div>
            <SearchBar formValues={formValues} setFormValues={setFormValues}/>
            <SearchFilters formValues={formValues} setFormValues={setFormValues}/>
        </div>
    )
}

export default SearchInputsContainer
