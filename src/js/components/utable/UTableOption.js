/**
 * @module components/UTableOption
 */
define('components/utable/UTableOption',[], function () {
    /**
     * A module representing a shirt.
     * @exports components/UTableOption
     */
    var defaultSetting = /** @alias module:components/UTableOption */{
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
        condition: null,

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
        FootAlign: "center",
        ShowNoData: true,
        ShowNoDataText: '暂无更多数据了',
        canLoad:true,

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
        }
    };

    return {
        getDefault: function () {
           return $.extend({}, defaultSetting);
        }
    };
});