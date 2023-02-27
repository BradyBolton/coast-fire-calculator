// css import
import "./App.css";

// local imports
import { generateDataSet } from "./models/calculations";

// library imports
import React, { useState } from "react";

// component imports
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLock, faLockOpen } from '@fortawesome/free-solid-svg-icons'

export const options = {
    animation: false,
    responsive: true,
    plugins: {
        legend: {
            position: "top",
        },
        title: {
            display: true,
            text: "Chart.js Line Chart",
        },
    },
};

function App(props: any) {
    ChartJS.register(
        CategoryScale,
        LinearScale,
        PointElement,
        LineElement,
        Title,
        Tooltip,
        Legend
    );

    // setup local state (coast fire parameters)
    const [rate, setRate] = useState(0.07); // default to 7% APR
    const [currentAge, setCurrentAge] = useState(35);
    const [retireAge, setRetireAge] = useState(50);
    const [retireAgeLock, setRetireAgeLock] = useState(false);
    const [pmtMonthly, setPmtMonthly] = useState(1000);
    const [fireNumber, setFireNumber] = useState(2000000);

    const lockIcon = retireAgeLock ? <FontAwesomeIcon icon={faLock} /> : <FontAwesomeIcon color="red" icon={faLockOpen} />;

    const projection = generateDataSet(fireNumber, currentAge, retireAge, rate, pmtMonthly).data
    const data = {
        datasets: [
            {
                label: "Accumulation Phase",
                data: projection,
                borderColor: "rgb(255, 99, 132)",
                backgroundColor: "rgba(255, 99, 132, 0.5)",
            },
        ],
    };

    // TODO: maybe add a tool-tip showing the math as to why FIRE is not possible
    const errorMessage = <div id="error">{projection.length === 0 ? 'FIRE is not possible with given parameters' : ''}</div>

    // show a stacked area chart of pricipal, contributions, and interest
    return (
        <div className="App">
            <h1>Coast FIRE Calculator</h1>

            <fieldset>
                <legend>Parameters</legend>
                <div className="paramContainer">
                    {/*
                        <button className="paramLockToggle" onClick={(e) => {
                            setRetireAgeLock(!retireAgeLock)
                        }}>
                            {lockIcon}
                        </button>
                    */}
                    <label className="paramLabel" htmlFor="currentAge">Current Age: </label>
                    <input id="currentAgeInput" name="currentAge" type="number"
                        value={currentAge}
                        min="15" max="100" step="1"
                        onInput={(e) => {
                            const et = e.target as HTMLInputElement;
                            setCurrentAge(parseInt(et.value))
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
                        min="0" max="0.2" step="any"
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
                        min="0" max="15000" step="any"
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
                        min="10000" max="6000000" step="1000"
                        onInput={(e) => {
                            const et = e.target as HTMLInputElement;
                            setFireNumber(parseFloat(et.value))
                        }}
                    />
                </div>
            </fieldset>

            {errorMessage}

            <div id="graph">
                <Line data={data} />
            </div>

        </div>
    );
}

export default App;
