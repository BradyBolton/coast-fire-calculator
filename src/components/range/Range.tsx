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
    setState: React.Dispatch<React.SetStateAction<number>>
}

function Range(props: IRangeProps) {

    const [currentValue, setCurrentValue] = useState<number | number[]>(
        props.defaultValue,
    );

    const handleSliderChange = (event: Event, value: number | number[]) => {
        setCurrentValue(value);
        // props.setState(value as number) // TODO: uncomment this
    };

    const handleBlur = () => {
        if (currentValue < props.minValue) {
            setCurrentValue(props.minValue);
        } else if (currentValue > props.maxValue) {
            setCurrentValue(props.maxValue);
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
        textInputSize = 2
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
                            color: 'darkgreen'
                        }}
                        defaultValue={props.defaultValue}
                        value={typeof currentValue === 'number' ? currentValue : props.defaultValue}
                        onChange={handleSliderChange}
                        min={props.minValue}
                        max={props.maxValue}
                        step={props.step}
                    />
                </Grid>
                <Grid item xs={textInputSize}>
                    <NumericFormat
                        value={Number(currentValue)}
                        defaultValue={0}
                        thousandSeparator=","
                        customInput={Input}
                        decimalScale={2}
                        onValueChange={(values) => {
                            setCurrentValue(values.floatValue ?? 0)
                        }}
                        onBlur={handleBlur}
                        prefix={'$'}
                    />
                </Grid>
            </Grid>
        </Box>
    )
}

export default Range;