// import local css
import "./index.css";

// local imports
import App from "./App";

// import libraries
import React from "react";
import ReactDOM from "react-dom/client";
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement
);

// TODO: track dark mode via global state (perhaps using easy-peasy)
const defaultTheme = createTheme({
    palette: {
        mode: 'light', // could be 'dark'
    },
    typography: {
        body1: {
            fontSize: '1.1rem',
        },
        label: {
            // fontWeight: 'bold',
            fontSize: '1.1rem',
        },
        subtitle1: {
            color: 'slategrey',
            fontSize: '1.1rem',
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
