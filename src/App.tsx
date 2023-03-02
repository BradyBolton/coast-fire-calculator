// local imports
import { generateDataSets, convertYearsElapsedToDate } from "./models/calculations";
import { Range } from "./components/range"

// library imports
import ScopedCssBaseline from '@mui/material/ScopedCssBaseline';
import { Input, Grid, Typography, Slider, TextField, Stack, Box, Link, Button, ButtonGroup, Container, Paper } from '@mui/material'
import { useState } from "react";
import "chartjs-adapter-moment";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    TimeScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";

// import components
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faGithub } from '@fortawesome/free-brands-svg-icons';

ChartJS.register(
    TimeScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
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

    let summaryMessage = <div id="message" className="bad"><em>FIRE is not possible with given parameters</em></div>
    if (projections.result.alreadyCoastFire) {
        summaryMessage = <div id="message" className="great">Coast FIRE already achieved!</div>
    } else if (projections.result.isPossible && !projections.result.alreadyCoastFire) {
        summaryMessage = <div id="message" className="good">
            Coast FIRE number of <em>${(projections.postCoastData[0].y).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' '}</em>
            on {`${projections.result.coastFireDate ?
                projections.result.coastFireDate.toLocaleDateString("en-US") : ''} `}

            (at age {`${projections.result.coastFireAge ?
                (projections.result.coastFireAge).toFixed(2) : ''} `}
            in {`${((projections.result.coastFireAge ? projections.result.coastFireAge : 0) - currentAge).toFixed(2)} years`}
            )
        </div >
    }

    const faPropIcon = faGithub as IconProp;

    // TODO: show a stacked area chart of pricipal, contributions, and interest
    return (
        <>
            <ScopedCssBaseline>
                <Container maxWidth="md">
                    <Stack spacing={2}>
                        <Stack direction="row" justifyContent="center" alignItems="center" spacing={2}>
                            <h2>Coast FIRE Calculator</h2>
                            <Link href="https://github.com/BradyBolton/coast-fire-calculator">
                                <FontAwesomeIcon icon={faPropIcon} size="xl" />
                            </Link>
                        </Stack>
                    </Stack>
                    <Paper sx={{ p: 2 }} elevation={2}>
                        <Stack spacing={2}>
                            <TextField
                                id="current-age"
                                label="Current Age"
                                size="small"
                                inputProps={{
                                    type: "number",
                                    inputMode: 'numeric',
                                    pattern: '[0-9]*'
                                }}
                            />
                            <Range
                                labelText="Retirement Age"
                                minValue={currentAge}
                                maxValue={100}
                                defaultValue={60}
                                step={1}
                            />
                            <Range
                                labelText="APR (return)"
                                minValue={0.01}
                                maxValue={20}
                                defaultValue={7}
                                step={0.01}
                                format="percentage"
                            />
                            <Range
                                labelText="Contributions (monthly)"
                                minValue={0}
                                maxValue={15000}
                                defaultValue={1200}
                                step={0.01}
                                format="money"
                            />
                            <Range
                                labelText="FIRE Number"
                                minValue={1000}
                                maxValue={6000000}
                                defaultValue={2000000}
                                step={1000}
                                format="money"
                            />
                            <Range
                                labelText="Initial Value"
                                minValue={0}
                                maxValue={fireNumber}
                                defaultValue={2000000}
                                step={1000}
                                format="money"
                            />
                        </Stack>
                    </Paper>


                    <Box sx={{ p: 2 }}>
                        <Typography sx={{
                            flexGrow: 1,
                            textAlign: "center"
                        }} variant="body1">
                            {summaryMessage}
                        </Typography>
                    </Box>

                </Container>

                <fieldset>
                    <legend>Parameters</legend>
                    <div className="paramContainer">
                        <label className="paramLabel" htmlFor="currentAge">Current Age: </label>
                        <input id="currentAgeInput" name="currentAge" type="number"
                            // treat zero as someone in the process of inputting their age
                            // because who would *possibly* be trying to do this for a newborn right? (heh)
                            value={currentAge ? currentAge : ''}
                            min="15" max="100" step="1"
                            onInput={(e) => {
                                const et = e.target as HTMLInputElement;
                                // default to 0 if empty, otherwise app will explode
                                setCurrentAge(parseInt(et.value !== "" ? et.value : "0"))
                            }}
                        />
                    </div>

                    <br />

                    <div className="paramContainer">
                        <label className="paramLabel" htmlFor="retireAge">Retirement Age: <em>{retireAge}</em></label>
                        <input
                            id="retireAgeInput" className="rangeInput" name="retireAge" type="range"
                            value={retireAge}
                            min={currentAge} max="100" step="1"
                            onInput={(e) => {
                                const et = e.target as HTMLInputElement;
                                setRetireAge(parseFloat(et.value))
                            }}
                        />
                    </div>

                    <div className="paramContainer">
                        <label className="paramLabel" htmlFor="apr">APR (return): <em>{(rate * 100).toFixed(2)}%</em></label>
                        <input
                            id="rateInput" className="rangeInput" name="apr" type="range"
                            value={rate}
                            min="0" max="0.2" step="0.001"
                            list="rateValues"
                            onInput={(e) => {
                                const et = e.target as HTMLInputElement;
                                setRate(parseFloat(et.value))
                            }}
                        />
                        <datalist id="rateValues">
                            <option value="0" label="0"></option>
                            <option value="0.04" label="4%"></option>
                            <option value="0.08" label="8%"></option>
                            <option value="0.12" label="12%"></option>
                            <option value="0.16" label="16%"></option>
                            <option value="0.20" label="20%"></option>
                        </datalist>
                    </div>

                    <div className="paramContainer">
                        <label className="paramLabel" htmlFor="pmtMonthly">Contributions (monthly): <em>${pmtMonthly.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</em></label>
                        <input
                            id="pmtMonthlyInput" className="rangeInput" name="pmtMonthly" type="range"
                            value={pmtMonthly}
                            min="0" max="15000" step="50"
                            onInput={(e) => {
                                const et = e.target as HTMLInputElement;
                                setPmtMonthly(parseFloat(et.value))
                            }}
                        />
                    </div>

                    <div className="paramContainer">
                        <label className="paramLabel" htmlFor="fireNumber">Fire Number: <em>${fireNumber.toLocaleString()}</em>
                            <br />
                            4% rule: <em>${(fireNumber * 0.04).toLocaleString()}/yr</em> at <em>${(fireNumber * 0.04 / 12).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mo</em>
                            <br />
                            3% rule: <em>${(fireNumber * 0.03).toLocaleString()}/mo</em> at <em>${(fireNumber * 0.03 / 12).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mo</em>
                            <br />
                            2% rule: <em>${(fireNumber * 0.02).toLocaleString()}/mo</em> at <em>${(fireNumber * 0.02 / 12).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mo</em>
                        </label>
                        <input
                            id="fireNumberInput" className="rangeInput" name="fireNumber" type="range"
                            value={fireNumber}
                            min={principal} max="6000000" step="1000"
                            onInput={(e) => {
                                const et = e.target as HTMLInputElement;
                                setFireNumber(parseFloat(et.value))
                            }}
                        />
                    </div>

                    <div className="paramContainer">
                        <label className="paramLabel" htmlFor="principal">Initial value: <em>${principal.toLocaleString()}</em></label>
                        <input
                            id="principalInput" className="rangeInput" name="principal" type="range"
                            value={principal}
                            min="0" max="1000000" step="100"
                            onInput={(e) => {
                                const et = e.target as HTMLInputElement;
                                setPrincipal(parseFloat(et.value))
                            }}
                        />
                    </div>
                </fieldset>

                {summaryMessage}


            </ScopedCssBaseline>

            {/* keep graph outside of scoped baseline because MUI css seems to completely wreck chart.js */}
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
        </>
    );
}

export default App;
