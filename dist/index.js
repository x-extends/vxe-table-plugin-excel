(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define("vxe-table-plugin-excel", [], factory);
  } else if (typeof exports !== "undefined") {
    factory();
  } else {
    var mod = {
      exports: {}
    };
    factory();
    global.VXETablePluginExcel = mod.exports.default;
  }
})(this, function () {
  "use strict";

  var _a;

  exports.__esModule = true;

  var xe_utils_1 = require("xe-utils");

  var excelEditConfig = {
    trigger: 'dblclick',
    mode: 'cell',
    showIcon: false,
    showStatus: false
  };
  var excelContextMenu = {
    header: {
      options: [[{
        code: 'exportAll',
        name: '隐藏列'
      }, {
        code: 'exportAll',
        name: '取消所有隐藏'
      }]]
    },
    body: {
      options: [[{
        code: 'clip',
        name: '剪贴(Ctrl+X)'
      }, {
        code: 'copy',
        name: '复制(Ctrl+C)'
      }, {
        code: 'paste',
        name: '粘贴(Ctrl+V)'
      }], [{
        code: 'insert',
        name: '插入'
      }, {
        code: 'remove',
        name: '删除'
      }, {
        code: 'clearData',
        name: '清除内容(Del)'
      }], // [
      //   {
      //     code: 'merge',
      //     name: '合并单元格'
      //   }
      // ],
      [{
        code: 'filter',
        name: '筛选',
        children: [{
          code: 'clearFilter',
          name: '清除筛选'
        }, {
          code: 'filterSelect',
          name: '按所选单元格的值筛选'
        }]
      }, {
        code: 'sort',
        name: '排序',
        children: [{
          code: 'clearSort',
          name: '清除排序'
        }, {
          code: 'sortAsc',
          name: '升序'
        }, {
          code: 'sortDesc',
          name: '倒序'
        }]
      }], [{
        code: 'exportAll',
        name: '导出数据.csv'
      }]]
    }
  };
  var EXCEL_METHODS_NAME;

  (function (EXCEL_METHODS_NAME) {
    EXCEL_METHODS_NAME["CONTEXT_MENU_CLICK_EVENT"] = "contextMenuClickEvent";
    EXCEL_METHODS_NAME["CELL_SPAN_METHOD"] = "cellSpanMethod";
  })(EXCEL_METHODS_NAME = exports.EXCEL_METHODS_NAME || (exports.EXCEL_METHODS_NAME = {}));

  exports.Excel = {
    name: 'VxeExcel',
    props: {
      columns: Array
    },
    data: function data() {
      var data = {
        excelStore: {
          uploadRows: []
        },
        mergeStore: {
          colList: [],
          rowList: []
        }
      };
      return data;
    },
    computed: {
      tableProps: function tableProps() {
        var _a = this,
            $props = _a.$props,
            editConfig = _a.editConfig;

        return xe_utils_1["default"].assign({}, $props, {
          border: true,
          resizable: true,
          showOverflow: null,
          // spanMethod: this.cellSpanMethod,
          contextMenu: excelContextMenu,
          mouseConfig: {
            selected: true,
            checked: true
          },
          keyboardConfig: {
            isArrow: true,
            isDel: true,
            isTab: true,
            isCut: true,
            isEdit: true
          },
          editConfig: Object.assign({}, excelEditConfig, editConfig),
          optimization: {
            scrollX: {
              gt: 100,
              oSize: 6,
              rSize: 20
            },
            scrollY: {
              gt: 100,
              oSize: 30,
              rSize: 80
            }
          }
        });
      }
    },
    watch: {
      columns: function columns(value) {
        this.loadColumn(value);
      }
    },
    mounted: function mounted() {
      var columns = this.columns;

      if (columns && columns.length) {
        this.loadColumn(this.columns);
      }
    },
    render: function render(h) {
      var _a = this,
          $slots = _a.$slots,
          $listeners = _a.$listeners,
          tableProps = _a.tableProps;

      return h('vxe-table', {
        "class": 'vxe-excel',
        props: tableProps,
        on: xe_utils_1["default"].assign({}, $listeners, {
          'context-menu-click': this.contextMenuClickEvent
        }),
        ref: 'xTable'
      }, $slots["default"]);
    },
    methods: (_a = {}, _a[EXCEL_METHODS_NAME.CONTEXT_MENU_CLICK_EVENT] = function (_a, evnt) {
      var menu = _a.menu,
          row = _a.row,
          column = _a.column;
      var $table = this.$refs.xTable;
      var property = column.property;

      switch (menu.code) {
        case 'clip':
          $table.handleCopyed(true, evnt);
          break;

        case 'copy':
          $table.handleCopyed(false, evnt);
          break;

        case 'paste':
          $table.handlePaste(evnt);
          break;

        case 'insert':
          $table.insertAt({}, row);
          break;

        case 'remove':
          $table.remove(row);
          break;

        case 'clearData':
          $table.clearData(row, property);
          break;

        case 'clearFilter':
          $table.clearFilter(column);
          break;

        case 'filterSelect':
          $table.filter(property).then(function (options) {
            if (options.length) {
              var option = options[0];
              option.data = xe_utils_1["default"].get(row, property);
              option.checked = true;
            }
          }).then(function () {
            return $table.updateData();
          });
          break;

        case 'clearSort':
          $table.clearSort();
          break;

        case 'sortAsc':
          $table.sort(property, 'asc');
          break;

        case 'sortDesc':
          $table.sort(property, 'desc');
          break;

        case 'exportAll':
          $table.exportCsv({
            isHeader: false
          });
          break;

        case 'merge':
          var _b = $table.getMouseCheckeds(),
              columns = _b.columns,
              rows = _b.rows;

          var _c = this.mergeStore,
              colList_1 = _c.colList,
              rowList_1 = _c.rowList;

          if (rows.length && columns.length) {
            rows.forEach(function (row) {
              return rowList_1.indexOf(row) === -1 ? rowList_1.push(row) : 0;
            });
            columns.forEach(function (column) {
              return colList_1.indexOf(column) === -1 ? colList_1.push(column) : 0;
            });
          }

          break;
      }
    }, _a[EXCEL_METHODS_NAME.CELL_SPAN_METHOD] = function (params) {
      var row = params.row,
          $rowIndex = params.$rowIndex,
          column = params.column,
          data = params.data;
      var _a = this.mergeStore,
          colList = _a.colList,
          rowList = _a.rowList;

      if (colList.indexOf(column) > -1) {
        var prevRow = data[$rowIndex - 1];
        var nextRow = data[$rowIndex + 1];
        var isMerged = rowList.indexOf(row) > -1;

        if (prevRow && isMerged && rowList.indexOf(prevRow) > -1) {
          return {
            rowspan: 0,
            colspan: 0
          };
        } else {
          var countRowspan = 1;

          if (isMerged) {
            while (nextRow && rowList.indexOf(nextRow) > -1) {
              nextRow = data[++countRowspan + $rowIndex];
            }
          }

          if (countRowspan > 1) {
            return {
              rowspan: countRowspan,
              colspan: 1
            };
          }
        }
      }
    }, _a)
  };
  var rowHeight = 24;

  function getCursorPosition(textarea) {
    var rangeData = {
      text: '',
      start: 0,
      end: 0
    };

    if (textarea.setSelectionRange) {
      rangeData.start = textarea.selectionStart;
      rangeData.end = textarea.selectionEnd;
    }

    return rangeData;
  }

  function setCursorPosition(textarea, rangeData) {
    if (textarea.setSelectionRange) {
      textarea.focus();
      textarea.setSelectionRange(rangeData.start, rangeData.end);
    }
  }
  /**
   * 渲染函数
   */


  var renderMap = {
    cell: {
      autofocus: '.vxe-textarea',
      renderEdit: function renderEdit(h, editRender, params, _a) {
        var $excel = _a.$excel;
        var excelStore = $excel.excelStore;
        var uploadRows = excelStore.uploadRows;
        var row = params.row,
            column = params.column;
        var model = column.model;
        return [h('div', {
          "class": 'vxe-input--wrapper vxe-excel-cell',
          style: {
            height: column.renderHeight - 1 + "px"
          }
        }, [h('textarea', {
          "class": 'vxe-textarea',
          style: {
            width: column.renderWidth + "px"
          },
          domProps: {
            value: model.value
          },
          on: {
            input: function input(evnt) {
              var inpElem = evnt.target;
              model.update = true;
              model.value = inpElem.value;

              if (inpElem.scrollHeight > inpElem.offsetHeight) {
                if (uploadRows.indexOf(row) === -1) {
                  inpElem.style.width = inpElem.offsetWidth + 20 + "px";
                } else {
                  inpElem.style.height = inpElem.scrollHeight + "px";
                }
              }
            },
            change: function change(evnt) {
              if (uploadRows.indexOf(row) === -1) {
                uploadRows.push(row);
              }
            },
            keydown: function keydown(evnt) {
              var inpElem = evnt.target;

              if (evnt.altKey && evnt.keyCode === 13) {
                evnt.preventDefault();
                evnt.stopPropagation();
                var rangeData_1 = getCursorPosition(inpElem);
                var pos_1 = rangeData_1.end;
                var cellValue = inpElem.value;
                cellValue = cellValue.slice(0, pos_1) + "\n" + cellValue.slice(pos_1, cellValue.length);
                inpElem.value = cellValue;
                model.update = true;
                model.value = cellValue;
                inpElem.style.height = (Math.floor(inpElem.offsetHeight / rowHeight) + 1) * rowHeight + "px";
                setTimeout(function () {
                  rangeData_1.start = rangeData_1.end = ++pos_1;
                  setCursorPosition(inpElem, rangeData_1);
                });
              }
            }
          }
        })])];
      },
      renderCell: function renderCell(h, editRender, params) {
        var row = params.row,
            column = params.column;
        return [h('span', {
          domProps: {
            innerHTML: xe_utils_1["default"].escape(xe_utils_1["default"].get(row, column.property)).replace(/\n/g, '<br>')
          }
        })];
      }
    }
  };
  /**
   * 基于 vxe-table 表格的增强插件，实现简单的 Excel 表格
   */

  exports.VXETablePluginExcel = {
    install: function install(xtable) {
      var Vue = xtable.Vue,
          Table = xtable.Table,
          renderer = xtable.renderer,
          v = xtable.v;

      if (v === 'v1') {
        throw new Error('[vxe-table-plugin-excel] >= V2 version is required.');
      } // 继承 Table


      xe_utils_1["default"].assign(exports.Excel.props, Table.props);
      xe_utils_1["default"].each(Table.methods, function (cb, name) {
        exports.Excel.methods[name] = function () {
          return this.$refs.xTable[name].apply(this.$refs.xTable, arguments);
        };
      }); // 添加到渲染器

      renderer.mixin(renderMap); // 注册组件

      Vue.component(exports.Excel.name, exports.Excel);
    }
  };

  if (typeof window !== 'undefined' && window.VXETable) {
    window.VXETable.use(exports.VXETablePluginExcel);
  }

  exports["default"] = exports.VXETablePluginExcel;
});