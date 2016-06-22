module.exports = {
    fixTo: function(num, x, y) {
        return Number((x / y).toFixed(num));
    },
    by: function(key) {
        return function(o1, o2) {
            return o2[key] - o1[key];
        }
    },
    bigger: function(a, b) {
        return (a > b) ? a : b;
    },
    shortNum: function(num) {
        var abs = Math.abs(num);
        if (abs > 10000) {
            num = (num / 10000).toFixed(1) + "万"
        } else if (abs > 100000000) {
            num = (num / 100000000).toFixed(1) + "亿"
        }
        return num;
    },
    min: function(arr) {
        var arr = [].concat(arr),
            m = arr[0];

        for (var i = 1, l = arr.length; i < l; i++) {
            m = Math.min(m, arr[i])
        }
        return m;
    },
    max: function(arr){
        var arr = [].concat(arr),
            m = arr[0];

        for (var i = 1, l = arr.length; i < l; i++) {
            m = Math.max(m, arr[i])
        }
        return m;        
    }
}
