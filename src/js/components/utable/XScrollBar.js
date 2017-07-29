/**
 * Created by Administrator on 2017/3/9.
 */
define("components/utable/XScrollBar", [], function () {
    function XScrollBar(options) {
        this.initialize(options);
    }

    XScrollBar.prototype = {
        constructor: XScrollBar,

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
            var that = this;
            that.options = options;

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
            xBar.style.top = "-4px";
            xBar.style.width = "100%";
            xBar.style.position = "absolute";
            xBar.style.zIndex = "2";

            var scrollWrapper = document.createElement("div");
            scrollWrapper.style.marginLeft = options.marginLeft + "px";
            scrollWrapper.style.marginRight = (options.marginRight - 1) + "px";
            scrollWrapper.style.width = "auto";
            scrollWrapper.style.overflowX = "auto";
            scrollWrapper.style.overflowY = "hidden";

            var scrollContent = document.createElement("div");
            scrollContent.style.width = options.width + "px";
            scrollContent.style.height = "1px";

            scrollWrapper.appendChild(scrollContent);
            this.scrollWrapper = scrollWrapper;
            xBar.appendChild(scrollWrapper);
            this.el = xBar;
            this.$el = $(xBar);
            $(scrollWrapper).on("scroll", function (evt) {
                that.options.onScroll(evt.currentTarget.scrollLeft);
            });
            this.$scrollWrapper=$(scrollWrapper);
        },

        setTop: function (top) {
            //  this.$el.css("top",top+"px");
        },

        setMarginRight: function (marginRight) {
            this.scrollWrapper.marginRight = marginRight + "px";
        },

        scrollLeft: function () {
            this.$scrollWrapper[0].scrollLeft = 0;
        }
    };

    return XScrollBar;
});