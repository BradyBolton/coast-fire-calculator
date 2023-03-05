// import local css
import "./index.css";

// local imports
import App from "./App";

// import libraries
import React from "react";
import ReactDOM from "react-dom/client";
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { pink } from '@mui/material/colors';
import { yellow } from '@mui/material/colors';

const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement
);

// TODO: track dark mode via global state (perhaps using easy-peasy)
const defaultTheme = createTheme({
    palette: {
        mode: 'light', // TODO: support dark mode (value could be 'dark')
        primary: pink,
        secondary: yellow,
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
            // fontWeight: 'bold'
        }
    },
});

// import CssBaseline to remove some browswer inconsistencies
root.render(
    <React.StrictMode>
        <ThemeProvider theme={defaultTheme}>
            <CssBaseline />
            <App />
        </ThemeProvider>
    </React.StrictMode>
);
