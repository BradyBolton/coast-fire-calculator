import { Input, Grid, Typography, Slider, Box } from '@mui/material'
import { NumericFormat } from 'react-number-format'

import React, { useState } from 'react'

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
}

function Range(props: IRangeProps) {

    // const [currentValue, setCurrentValue] = useState<number | number[]>(
    //     props.defaultValue,
    // );

    const handleSliderChange = (event: Event, value: number | number[]) => {
        // setCurrentValue(value);
        props.setState(value as number) // TODO: uncomment this
    };

    const handleBlur = () => {
        if (props.state < props.minValue) {
            props.setState(props.minValue);
        } else if (props.state > props.maxValue) {
            props.setState(props.maxValue);
        }
    };

    // TODO: do something else about this gross sizing (trying to make mobile look good)
    let textInputSize = 2
    if (Math.floor(Math.log10(props.maxValue)) > 2) {
        textInputSize = 3
    }

    let startAdornment = ""
    let endAdornment = ""
    if (props.format && props.format === "money") {
        startAdornment = "$"
    }
    if (props.format && props.format === "percentage") {
        endAdornment = "%"
        textInputSize = 3
    }

    return (
        <Box>
            <Typography variant="button">
                {props.labelText}
            </Typography>
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={12 - textInputSize}>
                    <Slider
                        sx={{
                            color: 'darkred'
                        }}
                        defaultValue={props.defaultValue}
                        value={props.state || 0}
                        onChange={handleSliderChange}
                        min={props.minValue}
                        max={props.maxValue}
                        step={props.step}
                    />
                </Grid>
                <Grid item xs={textInputSize}>
                    <NumericFormat
                        value={props.state || 0}
                        defaultValue={0}
                        thousandSeparator=","
                        customInput={Input}
                        decimalScale={2}
                        onValueChange={(values) => {
                            props.setState(values.floatValue ?? 0) // TODO: don't default to zero  (and also defaultValue prop)
                        }}
                        onBlur={handleBlur}
                        prefix={startAdornment}
                        suffix={endAdornment}
                    />
                </Grid>
            </Grid>
        </Box>
    )
}

export default Range;