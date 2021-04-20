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
            default: '#121212'
        }
    },
    spreadThis: {
        componentBackground: {
            backgroundColor: '#333333'
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
}

export default DarkTheme