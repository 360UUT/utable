define("jquery.utable", [
    "components/utable/UTable"
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
                    table.reload(arguments[0]);
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
