// simple compound interest formula
// reference: https://www.thecalculatorsite.com/finance/calculators/compound-interest-formula
const futureValue = (p: number, r: number, n: number, t: number): number => {
    return p * Math.pow(1 + (r / n), n * t)
}

// calculate the future value of a series of payments
// reference: https://www.thecalculatorsite.com/articles/finance/future-value-formula.php 
const futureValueSeries = (pmt: number, r: number, n: number, t: number): number => {
    return pmt * ((Math.pow(1 + (r / n), n * t) - 1) / (r / n))
}

// quick helper function to average out monthly payments per day
const pmtMonthlyToDaily = (monthlyPmt: number): number => {
    return monthlyPmt * 12 / 365
}

interface CoastFireResult {
    isPossible: boolean;
    coastFireNumber: number | undefined;
    coastFireAge: number | undefined;
    finalAmount: number | undefined;
}

// numerically resolve the coast fire amount and date (I can't be bothered to figure out the symbolic math)
const convergeCoastFire = (iterations: number,
    fireNumber: number, currentAge: number, retirementAge: number,
    pmt: number, min: number, max: number, rate: number,
    coastFireResult: CoastFireResult | undefined): CoastFireResult => {

    // default response indicating failure to compute coast fire number and year
    let result: CoastFireResult = coastFireResult !== undefined ? coastFireResult : {
        isPossible: false,
        coastFireNumber: undefined,
        coastFireAge: undefined,
        finalAmount: undefined,
    }

    // return base case
    if (iterations === 0 && coastFireResult !== undefined) {
        return coastFireResult
    }

    // otherwise continue iteration and converge onto a suitable coast fire result
    const step = (max - min) / 10
    for (let i = 1; i < 11; i++) {
        const numActiveYears = min + (i * step)
        const coastAmount = futureValueSeries(pmt, rate, 365, numActiveYears)
        const numCoastYears = retirementAge - numActiveYears - currentAge
        const finalAmount = futureValue(coastAmount, rate, 365, numCoastYears)

        if (finalAmount > fireNumber) {
            const newMin = min + ((i - 1) * step)
            const newMax = numActiveYears
            const newResult: CoastFireResult = {
                isPossible: true,
                coastFireNumber: coastAmount,
                coastFireAge: numActiveYears + currentAge,
                finalAmount: finalAmount
            }
            return convergeCoastFire(iterations - 1, fireNumber, currentAge, retirementAge, pmt, newMin, newMax, rate, newResult)
        }
    }

    return result
}

// calculate the coast fire amount and age necessary to retire at a given age with a given retirement goal at some rate of return
const calculateCoastFire = (fireNumber: number, currentAge: number, retirementAge: number, rate: number, monthlyContribution: number): CoastFireResult => {
    const pmt = pmtMonthlyToDaily(monthlyContribution)

    // TODO: remove hardcoded compounding period?
    for (let i = 1; i < retirementAge + 1; i++) {
        const coastAmount = futureValueSeries(pmt, rate, 365, i)
        const numCoastYears = retirementAge - i - currentAge
        const finalAmount = futureValue(coastAmount, rate, 365, numCoastYears)

        if (finalAmount > fireNumber) {
            // hard-coded 3 iterations to converge toward coast fire data
            return convergeCoastFire(3, fireNumber, currentAge, retirementAge, pmt, i - 1, i, rate, undefined)
        }
    }

    return {
        isPossible: false,
        coastFireNumber: undefined,
        coastFireAge: undefined,
        finalAmount: undefined,
    }
}

export { futureValue, futureValueSeries, pmtMonthlyToDaily, calculateCoastFire }