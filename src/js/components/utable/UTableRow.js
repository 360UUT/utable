define('components/utable/UTableRow', [
    'utils', 'components/utable/UTableOption'
], function (utils, UTableOption) {
    /**
     *
     * @param options
     * @param options.TableColumns {components/TableColumn[]} 表格列数组
     * @param options.KeyField
     * @param options.RowSelectCheckBox
     * @param options.onChangeRadio
     * @param options.notFoundRowHeight
     * @param options.onInitHeight
     * @constructor
     */
    function UTableRow(options) {
        this.$el = null;
        this.index = 0;
        this.model = {};
        this.initialize(options);
    }

    UTableRow.prototype = {
        constructor: UTableRow,
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
                    that.options.onChangeCheckboxButton.call(that, evt, model, that.body);
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
                    that.options.onChangeRadio.call(that, evt, that.model, that.body);
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
                        if (tableColumn.format == "enum") {
                            var val = utils.getJsonValue(model, tableColumn.tag);
                            for (var enumKey in tableColumn.enums) {
                                if (tableColumn.enums[enumKey]["value"] == val) {
                                    cell.title = tableColumn.enums[enumKey]["text"];
                                    cell.innerHTML = tableColumn.enums[enumKey]["text"];
                                    break;
                                }
                            }
                        } else {
                            cell.title = utils.formatValue(utils.getJsonValue(model, tableColumn.tag), tableColumn.format);
                            cell.setAttribute('format', tableColumn.format);
                            cell.innerHTML = utils.formatValue(utils.getJsonValue(model, tableColumn.tag), tableColumn.format);
                        }
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
                var rightPos = 0;
                for (var riIndex = cellIndex + 1; riIndex < rightCell.length; riIndex++) {
                    rightPos += utils.getCssNumber(rightCell[riIndex], "width");
                }
                if (cellIndex > 0) {
                    rightCell[cellIndex].style.borderLeft = 0;
                }
                rightCell[cellIndex].style.right = rightPos + "px";
            }

            return rowTag;
        },

        initialize: function (options) {
            this.options = $.extend({}, UTableOption.getDefault(), options);
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
                    that.options.rowClickHandler(evt, that.model,this.index);
            });

            this.$el.on('change', ".checkboxField [type=checkbox]", function (evt) {
                that.options.rowSelectHandler(evt, that.model);
            });

            return this;
        },

        /**
         *
         * @param col
         * @param col.isLink
         * @param col.isOper
         * @param val {string}
         * @param cell
         * @param rowTag
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
                        cssClass: col.cssClass,
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
         * @param cell
         * @param rowTag
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
                        option.clickEvent.call(that,evt, that.model, rowTag);
                    } else if (window[option.clickEvent] && utils.isFunc(window[option.clickEvent])) {
                        window[option.clickEvent].call(that, evt, that.model, rowTag);
                    }
                });
            } else {
                link.setAttribute("href", option.url);
            }

            if (option.cssClass)
                link.className += " " + option.cssClass;
            if (option.tag)
                link.setAttribute("tag", option.tag);
            if (option.tip){
                link.setAttribute("title", option.tip);
            }
            else{
                link.setAttribute("title", option.text);
            }
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
                    clickEvent: link.clickEvent,
                    tip:link.tip,
                    text: link.text,
                    cssClass: link.cssClass,
                    func: link.func
                };

                linkList.push(that.createSingleLink(option, cell, rowTag));
            });

            return linkList;
        },

        setChecked: function (flag) {
            var checkBox = this.$el.find('.checkboxField [type=checkbox]');
            if (checkBox.is(":enabled")) {
                if (flag != this.model.checked) {
                    this.model.checked = flag;
                    if (flag && !this.$el.hasClass("rowSelected")) {
                        this.$el.addClass("rowSelected");
                    } else {
                        this.$el.removeClass("rowSelected");
                    }
                    checkBox.prop('checked', flag);
                }
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
            var _this = this;
            var max = 0;
            var timer = null;

            function getMaxHeight() {
                if (timer)clearTimeout(timer);
                max = Math.max.apply(null, $.map(_this.$el.find('td'), function (item) {
                    return $(item).height();
                }));
                if (max <= 0) {
                    timer = setTimeout(getMaxHeight.bind(this), 0);
                } else {
                    this.$el.find('td:not(.fixedLeftColumn):not(.fixedRightColumn)').height(max).css({
                        "vertical-align": "top"
                    }).height(max);
                    this.$el.find('td.fixedLeftColumn').height(max + 1);
                    this.$el.find('td.fixedRightColumn').height(max + 1);

                    this.height = max;
                    _this.options.onInitHeight.call(_this, max);
                }
            }

            getMaxHeight.call(this);
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
        },

        getRowHeight: function () {
            return Number(this.height);
        }
    };

    return UTableRow;
});