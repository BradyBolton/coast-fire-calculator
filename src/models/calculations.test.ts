import { futureValue, futureValueSeries, pmtMonthlyToDaily, calculateCoastFire, getDatesFormatted, generateDataSet } from './calculations';

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

it('calculate record of 8 consecutive days', () => {
    const today = new Date()
    const a = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const b = new Date(a.getFullYear(), a.getMonth(), a.getDate() + 7);

    const expected = {
        '2023-02-26': new Date(a.getFullYear(), a.getMonth(), a.getDate()),
        '2023-02-27': new Date(a.getFullYear(), a.getMonth(), a.getDate() + 1),
        '2023-02-28': new Date(a.getFullYear(), a.getMonth(), a.getDate() + 2),
        '2023-03-01': new Date(a.getFullYear(), a.getMonth(), a.getDate() + 3),
        '2023-03-02': new Date(a.getFullYear(), a.getMonth(), a.getDate() + 4),
        '2023-03-03': new Date(a.getFullYear(), a.getMonth(), a.getDate() + 5),
        '2023-03-04': new Date(a.getFullYear(), a.getMonth(), a.getDate() + 6),
        '2023-03-05': new Date(a.getFullYear(), a.getMonth(), a.getDate() + 7),
    }

    const result = getDatesFormatted(a, b, 1)
    expect(result).toEqual(expected);
})

it('calculate datapoints of accumulation phase', () => {
    const data = generateDataSet(2000000, 23, 50, 0.07, 3000)
    const expected = {
        data: [
            { x: '2023-02-26', y: 0 },
            { x: '2024-06-01', y: 47534.254094779266 },
            { x: '2025-09-05', y: 99461.99074134445 },
            { x: '2026-12-10', y: 156189.28949854075 },
            { x: '2028-03-15', y: 218159.7629314719 },
            { x: '2029-06-19', y: 285858.0257015538 },
            { x: '2030-09-23', y: 359813.48429664073 },
            { x: '2031-12-28', y: 440604.47703725065 },
            { x: '2033-04-02', y: 528862.796734114 },
            { x: '2034-07-07', y: 625278.6313646277 },
            { x: '2035-10-11', y: 730605.9614047556 }
        ]
    }

    expect(data).toEqual(expected)
})

