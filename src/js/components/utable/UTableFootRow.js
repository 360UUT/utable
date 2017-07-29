define('components/utable/UTableFootRow', [
    'utils', 'components/utable/UTableOption'
], function (utils, UTableOption) {
    /**
     *
     * @param options
     * @param options.TableColumns {components/TableColumn[]} 表格列数组
     * @param options.KeyField
     * @param options.RowSelectCheckBox
     * @param options.onChangeRadio
     * @constructor
     */
    function UTableFootRow(options) {
        this.$el = null;
        this.index = 0;
        this.model = {};
        this.initialize(options);
    }

    UTableFootRow.prototype = {
        constructor: UTableFootRow,
        /**
         *
         * @param model 模型
         * @constructor
         */
        template: function (model) {
            var that = this;
            var options = this.options;
            var htmlTemplate = "";
            var tableHtmlArr = [];

            that.leftFixedColumn = [];
            that.rightFixedColumn = [];
            var leftWidth = 0;
            var rowTag = document.createElement("tr");

            // 判断是否需要添加复选框列
            if (options.ShowCheckBox) {
                var checkBoxCell = document.createElement("td");
                checkBoxCell.className = "checkboxField";

                if (options.FixedColumn) {
                    checkBoxCell.style.maxWidth = checkBoxCell.style.minWidth = checkBoxCell.style.width = options.CheckWidth + "px";
                    checkBoxCell.style.left = (leftWidth - 1) + "px";
                    checkBoxCell.className = "checkboxField fixedLeftColumn";
                    leftWidth += options.CheckWidth - 1;
                } else {
                    checkBoxCell.style.width = options.CheckWidth + "px";
                }
                rowTag.appendChild(checkBoxCell);
            }

            if (options.ShowRadioBox) {
                var radioBoxCell = document.createElement("td");
                radioBoxCell.className = "radioField";
                radioBoxCell.style.maxWidth = radioBoxCell.style.minWidth = radioBoxCell.style.width = options.CheckWidth + "px";
                radioBoxCell.style.borderLeft = 0;
                if (options.FixedColumn) {
                    radioBoxCell.className = "fixedLeftColumn";
                    radioBoxCell.style.left = (leftWidth - 1) + "px";
                    leftWidth += options.CheckWidth - 1;
                }
                radioBoxCell.innerHTML = "&nbsp;";
                rowTag.appendChild(radioBoxCell);
            }

            // 附加序号列
            if (options.ShowRowIndex) {
                var indexCol = document.createElement("td");
                indexCol.className = "rowIndex";
                indexCol.innerHTML = "&nbsp;";

                rowTag.appendChild(indexCol);
                if (options.FixedColumn) {
                    indexCol.className += " fixedLeftColumn";
                    indexCol.style.left = (leftWidth - 1) + "px";
                    //indexCol.style.height = this.options.notFoundRowHeight + "px";
                    leftWidth += options.IndexColWidth - 1;
                    indexCol.style.maxWidth = indexCol.style.minWidth = indexCol.style.width = options.IndexColWidth + "px";
                } else {
                    indexCol.style.width = options.IndexColWidth + "px";
                }
            }

            var dir = "left";
            var rightWidth = 0;
            var rightCell = [];
            var rightCellRight = [];

            // 填充内容
            $.each(options.TableColumns, function (index, tableColumn) {
                var cell = document.createElement("td");
                cell.style.textAlign = tableColumn.FootAlign;
                cell.style.whiteSpace = "nowrap";
                cell.style.textOverflow = "ellipsis";
                cell.style.overflow = "hidden";

                if (options.FixedColumn) {
                    cell.innerHTML="&nbsp;";
                    if (tableColumn.fixColumn) {
                        if (dir == "left") {
                            that.leftFixedColumn.push(tableColumn);
                            cell.className += " fixedLeftColumn";
                            cell.style.left = (leftWidth - 1) + "px";
                            leftWidth += tableColumn.width - 1;
                        } else {
                            that.rightFixedColumn.push(tableColumn);
                            cell.className += " fixedRightColumn";
                            rightCellRight.push(rightWidth - 1);
                            cell.style.right = (rightWidth - 1) + "px";
                            rightWidth += tableColumn.width - 1;
                            rightCell.push(cell);
                        }
                    } else {
                        dir = "right";
                    }
                    cell.style.maxWidth = cell.style.minWidth = cell.style.width = tableColumn.width + "px";
                } else {
                    cell.style.width = tableColumn.width + "%";
                }
                rowTag.appendChild(cell);
            });

            for (var cellIndex = 0; cellIndex < rightCell.length; cellIndex++) {
                var rightPos = 0;
                for (var riIndex = cellIndex + 1; riIndex < rightCell.length; riIndex++) {
                    rightPos += utils.getCssNumber(rightCell[riIndex], "width");
                }
                if (cellIndex > 0) {
                    rightCell[cellIndex].style.borderLeft = 0;
                }
                rightCell[cellIndex].style.right = rightPos + "px";
            }

            return rowTag;
        },

        initialize: function (options) {
            var uTableOpt = UTableOption.getDefault();
            this.options = $.extend(uTableOpt, options);
            this.model = this.model || {};
            this.model.checked = false;
        },
        /**
         * 获取高度最大值
         * @returns {number}
         */
        initHeight: function () {
            var max = Math.max.apply(null, $.map(this.$el.find('td'), function (item) {
                return $(item).height();
            }));
            if (max <= 0) {
                this.$el.find('td').css({
                    "white-space": "nowrap",
                    "text-overflow": "ellipsis",
                    "overflow": "hidden",
                    "vertical-align":"top"
                });
            } else {
                this.$el.find('td:not(.fixedLeftColumn):not(.fixedRightColumn)').height(max).css({
                    "vertical-align":"top"
                }).height(max);
                this.$el.find('td.fixedLeftColumn').height(max+1);
                this.$el.find('td.fixedRightColumn').height(max+1);
            }
        },
        render: function () {
            var that = this;
            if (this.model) {
                this.$el = $(this.template(this.model));
            }
            return this;
        },

        getCell: function (cellIndex) {
            return this.$el.find('td:eq(' + cellIndex + ')');
        }
    };

    return UTableFootRow;
});