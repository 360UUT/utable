define('components/utable/TableColumn', [
    'components/utable/TableColumnOption'
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