const LightTheme = {
    palette: {
        type: 'light',
        primary: {
            light: '#ffffff',
            main: '#fff',
            dark: '#bcbcbc',
            contrastText: '#d50000',
        },
        secondary: {
            light: '#ff5131',
            main: '#d50000',
            dark: '#9b0000',
            contrastText: '#ffffff',
        },
        background: {
            default: '#f5f5f5'
        }
    },
    spreadThis: {
        componentBackground: {
            backgroundColor: '#fff'
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

export default LightTheme