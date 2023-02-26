import { futureValue, futureValueSeries, pmtMonthlyToDaily, calculateCoastFire } from './calculations';

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