import React, { useState, useEffect } from "react";
import NavBar from "./components/Navbar/NavbarComponent";
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import { SavedCourseProvider } from './components/Utils/SavedCourseContext';
import LightTheme from './components/Utils/LightTheme';
import DarkTheme from './components/Utils/DarkTheme';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import DefaultPageContainer from './components/DefaultPageContainer';
import SchedulerPageContainer from './components/SchedulerPageContainer';
import CssBaseline from '@material-ui/core/CssBaseline';
import Box from '@material-ui/core/Box';

function App() {
  const darkTheme = createMuiTheme(DarkTheme);
  const lightTheme = createMuiTheme(LightTheme);
  const [currentPage, setCurrentPage] = useState("default");
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [darkMode, setDarkMode] = useState(prefersDarkMode);
  const [hideSearchSection, setHideSearchSection] = useState(false);
  function handleChange(newValue){
    setCurrentPage(newValue);
  }
  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };
  const toggleSearchVisibility = () => {
    setHideSearchSection(!hideSearchSection);
  };
  useEffect(() => {
    setDarkMode(prefersDarkMode);
  }, [prefersDarkMode]);

  return (
    <div className="App">
      <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
        <CssBaseline />
        <NavBar 
          currentPage={currentPage} 
          handleChange={handleChange} 
          toggleTheme={toggleTheme} 
          prefersDarkMode={darkMode}
          hideSearchSection={hideSearchSection}
          toggleSearchVisibility={toggleSearchVisibility}
          />
        <SavedCourseProvider>
          <Box m={1}>
            {currentPage==="default" ? (
              <DefaultPageContainer hideSearchSection={hideSearchSection}/>
            ) : (
              <SchedulerPageContainer/>
            )}
          </Box>
        </SavedCourseProvider>
      </ThemeProvider>
    </div>
  );
}

export default App;
