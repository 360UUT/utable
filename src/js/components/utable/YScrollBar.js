/**
 * 纵向滚动条
 */
define('components/utable/YScrollBar',[], function () {
    function YScrollBar(options) {
        this.initialize(options);
    }

    YScrollBar.prototype = {
        /**
         *
         * @param options {object}
         * @param options.top {number} 上定位距离
         * @param options.height {number} 表格内容的高度
         * @param options.contentHeight {number} 表格详细的高度
         * @param options.onScroll {function(number)}
         */
        initialize: function (options) {
            this.options = options;
            var that = this;

            /**
             * 结构
             <div id="scrollDiv_y" style="display:block; overflow-x:hidden; overflow-y:scroll; position:absolute; top:22px; right:0px; height:118px; padding-bottom:10px;" onscroll='divYScroll(this);'>
             <div style="width:1px; height:194px;"></div>
             </div>
             */
            var elemt = document.createElement("div");
            elemt.dataset.id = "scrollDiv_y";
            elemt.className="y-bar";
            elemt.style.overflowX = "hidden";
            elemt.style.overflowY = "auto";
            elemt.style.position = "absolute";
            elemt.style.top =0;
            elemt.style.width="10px";
            elemt.style.right = "-1px";
            elemt.style.paddingBottom = "0";
            elemt.style.bottom = "0";
            elemt.style.zIndex = "1";
            var innerEle = document.createElement("div");
            innerEle.style.width = "10px";
            innerEle.style.height = options.contentHeight + "px";
            elemt.appendChild(innerEle);
            this.$el = $(elemt);
            this.el = elemt;
            this.innerEle = innerEle;
            this.$el.on("scroll", function (evt) {
                that.options.onScroll(evt.currentTarget.scrollTop);
            });
        },

        setContentHeight: function (height) {
            this.innerEle.style.height = height + "px";
        },

        setOuterHeight:function(height){
           // this.el.style.height=height-1+"px";
        },

        scrollTop:function(){
            this.$el.scrollTop(0);
        }
    };

    return YScrollBar;
});