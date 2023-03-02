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
    Card,
    Container,
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
// import { faChevronUp } from '@fortawesome/free-solid-svg-icons';

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
    const [rate, setRate] = useState(0.07); // default to 7% APR
    const [currentAge, setCurrentAge] = useState(35);
    const [retireAge, setRetireAge] = useState(60);
    const [pmtMonthly, setPmtMonthly] = useState(4000);
    const [fireNumber, setFireNumber] = useState(2000000);
    const [principal, setPrincipal] = useState(0);

    const projections = generateDataSets(fireNumber, currentAge, retireAge, rate, pmtMonthly, principal)
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
    let summaryMessage = <Alert severity="error">
        <p id="message" className="bad"><em>FIRE is not possible with given parameters</em></p>
    </Alert>
    if (projections.result.alreadyCoastFire) {
        summaryMessage = <Alert severity="success">
            <p id="message" className="great">Coast FIRE already achieved!</p>
        </Alert>

    } else if (projections.result.isPossible && !projections.result.alreadyCoastFire) {
        summaryMessage = <Alert variant="outlined" severity="info">
            <p id="message" className="good">
                Coast FIRE number of <em>${(projections.postCoastData[0].y).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' '}</em>
                on {`${projections.result.coastFireDate ?
                    projections.result.coastFireDate.toLocaleDateString("en-US") : ''} `}

                (at age {`${projections.result.coastFireAge ?
                    (projections.result.coastFireAge).toFixed(2) : ''} `}
                in {`${((projections.result.coastFireAge ? projections.result.coastFireAge : 0) - currentAge).toFixed(2)} years`}
                )
            </p >

        </Alert>

    }

    const faPropIcon = faGithub as IconProp;
    // const faExpandPropIcon = faChevronUp as IconProp;

    // TODO: show a stacked area chart of pricipal, contributions, and interest
    return (
        <>
            <ScopedCssBaseline sx={{ backgroundColor: 'ghostwhite' }}>
                <Container maxWidth="md">
                    <Stack spacing={1} sx={{ m: 2 }}>
                        <Box sx={{ mt: 1 }}>
                            <Stack direction="row" justifyContent="center" alignItems="center" spacing={2}>
                                <h2>Coast FIRE Calculator</h2>
                                <Link sx={{ color: 'black' }} href="https://github.com/BradyBolton/coast-fire-calculator">
                                    <FontAwesomeIcon icon={faPropIcon} size="xl" />
                                </Link>
                            </Stack>
                        </Box>

                        <Paper sx={{ p: 2 }} elevation={2}>
                            <Stack spacing={1}>
                                <TextField
                                    id="current-age"
                                    label="Current Age"
                                    size="small"
                                    inputProps={{
                                        type: "number",
                                        inputMode: 'numeric',
                                        pattern: '[0-9]*'
                                    }}
                                    value={currentAge ?? 35}
                                    defaultValue={35}
                                    onChange={(event) => {
                                        if (event.target.value) {
                                            setCurrentAge(parseFloat(event.target.value))
                                        } else {
                                            setCurrentAge(0)
                                        }
                                    }}
                                />

                                <Range
                                    labelText="Retirement Age"
                                    minValue={currentAge}
                                    maxValue={100}
                                    defaultValue={60}
                                    step={1}
                                    state={retireAge}
                                    setState={setRetireAge}
                                />
                                <Range
                                    labelText="APR (return)"
                                    minValue={0.01}
                                    maxValue={0.2}
                                    defaultValue={.07}
                                    step={0.001}
                                    format="percentage"
                                    state={rate}
                                    setState={setRate}
                                />
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
                                <Card variant="outlined" sx={{ p: 1 }}>
                                    <Typography>
                                        4% rule: <b>${(fireNumber * 0.04).toLocaleString()}/yr</b> at <b>${(fireNumber * 0.04 / 12).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mo</b>
                                    </Typography>
                                    <Typography>
                                        3% rule: <b>${(fireNumber * 0.03).toLocaleString()}/mo</b> at <b>${(fireNumber * 0.03 / 12).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mo</b>
                                    </Typography>
                                    <Typography>
                                        2% rule: <b>${(fireNumber * 0.02).toLocaleString()}/mo</b> at <b>${(fireNumber * 0.02 / 12).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mo</b>
                                    </Typography>
                                </Card>
                                <Range
                                    labelText="Initial Value"
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

                        {summaryMessage}

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
