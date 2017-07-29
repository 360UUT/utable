define('components/utable/UTable', [
    'components/utable/UTableOption',
    'components/utable/TableColumn',
    'utils',
    'components/utable/UTableRow',
    'components/upager/UPager',
    'components/utable/UTableHeadRow',
    'components/utable/UTableBody',
    'components/utable/XScrollBar',
    'components/utable/UTableFooter'
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
        var defaultSetting = UTableOption.getDefault();
        that.options = $.extend({}, defaultSetting, options);
        that.options.fetchDataOption = $.extend({}, defaultSetting.fetchDataOption, options.fetchDataOption);
        that.options.fetchDataOption.type = that.options.fetchDataOption.type || "get";
        that.pageSize = that.options.PageSize;
        that.sortField = this.options.DefaultSortField;
        that.sortWay = this.options.DefaultSortWay;
        that.condition = this.options.condition;
        that.allData = this.options.MemoryAllData || [];

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
        list = utils.distinct(list);
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
        tableWrapperForFixHeight.appendChild(headerRow.render().fixedWrapper);

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
        tbBody.setMarginRight(headerRow.el.style.marginRight);

        var footerWrapper = document.createElement("div");
        footerWrapper.classList.add("footerWrapper");
        this.footerWrapper = footerWrapper;

        tableWrapperForFixHeight.appendChild(footerWrapper);

        var uTableFooter = new UTableFooter(this.options);
        uTableFooter.$el.appendTo(footerWrapper);
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
                if (that.xScroll) {
                    that.xScroll.scrollLeft();
                }
                that.loadPage(page);
            },
            beforePageChange: that.options.beforePageChange,
            ShowNoData: that.options.ShowNoData,
            ShowNoDataText: that.options.ShowNoDataText
        });
        pager.render();

        if (showPager) {
            pager.$el.appendTo(footerWrapper);
        }

        this.pager = pager;
        if (that.options.FixedColumn) {
            var xScroll = new XScrollBar({
                top: 0,
                marginLeft: Number(headerRow.el.style.paddingLeft.replace("px", "")),
                marginRight: Number(headerRow.el.style.marginRight.replace("px", "")) - 1,
                width: headerRow.getUnFixedWidth() + 1,
                onScroll: function (scrollLeft) {
                    headerRow.el.scrollLeft = scrollLeft;
                    tbBody.positionDiv.scrollLeft = scrollLeft;
                    that.uTableFooter.positionDiv.scrollLeft = scrollLeft;
                }
            });
            xScroll.$el.appendTo(uTableFooter.$el);
            this.xScroll = xScroll;
            this.$el.css({maxWidth: (this.headRow.getAllColWidth()) + "px"});
        }

        var timer = null;

        function fixWidth() {
            if (timer)clearTimeout(timer);
            if (that.$el.width() == 0) {
                timer = setTimeout(arguments.callee.bind(that), 0);
            } else {
                that.headRow.fixedWrapper.style.width = that.$el.width() + "px";
                that.footerWrapper.style.width = that.$el.width() + "px";
            }
        }

        fixWidth();
        window.addEventListener("resize", fixWidth, false);

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

        document.addEventListener("scroll", function () {
            var rect = that.$el[0].getBoundingClientRect();
            var offset = that.$el.offset();
            var maxBottom = that.$el.offset().top + that.$el.height();
            var distance = window.innerHeight - rect.height;

            if (window.innerHeight < rect.height) {
                if (rect.top < window.innerHeight + 25 && rect.top > 0) {
                    //console.log("头部在范围内，脚部不在范围内");
                    that.headRow.unFixedTop();
                    that.fixedOnBottom();
                    // 脚部显示出来
                } else if (rect.top < 0 && rect.top > distance && rect.bottom < rect.height && rect.bottom > 0 && window.innerHeight < rect.height) {
                    // console.log("头部且脚部都不在视口内");
                    that.headRow.fixedTop();
                    that.fixedOnBottom();
                } else if (rect.top < 0 && rect.bottom < rect.height && rect.bottom > 0) {
                    // 固定头部
                    that.headRow.fixedTop();
                    that.unFixedOnBottom();
                    //console.log("头不在且脚部在视口内");
                } else {
                    //console.log("恢复正常");
                    that.unFixedOnBottom();
                    that.headRow.unFixedTop();
                }
            } else {
                if (rect.top < window.innerHeight && rect.top > distance) {
                    //console.log("脚未显示，头以显示");
                    that.headRow.unFixedTop();
                    that.fixedOnBottom();
                } else if (rect.top < 0 && rect.bottom > 0) {
                    that.headRow.fixedTop();
                    that.unFixedOnBottom();
                    //console.log("脚显示，头未显示");
                } else {
                    //console.log("恢复正常");
                    that.unFixedOnBottom();
                    that.headRow.unFixedTop();
                }
            }
        }, false);
    };

    UTable.prototype.fixedOnBottom = function () {
        if (!$(this.footerWrapper).hasClass("fixed")) {
            $(this.footerWrapper).addClass("fixed");
        }
    };

    UTable.prototype.unFixedOnBottom = function () {
        if ($(this.footerWrapper).hasClass("fixed")) {
            $(this.footerWrapper).removeClass("fixed");
        }
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
            dataType: 'json'
        }, options);
        return $.ajax(options);
    };

    /**
     * 重新加载
     * @param option
     */
    UTable.prototype.reload = function (option) {
        var that = this;
        this.options = $.extend({}, this.options, option);
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

        that.headRow.setCheck(false);
        if (that.pager) {
            that.pager.setPageIndex(pageIndex, false);
            that.pager.setPageSize(this.options.PageSize);

            that.tbBody.scrollTop();

            that.pager.showLoading();
            that.pager.hideNoData();

            // 1为按url加载
            if (that.options.MemoryPage == true) {
                if (!that.options.ShowPager) {
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
                    options = that.options.fetchDataOption;
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
            that.pager.hideLoading();
            tbBody.clearItems();
            if (collection.length == 0) {
                that.pager.showNoData();
            }
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