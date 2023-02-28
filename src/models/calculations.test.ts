import { futureValue, futureValueSeries, pmtMonthlyToDaily, calculateCoastFire, getDatesFormatted, generateDataSets } from './calculations';

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
    const today = new Date(2023, 1, 26)
    const a = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const b = new Date(a.getFullYear(), a.getMonth(), a.getDate() + 7);

    const expected = {
        "2023-02-26T05:00:00.000Z": new Date(a.getFullYear(), a.getMonth(), a.getDate()),
        "2023-02-27T05:00:00.000Z": new Date(a.getFullYear(), a.getMonth(), a.getDate() + 1),
        "2023-02-28T05:00:00.000Z": new Date(a.getFullYear(), a.getMonth(), a.getDate() + 2),
        "2023-03-01T05:00:00.000Z": new Date(a.getFullYear(), a.getMonth(), a.getDate() + 3),
        "2023-03-02T05:00:00.000Z": new Date(a.getFullYear(), a.getMonth(), a.getDate() + 4),
        "2023-03-03T05:00:00.000Z": new Date(a.getFullYear(), a.getMonth(), a.getDate() + 5),
        "2023-03-04T05:00:00.000Z": new Date(a.getFullYear(), a.getMonth(), a.getDate() + 6),
    }

    const result = getDatesFormatted(a, b, 1)

    expect(result).toEqual(expected);
})

it('calculate datapoints of accumulation phase', () => {
    const result = generateDataSets(2000000, 23, 50, 0.07, 3000)

    // just validate the values, not the timestamps (we would be able to test
    // both the 'x' and 'y' values if we used dependency injection)
    const expectedPreCoastValues = [
        0,
        47534.254094779266,
        99461.99074134445,
        156189.28949854075,
        218159.7629314719,
        285858.0257015538,
        359813.48429664073,
        440604.47703725065,
        528862.796734114,
        625278.6313646277,
        730605.9614047556,
        732756.3276123962 // <- actual coast number
    ]
    const expectedPostCoastValues = [
        732756.3276123962, // <- post coast begins at coast fire date
        732861.5518112757,
        810173.6102652627,
        895641.5807978954,
        990125.8583225263,
        1094577.6037391664,
        1210048.3191472243,
        1337700.433180012,
        1478819.0030222044,
        1634824.6509129282,
        1807287.865364581,
        1997944.8110658743,
        2000000  // <- fire date
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