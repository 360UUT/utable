/**
 * Created by Administrator on 2017/3/6.
 */
define('components/utable/UTableHeadRow', ["utils"], function (utils) {

    /**
     *
     * @param options
     * @constructor
     */
    function UTableHeadRow(options) {
        this.el = null;
        this.initialize(options);
    }

    UTableHeadRow.prototype = {
        constructor: UTableHeadRow,
        /**
         * 配置函数
         * @param options
         * @param options.onChangeCheckBox
         * @param options.TableColumns
         * @param options.onCheckSortColumn
         * @param options.IndexColWidth 默认50
         * @param options.ShowCheckBox
         * @param options.FixedColumn
         * @param options.CheckWidth
         * @param options.ShowRadioBox
         * @param options.ShowRowIndex
         * @param options.TableClass
         */
        initialize: function (options) {
            var that = this;
            this.options = $.extend({
                onChangeCheckBox: function () {
                },
                onCheckSortColumn: function (tag) {
                },
                TableColumns: [],
                IndexColWidth: 50
            }, options);

            that.leftFixedColumn = [];
            that.rightFixedColumn = [];

            /*
             * 头部结构
             * <div style="padding-left:108px; width:auto;  overflow:hidden; background:#f00;" id="tableDiv_title">
             <table border="0" cellspacing="0" cellpadding="0">
             <tr>
             <td></td>
             </tr>
             </table>
             </div>
             * */
            var fixedWrapper=document.createElement("div");
            this.fixedWrapper=fixedWrapper;
            // 创建表头外层以偏移头部距离
            var tbHeadWrapper = document.createElement("div");
            tbHeadWrapper.style.width = "auto";
            tbHeadWrapper.style.overflow = "hidden";
            tbHeadWrapper.dataset.id = "tableDiv_title";
            tbHeadWrapper.className = "tb-head-wrapper";
            fixedWrapper.appendChild(tbHeadWrapper);

            var headTable = document.createElement("table");
            headTable.border = 0;
            headTable.className = options.TableClass;

            if (!options.FixedColumn) {
                headTable.className += " fixTable";
            }
            var leftWidth = 0;
            var rightWidth = 0;// 用于定位右侧距离

            var row = document.createElement("tr");
            if (options.ShowCheckBox) {
                var checkBoxCell = document.createElement("th");
                checkBoxCell.className = "checkboxField";
                checkBoxCell.style.maxWidth = checkBoxCell.style.minWidth = checkBoxCell.style.width = options.CheckWidth + "px";
                checkBoxCell.style.borderLeft = 0;
                checkBoxCell.style.textAlign = "center";
                checkBoxCell.style.borderBottom = 0;

                if (options.FixedColumn) {
                    checkBoxCell.className = "fixedLeftColumn";
                    checkBoxCell.style.left = (leftWidth - 1) + "px";
                    leftWidth += options.CheckWidth - 1;
                }
                var checkBox = document.createElement("input");
                checkBox.setAttribute("type", "checkbox");
                checkBox.setAttribute("name", "checkAll");
                checkBox.className = "checkAll";
                checkBoxCell.appendChild(checkBox);

                $(checkBox).on("change", function (evt) {
                    that.options.onChangeCheckBox($(this).is(":checked"));
                });
                row.appendChild(checkBoxCell);
            }
            if (options.ShowRadioBox) {
                var radioBoxCell = document.createElement("th");
                radioBoxCell.className = "radioField";
                radioBoxCell.style.maxWidth = radioBoxCell.style.minWidth = radioBoxCell.style.width = options.CheckWidth + "px";
                radioBoxCell.style.borderLeft = 0;
                radioBoxCell.style.borderBottom = 0;
                if (options.FixedColumn) {
                    radioBoxCell.className = "fixedLeftColumn";
                    radioBoxCell.style.left = (leftWidth - 1) + "px";
                    leftWidth += options.CheckWidth - 1;
                }
                radioBoxCell.innerHTML = "&nbsp;";
                row.appendChild(radioBoxCell);
            }
            if (options.ShowRowIndex) {
                var indexCol = document.createElement("th");
                indexCol.className = "rowIndex";
                indexCol.style.borderBottom = 0;
                if (options.FixedColumn) {
                    indexCol.className += " fixedLeftColumn";
                    indexCol.style.left = (leftWidth - 1) + "px";
                    leftWidth += options.IndexColWidth - 1;
                    indexCol.style.maxWidth = indexCol.style.minWidth = indexCol.style.width = options.IndexColWidth + "px";
                } else {
                    indexCol.style.width = options.IndexColWidth + "px";
                }
                indexCol.textContent = "序号";
                row.appendChild(indexCol);
            }

            var dir = "left";
            var rightCell = [];
            var rightCellRight = [];

            $.each(options.TableColumns, function (index, tableColumn) {
                var cell = document.createElement("th");
                cell.style.borderBottom = 0;
                cell.innerHTML = tableColumn.head;
                if (tableColumn.title) cell.setAttribute('data-title', tableColumn.title);
                if (tableColumn.addClass) cell.className = tableColumn.addClass;
                if (tableColumn.sort == "1") {
                    cell.innerHTML = utils.formatString("<a href='javascript:void(0);' class='sort-link' tag='{1}' sortTag='{2}'>{0}↑</a>",
                        tableColumn.head, tableColumn.tag, tableColumn.sortTag);
                }

                cell.style.textAlign = tableColumn.headAlign;
                cell.title = tableColumn.head;
                cell.style.whiteSpace = "nowrap";
                cell.style.textOverflow = "ellipsis";
                cell.style.overflow = "hidden";

                // 判断是否需要添加复选框列
                if (options.FixedColumn) {
                    if (tableColumn.fixColumn) {
                        if (dir == "left") {
                            that.leftFixedColumn.push(tableColumn);
                            cell.className = "fixedLeftColumn";
                            cell.style.left = (leftWidth - 1) + "px";
                            leftWidth += tableColumn.width - 1;
                        } else {
                            that.rightFixedColumn.push(tableColumn);
                            cell.className = "fixedRightColumn";
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
                row.appendChild(cell);
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

            tbHeadWrapper.style.paddingLeft = (leftWidth - 1) + "px";
            tbHeadWrapper.style.marginRight = (rightWidth - 1) + "px";
            var thead = document.createElement("thead");
            thead.appendChild(row);

            headTable.appendChild(thead);
            tbHeadWrapper.appendChild(headTable);

            this.el = tbHeadWrapper;
            this.$el = $(tbHeadWrapper);
            this.$el.on('click', '.sort-link', function (evt) {
                var text = $(this).text();
                $(this).text(text.substring(0, text.length - 1) + (text.indexOf('↑') != -1 ? '↓' : '↑'));
                that.options.onCheckSortColumn({
                    tag: evt.currentTarget.getAttribute("sortTag") || evt.currentTarget.getAttribute("tag"),
                    sortway: text.indexOf('↑') == -1 ? 'asc' : 'desc'
                });
            });
        },

        render: function () {
            this.$el = $(this.el);
            return this;
        },

        /**
         * 获取未固定的列的宽度
         * @returns {number}
         */
        getUnFixedWidth: function () {
            var totl=0;
             this.$el.find("th:not(.fixedLeftColumn):not(.fixedRightColumn)").each(function (index, ele) {
                  totl += utils.getCssNumber(ele,"width");
             });
            return totl;
        },

        fixedTop:function(){
            if(!$(this.fixedWrapper).hasClass("fixed"))
                $(this.fixedWrapper).addClass("fixed");
        },

        unFixedTop:function(){
            if($(this.fixedWrapper).hasClass("fixed"))
                $(this.fixedWrapper).removeClass("fixed");
        },
        /**
         * 获取总宽度
         * @returns {number}
         */
        getAllColWidth: function () {
          return this.getUnFixedWidth() + Number(this.el.style.paddingLeft.replace("px", "")) + Number(this.el.style.marginRight.replace("px", ""))-1;
        },

        setCheck: function (check) {
            this.$el.find(".checkAll").prop("checked", check);
        },

        /**
         * 获取范围值
         * @returns {ClientRect}
         */
        getBoundingClientRect:function(){
            return this.el.getBoundingClientRect();
        }
    };

    return UTableHeadRow;
});