// import local css
import "./index.css";

// local imports
import App from "./App";

// import libraries
import React, { FC, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { pink, yellow, grey } from '@mui/material/colors';
import { PaletteMode, Fab } from '@mui/material';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';


const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement
);

const getDesignTokens = (mode: PaletteMode) => ({
    palette: {
        mode: mode, // TODO: support dark mode (value could be 'dark')
        // primary: pink,
        // secondary: yellow,
        ...(mode === 'light'
            ? {
                // palette values for light mode
                primary: pink,
                divider: yellow[200],
                text: {
                    primary: grey[900],
                    secondary: grey[800],
                },
            }
            : {
                // palette values for dark mode
                primary: pink,
                divider: yellow[700],
                background: {
                    default: grey[900],
                    paper: grey[900],
                },
                text: {
                    primary: '#e8e8e8',
                    secondary: '#e8e8e8',
                },
            }),
    },
    breakpoints: {
        values: {
            xs: 389, // where things really break, but plenty of phones are ~390px wide
            sm: 475, // this width is when the UI starts disintegrating
            md: 900,
            lg: 1200,
            xl: 1536,
        },
    },
    typography: {
        body1: {
            fontSize: '1rem',
        },
        body2: {
            fontSize: '1.1rem',
        },
        label: {
            // fontWeight: 'bold',
            fontSize: '1rem',
        },
        subtitle1: {
            color: 'slategrey',
            fontSize: '1rem',
            textAlign: "center"
            // fontWeight: 'bold'
        }
    },
});


const AppWrapper: FC = () => {

    const faSunProp = faSun as IconProp;
    const faMoonProp = faMoon as IconProp;

    const [mode, setMode] = useState<PaletteMode>('dark');

    const colorMode = useMemo(
        () => ({
            // The dark mode switch would invoke this method
            toggleColorMode: () => {
                setMode((prevMode: PaletteMode) =>
                    prevMode === 'light' ? 'dark' : 'light',
                );
            },
        }),
        [],
    );

    // Update the theme only if the mode changes
    // @ts-ignore
    const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

    // TODO: track dark mode via global state (perhaps using easy-peasy)
    // const defaultTheme = createTheme();

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Fab sx={{
                margin: 0,
                right: 20,
                top: 20,
                left: 'auto',
                position: 'fixed',
            }}
                onClick={() => {
                    setMode((prevMode: PaletteMode) =>
                        prevMode === 'light' ? 'dark' : 'light',
                    );
                }}
                color="primary"
                aria-label="add"
                size="small"
            >
                {mode === "dark" ? <FontAwesomeIcon icon={faSunProp} size="lg" /> : <FontAwesomeIcon icon={faMoonProp} size="lg" />}
            </Fab>
            <App />
        </ThemeProvider>
    )
}


// import CssBaseline to remove some browswer inconsistencies
root.render(
    <React.StrictMode>
        <AppWrapper />
    </React.StrictMode>
);
