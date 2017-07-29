(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
         define(['jquery'], factory);
    } else {
        factory(root.jQuery);
    }
}(window, function () {
(function (factory) {
    if ( typeof define === 'function' && define.amd ) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else if (typeof exports === 'object') {
        // Node/CommonJS style for Browserify
        module.exports = factory;
    } else {
        // Browser globals
        factory();
    }
}(function () {
    var toFix  = ['wheel', 'mousewheel', 'DOMMouseScroll', 'MozMousePixelScroll'],
        toBind = ( 'onwheel' in document || document.documentMode >= 9 ) ?
                    ['wheel'] : ['mousewheel', 'DomMouseScroll', 'MozMousePixelScroll'],
        slice  = Array.prototype.slice,
        nullLowestDeltaTimeout, lowestDelta;

    if ( $.event.fixHooks ) {
        for ( var i = toFix.length; i; ) {
            $.event.fixHooks[ toFix[--i] ] = $.event.mouseHooks;
        }
    }

    var special = $.event.special.mousewheel = {
        version: '3.1.12',

        setup: function() {
            if ( this.addEventListener ) {
                for ( var i = toBind.length; i; ) {
                    this.addEventListener( toBind[--i], handler, false );
                }
            } else {
                this.onmousewheel = handler;
            }
            // Store the line height and page height for this particular element
            $.data(this, 'mousewheel-line-height', special.getLineHeight(this));
            $.data(this, 'mousewheel-page-height', special.getPageHeight(this));
        },

        teardown: function() {
            if ( this.removeEventListener ) {
                for ( var i = toBind.length; i; ) {
                    this.removeEventListener( toBind[--i], handler, false );
                }
            } else {
                this.onmousewheel = null;
            }
            // Clean up the data we added to the element
            $.removeData(this, 'mousewheel-line-height');
            $.removeData(this, 'mousewheel-page-height');
        },

        getLineHeight: function(elem) {
            var $elem = $(elem),
                $parent = $elem['offsetParent' in $.fn ? 'offsetParent' : 'parent']();
            if (!$parent.length) {
                $parent = $('body');
            }
            return parseInt($parent.css('fontSize'), 10) || parseInt($elem.css('fontSize'), 10) || 16;
        },

        getPageHeight: function(elem) {
            return $(elem).height();
        },

        settings: {
            adjustOldDeltas: true, // see shouldAdjustOldDeltas() below
            normalizeOffset: true  // calls getBoundingClientRect for each event
        }
    };

    $.fn.extend({
        mousewheel: function(fn) {
            return fn ? this.bind('mousewheel', fn) : this.trigger('mousewheel');
        },

        unmousewheel: function(fn) {
            return this.unbind('mousewheel', fn);
        }
    });


    function handler(event) {
        var orgEvent   = event || window.event,
            args       = slice.call(arguments, 1),
            delta      = 0,
            deltaX     = 0,
            deltaY     = 0,
            absDelta   = 0,
            offsetX    = 0,
            offsetY    = 0;
        event = $.event.fix(orgEvent);
        event.type = 'mousewheel';

        // Old school scrollwheel delta
        if ( 'detail'      in orgEvent ) { deltaY = orgEvent.detail * -1;      }
        if ( 'wheelDelta'  in orgEvent ) { deltaY = orgEvent.wheelDelta;       }
        if ( 'wheelDeltaY' in orgEvent ) { deltaY = orgEvent.wheelDeltaY;      }
        if ( 'wheelDeltaX' in orgEvent ) { deltaX = orgEvent.wheelDeltaX * -1; }

        // Firefox < 17 horizontal scrolling related to DOMMouseScroll event
        if ( 'axis' in orgEvent && orgEvent.axis === orgEvent.HORIZONTAL_AXIS ) {
            deltaX = deltaY * -1;
            deltaY = 0;
        }

        // Set delta to be deltaY or deltaX if deltaY is 0 for backwards compatabilitiy
        delta = deltaY === 0 ? deltaX : deltaY;

        // New school wheel delta (wheel event)
        if ( 'deltaY' in orgEvent ) {
            deltaY = orgEvent.deltaY * -1;
            delta  = deltaY;
        }
        if ( 'deltaX' in orgEvent ) {
            deltaX = orgEvent.deltaX;
            if ( deltaY === 0 ) { delta  = deltaX * -1; }
        }

        // No change actually happened, no reason to go any further
        if ( deltaY === 0 && deltaX === 0 ) { return; }

        // Need to convert lines and pages to pixels if we aren't already in pixels
        // There are three delta modes:
        //   * deltaMode 0 is by pixels, nothing to do
        //   * deltaMode 1 is by lines
        //   * deltaMode 2 is by pages
        if ( orgEvent.deltaMode === 1 ) {
            var lineHeight = $.data(this, 'mousewheel-line-height');
            delta  *= lineHeight;
            deltaY *= lineHeight;
            deltaX *= lineHeight;
        } else if ( orgEvent.deltaMode === 2 ) {
            var pageHeight = $.data(this, 'mousewheel-page-height');
            delta  *= pageHeight;
            deltaY *= pageHeight;
            deltaX *= pageHeight;
        }

        // Store lowest absolute delta to normalize the delta values
        absDelta = Math.max( Math.abs(deltaY), Math.abs(deltaX) );

        if ( !lowestDelta || absDelta < lowestDelta ) {
            lowestDelta = absDelta;

            // Adjust older deltas if necessary
            if ( shouldAdjustOldDeltas(orgEvent, absDelta) ) {
                lowestDelta /= 40;
            }
        }

        // Adjust older deltas if necessary
        if ( shouldAdjustOldDeltas(orgEvent, absDelta) ) {
            // Divide all the things by 40!
            delta  /= 40;
            deltaX /= 40;
            deltaY /= 40;
        }

        // Get a whole, normalized value for the deltas
        delta  = Math[ delta  >= 1 ? 'floor' : 'ceil' ](delta  / lowestDelta);
        deltaX = Math[ deltaX >= 1 ? 'floor' : 'ceil' ](deltaX / lowestDelta);
        deltaY = Math[ deltaY >= 1 ? 'floor' : 'ceil' ](deltaY / lowestDelta);

        // Normalise offsetX and offsetY properties
        if ( special.settings.normalizeOffset && this.getBoundingClientRect ) {
            var boundingRect = this.getBoundingClientRect();
            offsetX = event.clientX - boundingRect.left;
            offsetY = event.clientY - boundingRect.top;
        }

        // Add information to the event object
        event.deltaX = deltaX;
        event.deltaY = deltaY;
        event.deltaFactor = lowestDelta;
        event.offsetX = offsetX;
        event.offsetY = offsetY;
        // Go ahead and set deltaMode to 0 since we converted to pixels
        // Although this is a little odd since we overwrite the deltaX/Y
        // properties with normalized deltas.
        event.deltaMode = 0;

        // Add event and delta to the front of the arguments
        args.unshift(event, delta, deltaX, deltaY);

        // Clearout lowestDelta after sometime to better
        // handle multiple device types that give different
        // a different lowestDelta
        // Ex: trackpad = 3 and mouse wheel = 120
        if (nullLowestDeltaTimeout) { clearTimeout(nullLowestDeltaTimeout); }
        nullLowestDeltaTimeout = setTimeout(nullLowestDelta, 200);

        return ($.event.dispatch || $.event.handle).apply(this, args);
    }

    function nullLowestDelta() {
        lowestDelta = null;
    }

    function shouldAdjustOldDeltas(orgEvent, absDelta) {
        // If this is an older event and the delta is divisable by 120,
        // then we are assuming that the browser is treating this as an
        // older mouse wheel event and that we should divide the deltas
        // by 40 to try and get a more usable deltaFactor.
        // Side note, this actually impacts the reported scroll distance
        // in older browsers and can cause scrolling to be slower than native.
        // Turn this off by setting $.event.special.mousewheel.settings.adjustOldDeltas to false.
        return special.settings.adjustOldDeltas && orgEvent.type === 'mousewheel' && absDelta % 120 === 0;
    }

}));
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

/**
 * @module components/UTableOption
 */
define('components/UTableOption', [],function () {
    /**
     * A module representing a shirt.
     * @exports components/UTableOption
     */
    return /** @alias module:components/UTableOption */{
        LoadDataType: 0,// 0为用url加载数据，1为直接直接访问仓储

        /**
         * 数据转换函数
         * @param response {object}
         * @returns {*|Array} 数据项
         */
        parseItems: function (response) {
            response.data = response.data || [];
            return response.data;
        },

        /**
         * 获取总行数
         * @param response {object}
         * @returns {*|number} 总行数
         */
        parseTotalCount: function (response) {
            response.nTotalRecordCount = response.nTotalRecordCount || 0;
            return response.nTotalRecordCount;
        },

        /**
         * ajax参数配置
         */
        fetchDataOption: {
            beforeSend: function () {

            },
            complete: function (XMLHttpRequest, textStatus) {
            },
            success: function (data, textStatus) {
            }
        },

        /**
         *行点击事件
         */
        rowClickHandler: function (evt, model) {
        },

        changeRadioButton: function (evt, model) {
        },

        /**
         * checkbox事件
         * @param evt
         * @param model
         */
        changeCheckboxButton: function (evt, model) {
        },

        //加载完成后
        afterLoad: function (data) {

        },

        // 选择全部回调方法
        checkAllChangeHandler: function (evt) {
        },

        // 选择行事件
        rowSelectHandler: function (evt) {
        },

        /**
         * 跳页前的回调
         * @param evt
         * @param pageObj
         */
        beforePageChange: function (evt, pageObj) {
        },

        //筛选条件
        condition: [],

        // 列配置项
        TableColumns: [],

        // 获取数据的地址
        Url: '',

        // 表格样式
        TableClass: 'table table-bordered',
        ShowCheckBox: false,
        ShowRadioBox: false,
        ShowRowIndex: false,
        ShowPager: true,
        PageSize: 50,
        TableName: '',
        DefaultSortField: 'Id',
        DefaultSortWay: 'asc',
        KeyField: 'Id',
        MemoryPage: false,
        MemoryAllData: [],// 所有数据
        Procedure: '',
        IndexColWidth: 50,
        Repository: '',
        Func: '',
        CheckWidth: 30,
        TableBodyHeight: 200,
        FixedColumn: true,
        canLoad: true,
        FootAlign: "center",
        showNoData:true,
        showNoDataText:'暂无更多数据了',

        //添加合计处理
        ShowSum: false,
        SumCol: '',
        SumName: '',
        SumStyle: '',
        ShowTotalSum: false,
        TotalSumName: '',
        FixedTableHeight:false,

        notFoundRowHeight:29,

        // 表脚配置
        FooterOptions: {
            Rows: [
               /* {
                    RowType: "合计",
                    RowTypeNameIndex:1,
                    Cells: [{
                        CellIndex: 1,
                        CellText: '',
                        Func: null
                    }]
                }*/
            ]
        },

        rowPadding:10,
        fixRowHeight:false
    };
});
define('components/TableColumnOption',[
],function () {
    return {
        head: '',// 列头文本
        tag: '',
        width:120,
        sort: '',// 1为排序，0为不排序
        sortTag:'',
        format: '',
        addClass: '',
        clickEvent: '',
        img: '',
        isLink: false,
        url: '',
        paras: '',
        text: '',
        target: '',
        linkList: [],
        align: '',
        headAlign: 'center',
        isOper: false,
        fixColumn:false,
        func:undefined,
        nowrap:true
    }
});

define('components/TableColumn', [
    'components/TableColumnOption'
], function (TableColumnOption) {
    /**
     * @module components/TableColumn
     * @param options {components/TableColumnOption}
     * @constructor
     */
    function TableColumn(options) {
        $.extend(this, TableColumnOption, options);
    }

    return TableColumn;
});
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
define('components/UTableRow', [
    'utils', 'components/UTableOption'
], function (utils, UTableOption) {
    /**
     *
     * @param options
     * @param options.TableColumns {components/TableColumn[]} 表格列数组
     * @param options.KeyField
     * @param options.RowSelectCheckBox
     * @param options.onChangeRadio
     * @param options.notFoundRowHeight
     * @constructor
     */
    function UTableRow(options) {
        this.$el = null;
        this.index = 0;
        this.model = {};
        this.initialize(options);
    }

    UTableRow.prototype = {

        /**
         *
         * @param model 模型
         * @constructor
         */
        template: function (model) {
            var that = this;
            var options = this.options;
            var htmlTemplate = "";
            var tableHtmlArr = [];

            that.leftFixedColumn = [];
            that.rightFixedColumn = [];
            var leftWidth = 0;
            var fixLeft = 0;
            var rowTag = document.createElement("tr");
            if (!model[options.KeyField]) {
                throw  new Error("主键配置错误");
            }
            rowTag.dataset.id = model[options.KeyField];

            // 判断是否需要添加复选框列
            if (options.ShowCheckBox) {
                var checkBoxCell = document.createElement("td");
                checkBoxCell.className = "checkboxField";

                if (options.FixedColumn) {
                    checkBoxCell.style.maxWidth = checkBoxCell.style.minWidth = checkBoxCell.style.width = options.CheckWidth + "px";
                    checkBoxCell.style.left = (leftWidth - 1) + "px";
                    checkBoxCell.className = "checkboxField fixedLeftColumn";
                    leftWidth += options.CheckWidth - 1;
                } else {
                    checkBoxCell.style.width = options.CheckWidth + "px";
                }

                var checkBox = document.createElement("input");
                checkBox.setAttribute("type", "checkbox");
                checkBox.name = "checkbox";
                checkBox.className = "selectBtn";
                checkBox.checked = model.checked || false;
                checkBox.dataset.id = model[options.KeyField];
                checkBox.value = model[options.KeyField];
                checkBoxCell.appendChild(checkBox);
                rowTag.appendChild(checkBoxCell);
                $(checkBox).on("change", function (evt) {
                    if ($(this).is(":checked")) {
                        that.$el.addClass("rowSelected");
                    } else {
                        that.$el.removeClass("rowSelected");
                    }
                    that.model.checked = $(this).is(":checked");
                    that.options.onChangeCheckboxButton(evt, model, that.body);
                });
            }

            if (options.ShowRadioBox) {
                var radioBoxCell = document.createElement("td");
                radioBoxCell.className = "radioField";
                radioBoxCell.style.maxWidth = radioBoxCell.style.minWidth = radioBoxCell.style.width = options.CheckWidth + "px";
                radioBoxCell.style.borderLeft = 0;
                if (options.FixedColumn) {
                    radioBoxCell.className = "fixedLeftColumn";
                    radioBoxCell.style.left = (leftWidth - 1) + "px";
                    leftWidth += options.CheckWidth - 1;
                }

                var radioBox = document.createElement("input");
                radioBox.setAttribute("type", "radio");
                radioBox.setAttribute("name", "checkSingle");
                radioBox.className = "selectBtn";
                radioBoxCell.appendChild(radioBox);
                $(radioBox).on("change", function (evt) {
                    that.$el.addClass("rowSelected");
                    that.model.checked = true;
                    that.options.onChangeRadio.call(this, evt, that.model, that.body);
                });

                rowTag.appendChild(radioBoxCell);
            }

            // 附加序号列
            if (options.ShowRowIndex) {
                var indexCol = document.createElement("td");
                indexCol.className = "rowIndex";
                indexCol.innerHTML = String(that.index + 1);

                rowTag.appendChild(indexCol);
                if (options.FixedColumn) {
                    indexCol.className += " fixedLeftColumn";
                    indexCol.style.left = (leftWidth - 1) + "px";
                    leftWidth += options.IndexColWidth - 1;
                    indexCol.style.maxWidth = indexCol.style.minWidth = indexCol.style.width = options.IndexColWidth + "px";
                } else {
                    indexCol.style.width = options.IndexColWidth + "px";
                }
            }

            var dir = "left";
            var rightWidth = 0;
            var rightCell = [];
            var rightCellRight = [];

            // 填充内容
            $.each(options.TableColumns, function (index, tableColumn) {
                var cell = document.createElement("td");
                cell.style.textAlign = tableColumn.align;
                if (tableColumn.inputType !== "hidden") {
                    if (tableColumn.isLink || tableColumn.isOper) {
                        var link = that.createLink(tableColumn, utils.getJsonValue(model, tableColumn.tag), cell, rowTag);
                        cell.appendChild(link);
                    } else if (tableColumn.format) {
                        cell.title = utils.formatValue(utils.getJsonValue(model, tableColumn.tag), tableColumn.format);
                        cell.setAttribute('format', tableColumn.format);
                        cell.innerHTML = utils.formatValue(utils.getJsonValue(model, tableColumn.tag), tableColumn.format);
                    } else if (tableColumn.func) {
                        if (typeof tableColumn.func == "string" && utils.isFunc(window[tableColumn.func])) {
                            cell.title = utils.getJsonValue(model, tableColumn.tag);
                            cell.innerHTML = window[tableColumn.func](utils.getJsonValue(model, tableColumn.tag), model, tableColumn, cell, rowTag);
                        } else if (utils.isFunc(tableColumn.func)) {
                            cell.title = utils.getJsonValue(model, tableColumn.tag);
                            cell.innerHTML = tableColumn.func(utils.getJsonValue(model, tableColumn.tag), model, tableColumn, cell, rowTag);
                        }
                    }
                    else {
                        cell.title = utils.getJsonValue(model, tableColumn.tag);
                        cell.innerHTML = utils.getJsonValue(model, tableColumn.tag);
                    }

                    // cell.style.borderBottomWidth=0;
                    if (tableColumn.addClass) cell.className = " " + tableColumn.addClass;
                    if (tableColumn.nowrap) {
                        cell.style.whiteSpace = "nowrap";
                        cell.style.textOverflow = "ellipsis";
                        cell.style.overflow = "hidden";
                    }

                    if (options.FixedColumn) {
                        if (tableColumn.fixColumn) {
                            if (dir == "left") {
                                that.leftFixedColumn.push(tableColumn);
                                cell.className += " fixedLeftColumn";
                                cell.style.left = (leftWidth - 1) + "px";
                                leftWidth += tableColumn.width - 1;
                            } else {
                                that.rightFixedColumn.push(tableColumn);
                                cell.className += " fixedRightColumn";
                                rightCellRight.push(rightWidth - 1);
                                cell.style.right = (rightWidth - 1) + "px";
                                rightWidth += tableColumn.width - 1;//8是滚动条宽度
                                rightCell.push(cell);
                            }
                        } else {
                            dir = "right";
                        }
                        cell.style.maxWidth = cell.style.minWidth = cell.style.width = tableColumn.width + "px";
                    } else {
                        cell.style.width = tableColumn.width + "%";
                    }
                    rowTag.appendChild(cell);
                }
            });

            for (var cellIndex = 0; cellIndex < rightCell.length; cellIndex++) {
                rightCell[cellIndex].style.right =(rightCellRight[rightCellRight.length - cellIndex - 1]-8) + "px";
            }

            return rowTag;
        },

        initialize: function (options) {
            this.options = $.extend({}, UTableOption, options);
            this.model = this.model || {};
            this.model.checked = false;
        },

        render: function () {
            var that = this;
            if (this.model) {
                this.$el = $(this.template(this.model));
                this.bindEvents();
            }
            return this;
        },

        bindEvents: function () {
            var that = this;
            this.$el.on('click', function (evt) {
                if (that.options.rowClickHandler)
                    that.options.rowClickHandler(evt, that.model);
            });

            this.$el.on('change', ".checkboxField [type=checkbox]", function (evt) {
                that.options.rowSelectHandler(evt, that.model);
            });

            return this;
        },

        /**
         *
         * @param col {components/TableColumn}
         * @param val {string}
         * @returns {DocumentFragment}
         */
        createLink: function (col, val, cell, rowTag) {
            var documentFragment = document.createDocumentFragment();
            if (col.isLink) {
                if (col.isOper) {
                    $.each(this.createLinkList(col, cell, rowTag), function (index, item) {
                        documentFragment.appendChild(item);
                    });
                } else {
                    var option = {
                        img: col.img,
                        target: col.target,
                        url: col.url,
                        paras: col.paras,
                        clickEvent: col.clickEvent, tip: "",
                        text: col.text || val,
                        cssClass: "",
                        func: col.func
                    };
                    documentFragment.appendChild(this.createSingleLink(option, cell, rowTag));
                }
            }

            return documentFragment;
        },

        /**
         *
         * @param options
         * @returns {Element}
         */
        createSingleLink: function (options, cell, rowTag) {
            var option = $.extend({
                img: "",
                target: "",
                url: "",
                paras: "",
                clickEvent: null,
                tip: "",
                text: "",
                cssClass: "",
                func: null
            }, options);

            var that = this;
            var link = document.createElement('a');
            var imgObj = null;
            if (option.text) {
                link.innerHTML = option.text;
            } else if (option.img) {
                imgObj = new Image();
                imgObj.src = option.img;
                imgObj.style.marginLeft = "5px";
                imgObj.className = "img-btn";
                link.appendChild(imgObj);
            } else {
                link.innerHTML = option.text;
            }
            if (option.target) {
                link.setAttribute('target', option.target);
            }
            if (option.clickEvent) {
                link.className += " clickEvent";
                link.setAttribute("href", 'javascript:void(0);');
                $(link).on('click', function (evt) {
                    evt.preventDefault();
                    if (utils.isFunc(option.clickEvent)) {
                        option.clickEvent(evt, that.model, rowTag);
                    } else if (window[option.clickEvent] && utils.isFunc(window[option.clickEvent])) {
                        window[option.clickEvent](evt, that.model, rowTag);
                    }
                });
            } else {
                link.setAttribute("href", option.url);
            }

            if (option.cssClass)
                link.className = option.cssClass;
            if (option.tag)
                link.setAttribute("tag", option.tag);
            if (option.tip)
                link.setAttribute("title", option.tip);
            if (option.paras) {
                link.setAttribute("paras", option.paras);
                this.setLinkParams(link);
            }

            if (utils.isFunc(option.func)) {
                link.innerHTML = option.func(that.model, option.text, cell, link, rowTag);
                if (link.innerHTML == '') {
                    link.style.display = "none";
                }
            }
            return link;
        },

        /**
         *
         * @param linkElement
         */
        setLinkParams: function (linkElement) {
            var $link = $(linkElement);
            var that = this;
            var paras = $link.attr('paras');
            var url = $link.attr('href');
            var arr = paras.split(';');
            for (var i = 0; i < arr.length; i++) {
                var val = '';
                if (arr[i].indexOf('_') != -1) {
                    var tmpArr = arr[i].split('_');
                    for (var j = 0; j < tmpArr.length; j++) {
                        var tmp = tmpArr[j];
                        var v = utils.getJsonValue(that.model, tmp);
                        if (v != undefined && v.length > 0) {
                            val = v;
                            break;
                        }
                    }
                } else {
                    var v = utils.getJsonValue(that.model, arr[i]);
                    if (!!v)
                        val = v;
                }
                var reg = new RegExp("\\{" + i + "\\}", "g");
                url = url.replace(reg, val);
            }
            $link.attr('href', url);
        },

        /**
         *
         * @param col
         * @returns {Array}
         */
        createLinkList: function (col, cell, rowTag) {
            var linkList = [];
            var that = this;
            $.each(col.linkList, function (index, link) {
                var option = {
                    img: link.img,
                    target: link.target,
                    url: link.url,
                    paras: link.paras,
                    clickEvent: link.clickEvent, tip: "",
                    text: link.text,
                    cssClass: link.cssClass,
                    func: link.func
                };

                linkList.push(that.createSingleLink(option, cell, rowTag));
            });

            return linkList;
        },

        setChecked: function (flag) {
            if (flag != this.model.checked) {
                this.model.checked = flag;
                if (flag && !this.$el.hasClass("rowSelected")) {
                    this.$el.addClass("rowSelected");
                } else {
                    this.$el.removeClass("rowSelected");
                }
                this.$el.find('.checkboxField [type=checkbox]').prop('checked', flag);
            }
        },

        hasChecked: function () {
            return this.model.checked;
        },

        /**
         * 获取高度最大值
         * @returns {number}
         */
        initHeight: function () {
            var max = Math.max.apply(null, $.map(this.$el.find('td'), function (item) {
                return $(item).height();
            }));
            var padding = this.options.rowPadding;
            var notFoundMax = false;
            if (max <= 0) {
                max = this.options.notFoundRowHeight;
                notFoundMax = true;
            }

            $.each(this.$el.find('td:not(.fixedLeftColumn):not(.fixedRightColumn)'), function () {
                var $this = $(this);
                this.style.verticalAlign = "top";
                this.style.height = (max ) + "px";
                if (notFoundMax) {
                    $this.css({
                        "white-space": "nowrap",
                        "text-overflow": "ellipsis",
                        "overflow": "hidden"
                    });
                }
                this.style.padding = padding / 2 + "px";
            });

            $.each(this.$el.find('td.fixedLeftColumn'), function () {
                var $this = $(this);

                this.style.height = (max+padding) + "px";
                this.style.borderBottom = "0";
                this.style.padding = padding / 2 + "px";

                if (notFoundMax) {
                    this.style.height = (max) + "px";
                    $this.css({
                        "white-space": "nowrap",
                        "text-overflow": "ellipsis",
                        "overflow": "hidden"
                    });
                }
            });

            $.each(this.$el.find('td.fixedRightColumn'), function () {
                var $this = $(this);
                this.style.height = (max +padding) + "px";
                this.style.padding = padding / 2 + "px";
                this.style.borderBottom = "0";
                if (notFoundMax) {
                    this.style.height = (max) + "px";
                    $this.css({
                        "white-space": "nowrap",
                        "text-overflow": "ellipsis",
                        "overflow": "hidden"
                    });
                }
            });
        },

        setRadioSelected: function (hasCheck) {
            if (hasCheck && hasCheck != this.model.checked) {
                this.model.checked = hasCheck;
                this.$el.addClass("rowSelected");
                this.$el.find("[name=checkSingle]").click();
            } else {
                if (this.$el.hasClass("rowSelected")) {
                    this.$el.removeClass("rowSelected");
                }
                this.model.checked = hasCheck;
            }
        }
    };

    return UTableRow;
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
/**
 * Created by Administrator on 2017/3/6.
 */
define('components/UTableHeadRow', ["utils"], function (utils) {

    /**
     *
     * @param options
     * @constructor
     */
    function UTableHeadRow(options) {
        this.el = null;
        this.initialize(options);
    }

    UTableHeadRow.prototype = {

        /**
         * 配置函数
         * @param options
         * @param options.onChangeCheckBox
         * @param options.TableColumns
         * @param options.onCheckSortColumn
         * @param options.IndexColWidth 默认50
         * @param options opti
         */
        initialize: function (options) {
            var that = this;
            this.options = $.extend({
                onChangeCheckBox: function () {
                },
                onCheckSortColumn: function (tag) {
                },
                TableColumns: [],
                IndexColWidth: 50
            }, options);

            that.leftFixedColumn = [];
            that.rightFixedColumn = [];

            /*
             * 头部结构
             * <div style="padding-left:108px; width:auto;  overflow:hidden; background:#f00;" id="tableDiv_title">
             <table border="0" cellspacing="0" cellpadding="0">
             <tr>
             <td></td>
             </tr>
             </table>
             </div>
             * */

            // 创建表头外层以偏移头部距离
            var tbHeadWrapper = document.createElement("div");
            tbHeadWrapper.style.width = "auto";
            tbHeadWrapper.style.overflow = "hidden";
            tbHeadWrapper.dataset.id = "tableDiv_title";
            tbHeadWrapper.className = "tb-head-wrapper";

            var headTable = document.createElement("table");
            headTable.border = 0;
            headTable.className = options.TableClass;

            if (!options.FixedColumn) {
                headTable.className += " fixTable";
            }

            var leftWidth = 0;
            var rightWidth = 0;// 用于定位右侧距离

            var row = document.createElement("tr");
            if (options.ShowCheckBox) {
                var checkBoxCell = document.createElement("th");
                checkBoxCell.className = "checkboxField";
                checkBoxCell.style.maxWidth = checkBoxCell.style.minWidth = checkBoxCell.style.width = options.CheckWidth + "px";
                checkBoxCell.style.borderLeft = 0;
                checkBoxCell.style.textAlign = "center";
                if (options.FixedColumn) {
                    checkBoxCell.className = "fixedLeftColumn";
                    checkBoxCell.style.left = (leftWidth - 1) + "px";
                    leftWidth += options.CheckWidth - 1;
                }
                var checkBox = document.createElement("input");
                checkBox.setAttribute("type", "checkbox");
                checkBox.setAttribute("name", "checkAll");
                checkBox.className = "checkAll";
                checkBoxCell.appendChild(checkBox);
                $(checkBox).on("change", function (evt) {
                    that.options.onChangeCheckBox($(this).is(":checked"));
                });
                row.appendChild(checkBoxCell);
            }

            if (options.ShowRadioBox) {
                var radioBoxCell = document.createElement("th");
                radioBoxCell.className = "radioField";
                radioBoxCell.style.maxWidth = radioBoxCell.style.minWidth = radioBoxCell.style.width = options.CheckWidth + "px";
                radioBoxCell.style.borderLeft = 0;
                if (options.FixedColumn) {
                    radioBoxCell.className = "fixedLeftColumn";
                    radioBoxCell.style.left = (leftWidth - 1) + "px";
                    leftWidth += options.CheckWidth - 1;
                }
                row.appendChild(radioBoxCell);
            }

            // 附加序号列
            if (options.ShowRowIndex) {
                var indexCol = document.createElement("th");
                indexCol.className = "rowIndex";
                if (options.FixedColumn) {
                    indexCol.className += " fixedLeftColumn";
                    indexCol.style.left = (leftWidth - 1) + "px";
                    leftWidth += options.IndexColWidth - 1;
                    indexCol.style.maxWidth = indexCol.style.minWidth = indexCol.style.width = options.IndexColWidth + "px";
                } else {
                    indexCol.style.width = options.IndexColWidth + "px";
                }
                indexCol.textContent = "序号";
                row.appendChild(indexCol);
            }

            var dir = "left";

            var rightCell = [];
            var rightCellRight = [];

            $.each(options.TableColumns, function (index, tableColumn) {
                var cell = document.createElement("th");
                cell.innerHTML = tableColumn.head;
                if (tableColumn.title) cell.setAttribute('data-title', tableColumn.title);
                if (tableColumn.wordlen) cell.setAttribute('data-len', tableColumn.wordlen);
                if (tableColumn.wordlen) cell.setAttribute('data-len', tableColumn.wordlen);
                if (tableColumn.addClass) cell.className = tableColumn.addClass;
                if (tableColumn.sort == "1") {
                    cell.innerHTML = utils.formatString("<a href='javascript:void(0);' class='sort-link' tag='{1}' sortTag='{2}'>{0}↑</a>",
                        tableColumn.head, tableColumn.tag, tableColumn.sortTag);
                }

                cell.style.textAlign = tableColumn.headAlign;
                cell.title = tableColumn.head;

                // 判断是否需要添加复选框列
                if (options.FixedColumn) {
                    if (tableColumn.fixColumn) {
                        if (dir == "left") {
                            that.leftFixedColumn.push(tableColumn);
                            cell.className = "fixedLeftColumn";
                            cell.style.left = (leftWidth - 1) + "px";
                            leftWidth += tableColumn.width - 1;
                        } else {
                            that.rightFixedColumn.push(tableColumn);
                            cell.className = "fixedRightColumn";
                            rightCellRight.push(rightWidth - 1);
                            cell.style.right = (rightWidth - 1) + "px";
                            rightWidth += tableColumn.width - 1;
                            rightCell.push(cell);
                        }
                    } else {
                        dir = "right";
                    }
                    cell.style.maxWidth = cell.style.minWidth = cell.style.width = tableColumn.width + "px";
                } else {
                    cell.style.width = tableColumn.width + "%";
                }
                row.appendChild(cell);
            });

            for (var cellIndex = 0; cellIndex < rightCell.length; cellIndex++) {
                rightCell[cellIndex].style.right = rightCellRight[rightCellRight.length - cellIndex - 1] + "px";
            }

            tbHeadWrapper.style.paddingLeft = (leftWidth - 1) + "px";
            tbHeadWrapper.style.marginRight = (rightWidth - 1) + "px";
            var thead = document.createElement("thead");
            thead.appendChild(row);
            headTable.appendChild(thead);
            tbHeadWrapper.appendChild(headTable);

            this.el = tbHeadWrapper;
            this.$el = $(tbHeadWrapper);
            this.$el.on('click', '.sort-link', function (evt) {
                var text = $(this).text();
                $(this).text(text.substring(0, text.length - 1) + (text.indexOf('↑') != -1 ? '↓' : '↑'));
                that.options.onCheckSortColumn({
                    tag: evt.currentTarget.getAttribute("sortTag") || evt.currentTarget.getAttribute("tag"),
                    sortway: text.indexOf('↑') == -1 ? 'asc' : 'desc'
                });
            });
        },

        render: function () {
            this.$el = $(this.el);
            return this;
        },

        /**
         * 获取未固定的列的宽度
         * @returns {number}
         */
        getUnFixedWidth: function () {
            var totl = 0;
            this.$el.find("th:not(.fixedLeftColumn):not(.fixedRightColumn)").each(function (index, ele) {
                totl += $(ele).outerWidth();
            });
            return totl;
        },
        /**
         * 获取总宽度
         * @returns {number}
         */
        getAllColWidth: function () {
            return this.getUnFixedWidth() + Number(this.el.style.paddingLeft.replace("px", "")) + Number(this.el.style.marginRight.replace("px", ""));
        },
        getOutHeight: function () {
            return this.$el.outerHeight();
        },
        /**
         * 获取高度最大值
         * @returns {number}
         */
        initHeight: function () {
            var max = Math.max.apply(null, $.map(this.$el.find('th'), function (item) {
                return $(item).height();
            }));
            var padding =this.options.rowPadding;
            var notFoundMax = false;
            if (max <= 0) {
                max = this.options.notFoundRowHeight;
                notFoundMax = true;
            }
            $.each(this.$el.find('th:not(.fixedLeftColumn):not(.fixedRightColumn)'), function () {
                var $this = $(this);
                this.style.height = (max) + "px";
                this.style.padding = padding / 2 + "px";
                if (notFoundMax) {
                    $this.css({
                        "white-space": "nowrap",
                        "text-overflow": "ellipsis",
                        "overflow": "hidden"
                    });
                }
            });

            $.each(this.$el.find('th.fixedLeftColumn'), function () {
                var $this = $(this);
                this.style.height = (max + padding) + "px";
                this.style.borderBottom = "0";
                this.style.padding = padding / 2 + "px";
                if (notFoundMax) {
                    $this.css({
                        "white-space": "nowrap",
                        "text-overflow": "ellipsis",
                        "overflow": "hidden"
                    });
                }
            });

            $.each(this.$el.find('th.fixedRightColumn'), function () {
                var $this = $(this);
                this.style.height = (max + padding) + "px";
                this.style.padding = padding / 2 + "px";
                this.style.borderBottom = "0";
                if (notFoundMax) {
                    $this.css({
                        "white-space": "nowrap",
                        "text-overflow": "ellipsis",
                        "overflow": "hidden"
                    });
                }
            });

            this.max = max;
        }
    };

    return UTableHeadRow;
});
define('components/UTableBody', [
    'utils',
    'components/UTableOption',
    'components/UTableRow'
], function (utils, UTableOption, UTableRow) {
    function UTableBody(options) {
        this.initialize(options);
    }

    UTableBody.prototype = {
        /**
         * 初始化行数
         * @param options
         * @param options.TableBodyHeight 高度
         * @param options.TableClass 表格样式类
         * @param options.TableColumns {object[]}
         * @param options.onMouseWheel
         * @param options.changeRadioButton
         * @param options.KeyField
         * @param options.TableBodyMinHeight
         */
        initialize: function (options) {
            var that = this;
            this.options = options;
            this.rows = [];
            this.height = 0;
            that.radioSelectedModel = null;// 获取单选时的model

            /**
             * 结构
             *
             * <div style="overflow:hidden;height:128px; width:100%;">
             *      <div style="padding-left:108px; width:auto;overflow:hidden;" id="tableDiv_body">
             *           <table border="0" cellspacing="0" cellpadding="0">
             *           </table>
             *     </div>
             * </div>
             */

            /**
             * 外层信息
             */
            var outerWrapper = document.createElement("div");
            this.outerWrapper = outerWrapper;
            outerWrapper.className = "outerWrapper";
            outerWrapper.style.position = "relative";
            var wrapper = document.createElement("div");
            wrapper.className = "tb-body-wrapper";
            wrapper.style.overflowX = "hidden";
            wrapper.style.overflowY = "auto";
            wrapper.style.paddingBottom="1px";
            wrapper.style.position = "relative";
            wrapper.style.maxHeight = options.TableBodyHeight + "px";
            // wrapper.style.minHeight = options.TableBodyMinHeight + "px";
            wrapper.style.width = "100%";
            wrapper.style.borderBottom = wrapper.style.borderTop = "1px solid #ccc";

            outerWrapper.appendChild(wrapper);
            var positionDiv = document.createElement("div");
            positionDiv.style.width = "auto";
            positionDiv.style.overflow = "hidden";
            positionDiv.className = "positionDiv";
            this.positionDiv = positionDiv;
            wrapper.appendChild(positionDiv);

            var innerTable = document.createElement("table");
            innerTable.border = 0;
            innerTable.cellPadding = 0;
            innerTable.cellSpacing = 0;
            innerTable.className = options.TableClass;
            if (!options.FixedColumn) {
                innerTable.className += " fixTable";
            }

            var tbody = document.createElement("tbody");
            innerTable.appendChild(tbody);
            positionDiv.appendChild(innerTable);
            this.innerTable = tbody;

            this.el = wrapper;
            this.$el = $(wrapper);
            this.$el.on('mousewheel', function (evt) {
                if (this.scrollHeight > this.offsetHeight) {
                    if (evt.deltaY) {
                        this.scrollTop = this.scrollTop - evt.deltaY * 20;
                        that.options.onMouseWheel(this.scrollTop);
                    } else {
                        this.scrollTop = this.scrollTop + evt.wheelDelta / 5;
                        that.options.onMouseWheel(this.scrollTop);
                    }
                }
            });
        },

        /**
         * 设置左边距
         * @param left
         * @returns {UTableBody}
         */
        setPaddingLeft: function (left) {
            this.positionDiv.style.paddingLeft = left;
            return this;
        },
        /**
         * 设置右边距
         * @param right
         * @returns {UTableBody}
         */
        setMarginRight: function (right) {
            this.positionDiv.style.marginRight = right;
            return this;
        },

        /**
         * 添加实体
         * @param model
         */
        addModel: function (model, collectionLength) {
            var that = this;
            var options = $.extend({}, this.options, {
                isLastRow: that.rows.length == collectionLength,
                onChangeRadio: function (evt, model, currentBody) {
                    currentBody.radioSelectedModel = model;
                    $.each(currentBody.rows, function (index, row) {
                        if (row.model[currentBody.options.KeyField] != model[currentBody.options.KeyField]) {
                            currentBody.selectedModel = row.model;
                            row.setRadioSelected(false);
                        }
                    });
                    currentBody.options.changeRadioButton(evt, model);
                },
                onChangeCheckboxButton: function (evt, model, currentBody) {
                    currentBody.options.changeCheckboxButton(evt, model);
                }
            });

            var uTableRow = new UTableRow(options);
            uTableRow.index = that.rows.length;
            uTableRow.body = this;
            uTableRow.model = model;
            uTableRow.render();
            that.rows.push(uTableRow);
            that.innerTable.appendChild(uTableRow.$el[0]);
            uTableRow.initHeight();
        },

        clearItems: function () {
            this.rows = [];
            $(this.innerTable).empty();
        },

        /**
         * 获取内容高度
         * @returns {*|jQuery}
         */
        getContentHeight: function () {
            var height = 0;
            $.each(this.rows, function (index, row) {
                height += row.getRowHeight();
            });

            return height;
        },

        getOuterHeight: function () {
            var contentHeight = this.getContentHeight();
            if (contentHeight <= this.options.TableBodyHeight) {
                return contentHeight + 1;
            } else {
                return parseInt(this.options.TableBodyHeight) + 1;
            }
        },

        checkCanShowXBar:function(){
            var contentHeight = this.getContentHeight();
            if (contentHeight <= this.options.TableBodyHeight) {
                return false;
            } else {
                return true;
            }
        },

        /**
         * 设置scrollTop
         * @param scrollTop
         */
        setScrollTop: function (scrollTop) {
            this.el.scrollTop = scrollTop;
        },

        /**
         * 设为已选
         * @param hasChecked
         */
        setCheck: function (hasChecked) {
            $.each(this.rows, function (index, row) {
                row.setChecked(hasChecked);
            });
        },

        /**
         * 设置选中项
         */
        setCheckedItems: function (ids) {
            var options = this.options;
            $.each(this.rows, function (index, row) {
                var has = false;
                $.each(ids, function (idIndex, id) {
                    if (row.model[options.KeyField] == id) {
                        has = true;
                        return false;
                    }
                });
                row.setChecked(has);
            });
        },

        getRowsByIds: function (ids) {
            var items = [];
            var options = this.options;
            $.each(this.rows, function (index, row) {
                $.each(ids, function (idIndex, id) {
                    if (row.model[options.KeyField] == id) {
                        items.push(row);
                    }
                });
            });

            return items;
        },

        /**
         * 获取已选的行数据
         */
        getCheckedIds: function () {
            var that = this;
            return $.map(this.getCheckedItems(), function (item) {
                return item.model[that.options.KeyField];
            });
        },

        /**
         * 获取已选的项
         * @returns {*}
         */
        getCheckedItems: function () {
            return $.grep(this.rows, function (row, i) {
                return row.hasChecked();
            });
        },

        // 获取单选框已选的内容
        getRadioSelectedModel: function () {
            var checkItems = $.map(this.getCheckedItems(), function (item) {
                return item.model;
            });
            if (checkItems.length > 0)
                return checkItems[0];
            else
                return null;
        },

        setRadioSelectedModel: function (id) {
            var that = this;
            $.each(this.rows, function (index, row) {
                if (row.model[that.options.KeyField] == id) {
                    that.selectedModel = row.model;
                    row.setRadioSelected(true);
                } else {
                    row.setRadioSelected(false);
                }
            });
        }
    };

    return UTableBody;
});
/**
 * Created by Administrator on 2017/3/9.
 */
define("components/XScrollBar",[],function () {
    function XScrollBar(options) {
        this.initialize(options);
    }

    XScrollBar.prototype = {
        /**
         *
         * @param options
         * @param options.top 上距离
         * @param options.marginLeft
         * @param options.marginRight
         * @param options.width 宽度
         * @param options.onScroll 滚动回调函数
         */
        initialize: function (options) {
            var that=this;
            that.options=options;
            /**
             *
             <div style="background-color:#eee;overflow:hidden;top:150px; width:100%; z-index:2;position:absolute;">
             <div style="margin-left:108px; width:auto;overflow-x:scroll;overflow-y:hidden;" onscroll='divScroll(this);'>
             <div style="width:630px; height:1px;"></div>
             </div>
             </div>
             */
            var xBar = document.createElement("div");
            xBar.className = "x-bar";
            xBar.style.overflow = "hidden";
            xBar.style.top = 0;
            xBar.style.width = "100%";
            xBar.style.position = "absolute";
            xBar.style.zIndex = "2";

            var scrollWrapper = document.createElement("div");
            scrollWrapper.style.marginLeft = options.marginLeft + "px";
            scrollWrapper.style.marginRight = options.marginRight + "px";
            scrollWrapper.style.width = "auto";
            scrollWrapper.style.overflowX = "auto";
            scrollWrapper.style.overflowY = "hidden";

            var scrollContent = document.createElement("div");
            scrollContent.style.width=options.width+"px";
            scrollContent.style.height="1px";

            scrollWrapper.appendChild(scrollContent);
            xBar.appendChild(scrollWrapper);
            this.el = xBar;
            this.$el = $(xBar);
            $(scrollWrapper).on("scroll",function(evt){
                that.options.onScroll(evt.currentTarget.scrollLeft);
            });
        },

        setTop:function(top){
          //  this.$el.css("top",top+"px");
        }
    };

    return XScrollBar;
});
define('components/UTableFootRow', [
    'utils', 'components/UTableOption'
], function (utils, UTableOption) {
    /**
     *
     * @param options
     * @param options.TableColumns {components/TableColumn[]} 表格列数组
     * @param options.KeyField
     * @param options.RowSelectCheckBox
     * @param options.onChangeRadio
     * @constructor
     */
    function UTableFootRow(options) {
        this.$el = null;
        this.index = 0;
        this.model = {};
        this.initialize(options);
    }

    UTableFootRow.prototype = {
        /**
         *
         * @param model 模型
         * @constructor
         */
        template: function (model) {
            var that = this;
            var options = this.options;
            var htmlTemplate = "";
            var tableHtmlArr = [];

            that.leftFixedColumn = [];
            that.rightFixedColumn = [];
            var leftWidth = 0;
            var rowTag = document.createElement("tr");
            // 判断是否需要添加复选框列
            if (options.ShowCheckBox) {
                var checkBoxCell = document.createElement("td");
                checkBoxCell.className = "checkboxField";

                if (options.FixedColumn) {
                    checkBoxCell.style.maxWidth = checkBoxCell.style.minWidth = checkBoxCell.style.width = options.CheckWidth + "px";
                    checkBoxCell.style.left = (leftWidth - 1) + "px";
                    checkBoxCell.className = "checkboxField fixedLeftColumn";
                    leftWidth += options.CheckWidth - 1;
                } else {
                    checkBoxCell.style.width = options.CheckWidth + "px";
                }
                rowTag.appendChild(checkBoxCell);
            }

            if (options.ShowRadioBox) {
                var radioBoxCell = document.createElement("td");
                radioBoxCell.className = "radioField";
                radioBoxCell.style.maxWidth = radioBoxCell.style.minWidth = radioBoxCell.style.width = options.CheckWidth + "px";
                radioBoxCell.style.borderLeft = 0;
                if (options.FixedColumn) {
                    radioBoxCell.className = "fixedLeftColumn";
                    radioBoxCell.style.left = (leftWidth - 1) + "px";
                    leftWidth += options.CheckWidth - 1;
                }

                rowTag.appendChild(radioBoxCell);
            }

            // 附加序号列
            if (options.ShowRowIndex) {
                var indexCol = document.createElement("td");
                indexCol.className = "rowIndex";
                // indexCol.innerHTML = String(that.index + 1);

                rowTag.appendChild(indexCol);
                if (options.FixedColumn) {
                    indexCol.className += " fixedLeftColumn";
                    indexCol.style.left = (leftWidth - 1) + "px";
                    leftWidth += options.IndexColWidth - 1;
                    indexCol.style.maxWidth = indexCol.style.minWidth = indexCol.style.width = options.IndexColWidth + "px";
                } else {
                    indexCol.style.width = options.IndexColWidth + "px";
                }
            }

            var dir = "left";
            var rightWidth = 0;
            var rightCell = [];
            var rightCellRight = [];

            // 填充内容
            $.each(options.TableColumns, function (index, tableColumn) {
                var cell = document.createElement("td");
                cell.style.textAlign = tableColumn.FootAlign;
                if (tableColumn.nowrap) {
                    cell.style.whiteSpace = "nowrap";
                    cell.style.textOverflow = "ellipsis";
                    cell.style.overflow = "hidden";
                }
                if (options.FixedColumn) {
                    if (tableColumn.fixColumn) {
                        if (dir == "left") {
                            that.leftFixedColumn.push(tableColumn);
                            cell.className += " fixedLeftColumn";
                            cell.style.left = (leftWidth - 1) + "px";
                            leftWidth += tableColumn.width - 1;
                        } else {
                            that.rightFixedColumn.push(tableColumn);
                            cell.className += " fixedRightColumn";
                            rightCellRight.push(rightWidth - 1);
                            cell.style.right = (rightWidth - 1) + "px";
                            rightWidth += tableColumn.width - 1;
                            rightCell.push(cell);
                        }
                    } else {
                        dir = "right";
                    }
                    cell.style.maxWidth = cell.style.minWidth = cell.style.width = tableColumn.width + "px";
                } else {
                    cell.style.width = tableColumn.width + "%";
                }
                rowTag.appendChild(cell);
            });

            for (var cellIndex = 0; cellIndex < rightCell.length; cellIndex++) {
                rightCell[cellIndex].style.right = rightCellRight[rightCellRight.length - cellIndex - 1] + "px";
            }

            return rowTag;
        },

        initialize: function (options) {
            this.options = $.extend(UTableOption, options);
            this.model = this.model || {};
            this.model.checked = false;
        },

        render: function () {
            var that = this;
            if (this.model) {
                this.$el = $(this.template(this.model));
            }
            return this;
        },

        /**
         * 获取高度最大值
         * @returns {number}
         */
        initHeight: function () {
            var max = Math.max.apply(null, $.map(this.$el.find('td'), function (item) {
                return $(item).height();
            }));
            var padding = this.options.rowPadding;
            var notFoundMax = false;
            if (max <= 0) {
                max = this.options.notFoundRowHeight;
                notFoundMax = true;
            }

            $.each(this.$el.find('td:not(.fixedLeftColumn):not(.fixedRightColumn)'), function () {
                var $this = $(this);
                this.style.verticalAlign = "top";
                this.style.height = (max + padding) + "px";
                if (notFoundMax) {
                    $this.css({
                        "white-space": "nowrap",
                        "text-overflow": "ellipsis",
                        "overflow": "hidden"
                    });
                    this.style.lineHeight = this.style.height;
                }
                this.style.padding = padding / 2 + "px";
            });

            $.each(this.$el.find('td.fixedLeftColumn'), function () {
                var $this = $(this);

                this.style.height = (max + padding) + "px";
                this.style.borderBottom = "0";
                this.style.padding = padding / 2 + "px";

                if (notFoundMax) {
                    $this.css({
                        "white-space": "nowrap",
                        "text-overflow": "ellipsis",
                        "overflow": "hidden"
                    });
                    this.style.lineHeight = this.style.height;
                    this.style.height = (max + padding + padding + 2) + "px";
                }
            });

            $.each(this.$el.find('td.fixedRightColumn'), function () {
                var $this = $(this);
                this.style.height = (max + padding) + "px";
                this.style.padding = padding / 2 + "px";
                this.style.borderBottom = "0";
                if (notFoundMax) {
                    $this.css({
                        "white-space": "nowrap",
                        "text-overflow": "ellipsis",
                        "overflow": "hidden"
                    });
                    this.style.lineHeight = this.style.height;
                    this.style.height = (max + padding + padding + 2) + "px";
                }
            });
            this.max = max + padding;
            return max;
        },

        getCell: function (cellIndex) {
            return this.$el.find('td:eq(' + cellIndex + ')');
        }
    };

    return UTableFootRow;
});
define("components/UTableFooter", ['components/UTableFootRow', 'utils'], function (UTableFootRow, utils) {
    function UTableFooter(options) {
        this.initialize(options);
    }

    UTableFooter.prototype.initialize = function (options) {
        this.options = options;
        var that = this;

        that.leftFixedColumn = [];
        that.rightFixedColumn = [];
        that.rows = [];
        /*
         * 脚部结构
         * <div style="padding-left:108px; width:auto;  overflow:hidden; background:#f00;" id="tableDiv-footer">
         <table border="0" cellspacing="0" cellpadding="0">
         <tr>
         <td></td>
         </tr>
         </table>
         </div>
         * */

        // 创建表头外层以偏移头部距离
        var tbFooterWrapper = document.createElement("div");
        tbFooterWrapper.style.width = "auto";
        //tbFooterWrapper.style.overflow = "hidden";
        tbFooterWrapper.dataset.id = "tableDiv-footer";
        tbFooterWrapper.className = "tb-foot-wrapper";
        tbFooterWrapper.style.position = "relative";

        var positionDiv = document.createElement("div");
        positionDiv.style.width = "auto";
        positionDiv.style.overflow = "hidden";
        this.positionDiv = positionDiv;
        tbFooterWrapper.appendChild(positionDiv);

        var footTable = document.createElement("table");
        footTable.border = 0;
        footTable.className = options.TableClass;
        if (!options.FixedColumn) {
            footTable.className += " fixTable";
        }
        this.footTable = footTable;
        this.tfoot = document.createElement("tfoot");
        footTable.appendChild(this.tfoot);
        positionDiv.appendChild(footTable);
        this.$el = $(tbFooterWrapper);
        this.el = tbFooterWrapper;
    };

    UTableFooter.prototype.setRows = function (rows, data) {
        var that = this;
        this.rows = [];
        $(this.tfoot).empty();
        $.each(rows, function (index, row) {
            var uTableFootRow = new UTableFootRow(that.options);
            uTableFootRow.footer = that;
            uTableFootRow.model = row;
            uTableFootRow.render();
            that.rows.push(uTableFootRow);

            uTableFootRow.getCell(row.RowTypeNameIndex || 0).text(row.RowType);

            $.each(row.Cells, function (index, cellOpts) {
                var cell = $.extend({
                    CellIndex: 1,
                    CellText: '',
                    Func: null
                }, cellOpts);
                var curCell = uTableFootRow.getCell(cell.CellIndex || (uTableFootRow.$el.find("th").length - 1));
                if (utils.isFunc(cell.Func)) {
                    var text = cell.Func(data, curCell);
                    if (text) {
                        curCell.text(text);
                    }
                } else {
                    curCell.text(cell.CellText);
                }
                uTableFootRow.$el.find('th:eq(' + (cell.CellIndex || uTableFootRow.$el.find("th").length - 1) + ')')
            });
            that.tfoot.appendChild(uTableFootRow.$el[0]);
            uTableFootRow.initHeight();
        });
    };

    UTableFooter.prototype.setFixedLeft = function (left) {
        this.positionDiv.style.paddingLeft = left + "px";
    };

    UTableFooter.prototype.appendXBar=function(xBar){
        xBar.$el.appendTo(this.$el);
    };

    UTableFooter.prototype.setFixedRight = function (right) {
        this.positionDiv.style.marginRight = right + "px";
    };


    return UTableFooter;
});
define('components/UTable', [
    'components/UTableOption',
    'components/TableColumn',
    'utils',
    'components/UTableRow',
    'components/UPager',
    'components/UTableHeadRow',
    'components/UTableBody',
    'components/XScrollBar',
    'components/UTableFooter'
], function (UTableOption, TableColumn, utils, UTableRow, Pager, UTableHeadRow, UTableBody, XScrollBar, UTableFooter) {
    /**
     * 表格控件
     * @param selector {string|Element}选择器
     * @param options {module:components/UTableOption}
     * @constructor
     * @exports components/UTable
     * @class uut.UTable
     */
    function UTable(selector, options) {
        this.selector = selector;
        this.options = options;
        this.collection = [];
        this.totalCount = 0;
        this.pageIndex = 1;
        this.pageSize = 20;
        this.rows = [];
        this.pager = null;
    }

    /**
     * 初始化
     */
    UTable.prototype.initialize = function (selector, options) {
        var that = this;
        that.options = $.extend({}, UTableOption, options);
        that.options.fetchDataOption = $.extend({}, UTableOption.fetchDataOption, options.fetchDataOption);
        that.options.fetchDataOption.type = that.options.fetchDataOption.type || "get";
        that.pageSize = that.options.PageSize;
        that.sortField = this.options.DefaultSortField;
        that.sortWay = this.options.DefaultSortWay;
        that.condition = this.options.condition;
        that.allData = this.options.MemoryAllData || [];
        that.canLoad = this.options.canLoad;

        var list = [];
        $.each(that.options.TableColumns, function (index, tableColumn) {
            if (tableColumn.tag) {
                if (tableColumn.spliter) {
                    list = list.concat(tableColumn.tag.split(tableColumn.spliter));
                } else {
                    list.push(tableColumn.tag);
                }
            }
        });

        list.push(options.KeyField);

        // 去重
        list = list.distinct();
        this.strColumns = list.join(",");

        var tempTableColumns = [];
        $.each(this.options.TableColumns, function (index, item) {
            tempTableColumns.push(new TableColumn(item));
        });

        this.options.TableColumns = tempTableColumns;

        this.$element = $(selector);

        // 创建table外层，以限制宽度
        var tableWrapperForFixWidth = document.createElement("div");
        this.$el = $(tableWrapperForFixWidth);
        this.$el.appendTo(this.$element);

        tableWrapperForFixWidth.style.position = "relative";
        tableWrapperForFixWidth.className = "utable";
        //tableWrapperForFixWidth.style.width = this.options.TableWidth + "px";

        // 创建table外层，以限制高度
        var tableWrapperForFixHeight = document.createElement("div");
        tableWrapperForFixHeight.style.position = "relative";
        tableWrapperForFixHeight.style.width = "100%";
        tableWrapperForFixHeight.style.overflow = "hidden";
        tableWrapperForFixHeight.style.paddingBottom = "10px";
        tableWrapperForFixWidth.appendChild(tableWrapperForFixHeight);

        /**
         * 附加头部
         */
        var headerRow = new UTableHeadRow($.extend({
            onChangeCheckBox: function (haschecked) {
                if (that.tbBody)that.tbBody.setCheck(haschecked);
            },
            onCheckSortColumn: function (tagObj) {
                that.sortField = tagObj.tag;
                that.sortWay = tagObj.sortway;
                that.loadPage(1);
            }
        }, this.options));

        this.headRow = headerRow;
        tableWrapperForFixHeight.appendChild(headerRow.render().el);
        headerRow.initHeight();
        if (this.options.FixedColumn)
            tableWrapperForFixWidth.style.maxWidth = (headerRow.getAllColWidth()) + "px";

        /**
         * 表格内容
         */
        var tbBody = new UTableBody($.extend({
            onMouseWheel: function (scrollTop) {
            }
        }, this.options));
        this.tbBody = tbBody;

        tableWrapperForFixHeight.appendChild(tbBody.outerWrapper);
        tbBody.setPaddingLeft(headerRow.el.style.paddingLeft);
        tbBody.setMarginRight((Number(headerRow.el.style.marginRight.replace("px",""))-8)+"px");

        var uTableFooter = new UTableFooter(this.options);
        uTableFooter.$el.appendTo(tableWrapperForFixHeight);
        this.uTableFooter = uTableFooter;
        if (that.options.FixedColumn) {
            uTableFooter.setFixedLeft(headerRow.el.style.paddingLeft.replace("px", ""));
            uTableFooter.setFixedRight(headerRow.el.style.marginRight.replace("px", ""));
        }

        // 分页条
        var showPager = options.ShowPager;
        this.bindEvents();

        var pager = new Pager({
            changePage: function (page) {
                that.loadPage(page);
            },
            beforePageChange: that.options.beforePageChange,
            showNoData: that.options.showNoData,
            showNoDataText: that.options.showNoDataText,
        });
        pager.render();

        if (showPager) {
            pager.$el.appendTo(tableWrapperForFixHeight);
        }

        this.pager = pager;
        if (that.options.FixedColumn) {
            var xScroll = new XScrollBar({
                top: 0,
                marginLeft: headerRow.el.style.paddingLeft.replace("px", ""),
                marginRight: headerRow.el.style.marginRight.replace("px", "")-8,
                width: headerRow.getUnFixedWidth(),
                onScroll: function (scrollLeft) {
                    headerRow.el.scrollLeft = scrollLeft;
                    tbBody.positionDiv.scrollLeft = scrollLeft;
                    that.uTableFooter.positionDiv.scrollLeft = scrollLeft;
                }
            });
            xScroll.$el.appendTo(uTableFooter.$el);
            this.xScroll = xScroll;
        }

        return this;
    };

    UTable.prototype.bindEvents = function () {
        var that = this;
        this.$el.on('click', '.checkAll[type=checkbox]', function (evt) {
            var check = $(evt.currentTarget).is(":checked");
            $.each(that.rows, function (row) {
                this.setChecked(check);
            });
            that.options.checkAllChangeHandler.call(that, evt);
        });
    };

    /**
     * 渲染控件
     * @param condition
     * @returns {UTable}
     */
    UTable.prototype.render = function (condition) {
        if (!this.init) {
            this.initialize(this.selector, this.options);
            this.init = true;
        }
        if (condition) {
            this.condition = condition;
        }
        this.loadPage(1);
        return this;
    };

    UTable.prototype.fetchData = function (options) {
        var that = this;
        options = options || {};
        options = $.extend({
            url: that.options.Url,
            type: 'get',
            async: true,
            cache: false,
            data: {
                pageIndex: that.pager.getPageIndex(),
                PageSize: that.pager.getPageSize()
            },
            dataType: 'json',
            beforeSend: function (XMLHttpRequest) {
            },
            complete: function (XMLHttpRequest, textStatus) {
            }
        }, options);
        return $.ajax(options);
    };

    /**
     * 重新加载
     * @param option
     */
    UTable.prototype.reload = function (option) {
        var that = this;
        this.options = $.extend(this.options, option);
        that.pageSize = that.options.PageSize;
        that.condition = that.options.condition;
        that.sortField = this.options.DefaultSortField;
        that.sortWay = this.options.DefaultSortWay;
        that.condition = this.options.condition;
        that.allData = this.options.MemoryAllData || [];
        that.canLoad = this.options.canLoad;

        that.loadPage(1);
    };

    /**
     * 加载第几页数据
     * @param pageIndex
     * @returns {UTable}
     */
    UTable.prototype.loadPage = function (pageIndex) {
        var that = this;
        var options;
        that.headRow.initHeight();
        if (this.pager && this.canLoad) {
            this.pager.setPageIndex(pageIndex, false);
            this.pager.setPageSize(this.options.PageSize);

            // 1为按url加载
            if (this.options.MemoryPage == true) {
                if (that.options.ShowPager) {

                } else {
                    this.pager.setPageSize(this.allData.length);
                }
                var currentPageData = that.getMemoryPageData(pageIndex);
                that.collection = currentPageData.Items;
                that.totalCount = currentPageData.TotalCount;
                that.tbBody.clearItems();
                success.call(that, that.tbBody, that.collection, that.totalCount, currentPageData);
            } else {
                if (that.options.LoadDataType != '1') {
                    that.options.fetchDataOption.data = {
                        condition: that.condition,
                        sortField: that.sortField,
                        sortWay: that.sortWay,
                        pageIndex: that.pager.getPageIndex(),
                        pageSize: that.pager.getPageSize()
                    };
                    var options = that.options.fetchDataOption;
                    if (options.type.toLowerCase() == "get") {
                        options.data.condition = JSON.stringify(that.condition);
                    } else {
                        options.data.condition = that.condition;
                    }
                    that.tbBody.clearItems();
                    that.fetchData(options).done(function (data, textStatus) {
                        that.collection = that.options.parseItems(data);
                        that.totalCount = that.options.parseTotalCount(data);
                        success.call(that, that.tbBody, that.collection, that.totalCount, data);
                    });
                } else {
                    that.options.fetchDataOption.data = {
                        type: 'GetList',
                        columns: this.strColumns,
                        condition: this.condition,
                        tableName: that.options.TableName,
                        func: that.options.Func,
                        repository: that.options.Repository,
                        sortField: that.sortField,
                        sortWay: that.sortWay,
                        pageIndex: that.pager.getPageIndex(),
                        pageSize: that.pager.getPageSize(),
                        procedure: that.options.Procedure,
                        memoryPage: that.options.MemoryPage
                    };
                    options = that.options.fetchDataOption;
                    if (that.options.fetchDataOption.type.toLowerCase() == "get") {
                        options.data.condition = JSON.stringify(that.condition);
                    } else {
                        options.data.condition = that.condition;
                    }
                    that.tbBody.clearItems();
                    that.fetchData(options).done(function (data, textStatus) {
                        that.collection = that.options.parseItems(data);
                        that.totalCount = that.options.parseTotalCount(data);
                        success.call(that, that.tbBody, that.collection, that.totalCount, data);
                    });
                }
            }
        }

        function success(tbBody, collection, totalCount, response) {
            collection = collection || [];
            var that = this;
            $.each(collection, function (index, item) {
                tbBody.addModel(item, collection.length);
            });

            that.pager.setTotalCount(totalCount);
            that.pager.reRenderPageData();
            that.options.afterLoad(response);
            if (that.options.FooterOptions.Rows.length > 0) {
                that.uTableFooter.setRows(that.options.FooterOptions.Rows, response);
            }
        }

        return this;
    };

    /**
     * 按条件加载数据
     * @param condition
     */
    UTable.prototype.loadDataByCondition = function (condition) {
        this.condition = condition;
        this.loadPage(1);
    };

    UTable.prototype.getMemoryPageData = function () {
        var nPageIndex = this.pager.getPageIndex();
        var nPageSize = this.pager.getPageSize();

        var start = (nPageIndex - 1) * nPageSize;
        var end = start + nPageSize;

        var allData = this.allData;

        var pageData = {};
        pageData.Items = allData.slice(start, end);
        pageData.TotalCount = allData.length;
        return pageData;
    };

    /**
     * 清空数据项
     */
    UTable.prototype.clearItems = function () {
        this.tbBody.clearItems();
    };

    /**
     * 获取已选的ID项
     * @returns {*}
     */
    UTable.prototype.getCheckedIds = function () {
        return this.tbBody.getCheckedIds();
    };

    /**
     * 获取单选时的已选项
     * @returns {*}
     */
    UTable.prototype.getRadioSelectedModel = function () {
        return this.tbBody.getRadioSelectedModel();
    };

    UTable.prototype.setRadioSelectedModel = function (Id) {
        this.tbBody.setRadioSelectedModel(Id);
    };

    /**
     * 获取已选的model
     * @returns {*}
     */
    UTable.prototype.getCheckedItems = function () {
        return $.map(this.tbBody.getCheckedItems(), function (row) {
            return row.model;
        });
    };

    /**
     * 设置选中行
     * @param Ids 主键数组
     */
    UTable.prototype.setCheckedItems = function (Ids) {
        this.tbBody.setCheckedItems(Ids);
    };

    return UTable;
})
;
define("jquery.utable", [
    "components/UTable"
], function (UcTable) {
    $.fn.uTable = function (options) {
        var $this = $(this);
        if (options) {
            var type = $.type(options);
            var table;
            if (type === 'string' && $this.data('table')) {
                table = $this.data('table');
                switch (options) {
                    case "resetPageIndex":
                        table.loadPage(1);
                        break;
                    case "clearItems":
                        table.clearItems();
                        break;
                    case "getCheckedIds":
                        return table.getCheckedIds();
                    case "getCheckedItems":
                        return table.getCheckedItems();
                    case "setCheckedItems":
                        /**
                         * 设置选项
                         */
                        return table.setCheckedItems(arguments[1]);
                    case "loadDataByCondition":
                        return table.loadDataByCondition(arguments[1]);
                    case "reload":
                        return table.reload(arguments[1]);
                    case "getRadioSelectedModel":
                        return table.getRadioSelectedModel();
                    case "setRadioSelectedModel":
                        table.setRadioSelectedModel(arguments[1]);
                        break;
                }

            } else if (type == "object") {

                if ($this.data('table')) {
                    table = $this.data('table');
                    table.reload(arguments[1]);
                } else {
                    table = new UcTable(this, options);
                    $this.data('table', table);
                    table.render();
                }
            } else {
                if ($this.data('table')) {
                    table = $this.data('table');
                    table.reload({});
                } else {
                    table = new UcTable(this, {});
                    $this.data('table', table);
                    table.render();
                }
            }
        }
    };
});

    return require('jquery.utable');
}));
