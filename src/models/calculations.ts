import { DateTime } from "luxon"; // native date handling is trash

// CoastFireResult represents the convergeCoastFire() return structure
interface CoastFireResult {
    isPossible: boolean;
    alreadyCoastFire: boolean;
    coastFireNumber: number | undefined;
    coastFireAge: number | undefined;
    coastFireDate: DateTime | undefined;
    finalAmount: number | undefined;
}

export interface CoastFireDatum {
    x: string, // '2016-12-25'
    y: number  // value (usd)
}

// CoastFireData represents the generateDataSets return structure containing all
// the data needed to draw the graph
export interface CoastFireData {
    preCoastData: CoastFireDatum[] // today -> coast fire date, inclusive
    postCoastData: CoastFireDatum[] // coast fire date -> retire date, inclusive
    result: CoastFireResult
    xMin: DateTime,
    xMax: DateTime,
    yMin: number,
    yMax: number,
    calcValue: (date: DateTime) => number,
}

// futureValue carries out a simple compound interest formula
// reference: https://www.thecalculatorsite.com/finance/calculators/compound-interest-formula
const futureValue = (p: number, r: number, n: number, t: number): number => {
    return p * Math.pow(1 + (r / n), n * t)
}

// futureValueSeries calculates the future value of a series of payments
// reference: https://www.thecalculatorsite.com/articles/finance/future-value-formula.php 
const futureValueSeries = (pmt: number, r: number, n: number, t: number, p: number = 0): number => {
    if (r > 0) {
        return pmt * ((Math.pow(1 + (r / n), n * t) - 1) / (r / n)) + futureValue(p, r, n, t)
    }
    return p + (pmt * n * t) // no interest accumulation
}

// pmtMonthlyToDaily is a quick helper function to average out monthly payments per day
const pmtMonthlyToDaily = (monthlyPmt: number): number => {
    return monthlyPmt * 12 / 365
}

// convergeCoastFire numerically resolves the coast fire amount and date (there's probably a much simpler way)
// note: convergence won't work if coast fire is technically impossible (returning a mostly undefined result)
const convergeCoastFire = (iterations: number,
    fireNumber: number, currentAge: number, retirementAge: number,
    pmt: number, min: number, max: number, rate: number, principal: number = 0, pmtBarista: number = 0,
    coastFireResult: CoastFireResult | undefined): CoastFireResult => {

    const today: DateTime = DateTime.now()

    // default response indicating failure to compute coast fire number and year
    let result: CoastFireResult = coastFireResult !== undefined ? coastFireResult : {
        isPossible: false,
        alreadyCoastFire: false,
        coastFireNumber: undefined,
        coastFireAge: undefined,
        coastFireDate: undefined,
        finalAmount: undefined,
    }

    // return base case
    if (iterations === 0 && coastFireResult !== undefined) {
        return coastFireResult
    }

    // otherwise continue iteration and converge onto a suitable coast fire result
    const step = (max - min) / 10
    for (let i = 1; i < 11; i++) {
        const numSavingYears = min + (i * step)
        const coastAmount = futureValueSeries(pmt, rate, 365, numSavingYears, principal)
        const numCoastingYears = retirementAge - numSavingYears - currentAge
        const finalAmount = futureValueSeries(pmtBarista, rate, 365, numCoastingYears, coastAmount)

        if (finalAmount > fireNumber) {
            const newMin = min + ((i - 1) * step)
            const newMax = numSavingYears
            const newResult: CoastFireResult = {
                isPossible: true,
                alreadyCoastFire: false,
                coastFireNumber: coastAmount,
                coastFireAge: numSavingYears + currentAge,
                coastFireDate: today.plus({ years: numSavingYears }),
                finalAmount: finalAmount
            }
            return convergeCoastFire(iterations - 1, fireNumber, currentAge, retirementAge, pmt, newMin, newMax, rate, principal, pmtBarista, newResult)
        }
    }

    return result
}

