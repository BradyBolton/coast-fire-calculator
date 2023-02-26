# coast-fire-calculator

Quick CRA that attempts to calculate a coast FIRE number and date based on:

* FIRE number
* current age
* retirement age
* APR
* monthly contributions

This is especially useful for young high-income earners. An ideal scenario would be:

* All gas / no brakes approach toward savings in 20s
    * Max out all tax-advantaged savings (no exceptions) and top off a little extra in a taxable brokerage
* Early 30s one can completely halt contributions
* Let time and compound interest take care of the rest
* Life-max to the fullest by dumping every conceivable dollar into housing, travel, projects etc.
* Retire "early" at age 50 after ~20-25 years of financial recklessness

After playing with the calculator, it is increasingly clear that shooting for a closer retirement date has diminishing returns. Unless you're earning a super high income, it might be more feasible to sprint toward a coast FIRE number instead. By the time you achieve coast FIRE, you're ready to switch gears and start contributing toward life's major milestones (kids, home, vacations) living like a typical American [HENRY](https://www.investopedia.com/terms/h/high-earners-not-yet-rich-henrys.asp#:~:text=High%20Earners%2C%20Not%20Rich%20Yet%20(HENRYs)%20is%20a%20term,enough%20to%20be%20considered%20rich.) (but also retire comfortably unlike a HENRY).

## To run

Run this by:

```
npm i
npm run start
```

Then open [http://localhost:3000](http://localhost:3000) to view it in the browser.

Run basic tests for the coast fire calculations:

```
npm run test
```

## Roughly how it works

* Slap a bunch of bootstrap for sliders and toggles
* Indicate interest vs. principal and division between coast FIRE accumulation and non-accumulation phase with `chart.js`
* Iteratively dial onto the coast FIRE number (because I didn't do the real math)

## Goals

Right now the calculator only *gives* you a coast FIRE number and date based on your desired retirement age and current rate of contribution. I.e. "how long do you have to keep things up until you hit coast FIRE?" It gives you a basic plan on how to get there.

There should be another calculator to spit out expected future value for a user-given coast FIRE plan (e.g. Bob contributes $1500/mo for 8 years, and then contributes $400 at a part-time job for the next 12 years, how much will Bob have). This calculator would be more useful for trouble-shooting, but is more work on the UI side.
