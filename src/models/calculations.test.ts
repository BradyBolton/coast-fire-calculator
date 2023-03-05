import {
    calculateCoastFire,
    futureValue,
    futureValueSeries,
    generateDataSets,
    getDatesFormatted,
    pmtMonthlyToDaily,
} from './calculations';

import { DateTime } from "luxon";

const epsilon = 0.01

// simple growth of $1000 over 10 years at %7 APR compounded daily
it('simple compound interest', () => {
    const fv = futureValue(1000, 0.07, 365, 10)
    const expected = 2013.62
    expect(Math.abs(fv - expected)).toBeLessThan(epsilon);
});

// $500 per month, 0 pricipal for 10 years at 7% APR compounded daily
it('compound interest with contributions', () => {
    const pmt = pmtMonthlyToDaily(500)
    const fv = futureValueSeries(pmt, 0.07, 365, 10)
    const expected = 86881.51
    expect(Math.abs(fv - expected)).toBeLessThan(epsilon);
});

// calculate coast fire scenario for someone contributing $3070 per month, 
// 0 pricipal for 12.2 years at 7% APR compounded daily
it('calculate coast fire date successfully', () => {
    const result = calculateCoastFire(2000000, 23, 50, 0.07, 3070)
    const expected = {
        coastFireNumber: 709784.41,
        coastFireAge: 35.199,
        finalAmount: 2000000,
    }

    expect(result.isPossible).toBeTruthy();
    if (result.coastFireNumber !== undefined) {
        expect(Math.abs(result.coastFireNumber - expected.coastFireNumber)).toBeLessThan(epsilon);
    } else {
        fail('Coast fire number was undefined but got isPossible: true')
    }
    if (result.coastFireAge !== undefined) {
        expect(Math.abs(result.coastFireAge - expected.coastFireAge)).toBeLessThan(epsilon);
    } else {
        fail('Coast fire age was undefined but got isPossible: true')
    }
});

// calculate an unsuccessful coast fire scenario for a person whose ambition
// outstripes their earnings
it('calculate coast fire date unsuccessfully', () => {
    const result = calculateCoastFire(2000000, 23, 40, 0.07, 2000)

    expect(result.isPossible).toBeFalsy();
    expect(result.coastFireNumber).toBeUndefined();
    expect(result.coastFireAge).toBeUndefined();
    expect(result.finalAmount).toBeUndefined();
});

it('calculate record of 7 consecutive days', () => {
    const a = DateTime.fromISO('2023-01-26T17:36')
    const b = a.plus({ days: 6 })

    const expected = {
        "2023-01-26T17:36:00.000-05:00": a,
        "2023-01-27T17:36:00.000-05:00": a.plus({ days: 1 }),
        "2023-01-28T17:36:00.000-05:00": a.plus({ days: 2 }),
        "2023-01-29T17:36:00.000-05:00": a.plus({ days: 3 }),
        "2023-01-30T17:36:00.000-05:00": a.plus({ days: 4 }),
        "2023-01-31T17:36:00.000-05:00": a.plus({ days: 5 }),
        "2023-02-01T17:36:00.000-05:00": a.plus({ days: 6 }),
    }

    // a list of 7 timestamps, equally spaced apart, between 'a' and 'b', including 'a' and 'b'
    const result = getDatesFormatted(a, b, 7)

    expect(result).toEqual(expected);
})

it('calculate record of 10 equidistant dates', () => {
    const startDate = DateTime.fromISO("2023-03-05T17:24:21.792-05:00")
    const endDate = DateTime.fromISO("2030-06-24T21:00:21.792-04:00")

    const result = getDatesFormatted(startDate, endDate, 10)
    expect(Object.keys(result).length).toEqual(10);
})

it('calculate datapoints of accumulation phase', () => {
    const result = generateDataSets(2000000, 23, 50, 0.07, 3000)

    // just validate the values, not the timestamps (we would be able to test
    // both the 'x' and 'y' values if we used dependency injection)
    const expectedPreCoastValues = [
        0,
        53080.70696295287,
        111770.050604734,
        176490.76995464208,
        247825.07003303213,
        326652.38124900963,
        413556.41738648433,
        509422.18698339653,
        615298.2151632777,
        731979.9605696297, // <- approximate coast number
    ]
    const expectedPostCoastValues = [
        731979.9605696297, // <- post coast begins at approximate coast fire date
        818206.8051920788,
        914773.8357560807,
        1022569.3620559797,
        1143197.687580515,
        1278110.8288341898,
        1428671.5952278373,
        1597287.3690478806,
        1785521.7229659478,
        1996154.3995112309, // <- approximate fire date
    ]

    const preCoastValues = result.preCoastData.map((x) => {
        return x.y
    })
    const postCoastValues = result.postCoastData.map((x) => {
        return x.y
    })

    expect(preCoastValues).toEqual(expectedPreCoastValues)
    expect(postCoastValues).toEqual(expectedPostCoastValues)
})


it('zero FIRE number', () => {
    const result = calculateCoastFire(0, 35, 60, 0.07, 1000)

    expect(result.isPossible).toBeTruthy();
    expect(result.coastFireNumber).toBeUndefined();
    expect(result.coastFireAge).toBeUndefined();
    expect(result.finalAmount).toBeUndefined();
});

interface CoastFireDatum {
    x: string, // '2016-12-25'
    y: number  // value (usd)
}

it('use dates within a single day to calculate a future value series', () => {
    const a = DateTime.fromISO('2023-01-26')
    const b = a.plus({ days: 1 })

    const dates: Record<string, DateTime> = getDatesFormatted(a, b, 10)
    let result = []

    for (const [dateStr, date] of Object.entries(dates)) {
        const yearsElapsed = date.diff(a, 'years').years
        const dataPoint = {
            x: dateStr,
            y: futureValueSeries(pmtMonthlyToDaily(1000), 0.07, 365, yearsElapsed, 0)
        }
        result.push(dataPoint)
    }
    expect(result.length).toEqual(10)
})