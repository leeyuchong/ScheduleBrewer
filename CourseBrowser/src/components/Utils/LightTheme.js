const LightTheme = {
    palette: {
        type: 'light',
        primary: {
            light: '#cb4d51',
            main: '#951829',
            dark: '#610000',
            contrastText: '#fff',
        },
        secondary: {
            light: '#cb4d51',
            main: '#951829',
            dark: '#610000',
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