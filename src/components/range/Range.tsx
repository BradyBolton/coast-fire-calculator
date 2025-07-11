import {
    IconButton,
    Box,
    Slider,
    TextField,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material'
import { NumericFormat } from 'react-number-format'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faCircleQuestion } from '@fortawesome/free-solid-svg-icons';


import React from 'react'
import type { ReactNode } from 'react'

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
    openTipDialog: React.Dispatch<React.SetStateAction<boolean>>
    setTipDialogText: React.Dispatch<React.SetStateAction<string | ReactNode>>
    tipDialogText: string
    disabled?: boolean
}

// calcMinInputWidth adjusts the width of the input boxes appropriately based on
// expected ranges, formatting, and font size
function calcMinInputWidth(maxValue: number, step: number,
    isMediumScreen: boolean, isSmallScreen: boolean, isExtraSmallScreen: boolean): number {
    let totalCharLength = 1
    if (step < 1) {
        totalCharLength += 2;
    }

    totalCharLength += maxValue.toString().length;
    let charSize = (isExtraSmallScreen || isSmallScreen) ? 12 : isMediumScreen ? 14 : 16;

    return totalCharLength * charSize;
}


function Range(props: IRangeProps) {
    const faCircleQuestionProp = faCircleQuestion as IconProp;

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

    const minInputWidth = calcMinInputWidth(props.maxValue, props.step,
        isMediumScreen, isSmallScreen, isExtraSmallScreen);

    let startAdornment = ""
    let endAdornment = ""
    if (props.format && props.format === "money") {
        startAdornment = "$"
    }
    if (props.format && props.format === "percentage") {
        endAdornment = "%"
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

    // basically give up if the screen narrower than 300px
    const slider =
        <Slider
            className="range-slider"
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

    return (
        <Box className="range-container">
            <Typography variant="label" className="range-label">
                {props.labelText}
                <IconButton size="small" onClick={() => {
                    props.setTipDialogText(props.tipDialogText)
                    props.openTipDialog(true)
                }}>
                    <FontAwesomeIcon icon={faCircleQuestionProp} size="sm" />
                </IconButton>
            </Typography>
            <Box className="range-content">
                {slider}
                <NumericFormat
                    className="range-input"
                    disabled={props.disabled}
                    value={props.state || 0}
                    defaultValue={0}
                    thousandSeparator=","
                    customInput={TextField}
                    type="tel"
                    decimalScale={2}
                    fixedDecimalScale={props.step < 1 ? true : false}
                    onValueChange={(values) => {
                        props.setState(values.floatValue ?? 0) // TODO: don't default to zero  (and also defaultValue prop)
                    }}
                    onBlur={handleBlur}
                    prefix={startAdornment}
                    suffix={endAdornment}
                    sx={{
                        // fontWeight: 'bold',
                        fontSize: '1rem',
                        pr: 0,
                        width: `${minInputWidth}px`,
                        minWidth: `${minInputWidth}px`
                    }}
                    size='small'
                    onFocus={(event) => event.target.select()}
                />
            </Box>
        </Box>
    )
}

export default Range;