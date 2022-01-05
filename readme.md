# Schedule Brewer

ScheduleBrewer is a tool to help visualize various class schedules in preparation for pre-registration

## Tech/Framework Used

**Built with**:

- [Django](https://www.djangoproject.com)
- [React](https://reactjs.org)
- [Material UI](https://material-ui.com)
- [Onelogin SAML Connector](https://github.com/onelogin/python3-saml)
- [Webpack](https://webpack.js.org)

## Installation

To run ScheduleBrewer, clone this repository and install the dependencies:
**Python Dependencies**
This app was built and tested using Python 3.9.6.
Install the python dependencies from the `requirements.txt` file. After activating your [virtual environment](https://packaging.python.org/guides/installing-using-pip-and-virtual-environments/), in the same directory as the `requirements.txt` file, run the command `pip install -r requirements.txt`

**Node Dependencies**
This app was built and tested using Node v16.5.0.
Install the Node dependencies from the `package-lock.json` file. In the same directory as the `Frontend/package-lock.json` file, run the command `npm install`

## Usage

**Run Django**

1. Activate your virtual environment
2. In the terminal, go to the folder `ScheduleBrewer/Backend` where the file `manage.py` is
3. Run the following command: `python manage.py runserver`
4. Go to 127.0.0.1:8000 to view the page

**Compile the Frontend Files**

1. In the terminal, go to the folder `ScheduleBrewer/Frontend` where the file `package.json` is
2. Run the command `npm run build`

To continuously compile the files, instead of `npm run build`, run the command `npm run dev`

## Files

The `.env` file, and `/node_modules` and `/saml` folders are necessary but are not in this repository. `.env` and `/saml` can be found in the AWS server. `/node_modules` can be installed following the instructions above.

- `.env`: File for the passwords and secret keys
- `.gitignore`: Git ignore file
- `/Backend/`: The folder for Django backend files
  - `/CourseBrowser/`: Folder for the CourseBrowser app
    - \_\_init\_\_.py: Python boilerplate
    - `admin.py`: Django boilerplate file
    - `apps.py`: Django boilerplate file
    - `/migrations/`: Folder for the database migration files
    - `models.py`: Django file that contains the models (Database information)
    - `serializers.py`: Django file that serializers for the Django REST framework. Look here if you want to find out what course information (e.g. whether max_enr is sent) is sent to the front end.
    - `tests.py`: Django boilerplate file
    - `views.py`: Django file for the logic
  - `manage.py`: Django boilerplate file
  - `/onelogin/`: Folder for the onelogin SAML files that contain the logic for user authentication
  - `requirements.txt`: Package information for Python
  - `/saml/`: Folder for the SAML connection information
  - `/ScheduleBrewer`: Folder for Django project files. Important files include:
    - `/settings/`: Folder for settings for Django
      - `base.py`: Base settings common between local and production environments
      - `local.py`: Settings unique to the local environment
      - `production.py`: Settings unique to the production environment
    - `urls.py`: Django file for url routing
- `/Frontend/`: The folder for React and Webpack files
  - `.babelrc`: File for compiling JSX
  - `/node_modules/`: Folder for the node modules. Modules have to be installed.
  - `package-lock.json`: Package information for Node
  - `package.json`: Package information for Node
  - `/src/`: Folder for the front end React files
    - `components/`: React components for the app
    - `BadgeRect/`: Component for the badges like NRO or CLS in each search result
    - `Navbar/`: Navbar component
    - `Scheduler/`: Folder of components for the scheduler/timetable portion of the website.
      - `DayColumn.js`: Component for each column in the scheduler (Mon,Tue...)
      - `EventBlock.js`: Component for each course block
      - `SavedCourseDetail.js`: Component for the course detail bars below the scheduler
      - `SavedCourseDetailsContainer.js`: Container for the section that contains each Course Detail. Also includes the count for each course type (Classroom, Intensive, Other)
      - `SchedulerTable.js`: Component for the table. Also contains the logic for the other scheduler components
    - `Search/`: Folder of components for the search logic
      - `SearchInputs/`: Folder of components for the search inputs
      - `ChipGroup.js`: A chip group is the options for a single field. E.g. for the class type field, the options in a chip group are CLS, INT, OTH
      - `SearchBar.js`: Component for the search bar, the drop down for course codes, and the search button
      - `SearchFilters.js`: Component for the search filters and the drop down
      - `SearchInputsContainer.js`: Container for the components in this folder
      - `SearchResults/`: Folder of components for the search results
      - `ResultItemComponent.js`: Component for each search result
      - `SearchResultsContainer.js`: Container for all the search results
      - `SearchSection.js`: Container for the search section that contains the input box, filters, and the results
    - `Utils/`: Folder of utilies
      - `DarkTheme.js`: Theme for dark mode
      - `LightTheme.js`: Theme for light mode
      - `SavedCourseContext.js`: Context for the saved courses
    - `DefaultPageContainer.js`: Container for the entire site when the search section is on the left of the page and the scheduler section is on the right
    - `SchedulerPageContainer.js`: Container for the entire site when only the scheduler section is visible on the page
    #### Other React Files:
    - `App.js`: Top of the React-DOM tree, place where the theme is selected
    - `App.test.js`: File created by create-react-app
    - `index.css`: File created by create-react-app. Contains the styles for the badges
    - `index.js`: File created by create-react-app. Where React starts rendering components
    - `reportWebVitals.js`: File created by create-react-app
    - `setupTests.js`: File created by create-react-app
  - `static/`: Folder containing the compiled React files
  - `templates/`: Template files
    - `CourseBrowser/`: Schedule Brewer HTML files
    - `error.html`: Error page
    - `index.html`: Index page for Schedule Brewer
    - `samlTemplate/`: Folder for the SAML template files
  - `/webpack/`: Folder containing webpack files
    - `webpack-stats.json`: Webpack file. Tells where the HTML file should look for the javascript file
    - `webpack.config.js`: Webpack config file.

## Semester Transition

1. Delete all courses in the UserCourses table
2. Delete all courses in the CourseInfo table
3. Change the semester label:
   - In the project root, type the command `vi .env`
   - Change the SITE_TITLE to the appropriate value
4. Recompile the files (Look at the section Usage - Compile the Frontend Files)
5. Restart the NGINX server (see section below)
6. Import the new courses

## Restart NGINX server

1. Run the following commands to restart the NGINX server:
   `sudo systemctl daemon-reload`
   `sudo systemctl restart gunicorn`
   `sudo systemctl restart nginx`
