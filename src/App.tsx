// css imports
import './App.scss'

// local imports
import { Range } from "./components/range"
import { generateDataSets, convertYearsElapsedToDate } from "./models/calculations";

// import hooks
import "chartjs-adapter-moment";
import { useState } from "react";

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
    List,
    ListItem,
    Container,
    Divider,
    Grid,
    Link,
    Paper,
    Stack,
    TextField,
    Typography,
} from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
// import Accordion from '@mui/material/Accordion';
// import AccordionSummary from '@mui/material/AccordionSummary';
// import AccordionDetails from '@mui/material/AccordionDetails';

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
    // setup local state (coast fire parameters)
    const [rate, setRate] = useState(7); // default to 7% APR
    const [currentAge, setCurrentAge] = useState(35);
    const [retireAge, setRetireAge] = useState(60);
    const [pmtMonthly, setPmtMonthly] = useState(4000);
    const [fireNumber, setFireNumber] = useState(2000000);
    const [principal, setPrincipal] = useState(0);

    const projections = generateDataSets(fireNumber, currentAge, retireAge, rate / 100, pmtMonthly, principal)
    const today = new Date()
    const maxChartDate = convertYearsElapsedToDate(today, retireAge - currentAge);
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

    // TODO: maybe add a tool-tip showing the math as to why FIRE is not possible
    let summaryMessage = <Alert variant="filled" severity="error">
        <Typography>
            FIRE is not currently possible
        </Typography>
    </Alert>
    if (projections.result.alreadyCoastFire) {
        summaryMessage = <Alert variant="filled" severity="success">
            <Typography>
                Coast FIRE already achieved!
            </Typography>
        </Alert>

    } else if (projections.result.isPossible && !projections.result.alreadyCoastFire) {
        summaryMessage = <Alert variant="outlined" severity="info">
            <Typography >
                Your coast FIRE number is <b>${(projections.postCoastData[0].y).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' '}</b>
                on {`${projections.result.coastFireDate ?
                    projections.result.coastFireDate.toLocaleDateString("en-US") : ''} `}

                (at age <b>{`${projections.result.coastFireAge ?
                    (projections.result.coastFireAge).toFixed(2) : ''} `}</b>
                in <b>{`${((projections.result.coastFireAge ? projections.result.coastFireAge : 0) - currentAge).toFixed(2)} years`}</b>
                )
            </Typography>
        </Alert>

    }

    const faPropIcon = faGithub as IconProp;
    // const faExpandPropIcon = faChevronUp as IconProp;

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
                                        <Link sx={{ color: 'black' }} href="https://github.com/BradyBolton/coast-fire-calculator">
                                            <FontAwesomeIcon icon={faPropIcon} size="xl" />
                                        </Link>
                                    </Stack>
                                </Box>
                                <Typography alignSelf="center" variant="subtitle1">I'll let <a href="https://walletburst.com/tools/coast-fire-calc/">this guy</a> explain what Coast FIRE is (and you might like his calculator better)</Typography>
                                <Divider light />
                                <Grid container direction="row" alignItems="center">
                                    <Typography variant="label" sx={{ mr: 2 }}>
                                        Current Age:
                                    </Typography>
                                    <Grid item xs={3}>
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
                                                fontSize: '1.1rem'
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
                                    <Alert severity="info" variant="outlined" sx={{ width: 'max-content', pl: 2, pr: 2, pb: 0, pt: 0 }}>
                                        <Typography>Make sure to base your FIRE number off of your desired withdrawel rate!</Typography>
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
                                        max: maxChartDate.toISOString()
                                    },
                                    y: {
                                        min: 0,
                                        max: Math.floor(fireNumber * 1.1)
                                    }
                                }
                            }} data={data} />
                        </div>

                        {/*
                        TODO: create an accordion of instructions?
                        <Accordion  >
                            <AccordionSummary
                                expandIcon={
                                    <FontAwesomeIcon icon={faExpandPropIcon} />
                                }
                                aria-controls="panel1a-content"
                                id="panel1a-header"
                            >
                                <Typography>Instructions</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Typography>
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
                                    malesuada lacus ex, sit amet blandit leo lobortis eget.
                                </Typography>
                            </AccordionDetails>
                        </Accordion>
                        */}

                    </Stack>
                </Container>
            </ScopedCssBaseline>

        </>
    );
}

export default App;
