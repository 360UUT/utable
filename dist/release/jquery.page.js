(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
         define(['jquery'], factory);
    } else {
       root.uut=factory(root.jQuery);
    }
}(window, function () {
var requirejs, require, define;
(function (undef) {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        hasOwn = Object.prototype.hasOwnProperty,
        aps = [].slice,
        jsSuffixRegExp = /\.js$/;

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap, lastIndex,
            foundI, foundStarMap, starI, i, j, part,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                name = name.split('/');
                lastIndex = name.length - 1;

                // Node .js allowance:
                if (config.nodeIdCompat && jsSuffixRegExp.test(name[lastIndex])) {
                    name[lastIndex] = name[lastIndex].replace(jsSuffixRegExp, '');
                }

                //Lop off the last part of baseParts, so that . matches the
                //"directory" and not name of the baseName's module. For instance,
                //baseName of "one/two/three", maps to "one/two/three.js", but we
                //want the directory, "one/two" for this normalization.
                name = baseParts.slice(0, baseParts.length - 1).concat(name);

                //start trimDots
                for (i = 0; i < name.length; i += 1) {
                    part = name[i];
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            break;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            } else if (name.indexOf('./') === 0) {
                // No baseName, so this is ID is resolved relative
                // to baseUrl, pull off the leading dot.
                name = name.substring(2);
            }
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            var args = aps.call(arguments, 0);

            //If first arg is not require('string'), and there is only
            //one arg, it is the array form without a callback. Insert
            //a null so that the following concat is correct.
            if (typeof args[0] !== 'string' && args.length === 1) {
                args.push(null);
            }
            return req.apply(undef, args.concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (hasProp(waiting, name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!hasProp(defined, name) && !hasProp(defining, name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relName) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i,
            args = [],
            callbackType = typeof callback,
            usingExports;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (callbackType === 'undefined' || callbackType === 'function') {
            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (hasProp(defined, depName) ||
                           hasProp(waiting, depName) ||
                           hasProp(defining, depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback ? callback.apply(defined[name], args) : undefined;

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (config.deps) {
                req(config.deps, config.callback);
            }
            if (!callback) {
                return;
            }

            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            //Using a non-zero value because of concern for what old browsers
            //do, and latest browsers "upgrade" to 4 if lower value is used:
            //http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-windowtimers-settimeout:
            //If want a value immediately, use require('id') instead -- something
            //that works in almond on the global level, but not guaranteed and
            //unlikely to work in other AMD implementations.
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 4);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        return req(cfg);
    };

    /**
     * Expose module registry for debugging and tooling
     */
    requirejs._defined = defined;

    define = function (name, deps, callback) {
        if (typeof name !== 'string') {
            throw new Error('See almond README: incorrect module build, no module name');
        }

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
            waiting[name] = [name, deps, callback];
        }
    };

    define.amd = {
        jQuery: true
    };
}());

define("../../almond", function(){});

define('utils',[],function () {
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
                case 'Sunday': result = '星期天'; break;
                case 'Monday': result = '星期一'; break;
                case 'Tuesday': result = '星期二'; break;
                case 'Wednesday': result = '星期三'; break;
                case 'Thursday': result = '星期四'; break;
                case 'Friday': result = '星期五'; break;
                case 'Saturday': result = '星期六'; break;
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
            this.formatNumber(val, n, '.', ',');
            return val;
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
            var i = parseInt((n = Math.abs(+n || 0).toFixed(c)), 10) + '';
            var j = (i.length > 3) ? i.length % 3 : 0;
            return s + (j ? i.substr(0, j) + t : '') +
                i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + t) +
                (c ? d + Math.abs(n - i).toFixed(c).slice(2) : '');
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
        }
    };

    Array.prototype.distinct = function () {
        //直接定义结果数组
        var arr = [this[0]];
        for (var i = 1; i < this.length; i++) { //从数组第二项开始循环遍历此数组
            //对元素进行判断：
            //如果数组当前元素在此数组中第一次出现的位置不是i
            //那么我们可以判断第i项元素是重复的，否则直接存入结果数组
            if (this.indexOf(this[i]) == i) {
                arr.push(this[i]);
            }
        }
        return arr;
    };

    var skip_key_words = ['关键字', '请输入中文/拼音/英文/简拼'];

    String.prototype.trim = function () {
        return this.replace(/^\s+|\s+$/g, "");
    };
    String.prototype.ltrim = function () {
        return this.replace(/^\s+/g, "");
    };
    String.prototype.rtrim = function () {
        return this.replace(/\s+$/g, "");
    };

    Date.prototype.Format = function (fmt) { //author: meizz 
        var o = {
            "M+": this.getMonth() + 1, //月份 
            "d+": this.getDate(), //日 
            "h+": this.getHours(), //小时
            "H+": this.getHours(), //小时
            "m+": this.getMinutes(), //分 
            "s+": this.getSeconds(), //秒 
            "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
            "S": this.getMilliseconds() //毫秒 
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    };


    return utils;
});
/**
 * @module components/Pager
 */
define("components/UPager", ['utils'], function (utils) {
    /**
     * 分页控件
     * @param options {object}
     * @param options.pageIndex{number} 页码
     * @param options.pageSize{number}行数
     * @param options.changePage
     * @param options.beforePageChange
     * @param options.totalCount
     * @constructor
     */
    function UPager(options) {
        this.initialize(options);
    }

    /**
     * @private
     * @param model {object}
     * @param model.pageIndex {number} 1
     * @param model.pageSize {number} defualt
     */
    UPager.prototype.template = function (model) {
        var elemt = document.createElement("div");
        elemt.className = 'upage';
        elemt.innerHTML = '<div class="page-content">共<label class="total-record"></label>条记录<span><em class="page-current">0</em>/<em class="page-count">0</em></span>' +
            '<span class="page-item prev" title="上一页">&lt;</span><span class="page-item-container"></span><span class="page-item next" title="下一页">&gt;</span></div>' +
            '<div class="nodata">' + this.options.showNoDataText + '</div>';
        return elemt;
    };

    /**
     *
     * @param options
     * @returns {UPager}
     */
    UPager.prototype.initialize = function (options) {
        this.options = $.extend({
            pageIndex: 1,
            pageSize: 20,
            totalCount: 0,
            showNoData: true,
            showNoDataText: '暂无数据',

            /**
             * 分页回调事件
             * @param page
             * @param currentData
             */
            changePage: function (page, currentData) {
            },

            /**
             * 跳页前的回调
             * @param evt
             * @param model
             */
            beforePageChange: function (evt, model) {
            }
        }, options);

        this.pageIndex = this.options.pageIndex || 1;
        this.pageSize = this.options.pageSize || 20;
        this.totalCount = this.options.totalCount || 0;
        this.pageTotal = Math.ceil(this.totalCount / this.pageSize) || 1;
        return this;
    };

    /**
     *
     * @returns {UPager}
     */
    UPager.prototype.render = function () {
        this.el = this.template(this.options);
        this.$el = $(this.el);

        this.bindEvents();
        this.reRenderPageData();
        return this;
    };

    /**
     * @private
     */
    UPager.prototype.bindEvents = function () {
        var that = this;
        that.$el.on('click', '.page-item', function (evt) {
            that.options.beforePageChange(evt, {
                currentPageIndex: that.pageIndex,
                pageSize: that.pageSize,
                totalCount: that.totalCount,
                pageTotal: that.pageTotal
            });

            var $current = $(evt.currentTarget);
            if (!$current.hasClass('current') && !$current.hasClass('prev') && !$current.hasClass('next')) {
                that.$el.find('.page-item.current').removeClass('current');
                $current.addClass('current');
                var page = $current.data('page');
                that.$el.find('.page-current').html(page);
                that.pageIndex = page;
                that.options.changePage(page, this);
            } else if ($current.hasClass('prev')) {
                that.prevPage();
            } else if ($current.hasClass('next')) {
                that.nextPage();
            }
        });
    };

    /**
     * 前一页
     */
    UPager.prototype.prevPage = function () {
        if (this.pageIndex > 1) {
            this.setPageIndex(this.pageIndex - 1);
        }
    };

    /**
     * 下一页
     */
    UPager.prototype.nextPage = function () {
        if (this.pageIndex < this.pageTotal) {
            //++this.pageIndex;
            this.setPageIndex(this.pageIndex + 1);
        }
    };

    /**
     * 设置页码
     * @param pageIndex
     */
    UPager.prototype.setPageIndex = function (pageIndex, change) {
        if (this.pageIndex != pageIndex) {
            if (change || change == undefined) {
                this.options.changePage(pageIndex, this);
            }
        }
        this.pageIndex = pageIndex;
        this.reRenderPageData();
    };

    /**
     * 获取页码
     * @returns {number|*|page}
     */
    UPager.prototype.getPageIndex = function () {
        return this.pageIndex;
    };

    /**
     * 设置页码
     * @param pageSize
     */
    UPager.prototype.setPageSize = function (pageSize) {
        this.pageSize = pageSize;
        this.reRenderPageData();
    };

    /**
     * 获取行数
     * @returns {number|*}
     */
    UPager.prototype.getPageSize = function () {
        return this.pageSize;
    };

    /**
     * 设置总行数
     * @param count
     */
    UPager.prototype.setTotalCount = function (count) {
        this.totalCount = count;
        this.pageTotal = Math.ceil(this.totalCount / this.pageSize);
        this.reRenderPageData();
    };

    /**
     * 获取总行数
     */
    UPager.prototype.getTotalCount = function () {
        return this.totalCount;
    };

    /**
     * 组装页码项
     */
    UPager.prototype.reRenderPageData = function () {
        if (!this.buid) {
            this.buid = true;
            var $container = this.$el.find('.page-item-container');
            $container.empty();
            this.pageTotal = Math.ceil(this.totalCount / this.pageSize);

            if (this.pageTotal == 0 && this.options.showNoData) {
                this.$el.find('.page-content').hide();
                this.$el.find('.nodata').show();
            } else {
                this.$el.find('.page-content').show();
                this.$el.find('.nodata').hide();
                this.$el.find('.total-record').html(this.totalCount);
                var dot = '<span>...</span>';
                if (this.pageTotal <= 10) {
                    for (var pageIndexItem = 0; pageIndexItem < this.pageTotal; pageIndexItem++) {
                        var pageItem = $("<span class='page-item'  data-page='" + (pageIndexItem + 1) + "' title='第" + (pageIndexItem + 1) + "页'>" + (pageIndexItem + 1) + "</span>");
                        if (pageIndexItem == (this.pageIndex - 1)) {
                            pageItem.addClass('current');
                        }
                        this.$el.find('.disable').removeClass('disable');
                        if (this.pageIndex == 1) {
                            this.$el.find('.prev').addClass('disable');
                        }
                        if (this.pageIndex == this.pageTotal) {
                            this.$el.find('.next').addClass('disable');
                        }
                        pageItem.appendTo($container);
                    }
                } else {

                    if (this.pageIndex <= 5) {
                        (function (_this) {
                            for (var indexLeft = 0; indexLeft < 7; indexLeft++) {
                                var pageItem = $("<span class='page-item'  data-page='" + (indexLeft + 1) + "' title='第" + (indexLeft + 1) + "页'>" + (indexLeft + 1) + "</span>");
                                if (_this.pageIndex == indexLeft + 1) {
                                    pageItem.addClass('current');
                                }
                                pageItem.appendTo($container);
                            }
                            $container.append(dot);
                        }(this));
                    } else {
                        (function (_this) {
                            $container.append(
                                "<span class='page-item'  data-page='1' title='第1页'>1</span><span class='page-item' data-page='2' title='第2页'>2</span>" +
                                "<span>...</span>");

                            var begin = _this.pageIndex - 2;
                            var end = _this.pageIndex + 2;
                            if (end > _this.pageTotal) {
                                end = _this.pageTotal;
                                begin = end - 4;
                                if (_this.pageIndex - begin < 2) {
                                    begin = begin - 1;
                                }
                            } else if (end + 1 == _this.pageTotal) {
                                end = _this.pageTotal;
                            }
                            for (var i = begin; i <= end; i++) {
                                var pageItem = $("<span class='page-item' title='第" + (i + 1) + "页' data-page='" + i + "'>" + i + "</span>");
                                if (_this.pageIndex == i) {
                                    pageItem.addClass('current');
                                }
                                pageItem.appendTo($container);
                            }
                            if (end != _this.pageTotal) {
                                $container.append(dot);
                            }
                        }(this));
                    }
                }
                this.$el.find('.page-current').html(this.pageIndex);
                this.$el.find('.page-count').html(this.pageTotal);
            }
            this.buid = false;
        }
    };

    UPager.prototype.show = function () {
        this.$el.show();
    };

    UPager.prototype.close = function () {
        this.$el.hide();
    };


    return UPager;
})
;
define("jquery.page", [
    "components/UPager"
], function (UPager) {
    $.fn.page = function (options) {
        var $this = $(this);
        if (options) {
            var type = $.type(options);
            var pager;
            if (type === 'string' && $this.data('uut.pager')) {
                pager = $this.data('uut.pager');
                switch (options) {
                    case "prevPage":
                        pager.prevPage();
                        break;
                    case "nextPage":
                        pager.nextPage();
                        break;
                    case "setPageIndex":
                        pager.setPageIndex(Number(arguments[1]));
                        break;
                    case "getPageIndex":
                        return pager.getPageIndex();
                    case "setPageSize":
                        pager.setPageSize(Number(arguments[1]));
                        break;
                    case "getPageSize":
                        return pager.getPageSize();
                    case "setTotalCount":
                        pager.setTotalCount(Number(arguments[1]));
                        break;
                    case "getTotalCount":
                        return pager.getTotalCount();
                }
            } else if (type == "object") {
                pager = new UPager(options);
                $this.data('uut.pager', pager);
                pager.render();
                pager.$el.appendTo(this);
            } else {
                pager = new UPager({});
                $this.data('uut.pager', pager);
                pager.render();
                pager.$el.appendTo($this);
            }
        }
    };
});

    return require('jquery.page');
}));
