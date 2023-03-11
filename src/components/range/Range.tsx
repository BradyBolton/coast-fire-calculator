import { TextField, Grid, Typography, Slider, Box, useMediaQuery, useTheme } from '@mui/material'
import { NumericFormat } from 'react-number-format'

import React from 'react'

type RangeFormat = "money" | "percentage" | "none"

interface IRangeProps {
    labelText: string;
    minValue: number;
    maxValue: number;
    defaultValue: number;
    step: number;
    format?: RangeFormat;
    state: number
    setState: React.Dispatch<React.SetStateAction<number>>
    disabled?: boolean
}

function Range(props: IRangeProps) {

    const handleSliderChange = (event: Event, value: number | number[]) => {
        props.setState(value as number)
    };

    const handleBlur = () => {
        if (props.state < props.minValue) {
            props.setState(props.minValue);
        } else if (props.state > props.maxValue) {
            props.setState(props.maxValue);
        }
    };

    const theme = useTheme();
    const isMediumScreen = useMediaQuery(theme.breakpoints.down("md"));
    const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
    const isExtraSmallScreen = useMediaQuery(theme.breakpoints.down("xs"));

    // TODO: do something else about this gross sizing (trying to make mobile look good)
    let spaceAfterSlider = 1.5
    let textInputSize = isMediumScreen ? 2.5 : 1.5
    if (Math.floor(Math.log10(props.maxValue)) > 2) {
        textInputSize = isExtraSmallScreen ? 4.5 : isSmallScreen ? 4.5 : isMediumScreen ? 3.75 : 2
        spaceAfterSlider = 2.5
    }

    let startAdornment = ""
    let endAdornment = ""
    if (props.format && props.format === "money") {
        startAdornment = "$"
    }
    if (props.format && props.format === "percentage") {
        endAdornment = "%"
        textInputSize = isMediumScreen ? 3.5 : 1.5
    }

    let marks = [
        {
            value: props.minValue,
            label: props.minValue.toLocaleString(),
        },
        {
            value: props.maxValue,
            label: props.maxValue.toLocaleString(),
        },
    ];

    if (props.minValue < 0) {
        marks.push({
            value: 0,
            label: "0"
        })
    }

    // avoid shenanigans on small screens
    if (isExtraSmallScreen) {
        textInputSize = 0
    }

    // basically give up if the screen narrower than 300px
    const slider = !isExtraSmallScreen ? <Grid item xs={12 - textInputSize} sx={{ pr: spaceAfterSlider }}>
        <Slider
            color='primary'
            defaultValue={props.defaultValue}
            value={props.state || 0}
            onChange={handleSliderChange}
            min={props.minValue}
            max={props.maxValue}
            step={props.step}
            valueLabelDisplay="auto"
            marks={marks}
            disabled={props.disabled}
        />
    </Grid> : <></>

    return (
        <Box>
            <Typography variant="label">
                {props.labelText}:
            </Typography>
            <Grid container direction="row" spacing={spaceAfterSlider} sx={{ pl: 2 }}>
                {slider}
                <Grid item xs={textInputSize}>
                    <NumericFormat
                        disabled={props.disabled}
                        value={props.state || 0}
                        defaultValue={0}
                        thousandSeparator=","
                        customInput={TextField}
                        decimalScale={2}
                        onValueChange={(values) => {
                            props.setState(values.floatValue ?? 0) // TODO: don't default to zero  (and also defaultValue prop)
                        }}
                        onBlur={handleBlur}
                        prefix={startAdornment}
                        suffix={endAdornment}
                        sx={{
                            // fontWeight: 'bold',
                            fontSize: '1rem',
                            pr: 0
                        }}
                        size='small'
                        onFocus={(event) => event.target.select()}
                    />
                </Grid>
            </Grid>
        </Box>
    )
}

export default Range;