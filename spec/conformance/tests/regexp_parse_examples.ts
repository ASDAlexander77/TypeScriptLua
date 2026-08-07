namespace DateParse {
    function createDate(year: int, month: int, day: int, hour = 0, minute = 0, second = 0) {
        return Date.UTC(year, month, day, hour, minute, second);
    }

    function parse(dateString: string): long {

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        const fullMonthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        // Define regex patterns for different date formats
        const patterns = [
            { regex: /^(\d{4})-(\d{2})-(\d{2})$/, order: [1, 2, 3] },  // YYYY-MM-DD
            { regex: /^(\d{2})\/(\d{2})\/(\d{4})$/, order: [3, 1, 2] }, // MM/DD/YYYY -> YYYY-MM-DD
            { regex: /^(\d{2})-(\d{2})-(\d{4})$/, order: [3, 2, 1] },  // DD-MM-YYYY -> YYYY-MM-DD
            { regex: /^(\d{4})\/(\d{2})\/(\d{2})$/, order: [1, 2, 3] }, // YYYY/MM/DD
            { regex: /^(\d{4})\.(\d{2})\.(\d{2})$/, order: [1, 2, 3] }  // YYYY.MM.DD
        ];

        // Check for supported formats (YYYY-MM-DD, MM/DD/YYYY, etc.)
        for (let { regex, order } of patterns) {
            const match = dateString.match(regex);
            if (match) {
                const year = parseInt(match[order[0]]);
                const month = parseInt(match[order[1]]) - 1; // Month is zero-based
                const day = parseInt(match[order[2]]);
                return createDate(year, month, day);
            }
        }

        // Custom logic for RFC 2822 format (e.g., "Wed, 12 Feb 2025 07:21:02 GMT")
        const rfc2822Pattern = /^([A-Za-z]{3}), (\d{2}) ([A-Za-z]{3}) (\d{4}) (\d{2}):(\d{2}):(\d{2}) (GMT|UTC)$/;
        const rfc2822Match = dateString.match(rfc2822Pattern);
        if (rfc2822Match) {
            const [_, weekday, day, monthName, year, hour, minute, second] = rfc2822Match;
            const month = monthNames.indexOf(monthName); // Get the month index
            return createDate(parseInt(year), month, parseInt(day), parseInt(hour), parseInt(minute), parseInt(second));
        }

        const rfc2822PatternNoWeek = /^(\d{2}) ([A-Za-z]{3}) (\d{4}) (\d{2}):(\d{2}):(\d{2}) (GMT|UTC)$/;
        const rfc2822MatchNoWeek = dateString.match(rfc2822PatternNoWeek);
        if (rfc2822MatchNoWeek) {
            const [_, day, monthName, year, hour, minute, second] = rfc2822MatchNoWeek;
            const month = monthNames.indexOf(monthName); // Get the month index
            return createDate(parseInt(year), month, parseInt(day), parseInt(hour), parseInt(minute), parseInt(second));
        }        

        // Custom logic for long date format (e.g., "February 12, 2025 07:21:02")
        const longDatePattern = /^([A-Za-z]+) (\d{1,2}), (\d{4}) (\d{2}):(\d{2}):(\d{2})$/;
        const longDateMatch = dateString.match(longDatePattern);
        if (longDateMatch) {
            const [_, monthName, day, year, hour, minute, second] = longDateMatch;
            const month = fullMonthNames.indexOf(monthName); // Get the month index
            return createDate(parseInt(year), month, parseInt(day), parseInt(hour), parseInt(minute), parseInt(second));
        }

        // If no matching pattern is found, return NaN
        return NaN;        
    }      
}

const unixTimeZero = DateParse.parse("01 Jan 1970 00:00:00 GMT");
const javaScriptRelease = DateParse.parse("04 Dec 1995 00:12:00 GMT");

console.log(unixTimeZero);
// Expected output: 0

assert(unixTimeZero == 0);

console.log(javaScriptRelease);
// Expected output: 818035920000

assert(javaScriptRelease == 818035920000);

console.log("ALL DONE");
