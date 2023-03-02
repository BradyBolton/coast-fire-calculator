import { Input, Grid, Typography, Slider, Box, } from '@mui/material'
import InputAdornment from '@mui/material/InputAdornment';
import { NumericFormat } from 'react-number-format'

import { useState } from 'react'

type RangeFormat = "money" | "percentage" | "none"

interface IRangeProps {
    labelText: string;
    minValue: number;
    maxValue: number;
    defaultValue: number;
    step: number;
    format?: RangeFormat;
}

const NumberFormatCustom: React.FC = (props: any) => {
    const { inputRef, onChange, ...other } = props

    return (
        <>
            <NumericFormat
                {...other}
                getInputRef={inputRef}
                getValueChange={(values: any) => {
                    onChange({
                        target: {
                            name: props.name,
                            value: values.value
                        }
                    })
                }}
                thousandSeparator
            />
        </>

    )
}

function Range(props: IRangeProps) {

    const [currentValue, setCurrentValue] = useState<number | string | Array<number | string>>(
        props.defaultValue,
    );

    const handleSliderChange = (event: Event, newValue: number | number[]) => {
        setCurrentValue(newValue);
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentValue(event.target.value === '' ? '' : Number(event.target.value));
    };

    const handleBlur = () => {
        if (currentValue < props.minValue) {
            setCurrentValue(props.minValue);
        } else if (currentValue > props.maxValue) {
            setCurrentValue(props.maxValue);
        }
    };

    // TODO: do something else about this gross sizing (trying to make mobile look good)
    let textInputSize = 3
    if (Math.floor(Math.log10(props.maxValue)) > 2) {
        textInputSize = 4
    }

    let startAdornment = ""
    let endAdornment = ""
    if (props.format && props.format === "money") {
        startAdornment = "$"
    }
    if (props.format && props.format === "percentage") {
        endAdornment = "%"
        textInputSize = 4
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
                            color: 'blue'
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
                    <Input
                        value={currentValue}
                        size="small"
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        startAdornment={<InputAdornment position="start">{startAdornment}</InputAdornment>}
                        endAdornment={<InputAdornment position="end">{endAdornment}</InputAdornment>}
                        inputProps={{
                            step: props.step,
                            min: props.minValue,
                            max: props.maxValue,
                            type: 'number',
                        }}
                    />
                </Grid>
            </Grid>
        </Box>
    )
}

export default Range;