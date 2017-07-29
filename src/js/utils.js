define("utils", [], function () {
    var MathExtents = (function () {
        function add(a, b) {
            var c, d, e;
            try {
                c = a.toString().split(".")[1].length;
            } catch (f) {
                c = 0;
            }
            try {
                d = b.toString().split(".")[1].length;
            } catch (f) {
                d = 0;
            }
            return e = Math.pow(10, Math.max(c, d)), (mul(a, e) + mul(b, e)) / e;
        }

        function sub(a, b) {
            var c, d, e;
            try {
                c = a.toString().split(".")[1].length;
            } catch (f) {
                c = 0;
            }
            try {
                d = b.toString().split(".")[1].length;
            } catch (f) {
                d = 0;
            }
            return e = Math.pow(10, Math.max(c, d)), (mul(a, e) - mul(b, e)) / e;
        }

        function mul(a, b) {
            var c = 0,
                d = a.toString(),
                e = b.toString();
            try {
                c += d.split(".")[1].length;
            } catch (f) { }
            try {
                c += e.split(".")[1].length;
            } catch (f) { }
            return Number(d.replace(".", "")) * Number(e.replace(".", "")) / Math.pow(10, c);
        }

        function div(a, b) {
            var c, d, e = 0,
                f = 0;
            try {
                e = a.toString().split(".")[1].length;
            } catch (g) { }
            try {
                f = b.toString().split(".")[1].length;
            } catch (g) { }
            return c = Number(a.toString().replace(".", "")), d = Number(b.toString().replace(".", "")), mul(c / d, Math.pow(10, f - e));
        }

        return {
            div: div,
            add: add,
            sub: sub,
            mul: mul
        };
    }());

    var utils = {
        replaceAll: function (str, search, replacement) {
            var fix = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            return str.replace(new RegExp(fix, 'g'), replacement);
        },
        formatString: function () {
            if (arguments.length < 1) {
                return null;
            }
            var str = arguments[0];
            for (var i = 1; i < arguments.length; i++) {
                var placeHolder = '{' + (i - 1) + '}';
                str = utils.replaceAll(str, placeHolder, arguments[i]);
            }
            return str;
        },
        getCurrentStyle: function (node) {
            var style = null;
            if (window.getComputedStyle) {
                style = window.getComputedStyle(node, null);
            } else {
                style = node.currentStyle;
            }

            return style;
        },
        getJsonValue: function (json, tag) {
            if (tag == undefined)
                return '';
            var tagArr = tag.split('.');
            var v = json;
            for (var i = 0; i < tagArr.length; i++) {
                v = v[tagArr[i]];
                if (v == undefined || v == 'null' || v == 'undefined') {
                    return '';
                }
            }
            return v;
        },
        isFunc: function (val) {
            return Object.prototype.toString.call(val) == "[object Function]";
        },
        FomatWeek: function (val) {
            var result = val;
            switch (val) {
                case 'Sunday':
                    result = '星期天';
                    break;
                case 'Monday':
                    result = '星期一';
                    break;
                case 'Tuesday':
                    result = '星期二';
                    break;
                case 'Wednesday':
                    result = '星期三';
                    break;
                case 'Thursday':
                    result = '星期四';
                    break;
                case 'Friday':
                    result = '星期五';
                    break;
                case 'Saturday':
                    result = '星期六';
                    break;
            }
            return result;
        },
        formatValue: function (val, format) {
            if (format == 'string')
                return val;
            if (format == 'money')
                return this.formatMoney(val);
            if (format == 'rate')
                return this.FormatRate(val);
            if (format == 'MoneySN')
                return this.FormatMoneySN(val);
            if (format == 'week')
                return this.FomatWeek(val);
            if (val && !!format && format.startsWith('utc')) {
                var dStr = format.split('@')[1];
                if (!dStr) {
                    dStr = 'yyyy-MM-dd HH:mm:ss';
                }
                var d = new Date(val);
                return this.formatDate(d, dStr, false);
            }
            if (this.isNumber(val)) {
                var f = parseFloat(val);
                var ff = format == undefined ? f : f.toFixed(parseInt(format));
                return ff.toString();
            } else if (this.isDate(val)) {
                //var d = new Date(val);
                var d = new Date(Date.parse(val.replace(/-/g, "/")));
                return format == undefined ? this.formatDate(d, "yyyy-MM-dd HH:mm", false) : this.formatDate(d, format, false);
            } else {
                return val;
            }
        },
        formatDate: function (date, format, utc) {
            var MMMM = ["\x00", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            var MMM = ["\x01", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            var dddd = ["\x02", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            var ddd = ["\x03", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

            function ii(i, len) {
                var s = i + "";
                len = len || 2;
                while (s.length < len) s = "0" + s;
                return s;
            }

            var y = utc ? date.getUTCFullYear() : date.getFullYear();
            format = format.replace(/(^|[^\\])yyyy+/g, "$1" + y);
            format = format.replace(/(^|[^\\])yy/g, "$1" + y.toString().substr(2, 2));
            format = format.replace(/(^|[^\\])y/g, "$1" + y);
            var M = (utc ? date.getUTCMonth() : date.getMonth()) + 1;
            format = format.replace(/(^|[^\\])MMMM+/g, "$1" + MMMM[0]);
            format = format.replace(/(^|[^\\])MMM/g, "$1" + MMM[0]);
            format = format.replace(/(^|[^\\])MM/g, "$1" + ii(M));
            format = format.replace(/(^|[^\\])M/g, "$1" + M);
            var d = utc ? date.getUTCDate() : date.getDate();
            format = format.replace(/(^|[^\\])dddd+/g, "$1" + dddd[0]);
            format = format.replace(/(^|[^\\])ddd/g, "$1" + ddd[0]);
            format = format.replace(/(^|[^\\])dd/g, "$1" + ii(d));
            format = format.replace(/(^|[^\\])d/g, "$1" + d);
            var H = utc ? date.getUTCHours() : date.getHours();
            format = format.replace(/(^|[^\\])HH+/g, "$1" + ii(H));
            format = format.replace(/(^|[^\\])H/g, "$1" + H);
            var h = H > 12 ? H - 12 : H == 0 ? 12 : H;
            format = format.replace(/(^|[^\\])hh+/g, "$1" + ii(h));
            format = format.replace(/(^|[^\\])h/g, "$1" + h);
            var m = utc ? date.getUTCMinutes() : date.getMinutes();
            format = format.replace(/(^|[^\\])mm+/g, "$1" + ii(m));
            format = format.replace(/(^|[^\\])m/g, "$1" + m);
            var s = utc ? date.getUTCSeconds() : date.getSeconds();
            format = format.replace(/(^|[^\\])ss+/g, "$1" + ii(s));
            format = format.replace(/(^|[^\\])s/g, "$1" + s);
            var f = utc ? date.getUTCMilliseconds() : date.getMilliseconds();
            format = format.replace(/(^|[^\\])fff+/g, "$1" + ii(f, 3));
            f = Math.round(f / 10);
            format = format.replace(/(^|[^\\])ff/g, "$1" + ii(f));
            f = Math.round(f / 10);
            format = format.replace(/(^|[^\\])f/g, "$1" + f);
            var T = H < 12 ? "AM" : "PM";
            format = format.replace(/(^|[^\\])TT+/g, "$1" + T);
            format = format.replace(/(^|[^\\])T/g, "$1" + T.charAt(0));
            var t = T.toLowerCase();
            format = format.replace(/(^|[^\\])tt+/g, "$1" + t);
            format = format.replace(/(^|[^\\])t/g, "$1" + t.charAt(0));
            var tz = -date.getTimezoneOffset();
            var K = utc || !tz ? "Z" : tz > 0 ? "+" : "-";
            if (!utc) {
                tz = Math.abs(tz);
                var tzHrs = Math.floor(tz / 60);
                var tzMin = tz % 60;
                K += ii(tzHrs) + ":" + ii(tzMin);
            }

            format = format.replace(/(^|[^\\])K/g, "$1" + K);
            var day = (utc ? date.getUTCDay() : date.getDay()) + 1;
            format = format.replace(new RegExp(dddd[0], "g"), dddd[day]);
            format = format.replace(new RegExp(ddd[0], "g"), ddd[day]);
            format = format.replace(new RegExp(MMMM[0], "g"), MMMM[M]);
            format = format.replace(new RegExp(MMM[0], "g"), MMM[M]);
            format = format.replace(/\\(.)/g, "$1");
            return format;
        },
        isDate: function (t) {
            if (t == null) return false;
            var ds = t.toString();
            if (ds.indexOf('.') > 0) {
                ds = ds.substr(0, ds.indexOf('.'));
            }
            ds = ds.replace('T', ' ');
            var reg = /^(\d{4})\-(\d{2})\-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/g;
            return (reg.test(ds))
        },

        getCssNumber: function (ele, style) {
            return Number(ele.style[style].replace("px", ""));
        },
        isNumber: function (s) {
            var reg = new RegExp("^(-?\\d+)(\\.\\d+)?$");
            return reg.test(s);
        },
        /**
         * 转换成金钱格式字符串, eg: 1000.0046 => "1,000.00"
         * @return {string}
         */
        formatMoney: function (money) {
            if (typeof (money) == undefined || money == null || money == undefined || !money)
                money = 0;
            var isPd = false;
            money = money.toString();
            var char = /-/;
            if (char.test(money)) {
                money = money.replace(char, "");
                isPd = true;
            }
            if (/\^(\-?)\d+(\.\d?)$/.test(money)) return '0.00';
            money = this.FormatRateRule(money, 2);//增加先四舍五入，再进行formatmoney
            money = money.replace(/^(\d*)$/, "$1.");
            money = (money + "00").replace(/(\d*\.\d\d)\d*/, "$1");
            money = money.replace(".", ",");
            var re = /^(\d+)(\d{3},)/;
            while (re.test(money)) { // 每隔3位加,
                money = money.replace(re, "$1,$2");
            }
            money = money.replace(/,(\d\d)$/, ".$1"); // 分割小数.
            return isPd ? '-' + money.replace(/^\./, "0.") : '' + money.replace(/^\./, "0.");
        },
        /**
         * 正则表达式，强制转带小数点汇率等
         * @param {} val
         * @param {} n
         * @returns {}
         */
        FormatRateRule: function (val, n) {
            if (val.toString().indexOf(".") === -1) {
                val = val + ".";
                for (var i = 0; i < n; ++i)
                    val = val + '0';
            }
            //var rateRule = /^\d*\.\d*$/;//该正则无法支持负数，支持的是：^-?\d*\.\d*$
            //if (rateRule.test(val))
            //    return Number(val).toFixed(n);
            return this.formatNumber(val, n, '.', ',');
        },

        /**
         * 汇率变四位转换
         * @param {} rate
         * @returns {}
         */
        FormatRate: function (rate) {
            // return  FormatMoneySN(s,4);
            return this.FormatRateRule(rate, 4);
        },
        /**
         * 数字转金额格式（含四舍五入）暂时未使用该方法
         * @param {} number
         * @param {} decimals
         * @param {} decPoint
         * @param {} thousandsSep
         * @returns {}
         */
        formatNumber: function (number, decimals, decPoint, thousandsSep) {
            var n = number, c = isNaN(decimals = Math.abs(decimals)) ? 2 : decimals;
            var d = decPoint === undefined ? ',' : decPoint;
            var t = thousandsSep === undefined ?
                '.' : thousandsSep, s = n < 0 ? '-' : '';

            var i = parseInt((n = this.toFixed(Math.abs(+n || 0), c)), 10) + '';

            var j = (i.length > 3) ? i.length % 3 : 0;
            return s + (j ? i.substr(0, j) + t : '') +
                i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + t) +
                (c ? d + this.toFixed(Math.abs(n - i), c).slice(2) : '');
        },

        /**
         * 实现类似js 的toFixed 解决0.565 保留2位小数==>0.56的问题
         * @param {number} number 数字
         * @param {number} len 保留的小数位数
         * @returns {string}
         */
        toFixed: function (number, len) {
            var add = 0;
            var s, temp, result;
            var s1 = number + "";
            var start = s1.indexOf(".");
            if (start != -1) {
                if (s1.substr(start + len + 1, 1) >= 5) add = 1;
            }
            var temp = Math.pow(10, len);
            s = Math.floor(MathExtents.mul(number, temp) + add);

            result = MathExtents.div(s, temp);

            var resultStr = result.toString();
            var pos_decimal = resultStr.indexOf('.');
            if (pos_decimal < 0) {
                pos_decimal = resultStr.length;
                resultStr += '.';
            }
            while (resultStr.length <= pos_decimal + len) {
                resultStr += '0';
            }

            return resultStr;
        },

        //金额、汇率转换
        /**
         * @return {string}
         * s  =  需要格式化的数据
         * n  =  需要保留才小数位数，如果不传进来就默认拿2位
         */
        FormatMoneySN: function (s, n) {
            n = n > 0 && n <= 20 ? n : 2;
            s = parseFloat((s + "").replace(/[^\d\.-]/g, "")).toFixed(n) + "";
            var l = s.split(".")[0].split("").reverse(),
                r = s.split(".")[1];
            t = "";
            for (i = 0; i < l.length; i++) {
                t += l[i] + ((i + 1) % 3 == 0 && (i + 1) != l.length ? "," : "");
            }
            return t.split("").reverse().join("") + "." + r;
        },

        distinct:function(arrSrc){
            var arr = [arrSrc[0]];
            for (var i = 1; i < arrSrc.length; i++) { //从数组第二项开始循环遍历此数组
                //对元素进行判断：
                //如果数组当前元素在此数组中第一次出现的位置不是i
                //那么我们可以判断第i项元素是重复的，否则直接存入结果数组
                if (arrSrc.indexOf(arrSrc[i]) == i) {
                    arr.push(arrSrc[i]);
                }
            }
            return arr;
        }
    };

    return utils;
});