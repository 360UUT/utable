define('components/utable/UTableBody', [
    'utils',
    'components/utable/UTableRow',
    'components/utable/YScrollBar',
    'jquery-mousewheel'
], function (utils, UTableRow, YScrollBar) {
    function UTableBody(options) {
        this.initialize(options);
    }

    UTableBody.prototype = {
        constructor: UTableBody,
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
         * @param options.FixedColumn
         */
        initialize: function (options) {
            var that = this;
            that.options = options;
            that.rows = [];
            that.height = 0;
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
            that.outerWrapper = outerWrapper;
            outerWrapper.className = "outerWrapper";
            outerWrapper.style.position = "relative";

            var wrapper = document.createElement("div");
            wrapper.className = "tb-body-wrapper";
            wrapper.style.overflowX = "hidden";
            wrapper.style.overflowY = "hidden";
            wrapper.style.position = "relative";
            //wrapper.style.maxHeight = options.TableBodyHeight + "px";
            wrapper.style.width = "100%";
            wrapper.style.borderBottom = wrapper.style.borderTop = "1px solid #ccc";

            outerWrapper.appendChild(wrapper);
            var positionDiv = document.createElement("div");
            positionDiv.style.width = "auto";
            positionDiv.style.overflow = "hidden";
            positionDiv.className = "positionDiv";
            that.positionDiv = positionDiv;
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
            that.innerTable = tbody;

            var yScrollBar = new YScrollBar({
                onScroll: function (scrollTop) {
                    wrapper.scrollTop = scrollTop;
                }
            });
            that.yScrollBar = yScrollBar;
            that.el = wrapper;
            that.$el = $(wrapper);
            that.$el.on('mousewheel', function (evt) {
                if (this.scrollHeight > this.offsetHeight) {
                    if (evt.deltaY) {
                        this.scrollTop = this.scrollTop - evt.deltaY * 20;
                        that.options.onMouseWheel(this.scrollTop);
                    } else {
                        this.scrollTop = this.scrollTop + evt.wheelDelta / 5;
                        that.options.onMouseWheel(this.scrollTop);
                    }
                    that.yScrollBar.el.scrollTop = this.scrollTop;
                }
            });

            that.outerWrapper.appendChild(yScrollBar.el);
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
            that.collectionLength=collectionLength;
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
                },
                onInitHeight:function(){
                    that.resizeContentHeight();
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

        checkCanShowYBar: function () {
            /*var contentHeight = this.getContentHeight();
             if (contentHeight <= this.options.TableBodyHeight) {
             this.$el.css("overflow-y","hidden");
             return false;
             } else {
             this.$el.css("overflow-y","auto");
             return true;
             }*/
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
        },

        resizeContentHeight: function () {
            var _this = this;
            var $positionDiv = $(this.positionDiv);
            var height;
            var timer;
            getHeightUntilHasHeight();
            function getHeightUntilHasHeight() {
                height = $positionDiv.height();
                if (height) {
                    if (timer)
                        clearTimeout(timer);

                    _this.yScrollBar.setContentHeight($positionDiv.outerHeight() + 2);
                } else {
                    timer = setTimeout(getHeightUntilHasHeight, 200);
                }
            }
        },

        scrollTop: function () {
            this.yScrollBar.scrollTop();
        }
    };

    return UTableBody;
});