// css import
import "./App.css";

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

const labels = ["January", "February", "March", "April", "May", "June", "July"];

export const options = {
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

export const data = {
    labels,
    datasets: [
        {
            label: "Dataset 1",
            data: labels.map(() =>
                200
            ),
            borderColor: "rgb(255, 99, 132)",
            backgroundColor: "rgba(255, 99, 132, 0.5)",
        },
        {
            label: "Dataset 2",
            data: labels.map(() =>
                200
            ),
            borderColor: "rgb(53, 162, 235)",
            backgroundColor: "rgba(53, 162, 235, 0.5)",
        },
    ],
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

    const lockIcon = retireAgeLock ? <FontAwesomeIcon icon={faLock} /> : <FontAwesomeIcon color="red" icon={faLockOpen} />;

    // show a stacked area chart of pricipal, contributions, and interest
    return (
        <div className="App">
            <h1>Coast FIRE Calculator</h1>

            <fieldset>
                <legend>Parameters</legend>
                <div>
                    <button className="paramLockToggle" onClick={(e) => {
                        setRetireAgeLock(!retireAgeLock)
                    }}>
                        {lockIcon}
                    </button>
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

                <div>
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

                <div>
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
            </fieldset>

            <div id="graph">
                <Line data={data} />
            </div>

        </div>
    );
}

export default App;
