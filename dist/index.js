(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define("vxe-table-plugin-excel", ["exports", "xe-utils"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("xe-utils"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.XEUtils);
    global.VXETablePluginExcel = mod.exports.default;
  }
})(this, function (_exports, _xeUtils) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports["default"] = _exports.VXETablePluginExcel = void 0;
  _xeUtils = _interopRequireDefault(_xeUtils);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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
  var Excel = {
    name: 'VxeExcel',
    props: {
      columns: Array
    },
    data: function data() {
      return {
        excelStore: {
          uploadRows: []
        },
        mergeStore: {
          colList: [],
          rowList: []
        }
      };
    },
    computed: {
      tableProps: function tableProps() {
        var $props = this.$props,
            editConfig = this.editConfig;
        return _xeUtils["default"].assign({}, $props, {
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
      var $slots = this.$slots,
          $listeners = this.$listeners,
          tableProps = this.tableProps;
      return h('vxe-table', {
        "class": 'vxe-excel',
        props: tableProps,
        on: _xeUtils["default"].assign({}, $listeners, {
          'context-menu-click': this.contextMenuClickEvent
        }),
        ref: 'xTable'
      }, $slots["default"]);
    },
    methods: {
      contextMenuClickEvent: function contextMenuClickEvent(_ref, evnt) {
        var menu = _ref.menu,
            row = _ref.row,
            column = _ref.column;
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
                option.data = _xeUtils["default"].get(row, property);
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
            var _$table$getMouseCheck = $table.getMouseCheckeds(),
                columns = _$table$getMouseCheck.columns,
                rows = _$table$getMouseCheck.rows;

            var _this$mergeStore = this.mergeStore,
                colList = _this$mergeStore.colList,
                rowList = _this$mergeStore.rowList;

            if (rows.length && columns.length) {
              rows.forEach(function (row) {
                return rowList.indexOf(row) === -1 ? rowList.push(row) : 0;
              });
              columns.forEach(function (column) {
                return colList.indexOf(column) === -1 ? colList.push(column) : 0;
              });
            }

            break;
        }
      },
      cellSpanMethod: function cellSpanMethod(params) {
        var row = params.row,
            $rowIndex = params.$rowIndex,
            column = params.column,
            data = params.data;
        var _this$mergeStore2 = this.mergeStore,
            colList = _this$mergeStore2.colList,
            rowList = _this$mergeStore2.rowList;

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
      }
    }
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
      rangeData.text = rangeData.start !== rangeData.end ? textarea.value.substring(rangeData.start, rangeData.end) : '';
    } else if (document.selection) {
      var index = 0;
      var range = document.selection.createRange();
      var textRange = document.body.createTextRange();
      textRange.moveToElementText(textarea);
      rangeData.text = range.text;
      rangeData.bookmark = range.getBookmark();

      for (; textRange.compareEndPoints('StartToStart', range) < 0 && range.moveStart('character', -1) !== 0; index++) {
        if (textarea.value.charAt(index) === '\n') {
          index++;
        }
      }

      rangeData.start = index;
      rangeData.end = rangeData.text.length + rangeData.start;
    }

    return rangeData;
  }

  function setCursorPosition(textarea, rangeData) {
    if (textarea.setSelectionRange) {
      textarea.focus();
      textarea.setSelectionRange(rangeData.start, rangeData.end);
    } else if (textarea.createTextRange) {
      var textRange = textarea.createTextRange();

      if (textarea.value.length === rangeData.start) {
        textRange.collapse(false);
        textRange.select();
      } else {
        textRange.moveToBookmark(rangeData.bookmark);
        textRange.select();
      }
    }
  }
  /**
   * 渲染函数
   */


  var renderMap = {
    cell: {
      autofocus: '.vxe-textarea',
      renderEdit: function renderEdit(h, editRender, params, _ref2) {
        var $excel = _ref2.$excel;
        var excelStore = $excel.excelStore;
        var uploadRows = excelStore.uploadRows;
        var row = params.row,
            column = params.column;
        var model = column.model;
        return [h('div', {
          "class": 'vxe-input--wrapper vxe-excel-cell',
          style: {
            height: "".concat(column.renderHeight - 1, "px")
          }
        }, [h('textarea', {
          "class": 'vxe-textarea',
          style: {
            width: "".concat(column.renderWidth, "px")
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
                  inpElem.style.width = "".concat(inpElem.offsetWidth + 20, "px");
                } else {
                  inpElem.style.height = "".concat(inpElem.scrollHeight, "px");
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
                var rangeData = getCursorPosition(inpElem);
                var pos = rangeData.end;
                var cellValue = inpElem.value;
                cellValue = "".concat(cellValue.slice(0, pos), "\n").concat(cellValue.slice(pos, cellValue.length));
                inpElem.value = cellValue;
                model.update = true;
                model.value = cellValue;
                inpElem.style.height = "".concat((Math.floor(inpElem.offsetHeight / rowHeight) + 1) * rowHeight, "px");
                setTimeout(function () {
                  rangeData.start = rangeData.end = ++pos;
                  setCursorPosition(inpElem, rangeData);
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
            innerHTML: _xeUtils["default"].escape(_xeUtils["default"].get(row, column.property)).replace(/\n/g, '<br>')
          }
        })];
      }
    }
  };
  var VXETablePluginExcel = {
    install: function install(VXETable) {
      var Vue = VXETable.Vue,
          Table = VXETable.Table,
          renderer = VXETable.renderer,
          v = VXETable.v;

      if (v === 'v1') {
        throw new Error('[vxe-table-plugin-excel] >= V2 version is required.');
      } // 继承 Table


      _xeUtils["default"].assign(Excel.props, Table.props);

      _xeUtils["default"].each(Table.methods, function (cb, name) {
        Excel.methods[name] = function () {
          return this.$refs.xTable[name].apply(this.$refs.xTable[name], arguments);
        };
      }); // 添加到渲染器


      renderer.mixin(renderMap); // 注册组件

      Vue.component(Excel.name, Excel);
    }
  };
  _exports.VXETablePluginExcel = VXETablePluginExcel;

  if (typeof window !== 'undefined' && window.VXETable) {
    window.VXETable.use(VXETablePluginExcel);
  }

  var _default = VXETablePluginExcel;
  _exports["default"] = _default;
});