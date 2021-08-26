import React, { useState, useEffect } from 'react';
import SearchBar from './SearchBar';
import SearchFilters from './SearchFilters';

function SearchInputsContainer(props) {
    // PROPS: 
    //  setSearchURL: Function to set the url with the search information

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
    };
    const [formValues, setFormValues] = useState(defaultValues);

    useEffect(() => {
        let url = "http://127.0.0.1:8000/api/search/?";
        let searchParams = new URLSearchParams();
        for (const [key, value] of Object.entries(formValues)) {
            if (value) {
                searchParams.append(key, value);
            }
        }
        props.setSearchURL("" + url + searchParams.toString());
    }, [formValues]);

    return (
        <div>
            <SearchBar formValues={formValues} setFormValues={setFormValues} />
            <SearchFilters formValues={formValues} setFormValues={setFormValues} />
        </div>
    );
}

export default SearchInputsContainer;
