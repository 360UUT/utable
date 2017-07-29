define("components/utable/UTableFooter", ['components/utable/UTableFootRow', 'utils'], function (UTableFootRow, utils) {
    function UTableFooter(options) {
        this.initialize(options);
    }

    UTableFooter.prototype.initialize = function (options) {
        this.options = options;
        var that = this;

        that.leftFixedColumn = [];
        that.rightFixedColumn = [];
        that.rows = [];
        /*
         * 脚部结构
         * <div style="padding-left:108px; width:auto;  overflow:hidden; background:#f00;" id="tableDiv-footer">
         <table border="0" cellspacing="0" cellpadding="0">
         <tr>
         <td></td>
         </tr>
         </table>
         </div>
         * */

        // 创建表头外层以偏移头部距离
        var tbFooterWrapper = document.createElement("div");
        tbFooterWrapper.style.width = "auto";
        //tbFooterWrapper.style.overflow = "hidden";
        tbFooterWrapper.dataset.id = "tableDiv-footer";
        tbFooterWrapper.className = "tb-foot-wrapper";
        tbFooterWrapper.style.position = "relative";

        var positionDiv = document.createElement("div");
        positionDiv.style.width = "auto";
        positionDiv.style.overflow = "hidden";
        this.positionDiv = positionDiv;
        tbFooterWrapper.appendChild(positionDiv);

        var footTable = document.createElement("table");
        footTable.border = 0;
        footTable.className = options.TableClass;
        if (!options.FixedColumn) {
            footTable.className += " fixTable";
        }
        this.footTable = footTable;
        this.tfoot = document.createElement("tfoot");
        footTable.appendChild(this.tfoot);
        positionDiv.appendChild(footTable);
        this.$el = $(tbFooterWrapper);
        this.el = tbFooterWrapper;
    };

    UTableFooter.prototype.setRows = function (rows, data) {
        var that = this;
        this.rows = [];
        $(this.tfoot).empty();
        $.each(rows, function (index, row) {
            var uTableFootRow = new UTableFootRow(that.options);
            uTableFootRow.footer = that;
            uTableFootRow.model = row;
            uTableFootRow.render();
            that.rows.push(uTableFootRow);

            uTableFootRow.getCell(row.RowTypeNameIndex || 0).text(row.RowType);

            $.each(row.Cells, function (index, cellOpts) {
                var cell = $.extend({
                    CellIndex: 1,
                    CellText: '',
                    Func: null
                }, cellOpts);
                var curCell = uTableFootRow.getCell(cell.CellIndex || (uTableFootRow.$el.find("th").length - 1));
                if (utils.isFunc(cell.Func)) {
                    var text = String(cell.Func(data, curCell));
                    curCell.text(text);
                } else {
                    curCell.text(cell.CellText||"&nbsp;");
                }
                uTableFootRow.$el.find('th:eq(' + (cell.CellIndex || uTableFootRow.$el.find("th").length - 1) + ')')
            });
            that.tfoot.appendChild(uTableFootRow.$el[0]);
            uTableFootRow.initHeight();
        });
    };

    UTableFooter.prototype.setFixedLeft = function (left) {
        this.positionDiv.style.paddingLeft = left + "px";
    };

    UTableFooter.prototype.appendXBar = function (xBar) {
        xBar.$el.appendTo(this.$el);
    };

    UTableFooter.prototype.setFixedRight = function (right) {
        this.positionDiv.style.marginRight = right + "px";
    };

    return UTableFooter;
});