// calculate the coast fire amount and age necessary to retire at a given age with a given retirement goal at some rate of return
const calculateCoastFire = (fireNumber: number, currentAge: number, retirementAge: number, rate: number,
    pmtMonthly: number, principal: number = 0, pmtMonthlyBarista: number = 0): CoastFireResult => {

    const pmt = pmtMonthlyToDaily(pmtMonthly)
    const pmtBarista = pmtMonthlyToDaily(pmtMonthlyBarista)

    // check if coast/barista FIRE has already been achieved:
    // (account for a sufficiently reckless barista withdrawal rate sabotaging an otherwise workable coast FIRE scenario)
    if (futureValueSeries(pmtBarista, rate, 365, retirementAge - currentAge, principal) >= fireNumber) {
        return {
            isPossible: true,
            alreadyCoastFire: true, // also counts as barista FIRE if |pmtBarista| > 0
            coastFireNumber: undefined,
            coastFireAge: undefined,
            finalAmount: undefined,
            coastFireDate: undefined
        }
    }

    // TODO: make compounding period a parameter
    const yearsTilRetirement = retirementAge - currentAge
    for (let i = 1; i < (yearsTilRetirement + 1); i++) {
        const coastAmount = futureValueSeries(pmt, rate, 365, i, principal)
        const numCoastYears = retirementAge - i - currentAge
        const finalAmount = futureValueSeries(pmtBarista, rate, 365, numCoastYears, coastAmount)

        if (finalAmount > fireNumber) {
            // hard-coded 3 iterations to converge toward coast fire data
            return convergeCoastFire(3, fireNumber, currentAge, retirementAge, pmt, i - 1, i, rate, principal, pmtBarista, undefined)
        }
    }

    // as numCoastYears approaches to 0, we approach a FIRE plan (no coasting)
    return {
        isPossible: false,
        alreadyCoastFire: false,
        coastFireNumber: undefined,
        coastFireAge: undefined,
        finalAmount: undefined,
        coastFireDate: undefined
    }
}

// getDates returns an array of Date objects of size numDates representing the window between startDate to endDate
// note: for some array of size n, indices from the first and n-1 will be spaced equally, but not n-1 to n (most likely)
const getDates = (startDate: DateTime, endDate: DateTime, numDates: number): DateTime[] => {
    const diffDays = endDate.diff(startDate, 'days').days // a float w/ residual
    const stepSize = diffDays / (numDates - 1)

    let dateArray: DateTime[] = [];
    let currentDate = startDate;
    for (let i = 0; i < numDates; i++) {
        dateArray.push(currentDate);
        currentDate = currentDate.plus({ days: stepSize }); // cloning not needed, this creates a new object (luxon's immutability)
    }
    dateArray.push(endDate);

    return dateArray;
}

// getDatesFormatted returns a map of DateTime objects indiced by its ISO string representation of size numDays
const getDatesFormatted = (startDate: DateTime, stopDate: DateTime, numDates: number): Record<string, DateTime> => {
    let dates = getDates(startDate, stopDate, numDates)

    let result = dates.reduce(function (map: Record<string, DateTime>, obj: DateTime) {
        const formattedDate: string = obj.toISO() ?? ''
        map[formattedDate] = obj
        return map;
    }, {});

    return result;
}

// function to generate such a closure
export const getValueCalculator = (result: CoastFireResult, currentAge: number,
    rate: number, pmtMonthly: number, principal: number = 0, pmtMonthlyBarista: number = 0): ((date: DateTime) => number) => {

    const today = DateTime.now()
    const daysTilCoast = ((result.coastFireAge ?? currentAge) - currentAge) * 365 // 0 if no coast fire
    const coastFireDate = today.plus({ days: daysTilCoast }) // if no coast fire possible, it will default to today

    // closure to calculate the Y-value (returned by this function for later use)
    return (date: DateTime): number => {
        let yearsElapsed = date.diff(today, 'years').years
        let res = 0;
        let p = principal;
        const coastFireNumber = futureValueSeries(pmtMonthlyToDaily(pmtMonthly), rate, 365, daysTilCoast/365, p);

        if (date > coastFireDate) {
            // post-coast-fire numbers require a different starting point
            if (result.isPossible) {
                p = coastFireNumber;
                yearsElapsed = date.diff(coastFireDate, 'years').years 
                res = futureValueSeries(pmtMonthlyToDaily(pmtMonthlyBarista), rate, 365, yearsElapsed, p);
            } else {
                res = futureValueSeries(pmtMonthlyToDaily(pmtMonthly), rate, 365, yearsElapsed, p);
            }
        } else if (date === coastFireDate) {
            res = coastFireNumber;
        } else {
            res = futureValueSeries(pmtMonthlyToDaily(pmtMonthly), rate, 365, yearsElapsed, p);
        }

        return res;
    }
}

