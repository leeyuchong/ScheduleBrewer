const DarkTheme = {
    palette: {
        type: 'dark',
        primary: {
            light: '#954753',
            main: '#641a2b',
            dark: '#370000',
            contrastText: '#ffffff',
        },
        secondary: {
            light: '#ffffff',
            main: '#fff8ef',
            dark: '#ccc5bd',
            contrastText: '#000000',
        },
        background: {
            default: '#1B1B1B'
        }
    },
    spreadThis: {
        componentBackground: {
            backgroundColor: '#303030'
        },
        blackButton: {
            color: "#212121",
            borderColor: "#212121",
            '&:hover': {
                backgroundColor: "rgb(33,33,33, 0.2)",
            },
        },
        whiteButton: {
            color: "#fafafa",
            borderColor: "#fafafa",
            '&:hover': {
                backgroundColor: "rgb(245,245,245, 0.2)",
            },
        }
    },
};

export default DarkTheme;
