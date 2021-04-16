const DarkTheme = {
    palette: {
        type: 'dark',
        primary: {
            light: '#ffffff',
            main: '#383838',
            dark: '#bcbcbc',
            contrastText: '#ff5252',
        },
        secondary: {
            light: '#ff5131',
            main: '#ff5252',
            dark: '#9b0000',
            contrastText: '#ffffff',
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