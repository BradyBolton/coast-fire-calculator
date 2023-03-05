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

interface CoastFireDatum {
    x: string, // '2016-12-25'
    y: number  // value (usd)
}

// CoastFireData represents the generateDataSets return structure containing all
// the data needed to draw the graph
interface CoastFireData {
    preCoastData: CoastFireDatum[] // today -> coast fire date, inclusive
    postCoastData: CoastFireDatum[] // coast fire date -> retire date, inclusive
    result: CoastFireResult
    xMin: DateTime,
    xMax: DateTime,
    yMin: number,
    yMax: number,
}

// futureValue carries out a simple compound interest formula
// reference: https://www.thecalculatorsite.com/finance/calculators/compound-interest-formula
const futureValue = (p: number, r: number, n: number, t: number): number => {
    return p * Math.pow(1 + (r / n), n * t)
}

// futureValueSeries calculates the future value of a series of payments
// reference: https://www.thecalculatorsite.com/articles/finance/future-value-formula.php 
const futureValueSeries = (pmt: number, r: number, n: number, t: number, p: number = 0): number => {
    return pmt * ((Math.pow(1 + (r / n), n * t) - 1) / (r / n)) + futureValue(p, r, n, t)
}

// pmtMonthlyToDaily is a quick helper function to average out monthly payments per day
const pmtMonthlyToDaily = (monthlyPmt: number): number => {
    return monthlyPmt * 12 / 365
}

// convergeCoastFire numerically resolves the coast fire amount and date (there's probably a much simpler way)
// note: convergence won't work if coast fire is technically impossible (returning a mostly undefined result)
const convergeCoastFire = (iterations: number,
    fireNumber: number, currentAge: number, retirementAge: number,
    pmt: number, min: number, max: number, rate: number, principal: number = 0,
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
        const finalAmount = futureValue(coastAmount, rate, 365, numCoastingYears)

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
            return convergeCoastFire(iterations - 1, fireNumber, currentAge, retirementAge, pmt, newMin, newMax, rate, principal, newResult)
        }
    }

    return result
}

// calculate the coast fire amount and age necessary to retire at a given age with a given retirement goal at some rate of return
const calculateCoastFire = (fireNumber: number, currentAge: number, retirementAge: number, rate: number, monthlyContribution: number, principal: number = 0): CoastFireResult => {
    if (futureValue(principal, rate, 365, retirementAge - currentAge) >= fireNumber) {
        return {
            isPossible: true,
            alreadyCoastFire: true,
            coastFireNumber: undefined,
            coastFireAge: undefined,
            finalAmount: undefined,
            coastFireDate: undefined
        }
    }

    const pmt = pmtMonthlyToDaily(monthlyContribution)

    // TODO: make compounding period a parameter
    const yearsTilRetirement = retirementAge - currentAge
    for (let i = 1; i < (yearsTilRetirement + 1); i++) {
        const coastAmount = futureValueSeries(pmt, rate, 365, i, principal)
        const numCoastYears = retirementAge - i - currentAge
        const finalAmount = futureValue(coastAmount, rate, 365, numCoastYears)

        if (finalAmount > fireNumber) {
            // hard-coded 3 iterations to converge toward coast fire data
            return convergeCoastFire(3, fireNumber, currentAge, retirementAge, pmt, i - 1, i, rate, principal, undefined)
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
        const formattedDate: string = obj.toISO()
        map[formattedDate] = obj
        return map;
    }, {});

    return result;
}

// Return the value for the outer data field used to paint the line chart
const generateDataSets = (fireNumber: number, currentAge: number, retirementAge: number,
    rate: number, monthlyContribution: number, principal: number = 0): CoastFireData => {

    const result = calculateCoastFire(fireNumber, currentAge, retirementAge, rate, monthlyContribution, principal)

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
            const yearsElapsed = date.diff(today, 'years').years
            const dataPoint = {
                x: dateStr,
                y: futureValueSeries(pmtMonthlyToDaily(monthlyContribution), rate, 365, yearsElapsed, principal)
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
            const yearsElapsed = date.diff(today, 'years').years
            const dataPoint = {
                x: dateStr,
                y: futureValueSeries(pmtMonthlyToDaily(monthlyContribution), rate, 365, yearsElapsed, principal)
            }
            data.preCoastData.push(dataPoint)
        }
        for (const [dateStr, date] of Object.entries(postCoastDates)) {
            const yearsElapsed = date.diff(coastFireDate, 'years').years
            const dataPoint = {
                x: dateStr,
                // note: do not use result.coastFireDate because there would be a gap in the graph
                y: futureValue(data.preCoastData[data.preCoastData.length - 1].y, rate, 365, yearsElapsed)
            }
            data.postCoastData.push(dataPoint)
        }

    } else if (result.alreadyCoastFire) {

        // case 3: only draw post-coast graph
        postCoastDates = getDatesFormatted(today, fireDate, 10)

        for (const [dateStr, date] of Object.entries(postCoastDates)) {
            const yearsElapsed = date.diff(coastFireDate, 'years').years
            const dataPoint = {
                x: dateStr,
                // note: do not use result.coastFireDate because there would be a gap in the graph
                y: futureValue(principal, rate, 365, yearsElapsed)
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