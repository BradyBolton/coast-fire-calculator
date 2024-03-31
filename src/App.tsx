// css imports
import './App.scss'

// local imports
import { Range } from "./components/range"
import { generateDataSets } from "./models/calculations";

// import hooks
import "chartjs-adapter-moment";
import { useState, useEffect } from "react";

// import components
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    Legend,
    LineElement,
    LinearScale,
    PointElement,
    TimeScale,
    Title,
    Tooltip,
} from "chart.js";
import ScopedCssBaseline from '@mui/material/ScopedCssBaseline';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    Grid,
    Link,
    List,
    ListItem,
    Paper,
    Stack,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { faClipboard, faAngleDown, faCircleInfo } from '@fortawesome/free-solid-svg-icons';

ChartJS.register(
    Legend,
    LineElement,
    LinearScale,
    PointElement,
    TimeScale,
    Title,
    Tooltip,
);

function App(props: any) {
    // first parse any params
    const currentUrl = new URL(window.location.href)
    const currentAgeParam: number = parseInt(currentUrl.searchParams.get('ca') ?? "-1")
    const retireAgeParam: number = parseInt(currentUrl.searchParams.get('ra') ?? "-1")
    const pmtParam: number = parseFloat(currentUrl.searchParams.get('pmt') ?? "-1")
    const rateParam: number = parseFloat(currentUrl.searchParams.get('r') ?? "-1")
    const fireNumParam: number = parseFloat(currentUrl.searchParams.get('fn') ?? "-1")
    const principalParam: number = parseFloat(currentUrl.searchParams.get('p') ?? "-1")
    const pmtBaristaParam: number = parseFloat(currentUrl.searchParams.get('pmtb') ?? "0")

    // setup local state (coast fire parameters)
    const [currentAge, setCurrentAge] = useState(currentAgeParam > -1 ? currentAgeParam : 35);
    const [retireAge, setRetireAge] = useState(retireAgeParam > -1 ? retireAgeParam : 67);
    const [pmtMonthly, setPmtMonthly] = useState(pmtParam > -1 ? pmtParam : 2500);
    const [rate, setRate] = useState(rateParam > -1 ? rateParam : 7); // default to 7% APR
    const [fireNumber, setFireNumber] = useState(fireNumParam > -1 ? fireNumParam : 2000000);
    const [principal, setPrincipal] = useState(principalParam > -1 ? principalParam : 0);
    const [pmtMonthlyBarista, setPmtMonthlyBarista] = useState(pmtBaristaParam);

    const [copiedUrl, setCopiedUrl] = useState(false);
    const [calcMode, setCalcMode] = useState<"coast" | "barista">(pmtMonthlyBarista !== 0 ? "barista" : "coast"); // toggle between coast or barista fire calculations
    const [tipDialogText, setTipDialogText] = useState("");
    const [openTipDialog, setOpenTipDialog] = useState(false); // tip dialog

    const handleClose = () => {
        setOpenTipDialog(false);
    };

    const baristaPmtMonthly = calcMode === "coast" ? 0 : pmtMonthlyBarista
    const projections = generateDataSets(fireNumber, currentAge, retireAge, rate / 100, pmtMonthly, principal, baristaPmtMonthly)
    const data = {
        datasets: [
            {
                label: "Accumulation Phase",
                data: projections.preCoastData,
                borderColor: "rgb(255, 99, 132)",
                backgroundColor: "rgba(255, 99, 132, 0.5)",
            },
            {
                label: "Coasting Phase",
                data: projections.postCoastData,
                borderColor: "rgb(99, 102, 255)",
                backgroundColor: "rgba(99, 102, 255, 0.5)",
            },
        ],
    };

    const coastDateStr = projections.result.coastFireDate ?
        projections.result.coastFireDate.toLocaleString() : ''
    const summaryAddendum = calcMode === "barista" ?
        pmtMonthlyBarista > 0 ?
            <Typography variant="body2">
                (i.e. after <b>{coastDateStr}</b> you will be able to retire at age <b>{retireAge}</b> as long as you continue saving <b>{`$${(pmtMonthlyBarista).toFixed(2)}/mo`}</b>)
            </Typography> :
            <Typography variant="body2">
                (i.e. you can start withdrawing <b>{`$${(-1 * pmtMonthlyBarista).toFixed(2)}/mo`}</b> from savings on <b>{coastDateStr}</b> and still retire at age <b>{retireAge}</b>)
            </Typography> :
        <Typography variant="body2">
            (i.e. after <b>{coastDateStr}</b> you can halt all retirement contributions and still retire at age <b>{retireAge}</b >)
        </Typography >


    // TODO: maybe add a tool-tip showing the math as to why FIRE is not possible
    let summaryMessage = <Alert variant="filled" severity="error">
        <Typography variant="body2">
            FIRE is not currently possible
        </Typography>
    </Alert>
    if (projections.result.alreadyCoastFire) {
        summaryMessage = <Alert variant="filled" severity="success">
            <Typography variant="body2">
                {calcMode.charAt(0).toUpperCase() + calcMode.slice(1)} FIRE already achieved!
            </Typography>
        </Alert>

    } else if (projections.result.isPossible && !projections.result.alreadyCoastFire) {
        summaryMessage = <Alert variant="outlined" severity="info">
            <Typography variant="body2">
                In <b>{`${((projections.result.coastFireAge ? projections.result.coastFireAge : 0) - currentAge).toFixed(2)} years `}</b>
                you can {calcMode} FIRE once you save up <b>${(projections.postCoastData[0].y).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' '}</b>
                on <b>{`${coastDateStr} `}</b> at age <b>{`${projections.result.coastFireAge ?
                    (projections.result.coastFireAge).toFixed(2) : ''} `}</b>
            </Typography>
            {summaryAddendum}
        </Alert>
    }

    const faPropIcon = faGithub as IconProp;
    const faClipboardPropIcon = faClipboard as IconProp;
    const faAngleDownPropIcon = faAngleDown as IconProp;
    const faCircleInfoPropIcon = faCircleInfo as IconProp;

    const generatedUrl = `https://bradybolton.github.io/coast-fire-calculator/?` +
        `ca=${currentAge}` +
        `&ra=${retireAge}` +
        `&r=${rate}` +
        `&pmt=${pmtMonthly}` +
        `&fn=${fireNumber}` +
        `&p=${principal}` +
        `&pmtb=${pmtMonthlyBarista}`

    const onShareClick = () => {
        navigator.clipboard.writeText(generatedUrl);
        setCopiedUrl(true)
    }

    const copiedIcon = copiedUrl ? <FontAwesomeIcon icon={faClipboardPropIcon} className="fa-flip" /> :
        <FontAwesomeIcon icon={faClipboardPropIcon} />

    useEffect(() => {
        if (copiedUrl) {
            const timer = setTimeout(() => {
                setCopiedUrl(false)
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [copiedUrl, setCopiedUrl]);

    // warn peope of the difficulties of small phones (like mine)
    const theme = useTheme();
    const topMessage = useMediaQuery(theme.breakpoints.down("xs")) ?
        "(tip: rotate your screen if you want sliders)"
        : <Typography variant="subtitle2">
            Watch <Link href="https://www.youtube.com/watch?v=V1ategW3cyk">this video</Link> {' '}
            and check out <Link href="https://walletburst.com/tools/coast-fire-calc/" > this guy's calculator</Link> if you're confused
            <br /> <b>Note:</b> Barista FIRE calculator mode is experimental
        </Typography>

    const handleCalculatorMode = (
        event: React.MouseEvent<HTMLElement>,
        newMode: "coast" | "barista",
    ) => {
        setCalcMode(newMode);
    };

    // TODO: show a stacked area chart of pricipal, contributions, and interest
    return (
        <>
            <ScopedCssBaseline>
                <div id="main-container">
                    <div id="controls-container">
                        <Paper sx={{ p: 2 }} elevation={2}>
                            <Stack spacing={1}>
                                <Box>
                                    <Stack direction="row" justifyContent="center" alignItems="center" spacing={1}>
                                        <h2>Coast FIRE Calculator</h2>
                                        <Link sx={{
                                            color: props.theme === 'light' ? 'black' : 'white',
                                        }} href="https://github.com/BradyBolton/coast-fire-calculator">
                                            <FontAwesomeIcon id="gh-icon" icon={faPropIcon} size="xl" />
                                        </Link>
                                    </Stack>
                                </Box>
                                <Typography alignSelf="center" variant="subtitle1">{topMessage}</Typography>
                                <Box alignSelf="center">
                                    <Button
                                        sx={{
                                            width: "max-content",
                                            height: "max-content",
                                            p: 1
                                        }}
                                        color="primary"
                                        variant="contained"
                                        onClick={onShareClick}
                                        startIcon={copiedIcon}
                                        size="small"
                                    >
                                        Share as URL
                                    </Button>
                                </Box>
                                <Divider light />
                                <Box alignSelf="center">
                                    <Grid container direction="row" alignItems="center">
                                        <Typography variant="label" >
                                            FIRE Type:
                                        </Typography>
                                        <Grid item sx={{ ml: 2 }}>
                                            <ToggleButtonGroup
                                                color="primary"
                                                value={calcMode}
                                                exclusive
                                                onChange={handleCalculatorMode}
                                                size="small"
                                            >
                                                <ToggleButton value="coast">
                                                    Coast FIRE
                                                </ToggleButton>
                                                <ToggleButton value="barista">
                                                    Barista FIRE
                                                </ToggleButton>
                                            </ToggleButtonGroup>

                                        </Grid>
                                    </Grid>
                                </Box>

                                <Divider light />

                                <Box alignSelf="center">
                                    <Grid container direction="row" alignItems="center">
                                        <Typography variant="label" >
                                            Current Age:
                                        </Typography>
                                        <Grid item sx={{ ml: 2, width: '6rem' }}>
                                            <TextField
                                                id="current-age"
                                                size="small"
                                                inputProps={{
                                                    type: "number",
                                                    inputMode: 'numeric',
                                                    pattern: '[0-9]*'
                                                }}
                                                value={currentAge ? currentAge : ''}
                                                onInput={(e) => {
                                                    const et = e.target as HTMLInputElement;
                                                    // set to zero so that the app does not explode
                                                    const newCurrentAge = parseInt(et.value !== "" ? et.value : "0")
                                                    if (newCurrentAge <= retireAge) {
                                                        setCurrentAge(newCurrentAge)
                                                    }
                                                }}
                                                onBlur={(e) => {
                                                    if (!currentAge) {
                                                        setCurrentAge(35) // TODO: make this a default value constant
                                                    }
                                                }}
                                                sx={{
                                                    fontSize: '1rem'
                                                }}
                                            />
                                        </Grid>
                                    </Grid>

                                </Box>
                                <Divider light />
                                <Range
                                    labelText="Retirement Age"
                                    minValue={currentAge}
                                    maxValue={100}
                                    defaultValue={60}
                                    step={1}
                                    state={retireAge}
                                    setState={setRetireAge}
                                    openTipDialog={setOpenTipDialog}
                                    setTipDialogText={setTipDialogText}
                                    tipDialogText={"Retirement Age is the age you plan to fully retire. In other words, the age you plan to start fully withdrawing money from your retirement savings and stop working."}
                                />
                                <Divider light />
                                <Range
                                    labelText="Initial Principal"
                                    minValue={0}
                                    maxValue={fireNumber}
                                    defaultValue={2000000}
                                    step={1000}
                                    format="money"
                                    state={principal}
                                    setState={setPrincipal}
                                    openTipDialog={setOpenTipDialog}
                                    setTipDialogText={setTipDialogText}
                                    tipDialogText={"Initial Principal is the total face value of your retirement assets today. Only include investment assets (not cash). Do not count home equity unless you know what you're doing and you plan to turn that equity into retirement income."}
                                />
                                <Divider light />
                                <Range
                                    labelText="FIRE Number"
                                    minValue={1000}
                                    maxValue={6000000}
                                    defaultValue={2000000}
                                    step={1000}
                                    format="money"
                                    state={fireNumber}
                                    setState={setFireNumber}
                                    openTipDialog={setOpenTipDialog}
                                    setTipDialogText={setTipDialogText}
                                    tipDialogText={"FIRE Number is the total value of investments you will need to retire comfortably. Your FIRE number should be large enough for you to comfortably withdraw money from during retirement. If you're following the 4% rule, that means you can withdraw 4% from your total savings each year. Using this rule, if you need $60k a year for retirement, you should aim to save $1.5m by the time you retire: 60,000 x (1/0.04) = 1,500,000."}
                                />
                                <Grid item alignSelf="center">
                                    <Accordion variant="outlined" defaultExpanded>
                                        <AccordionSummary
                                            expandIcon={<FontAwesomeIcon icon={faAngleDownPropIcon} />}
                                            aria-controls="panel1-content"
                                            id="panel1-header"
                                        >
                                            <FontAwesomeIcon icon={faCircleInfoPropIcon} />
                                            <Typography sx={{ "ml": 1 }} >
                                                Withdrawal Info</Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <Typography>Make sure to base your FIRE number off of your desired withdrawal rate!</Typography>
                                            <List disablePadding>
                                                <ListItem disablePadding>
                                                    <Typography>
                                                        4% rule: <b>${(fireNumber * 0.04).toLocaleString()}/yr</b> at <b>${(fireNumber * 0.04 / 12).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mo</b>
                                                    </Typography>
                                                </ListItem>
                                                <ListItem disablePadding>
                                                    <Typography>
                                                        3% rule: <b>${(fireNumber * 0.03).toLocaleString()}/yr</b> at <b>${(fireNumber * 0.03 / 12).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mo</b>
                                                    </Typography>
                                                </ListItem>
                                                <ListItem disablePadding>
                                                    <Typography>
                                                        2% rule: <b>${(fireNumber * 0.02).toLocaleString()}/yr</b> at <b>${(fireNumber * 0.02 / 12).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mo</b>
                                                    </Typography>
                                                </ListItem>
                                            </List>

                                        </AccordionDetails>
                                    </Accordion>
                                </Grid>
                                <Divider light />
                                <Range
                                    labelText="Contributions (monthly)"
                                    minValue={0}
                                    maxValue={15000}
                                    defaultValue={1200}
                                    step={0.01}
                                    format="money"
                                    state={pmtMonthly}
                                    setState={setPmtMonthly}
                                    openTipDialog={setOpenTipDialog}
                                    setTipDialogText={setTipDialogText}
                                    tipDialogText={"Contributions is the amount you contribute each month to savings during your accumulation period (before achieving coast/barista FIRE). During this period, you should aggressively save toward retirement. Later down the road once you achieve coast/barista FIRE, you can stop contributing this amount (and either save less, save nothing, or start making small withdrawals)."}
                                />
                                <Divider light />
                                <Range
                                    disabled={calcMode === "coast"}
                                    labelText="Barista FIRE Contributions (monthly)"
                                    // negative barista "income" has interesting implications
                                    // i.e. a "soft-retirement" with smaller withdrawals
                                    // caps are based off of theoretical withdrawal limits of 4% rule (otherwise the purpose of coast/barista fire is defeated)
                                    minValue={Math.floor(-1 * fireNumber * 0.04 / 12)}
                                    maxValue={Math.floor(fireNumber * 0.04 / 12)}
                                    defaultValue={0}
                                    step={0.01}
                                    format="money"
                                    state={pmtMonthlyBarista}
                                    setState={setPmtMonthlyBarista}
                                    openTipDialog={setOpenTipDialog}
                                    setTipDialogText={setTipDialogText}
                                    tipDialogText={"Barista FIRE Contributions is the amount you plan to add (or withdraw) monthly to or from your savings once you achieve barista FIRE. With barista FIRE, you can take a lower paying job, work fewer hours, and even start making small withdrawals from your savings until you achieve true retirement (when you stop working entirely)."}
                                />
                                <Divider light />
                                <Range
                                    labelText="APR (real return)"
                                    minValue={0}
                                    maxValue={15}
                                    defaultValue={7}
                                    step={0.01}
                                    format="percentage"
                                    state={rate}
                                    setState={setRate}
                                    openTipDialog={setOpenTipDialog}
                                    setTipDialogText={setTipDialogText}
                                    tipDialogText={`APR is the expected real rate of return on your investments. In other words, what is the growth rate of your investments (in ${new Date().getFullYear()} dollars) after accounting for taxes and inflation? Some use 7%. E.g. they subtract an assumed 4% inflation from a historic average (S&P nominal growth historically averaged 11.88% from 1957-2021), rounded down to the ballpark of 7%. Exercising caution is good. Some argue that 7% is too optimistic (fears of demographic shifts, widespread population contractions, etc.) and argue for 4-5% real return (or less). Others argue that 7% is too conservative.`}
                                />
                            </Stack>
                        </Paper>

                    </div>
                    <div id="graph-container">
                        <div id="fixed">
                            <Box sx={{ pl: 3, pr: 3 }}>
                                {summaryMessage}

                            </Box>

                            <div id="graph">
                                <Line options={{
                                    animation: false,
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            position: "top",
                                            labels: {
                                                color: props.theme === 'light' ? '#212121' : 'white'
                                            }
                                        },
                                        title: {
                                            display: true,
                                            text: "Coast FIRE Projections",
                                            color: props.theme === 'light' ? '#212121' : 'white'
                                        },
                                    },
                                    scales: {
                                        x: {
                                            type: 'time',
                                            min: projections.xMin.toISO(),
                                            max: projections.xMax.toISO(),
                                            ticks: {
                                                color: props.theme === 'light' ? '#212121' : 'white'
                                            }
                                        },
                                        y: {
                                            min: projections.yMin,
                                            max: projections.yMax,
                                            ticks: {
                                                color: props.theme === 'light' ? '#212121' : 'white'
                                            }
                                        }
                                    }
                                }} data={data} />
                            </div>
                        </div>


                    </div>

                </div>
                <Dialog
                    open={openTipDialog}
                    onClose={handleClose}
                >
                    <DialogTitle>
                        {"Explanation"}
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            {tipDialogText}
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose} autoFocus>
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
            </ScopedCssBaseline >
        </>
    );
}

export default App;
