var ONE_DAY = 3600 * 24 * 1000;
var MOUNTH_DAY = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
var WEEK_DAY = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

module.exports = {
    getDayBefore: getDayBefore,
    format: format,

    getYesterday: function() {

    },
    getWeekday: function(time) {
        var time = new Date(time);
        return WEEK_DAY[time.getDay()];
    },
    getPrecedingWeek: function() {

        var now = new Date();

        return {
            start: format(now.setDate(now.getDate() - 6 - now.getDay())),
            end: format(now.setDate(now.getDate() + 7 - now.getDay()))
        }
    },
    getPrecedingMonth: function() {
        var now = new Date(),
            pmonth = new Date(now.setDate(0));

        return {
            month: pmonth.getMonth() + 1,
            end: format(pmonth), //hack
            start: format(pmonth.setDate(1))
        };
    },
    getPrecedingQuarter: function() {
        var now = new Date(),
            year = now.getFullYear(),
            month = now.getMonth(),

            quarter = ~~(month / 3) - 1;

        if (quarter < 0) {
            year--;
            quarter = 3;
        }
        var firstMonth = quarter * 3 + 1,
            lastMonth = (quarter + 1) * 3;

        return {
            quarter: quarter,
            start: format(combine(year, doublebit(firstMonth), "01")),
            end: format(combine(year, doublebit(lastMonth), doublebit(MOUNTH_DAY[lastMonth])))
        };
    }
}

function format(time) {
    if (/\d{4}-\d{2}-\d{2}/.test(time)) return time;

    time = new Date(time) || new Date();
    var month = +time.getMonth() + 1;
    var date = +time.getDate();
    return combine(time.getFullYear(), doublebit(month), doublebit(date));
}

function combine(y, m, d) {
    return [y, m, d].join('-');
}

function doublebit(num) {
    return (num > 9) ? num : "0" + num;
}

function getDayBefore(num, end) {
    var end = +new Date(end) || +new Date(),
        num = num || 0,
        ONE_DAY = 3600 * 24 * 1000;

    return new Date(end - ONE_DAY * num);
}

function isLeapYear(year) {
    var year = new Date(year) || new Date();

    year = year.getFullYear();

    if (year % 4 == 0 && year % 100 != 0) {
        return true;
    } else {
        if (year % 400 == 0) {
            return true;
        } else {
            return false;
        }
    }
}