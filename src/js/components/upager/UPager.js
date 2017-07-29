/**
 * @module components/Pager
 */
define("components/upager/UPager", ['utils'], function (utils) {
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
            '<div class="nodata">' + this.options.ShowNoDataText + '</div>'+'<div class="loading" style="display: none;text-align: center;">正在加载...</div>';
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
            ShowNoData: true,
            ShowNoDataText: '暂无数据',

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
            this.$el.find('.total-record').html(this.totalCount);
            var dot = '<span class="page-dot">...</span>';
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
                            "<span class='page-dot'>...</span>");

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
    };

    UPager.prototype.show = function () {
        this.$el.show();
    };

    UPager.prototype.close = function () {
        this.$el.hide();
    };

    UPager.prototype.showNoData = function () {
        this.$el.find('.page-content').hide();
        this.$el.find('.nodata').show();
    };
    UPager.prototype.hideNoData = function () {
        this.$el.find('.page-content').show();
        this.$el.find('.nodata').hide();
    };
    UPager.prototype.showLoading = function () {
        this.$el.find('.page-content').hide();
        this.$el.find('.loading').show();
    };
    UPager.prototype.hideLoading = function () {
        this.$el.find('.page-content').show();
        this.$el.find('.loading').hide();
    };

    return UPager;
})
;