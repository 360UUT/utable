define("jquery.page", [
    "components/upager/UPager"
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
                        if(arguments.length==2){
                            pager.setPageIndex(Number(arguments[1]));
                        }else{
                            pager.setPageIndex(Number(arguments[1]),arguments[2]);
                        }
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
