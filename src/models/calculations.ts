// simple compound interest formula

// reference: https://www.thecalculatorsite.com/finance/calculators/compound-interest-formula
const futureValue = (p: number, r: number, n: number, t: number): number => {
    return p * Math.pow(1 + (r / n), n * t)
}

// calculate the future value of a series of payments
// reference: https://www.thecalculatorsite.com/articles/finance/future-value-formula.php 
const futureValueSeries = (pmt: number, r: number, n: number, t: number, p: number = 0): number => {
    return pmt * ((Math.pow(1 + (r / n), n * t) - 1) / (r / n)) + futureValue(p, r, n, t)
}

// quick helper function to average out monthly payments per day
const pmtMonthlyToDaily = (monthlyPmt: number): number => {
    return monthlyPmt * 12 / 365
}

interface CoastFireResult {
    isPossible: boolean;
    alreadyCoastFire: boolean;
    coastFireNumber: number | undefined;
    coastFireAge: number | undefined;
    coastFireDate: Date | undefined;
    finalAmount: number | undefined;
}

// numerically resolve the coast fire amount and date (I can't be bothered to figure out the symbolic math)
// note: convergence won't work if coast fire is technically impossible (returning a mostly undefined result)
const convergeCoastFire = (iterations: number,
    fireNumber: number, currentAge: number, retirementAge: number,
    pmt: number, min: number, max: number, rate: number, principal: number = 0,
    coastFireResult: CoastFireResult | undefined): CoastFireResult => {

    const today = new Date()

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
        const numActiveYears = min + (i * step)
        const coastAmount = futureValueSeries(pmt, rate, 365, numActiveYears, principal)
        const numCoastYears = retirementAge - numActiveYears - currentAge
        const finalAmount = futureValue(coastAmount, rate, 365, numCoastYears)

        if (finalAmount > fireNumber) {
            const newMin = min + ((i - 1) * step)
            const newMax = numActiveYears
            const newResult: CoastFireResult = {
                isPossible: true,
                alreadyCoastFire: false,
                coastFireNumber: coastAmount,
                coastFireAge: numActiveYears + currentAge,
                coastFireDate: convertYearsElapsedToDate(today, numActiveYears),
                finalAmount: finalAmount
            }
            return convergeCoastFire(iterations - 1, fireNumber, currentAge, retirementAge, pmt, newMin, newMax, rate, principal, newResult)
        }
    }

    return result
}

const convertYearsElapsedToDate = (startDate: Date, yearsElapsed: number): Date => {
    const elapsedDays = Math.ceil(yearsElapsed * 365);
    return new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + elapsedDays);
}

// calculate the coast fire amount and age necessary to retire at a given age with a given retirement goal at some rate of return
const calculateCoastFire = (fireNumber: number, currentAge: number, retirementAge: number, rate: number, monthlyContribution: number, principal: number = 0): CoastFireResult => {

    if (futureValue(principal, rate, 365, retirementAge - currentAge) >= fireNumber) {
        console.log('already coast fire')
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

interface CoastFireDatum {
    x: string, // '2016-12-25'
    y: number  // value (usd)
}

interface CoastFireData {
    preCoastData: CoastFireDatum[] // today -> coast fire date, inclusive
    postCoastData: CoastFireDatum[] // coast fire date -> retire date, inclusive
    result: CoastFireResult
}

const getDates = (startDate: Date, stopDate: Date, stepDays: number) => {
    var dateArray: Date[] = new Array();
    var currentDate = new Date(startDate);
    while (currentDate <= stopDate) {
        dateArray.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + stepDays);
    }
    return dateArray;
}

const formatDate = (date: Date): string => {
    return date.getUTCFullYear() + "-" +
        ("0" + (date.getUTCMonth() + 1)).slice(-2) + "-" +
        ("0" + date.getUTCDate()).slice(-2)
}

const getDatesFormatted = (startDate: Date, stopDate: Date, stepDays: number): Record<string, Date> => {
    let dates = getDates(startDate, stopDate, stepDays)

    var result = dates.reduce(function (map: Record<string, Date>, obj: Date) {
        const formattedDate: string = formatDate(obj)
        map[formattedDate] = obj
        return map;
    }, {});

    return result;
}

// shamelessly stolen: https://stackoverflow.com/a/15289883
// we simply care about the days between, so UTC is appropriate since it does not observe
// daylight savings, and for simplicity we will simply assume that a year is 365 days
function dateDiffInDays(a: Date, b: Date) {
    const _MS_PER_DAY = 1000 * 60 * 60 * 24;
    // Discard the time and time-zone information.
    const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

    return Math.floor((utc2 - utc1) / _MS_PER_DAY);
}

// Return the value for the outer data field used to paint the line chart
const generateDataSets = (fireNumber: number, currentAge: number, retirementAge: number, rate: number, monthlyContribution: number, principal: number = 0): CoastFireData => {

    const result = calculateCoastFire(fireNumber, currentAge, retirementAge, rate, monthlyContribution, principal)

    let data: CoastFireData = {
        preCoastData: [],
        postCoastData: [],
        result: result
    }

    // check if the principal is already high enough to achieve FIRE at retirement age
    if (result.alreadyCoastFire) {
        return data
    }

    if (result.isPossible) {
        // be careful: only use days for date calculations when using calculation results
        const today = new Date()

        // get chart maximum date as Date object
        const daysTotal = ((retirementAge - currentAge) * 365)
        const fireDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + daysTotal);

        // get coast fire date as Date object
        const daysAccumulating = ((result.coastFireAge ?? 0) - currentAge) * 365
        const coastFireDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + daysAccumulating);

        // accumulation phase
        const preCoastStep = Math.floor(dateDiffInDays(today, coastFireDate) / 10) // TODO: figure out a better way to handle step
        const preCoastDates: Record<string, Date> = getDatesFormatted(today, coastFireDate, preCoastStep)

        // coasting phase
        const postCoastStep = Math.floor(dateDiffInDays(coastFireDate, fireDate) / 10) // TODO: figure out a better way to handle step
        const postCoastDates: Record<string, Date> = getDatesFormatted(coastFireDate, fireDate, postCoastStep)

        for (const [dateStr, date] of Object.entries(preCoastDates)) {
            // years elapsed since current age
            const yearsElapsed = dateDiffInDays(today, date) / 365.0
            const dataPoint = {
                x: dateStr,
                y: futureValueSeries(pmtMonthlyToDaily(monthlyContribution), rate, 365, yearsElapsed, principal)
            }
            data.preCoastData.push(dataPoint)
        }

        for (const [dateStr, date] of Object.entries(postCoastDates)) {
            // years elapsed since current age
            const yearsElapsed = dateDiffInDays(coastFireDate, date) / 365.0
            const dataPoint = {
                x: dateStr,
                y: futureValue(result.coastFireNumber ?? 0, rate, 365, yearsElapsed)
            }
            data.postCoastData.push(dataPoint)
        }

        // append the specific coast fire day to datasets
        const yearsElapsed = dateDiffInDays(today, coastFireDate) / 365.0
        const dataPoint = {
            x: formatDate(result.coastFireDate ?? today), // technically an x value of today would never happen
            y: futureValueSeries(pmtMonthlyToDaily(monthlyContribution), rate, 365, yearsElapsed, principal)
        }
        data.preCoastData.push(dataPoint)
        data.postCoastData.unshift(dataPoint)
    }
    return data

}

export { futureValue, futureValueSeries, pmtMonthlyToDaily, calculateCoastFire, getDatesFormatted, generateDataSets }