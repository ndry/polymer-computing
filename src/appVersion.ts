import buildTime from '~build/time';
import { abbreviatedSha as buildGitRevSha } from '~build/info';

const biuldTimeStr = ((date: Date) => {
    const digits = "0123456789abcdefghijklmnopqrstuvwxyz";
    
    const relYearStr = (() => {
        // returns 0..v if year relative to anchor year is in renderable range
        //     OR 00[m]yyyyz (e.g. 1999 -> 001999a) otherwise (this case is hardly applicable for this specific need)
        const anchorYear = 2022;
        const year = date.getUTCFullYear();
        const relYear = year - anchorYear;
        if (relYear < 0 || relYear >= digits.length) {
            const _0 = digits[0];
            const _a = digits[10];
            const mYearStr = year.toString().replace("-", "m");

            return _0 + _0 + mYearStr + _a;
        }
        return digits[relYear];
    })();

    const monthStr = digits[date.getUTCMonth() + 1]; // Jan is 1, Dec is c=12
    const dayStr = digits[date.getUTCDate()]; // 1, 2, ..., 9, a, b, ..., v=31

    const startOfDay = new Date(date.toISOString().split("T")[0]);
    const millisecondOfDay = date.getTime() - startOfDay.getTime();
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    const fractionOfDay = millisecondOfDay / millisecondsPerDay;
    const fractionOfDayStr = fractionOfDay.toString().substring(2, 6); // 4 digits of precision give resolution of ~9 sec

    return relYearStr + monthStr + dayStr + fractionOfDayStr;
})(buildTime);

export const appVersion = "1.0.0"
    + `+${biuldTimeStr}-${buildGitRevSha}`
    + (import.meta.env.PROD ? "" : ("-" + import.meta.env.MODE));
console.log("appVersion", appVersion);