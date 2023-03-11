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
    Alert,
    Box,
    Button,
    Container,
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
    useTheme
} from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { faClipboard } from '@fortawesome/free-solid-svg-icons';

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
    const pmtBaristaParam: number = parseFloat(currentUrl.searchParams.get('pmtb') ?? "-1")

    // setup local state (coast fire parameters)
    const [currentAge, setCurrentAge] = useState(currentAgeParam > -1 ? currentAgeParam : 35);
    const [retireAge, setRetireAge] = useState(retireAgeParam > -1 ? retireAgeParam : 60);
    const [pmtMonthly, setPmtMonthly] = useState(pmtParam > -1 ? pmtParam : 4000);
    const [rate, setRate] = useState(rateParam > -1 ? rateParam : 7); // default to 7% APR
    const [fireNumber, setFireNumber] = useState(fireNumParam > -1 ? fireNumParam : 2000000);
    const [principal, setPrincipal] = useState(principalParam > -1 ? principalParam : 0);
    const [pmtMonthlyBarista, setPmtMonthlyBarista] = useState(pmtBaristaParam > -1 ? pmtBaristaParam : 0);

    const [copiedUrl, setCopiedUrl] = useState(false);
    const [calcMode, setCalcMode] = useState<"coast" | "barista">(pmtMonthlyBarista > 0 ? "barista" : "coast"); // toggle between coast or barista fire calculations

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
    const baristaAddendum = calcMode === "barista" ? <Typography variant="body2">
        (After {coastDateStr}, you will be able to retire by <b>{retireAge}</b> as long as you continue saving <b>{`$${(pmtMonthlyBarista).toFixed(2)}`}</b> a month)
    </Typography> : <></>


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
                Your {calcMode} FIRE number is <b>${(projections.postCoastData[0].y).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' '}</b>
                on {`${coastDateStr} `} at age <b>{`${projections.result.coastFireAge ?
                    (projections.result.coastFireAge).toFixed(2) : ''} `}</b>
                in <b>{`${((projections.result.coastFireAge ? projections.result.coastFireAge : 0) - currentAge).toFixed(2)} years`}</b>
            </Typography>
            {baristaAddendum}
        </Alert>
    }


    const faPropIcon = faGithub as IconProp;
    const faClipboardPropIcon = faClipboard as IconProp;
    // const faExpandPropIcon = faChevronUp as IconProp;

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
        : <div>I'll let <a href="https://walletburst.com/tools/coast-fire-calc/">this guy</a> explain what Coast FIRE is (and you might like his calculator better)</div>

    const handleCalculatorMode = (
        event: React.MouseEvent<HTMLElement>,
        newMode: "coast" | "barista",
    ) => {
        setCalcMode(newMode);
    };

    // TODO: show a stacked area chart of pricipal, contributions, and interest
    return (
        <>
            <ScopedCssBaseline sx={{ backgroundColor: 'ghostwhite' }}>
                <Container maxWidth="md">
                    <Stack spacing={2} sx={{ m: 2 }}>
                        <Paper sx={{ p: 2 }} elevation={2}>
                            <Stack spacing={1}>
                                <Box>
                                    <Stack direction="row" justifyContent="center" alignItems="center" spacing={1}>
                                        <h2>Coast FIRE Calculator</h2>
                                        <Link sx={{
                                            color: 'black',
                                        }} href="https://github.com/BradyBolton/coast-fire-calculator">
                                            <FontAwesomeIcon id="gh-icon" icon={faPropIcon} size="xl" />
                                        </Link>
                                    </Stack>
                                </Box>
                                <Typography alignSelf="center" variant="subtitle1">{topMessage}</Typography>
                                <Box alignSelf="center">
                                    <Stack direction="row" alignItems="center" spacing={1}>
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
                                    </Stack>
                                </Box>
                                <Divider light />
                                <Grid container direction="row" alignItems="center">
                                    <Typography variant="label" >
                                        Current Age:
                                    </Typography>
                                    <Grid item sx={{ ml: 2 }} xs={3}>
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
                                <Divider light />
                                <Range
                                    labelText="Retirement Age"
                                    minValue={currentAge}
                                    maxValue={100}
                                    defaultValue={60}
                                    step={1}
                                    state={retireAge}
                                    setState={setRetireAge}
                                />
                                <Divider light />
                                <Range
                                    labelText="APR (return)"
                                    minValue={0.01}
                                    maxValue={15}
                                    defaultValue={7}
                                    step={0.01}
                                    format="percentage"
                                    state={rate}
                                    setState={setRate}
                                />
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
                                />
                                <Grid item alignSelf="center">
                                    <Alert severity="info" variant="outlined" sx={{ pl: 2, pr: 2, pb: 0, pt: 0 }}>
                                        <Typography>Make sure to base your FIRE number off of your desired withdrawal rate!</Typography>
                                        <List disablePadding>
                                            <ListItem disablePadding>
                                                <Typography>
                                                    4% rule: <b>${(fireNumber * 0.04).toLocaleString()}/yr</b> at <b>${(fireNumber * 0.04 / 12).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mo</b>
                                                </Typography>
                                            </ListItem>
                                            <ListItem disablePadding>
                                                <Typography>
                                                    3% rule: <b>${(fireNumber * 0.03).toLocaleString()}/mo</b> at <b>${(fireNumber * 0.03 / 12).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mo</b>
                                                </Typography>
                                            </ListItem>
                                            <ListItem disablePadding>
                                                <Typography>
                                                    2% rule: <b>${(fireNumber * 0.02).toLocaleString()}/mo</b> at <b>${(fireNumber * 0.02 / 12).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mo</b>
                                                </Typography>
                                            </ListItem>
                                        </List>
                                    </Alert>

                                </Grid>
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
                                />

                                <Divider light />
                                <Range
                                    disabled={calcMode === "coast"}
                                    labelText="Barista FIRE contributions (monthly)"
                                    // negative barista "income" has interesting implications
                                    // i.e. a "soft-retirement" with smaller withdrawels
                                    minValue={0}
                                    maxValue={pmtMonthly}
                                    defaultValue={0}
                                    step={0.01}
                                    format="money"
                                    state={pmtMonthlyBarista}
                                    setState={setPmtMonthlyBarista}
                                />
                            </Stack>
                        </Paper>

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
                                    },
                                    title: {
                                        display: true,
                                        text: "Coast FIRE Projections",
                                    },
                                },
                                scales: {
                                    x: {
                                        type: 'time',
                                        min: projections.xMin.toISO(),
                                        max: projections.xMax.toISO()
                                    },
                                    y: {
                                        min: projections.yMin,
                                        max: projections.yMax
                                    }
                                }
                            }} data={data} />
                        </div>
                    </Stack>
                </Container>
            </ScopedCssBaseline >
        </>
    );
}

export default App;