// Return the value for the outer data field used to paint the line chart
const generateDataSets = (fireNumber: number, currentAge: number, retirementAge: number,
    rate: number, pmtMonthly: number, principal: number = 0, pmtMonthlyBarista: number = 0): CoastFireData => {

    const result = calculateCoastFire(fireNumber, currentAge, retirementAge, rate, pmtMonthly, principal, pmtMonthlyBarista)
    const valueCalculator = getValueCalculator(result, currentAge, rate, pmtMonthly, principal, pmtMonthlyBarista)

    const today = DateTime.now()
    const daysTilFire = ((retirementAge - currentAge) * 365)
    const fireDate = today.plus({ days: daysTilFire })
    const daysTilCoast = ((result.coastFireAge ?? currentAge) - currentAge) * 365 // 0 if no coast fire
    const coastFireDate = today.plus({ days: daysTilCoast }) // if no coast fire possible, it will default to today

    let data: CoastFireData = {
        preCoastData: [],
        postCoastData: [],
        result: result,
        xMin: today,
        xMax: fireDate,
        yMin: principal,
        yMax: Math.floor(fireNumber * 1.1),
        calcValue: valueCalculator,
    }

    /* At this point, 3 scenarios are possible
       1. FIRE is not possible
       2. coast FIRE is possible
       3. coast FIRE already achieved
     */

    let preCoastDates: Record<string, DateTime> | undefined
    let postCoastDates: Record<string, DateTime> | undefined

    if (!result.isPossible) {

        // case 1: only draw pre-coast graph
        preCoastDates = getDatesFormatted(today, fireDate, 10)

        for (const [dateStr, date] of Object.entries(preCoastDates)) {
            const dataPoint = {
                x: dateStr,
                y: valueCalculator(date)
            }
            data.preCoastData.push(dataPoint)
        }

        const finalValue = data.preCoastData[data.preCoastData.length - 1].y
        data.yMax = Math.floor(finalValue * 1.1)

    } else if (result.isPossible && !result.alreadyCoastFire) {

        // case 2: draw pre and post coast graphs
        preCoastDates = getDatesFormatted(today, coastFireDate, 10)
        postCoastDates = getDatesFormatted(coastFireDate, fireDate, 10)

        for (const [dateStr, date] of Object.entries(preCoastDates)) {
            const dataPoint = {
                x: dateStr,
                y: valueCalculator(date)
            }
            data.preCoastData.push(dataPoint)
        }
        for (const [dateStr, date] of Object.entries(postCoastDates)) {
            const dataPoint = {
                x: dateStr,
                // note: do not use result.coastFireDate because there would be a gap in the graph
                // that small gap is the difference between result.coastFireNumber and the actual y-val of the last point in preCoastData
                // y: futureValueSeries(pmtMonthlyToDaily(pmtMonthlyBarista), rate, 365, yearsElapsed, data.preCoastData[data.preCoastData.length - 1].y)
                y: valueCalculator(date)
            }
            data.postCoastData.push(dataPoint)
        }

        // accounts for die with zero scenarios
        const finalPreCoastValue = data.preCoastData[data.preCoastData.length - 1].y
        const finalPostCoastValue = data.postCoastData[data.postCoastData.length - 1].y
        data.yMax = Math.floor(Math.max(finalPreCoastValue, finalPostCoastValue) * 1.1)

    } else if (result.alreadyCoastFire) {

        // case 3: only draw post-coast graph
        postCoastDates = getDatesFormatted(today, fireDate, 10)

        for (const [dateStr, date] of Object.entries(postCoastDates)) {
            const yearsElapsed = date.diff(coastFireDate, 'years').years
            const dataPoint = {
                x: dateStr,
                // note: do not use result.coastFireDate because there would be a gap in the graph
                // y: futureValue(principal, rate, 365, yearsElapsed)
                y: futureValueSeries(pmtMonthlyToDaily(pmtMonthlyBarista), rate, 365, yearsElapsed, principal)
            }
            data.postCoastData.push(dataPoint)
        }

        const finalValue = data.postCoastData[data.postCoastData.length - 1].y
        data.yMax = Math.floor(finalValue * 1.1)

    }

    return data
}

export {
    calculateCoastFire,
    futureValue,
    futureValueSeries,
    generateDataSets,
    getDatesFormatted,
    pmtMonthlyToDaily,
}