"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.VXETablePluginExcel = void 0;

var _ctor = _interopRequireDefault(require("xe-utils/ctor"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/* eslint-enable no-unused-vars */
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
    }], [{
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

function registerComponent(params) {
  var _Vue = params.Vue;
  var Table = params.Table;
  var Excel = {
    name: 'VxeExcel',
    props: {
      columns: Array
    },
    data: function data() {
      return {
        excelStore: {
          uploadRows: []
        }
      };
    },
    computed: {
      tableProps: function tableProps() {
        var $props = this.$props,
            editConfig = this.editConfig,
            sortConfig = this.sortConfig,
            filterConfig = this.filterConfig;
        return _ctor["default"].assign({}, $props, {
          border: true,
          resizable: true,
          showOverflow: null,
          contextMenu: excelContextMenu,
          mouseConfig: {
            selected: true,
            checked: true
          },
          keyboardConfig: {
            isArrow: true,
            isDel: true,
            isEnter: true,
            isTab: true,
            isCut: true,
            isEdit: true
          },
          editConfig: Object.assign({}, excelEditConfig, editConfig),
          sortConfig: Object.assign({
            showIcon: false
          }, sortConfig),
          filterConfig: Object.assign({
            showIcon: false
          }, filterConfig),
          optimization: {
            scrollX: {
              gt: 100
            },
            scrollY: {
              gt: 200
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
        on: _ctor["default"].assign({}, $listeners, {
          'context-menu-click': this.contextMenuClickEvent
        }),
        ref: 'xTable'
      }, $slots["default"]);
    },
    methods: {
      contextMenuClickEvent: function contextMenuClickEvent(params, evnt) {
        var menu = params.menu,
            row = params.row,
            column = params.column;
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
            $table.setFilter(column, [{
              data: _ctor["default"].get(row, property),
              checked: true
            }]);
            $table.updateData();
            $table.clearIndexChecked();
            $table.clearHeaderChecked();
            $table.clearChecked();
            $table.clearSelected();
            $table.clearCopyed();
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
            $table.exportData({
              isHeader: false
            });
            break;
        }
      }
    }
  }; // 继承 Table

  _ctor["default"].assign(Excel.props, Table.props);

  _ctor["default"].each(Table.methods, function (cb, name) {
    Excel.methods[name] = function () {
      return this.$refs.xTable[name].apply(this.$refs.xTable, arguments);
    };
  });

  _Vue.component(Excel.name, Excel);
}

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
    autofocus: 'textarea',
    renderEdit: function renderEdit(h, editRender, params) {
      var $table = params.$table,
          row = params.row;
      var $excel = $table.$parent;
      var excelStore = $excel.excelStore;
      var uploadRows = excelStore.uploadRows;
      var column = params.column;
      var model = column.model;
      return [h('div', {
        "class": 'vxe-textarea vxe-excel-cell',
        style: {
          height: "".concat(column.renderHeight, "px")
        }
      }, [h('textarea', {
        "class": 'vxe-textarea--inner',
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
          change: function change() {
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
          innerHTML: _ctor["default"].escape(_ctor["default"].get(row, column.property)).replace(/\n/g, '<br>')
        }
      })];
    }
  }
};
/**
 * 基于 vxe-table 表格的增强插件，实现简单的 EXCEL 表格
 */

var VXETablePluginExcel = {
  install: function install(xtable) {
    var renderer = xtable.renderer,
        v = xtable.v;

    if (v !== 'v2') {
      throw new Error('[vxe-table-plugin-excel] V2 version is required.');
    } // 添加到渲染器


    renderer.mixin(renderMap); // 注册组件

    registerComponent(xtable);
  }
};
exports.VXETablePluginExcel = VXETablePluginExcel;

if (typeof window !== 'undefined' && window.VXETable) {
  window.VXETable.use(VXETablePluginExcel);
}

var _default = VXETablePluginExcel;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LnRzIl0sIm5hbWVzIjpbImV4Y2VsRWRpdENvbmZpZyIsInRyaWdnZXIiLCJtb2RlIiwic2hvd0ljb24iLCJzaG93U3RhdHVzIiwiZXhjZWxDb250ZXh0TWVudSIsImhlYWRlciIsIm9wdGlvbnMiLCJjb2RlIiwibmFtZSIsImJvZHkiLCJjaGlsZHJlbiIsInJlZ2lzdGVyQ29tcG9uZW50IiwicGFyYW1zIiwiX1Z1ZSIsIlZ1ZSIsIlRhYmxlIiwiRXhjZWwiLCJwcm9wcyIsImNvbHVtbnMiLCJBcnJheSIsImRhdGEiLCJleGNlbFN0b3JlIiwidXBsb2FkUm93cyIsImNvbXB1dGVkIiwidGFibGVQcm9wcyIsIiRwcm9wcyIsImVkaXRDb25maWciLCJzb3J0Q29uZmlnIiwiZmlsdGVyQ29uZmlnIiwiWEVVdGlscyIsImFzc2lnbiIsImJvcmRlciIsInJlc2l6YWJsZSIsInNob3dPdmVyZmxvdyIsImNvbnRleHRNZW51IiwibW91c2VDb25maWciLCJzZWxlY3RlZCIsImNoZWNrZWQiLCJrZXlib2FyZENvbmZpZyIsImlzQXJyb3ciLCJpc0RlbCIsImlzRW50ZXIiLCJpc1RhYiIsImlzQ3V0IiwiaXNFZGl0IiwiT2JqZWN0Iiwib3B0aW1pemF0aW9uIiwic2Nyb2xsWCIsImd0Iiwic2Nyb2xsWSIsIndhdGNoIiwidmFsdWUiLCJsb2FkQ29sdW1uIiwibW91bnRlZCIsImxlbmd0aCIsInJlbmRlciIsImgiLCIkc2xvdHMiLCIkbGlzdGVuZXJzIiwib24iLCJjb250ZXh0TWVudUNsaWNrRXZlbnQiLCJyZWYiLCJtZXRob2RzIiwiZXZudCIsIm1lbnUiLCJyb3ciLCJjb2x1bW4iLCIkdGFibGUiLCIkcmVmcyIsInhUYWJsZSIsInByb3BlcnR5IiwiaGFuZGxlQ29weWVkIiwiaGFuZGxlUGFzdGUiLCJpbnNlcnRBdCIsInJlbW92ZSIsImNsZWFyRGF0YSIsImNsZWFyRmlsdGVyIiwic2V0RmlsdGVyIiwiZ2V0IiwidXBkYXRlRGF0YSIsImNsZWFySW5kZXhDaGVja2VkIiwiY2xlYXJIZWFkZXJDaGVja2VkIiwiY2xlYXJDaGVja2VkIiwiY2xlYXJTZWxlY3RlZCIsImNsZWFyQ29weWVkIiwiY2xlYXJTb3J0Iiwic29ydCIsImV4cG9ydERhdGEiLCJpc0hlYWRlciIsImVhY2giLCJjYiIsImFwcGx5IiwiYXJndW1lbnRzIiwiY29tcG9uZW50Iiwicm93SGVpZ2h0IiwiZ2V0Q3Vyc29yUG9zaXRpb24iLCJ0ZXh0YXJlYSIsInJhbmdlRGF0YSIsInRleHQiLCJzdGFydCIsImVuZCIsInNldFNlbGVjdGlvblJhbmdlIiwic2VsZWN0aW9uU3RhcnQiLCJzZWxlY3Rpb25FbmQiLCJzZXRDdXJzb3JQb3NpdGlvbiIsImZvY3VzIiwicmVuZGVyTWFwIiwiY2VsbCIsImF1dG9mb2N1cyIsInJlbmRlckVkaXQiLCJlZGl0UmVuZGVyIiwiJGV4Y2VsIiwiJHBhcmVudCIsIm1vZGVsIiwic3R5bGUiLCJoZWlnaHQiLCJyZW5kZXJIZWlnaHQiLCJ3aWR0aCIsInJlbmRlcldpZHRoIiwiZG9tUHJvcHMiLCJpbnB1dCIsImlucEVsZW0iLCJ0YXJnZXQiLCJ1cGRhdGUiLCJzY3JvbGxIZWlnaHQiLCJvZmZzZXRIZWlnaHQiLCJpbmRleE9mIiwib2Zmc2V0V2lkdGgiLCJjaGFuZ2UiLCJwdXNoIiwia2V5ZG93biIsImFsdEtleSIsImtleUNvZGUiLCJwcmV2ZW50RGVmYXVsdCIsInN0b3BQcm9wYWdhdGlvbiIsInBvcyIsImNlbGxWYWx1ZSIsInNsaWNlIiwiTWF0aCIsImZsb29yIiwic2V0VGltZW91dCIsInJlbmRlckNlbGwiLCJpbm5lckhUTUwiLCJlc2NhcGUiLCJyZXBsYWNlIiwiVlhFVGFibGVQbHVnaW5FeGNlbCIsImluc3RhbGwiLCJ4dGFibGUiLCJyZW5kZXJlciIsInYiLCJFcnJvciIsIm1peGluIiwid2luZG93IiwiVlhFVGFibGUiLCJ1c2UiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFFQTs7OztBQVVBO0FBRUEsSUFBTUEsZUFBZSxHQUFHO0FBQ3RCQyxFQUFBQSxP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QVYsQ0FBTjtBQUNELEtBSjZCLENBSzlCOzs7QUFDQUYsSUFBQUEsUUFBUSxDQUFDRyxLQUFULENBQWU3QyxTQUFmLEVBTjhCLENBTzlCOztBQUNBL0YsSUFBQUEsaUJBQWlCLENBQUN3SSxNQUFELENBQWpCO0FBQ0Q7QUFWZ0MsQ0FBNUI7OztBQWFQLElBQUksT0FBT0ssTUFBUCxLQUFrQixXQUFsQixJQUFpQ0EsTUFBTSxDQUFDQyxRQUE1QyxFQUFzRDtBQUNwREQsRUFBQUEsTUFBTSxDQUFDQyxRQUFQLENBQWdCQyxHQUFoQixDQUFvQlQsbUJBQXBCO0FBQ0Q7O2VBRWNBLG1CIiwiZmlsZSI6ImluZGV4LmNvbW1vbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludC1kaXNhYmxlIG5vLXVudXNlZC12YXJzICovXHJcbmltcG9ydCBWdWUsIHsgQ3JlYXRlRWxlbWVudCB9IGZyb20gJ3Z1ZSdcclxuaW1wb3J0IFhFVXRpbHMgZnJvbSAneGUtdXRpbHMvY3RvcidcclxuaW1wb3J0IHtcclxuICBWWEVUYWJsZSxcclxuICBDb2x1bW5Db25maWcsXHJcbiAgQ29sdW1uRWRpdFJlbmRlck9wdGlvbnMsXHJcbiAgQ29sdW1uRWRpdFJlbmRlclBhcmFtcyxcclxuICBDb2x1bW5DZWxsUmVuZGVyT3B0aW9ucyxcclxuICBDb2x1bW5DZWxsUmVuZGVyUGFyYW1zLFxyXG4gIE1lbnVMaW5rUGFyYW1zXHJcbn0gZnJvbSAndnhlLXRhYmxlL2xpYi92eGUtdGFibGUnXHJcbi8qIGVzbGludC1lbmFibGUgbm8tdW51c2VkLXZhcnMgKi9cclxuXHJcbmNvbnN0IGV4Y2VsRWRpdENvbmZpZyA9IHtcclxuICB0cmlnZ2VyOiAnZGJsY2xpY2snLFxyXG4gIG1vZGU6ICdjZWxsJyxcclxuICBzaG93SWNvbjogZmFsc2UsXHJcbiAgc2hvd1N0YXR1czogZmFsc2VcclxufVxyXG5cclxuY29uc3QgZXhjZWxDb250ZXh0TWVudSA9IHtcclxuICBoZWFkZXI6IHtcclxuICAgIG9wdGlvbnM6IFtcclxuICAgICAgW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgIGNvZGU6ICdleHBvcnRBbGwnLFxyXG4gICAgICAgICAgbmFtZTogJ+makOiXj+WIlydcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGNvZGU6ICdleHBvcnRBbGwnLFxyXG4gICAgICAgICAgbmFtZTogJ+WPlua2iOaJgOaciemakOiXjydcclxuICAgICAgICB9XHJcbiAgICAgIF1cclxuICAgIF1cclxuICB9LFxyXG4gIGJvZHk6IHtcclxuICAgIG9wdGlvbnM6IFtcclxuICAgICAgW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgIGNvZGU6ICdjbGlwJyxcclxuICAgICAgICAgIG5hbWU6ICfliarotLQoQ3RybCtYKSdcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGNvZGU6ICdjb3B5JyxcclxuICAgICAgICAgIG5hbWU6ICflpI3liLYoQ3RybCtDKSdcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGNvZGU6ICdwYXN0ZScsXHJcbiAgICAgICAgICBuYW1lOiAn57KY6LS0KEN0cmwrViknXHJcbiAgICAgICAgfVxyXG4gICAgICBdLFxyXG4gICAgICBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgY29kZTogJ2luc2VydCcsXHJcbiAgICAgICAgICBuYW1lOiAn5o+S5YWlJ1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgY29kZTogJ3JlbW92ZScsXHJcbiAgICAgICAgICBuYW1lOiAn5Yig6ZmkJ1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgY29kZTogJ2NsZWFyRGF0YScsXHJcbiAgICAgICAgICBuYW1lOiAn5riF6Zmk5YaF5a65KERlbCknXHJcbiAgICAgICAgfVxyXG4gICAgICBdLFxyXG4gICAgICBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgY29kZTogJ2ZpbHRlcicsXHJcbiAgICAgICAgICBuYW1lOiAn562b6YCJJyxcclxuICAgICAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICBjb2RlOiAnY2xlYXJGaWx0ZXInLFxyXG4gICAgICAgICAgICAgIG5hbWU6ICfmuIXpmaTnrZvpgIknXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICBjb2RlOiAnZmlsdGVyU2VsZWN0JyxcclxuICAgICAgICAgICAgICBuYW1lOiAn5oyJ5omA6YCJ5Y2V5YWD5qC855qE5YC8562b6YCJJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICBdXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBjb2RlOiAnc29ydCcsXHJcbiAgICAgICAgICBuYW1lOiAn5o6S5bqPJyxcclxuICAgICAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICBjb2RlOiAnY2xlYXJTb3J0JyxcclxuICAgICAgICAgICAgICBuYW1lOiAn5riF6Zmk5o6S5bqPJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgY29kZTogJ3NvcnRBc2MnLFxyXG4gICAgICAgICAgICAgIG5hbWU6ICfljYfluo8nXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICBjb2RlOiAnc29ydERlc2MnLFxyXG4gICAgICAgICAgICAgIG5hbWU6ICflgJLluo8nXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIF1cclxuICAgICAgICB9XHJcbiAgICAgIF0sXHJcbiAgICAgIFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBjb2RlOiAnZXhwb3J0QWxsJyxcclxuICAgICAgICAgIG5hbWU6ICflr7zlh7rmlbDmja4uY3N2J1xyXG4gICAgICAgIH1cclxuICAgICAgXVxyXG4gICAgXVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gcmVnaXN0ZXJDb21wb25lbnQgKHBhcmFtczogYW55KSB7XHJcbiAgY29uc3QgX1Z1ZTogdHlwZW9mIFZ1ZSA9IHBhcmFtcy5WdWVcclxuICBjb25zdCBUYWJsZTogYW55ID0gcGFyYW1zLlRhYmxlXHJcbiAgY29uc3QgRXhjZWw6IHsgW2tleTogc3RyaW5nXTogYW55IH0gPSB7XHJcbiAgICBuYW1lOiAnVnhlRXhjZWwnLFxyXG4gICAgcHJvcHM6IHtcclxuICAgICAgY29sdW1uczogQXJyYXlcclxuICAgIH0sXHJcbiAgICBkYXRhICgpIHtcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBleGNlbFN0b3JlOiB7XHJcbiAgICAgICAgICB1cGxvYWRSb3dzOiBbXVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIGNvbXB1dGVkOiB7XHJcbiAgICAgIHRhYmxlUHJvcHMgKHRoaXM6IGFueSkge1xyXG4gICAgICAgIGNvbnN0IHsgJHByb3BzLCBlZGl0Q29uZmlnLCBzb3J0Q29uZmlnLCBmaWx0ZXJDb25maWcgfSA9IHRoaXNcclxuICAgICAgICByZXR1cm4gWEVVdGlscy5hc3NpZ24oe30sICRwcm9wcywge1xyXG4gICAgICAgICAgYm9yZGVyOiB0cnVlLFxyXG4gICAgICAgICAgcmVzaXphYmxlOiB0cnVlLFxyXG4gICAgICAgICAgc2hvd092ZXJmbG93OiBudWxsLFxyXG4gICAgICAgICAgY29udGV4dE1lbnU6IGV4Y2VsQ29udGV4dE1lbnUsXHJcbiAgICAgICAgICBtb3VzZUNvbmZpZzogeyBzZWxlY3RlZDogdHJ1ZSwgY2hlY2tlZDogdHJ1ZSB9LFxyXG4gICAgICAgICAga2V5Ym9hcmRDb25maWc6IHsgaXNBcnJvdzogdHJ1ZSwgaXNEZWw6IHRydWUsIGlzRW50ZXI6IHRydWUsIGlzVGFiOiB0cnVlLCBpc0N1dDogdHJ1ZSwgaXNFZGl0OiB0cnVlIH0sXHJcbiAgICAgICAgICBlZGl0Q29uZmlnOiBPYmplY3QuYXNzaWduKHt9LCBleGNlbEVkaXRDb25maWcsIGVkaXRDb25maWcpLFxyXG4gICAgICAgICAgc29ydENvbmZpZzogT2JqZWN0LmFzc2lnbih7IHNob3dJY29uOiBmYWxzZSB9LCBzb3J0Q29uZmlnKSxcclxuICAgICAgICAgIGZpbHRlckNvbmZpZzogT2JqZWN0LmFzc2lnbih7IHNob3dJY29uOiBmYWxzZSB9LCBmaWx0ZXJDb25maWcpLFxyXG4gICAgICAgICAgb3B0aW1pemF0aW9uOiB7XHJcbiAgICAgICAgICAgIHNjcm9sbFg6IHtcclxuICAgICAgICAgICAgICBndDogMTAwXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHNjcm9sbFk6IHtcclxuICAgICAgICAgICAgICBndDogMjAwXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgd2F0Y2g6IHtcclxuICAgICAgY29sdW1ucyAodGhpczogYW55LCB2YWx1ZTogQ29sdW1uQ29uZmlnW10pIHtcclxuICAgICAgICB0aGlzLmxvYWRDb2x1bW4odmFsdWUpXHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICBtb3VudGVkICh0aGlzOiBhbnkpIHtcclxuICAgICAgY29uc3QgeyBjb2x1bW5zIH0gPSB0aGlzXHJcbiAgICAgIGlmIChjb2x1bW5zICYmIGNvbHVtbnMubGVuZ3RoKSB7XHJcbiAgICAgICAgdGhpcy5sb2FkQ29sdW1uKHRoaXMuY29sdW1ucylcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIHJlbmRlciAodGhpczogYW55LCBoOiBDcmVhdGVFbGVtZW50KSB7XHJcbiAgICAgIGNvbnN0IHsgJHNsb3RzLCAkbGlzdGVuZXJzLCB0YWJsZVByb3BzIH0gPSB0aGlzXHJcbiAgICAgIHJldHVybiBoKCd2eGUtdGFibGUnLCB7XHJcbiAgICAgICAgY2xhc3M6ICd2eGUtZXhjZWwnLFxyXG4gICAgICAgIHByb3BzOiB0YWJsZVByb3BzLFxyXG4gICAgICAgIG9uOiBYRVV0aWxzLmFzc2lnbih7fSwgJGxpc3RlbmVycywge1xyXG4gICAgICAgICAgJ2NvbnRleHQtbWVudS1jbGljayc6IHRoaXMuY29udGV4dE1lbnVDbGlja0V2ZW50XHJcbiAgICAgICAgfSksXHJcbiAgICAgICAgcmVmOiAneFRhYmxlJ1xyXG4gICAgICB9LCAkc2xvdHMuZGVmYXVsdClcclxuICAgIH0sXHJcbiAgICBtZXRob2RzOiB7XHJcbiAgICAgIGNvbnRleHRNZW51Q2xpY2tFdmVudCAodGhpczogYW55LCBwYXJhbXM6IE1lbnVMaW5rUGFyYW1zLCBldm50OiBhbnkpIHtcclxuICAgICAgICBjb25zdCB7IG1lbnUsIHJvdywgY29sdW1uIH0gPSBwYXJhbXNcclxuICAgICAgICBjb25zdCAkdGFibGUgPSB0aGlzLiRyZWZzLnhUYWJsZVxyXG4gICAgICAgIGNvbnN0IHsgcHJvcGVydHkgfSA9IGNvbHVtblxyXG4gICAgICAgIHN3aXRjaCAobWVudS5jb2RlKSB7XHJcbiAgICAgICAgICBjYXNlICdjbGlwJzpcclxuICAgICAgICAgICAgJHRhYmxlLmhhbmRsZUNvcHllZCh0cnVlLCBldm50KVxyXG4gICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgY2FzZSAnY29weSc6XHJcbiAgICAgICAgICAgICR0YWJsZS5oYW5kbGVDb3B5ZWQoZmFsc2UsIGV2bnQpXHJcbiAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICBjYXNlICdwYXN0ZSc6XHJcbiAgICAgICAgICAgICR0YWJsZS5oYW5kbGVQYXN0ZShldm50KVxyXG4gICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgY2FzZSAnaW5zZXJ0JzpcclxuICAgICAgICAgICAgJHRhYmxlLmluc2VydEF0KHt9LCByb3cpXHJcbiAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICBjYXNlICdyZW1vdmUnOlxyXG4gICAgICAgICAgICAkdGFibGUucmVtb3ZlKHJvdylcclxuICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgIGNhc2UgJ2NsZWFyRGF0YSc6XHJcbiAgICAgICAgICAgICR0YWJsZS5jbGVhckRhdGEocm93LCBwcm9wZXJ0eSlcclxuICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgIGNhc2UgJ2NsZWFyRmlsdGVyJzpcclxuICAgICAgICAgICAgJHRhYmxlLmNsZWFyRmlsdGVyKGNvbHVtbilcclxuICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgIGNhc2UgJ2ZpbHRlclNlbGVjdCc6XHJcbiAgICAgICAgICAgICR0YWJsZS5zZXRGaWx0ZXIoY29sdW1uLCBbXHJcbiAgICAgICAgICAgICAgeyBkYXRhOiBYRVV0aWxzLmdldChyb3csIHByb3BlcnR5KSwgY2hlY2tlZDogdHJ1ZSB9XHJcbiAgICAgICAgICAgIF0pXHJcbiAgICAgICAgICAgICR0YWJsZS51cGRhdGVEYXRhKClcclxuICAgICAgICAgICAgJHRhYmxlLmNsZWFySW5kZXhDaGVja2VkKClcclxuICAgICAgICAgICAgJHRhYmxlLmNsZWFySGVhZGVyQ2hlY2tlZCgpXHJcbiAgICAgICAgICAgICR0YWJsZS5jbGVhckNoZWNrZWQoKVxyXG4gICAgICAgICAgICAkdGFibGUuY2xlYXJTZWxlY3RlZCgpXHJcbiAgICAgICAgICAgICR0YWJsZS5jbGVhckNvcHllZCgpXHJcbiAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICBjYXNlICdjbGVhclNvcnQnOlxyXG4gICAgICAgICAgICAkdGFibGUuY2xlYXJTb3J0KClcclxuICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgIGNhc2UgJ3NvcnRBc2MnOlxyXG4gICAgICAgICAgICAkdGFibGUuc29ydChwcm9wZXJ0eSwgJ2FzYycpXHJcbiAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICBjYXNlICdzb3J0RGVzYyc6XHJcbiAgICAgICAgICAgICR0YWJsZS5zb3J0KHByb3BlcnR5LCAnZGVzYycpXHJcbiAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICBjYXNlICdleHBvcnRBbGwnOlxyXG4gICAgICAgICAgICAkdGFibGUuZXhwb3J0RGF0YSh7IGlzSGVhZGVyOiBmYWxzZSB9KVxyXG4gICAgICAgICAgICBicmVha1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuICAvLyDnu6fmib8gVGFibGVcclxuICBYRVV0aWxzLmFzc2lnbihFeGNlbC5wcm9wcywgVGFibGUucHJvcHMpXHJcbiAgWEVVdGlscy5lYWNoKFRhYmxlLm1ldGhvZHMsIChjYjogRnVuY3Rpb24sIG5hbWU6IHN0cmluZykgPT4ge1xyXG4gICAgRXhjZWwubWV0aG9kc1tuYW1lXSA9IGZ1bmN0aW9uICh0aGlzOiBhbnkpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuJHJlZnMueFRhYmxlW25hbWVdLmFwcGx5KHRoaXMuJHJlZnMueFRhYmxlLCBhcmd1bWVudHMpXHJcbiAgICB9XHJcbiAgfSlcclxuICBfVnVlLmNvbXBvbmVudChFeGNlbC5uYW1lLCBFeGNlbClcclxufVxyXG5cclxuY29uc3Qgcm93SGVpZ2h0OiBudW1iZXIgPSAyNFxyXG5cclxuaW50ZXJmYWNlIHBvc1JhbmdlRGF0YSB7XHJcbiAgdGV4dDogc3RyaW5nO1xyXG4gIHN0YXJ0OiBudW1iZXI7XHJcbiAgZW5kOiBudW1iZXI7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEN1cnNvclBvc2l0aW9uICh0ZXh0YXJlYTogYW55KTogcG9zUmFuZ2VEYXRhIHtcclxuICBjb25zdCByYW5nZURhdGE6IHBvc1JhbmdlRGF0YSA9IHsgdGV4dDogJycsIHN0YXJ0OiAwLCBlbmQ6IDAgfVxyXG4gIGlmICh0ZXh0YXJlYS5zZXRTZWxlY3Rpb25SYW5nZSkge1xyXG4gICAgcmFuZ2VEYXRhLnN0YXJ0ID0gdGV4dGFyZWEuc2VsZWN0aW9uU3RhcnRcclxuICAgIHJhbmdlRGF0YS5lbmQgPSB0ZXh0YXJlYS5zZWxlY3Rpb25FbmRcclxuICB9XHJcbiAgcmV0dXJuIHJhbmdlRGF0YVxyXG59XHJcblxyXG5mdW5jdGlvbiBzZXRDdXJzb3JQb3NpdGlvbiAodGV4dGFyZWE6IGFueSwgcmFuZ2VEYXRhOiBwb3NSYW5nZURhdGEpIHtcclxuICBpZiAodGV4dGFyZWEuc2V0U2VsZWN0aW9uUmFuZ2UpIHtcclxuICAgIHRleHRhcmVhLmZvY3VzKClcclxuICAgIHRleHRhcmVhLnNldFNlbGVjdGlvblJhbmdlKHJhbmdlRGF0YS5zdGFydCwgcmFuZ2VEYXRhLmVuZClcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDmuLLmn5Plh73mlbBcclxuICovXHJcbmNvbnN0IHJlbmRlck1hcCA9IHtcclxuICBjZWxsOiB7XHJcbiAgICBhdXRvZm9jdXM6ICd0ZXh0YXJlYScsXHJcbiAgICByZW5kZXJFZGl0IChoOiBDcmVhdGVFbGVtZW50LCBlZGl0UmVuZGVyOiBDb2x1bW5FZGl0UmVuZGVyT3B0aW9ucywgcGFyYW1zOiBDb2x1bW5FZGl0UmVuZGVyUGFyYW1zKSB7XHJcbiAgICAgIGNvbnN0IHsgJHRhYmxlLCByb3cgfSA9IHBhcmFtc1xyXG4gICAgICBjb25zdCAkZXhjZWw6IGFueSA9ICR0YWJsZS4kcGFyZW50XHJcbiAgICAgIGNvbnN0IHsgZXhjZWxTdG9yZSB9ID0gJGV4Y2VsXHJcbiAgICAgIGNvbnN0IHsgdXBsb2FkUm93cyB9ID0gZXhjZWxTdG9yZVxyXG4gICAgICBjb25zdCBjb2x1bW46IGFueSA9IHBhcmFtcy5jb2x1bW5cclxuICAgICAgY29uc3QgbW9kZWw6IHsgdmFsdWU6IGFueSwgdXBkYXRlOiBib29sZWFuIH0gPSBjb2x1bW4ubW9kZWxcclxuICAgICAgcmV0dXJuIFtcclxuICAgICAgICBoKCdkaXYnLCB7XHJcbiAgICAgICAgICBjbGFzczogJ3Z4ZS10ZXh0YXJlYSB2eGUtZXhjZWwtY2VsbCcsXHJcbiAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICBoZWlnaHQ6IGAke2NvbHVtbi5yZW5kZXJIZWlnaHR9cHhgXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSwgW1xyXG4gICAgICAgICAgaCgndGV4dGFyZWEnLCB7XHJcbiAgICAgICAgICAgIGNsYXNzOiAndnhlLXRleHRhcmVhLS1pbm5lcicsXHJcbiAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgd2lkdGg6IGAke2NvbHVtbi5yZW5kZXJXaWR0aH1weGBcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZG9tUHJvcHM6IHtcclxuICAgICAgICAgICAgICB2YWx1ZTogbW9kZWwudmFsdWVcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgb246IHtcclxuICAgICAgICAgICAgICBpbnB1dCAoZXZudDogYW55KSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBpbnBFbGVtID0gZXZudC50YXJnZXRcclxuICAgICAgICAgICAgICAgIG1vZGVsLnVwZGF0ZSA9IHRydWVcclxuICAgICAgICAgICAgICAgIG1vZGVsLnZhbHVlID0gaW5wRWxlbS52YWx1ZVxyXG4gICAgICAgICAgICAgICAgaWYgKGlucEVsZW0uc2Nyb2xsSGVpZ2h0ID4gaW5wRWxlbS5vZmZzZXRIZWlnaHQpIHtcclxuICAgICAgICAgICAgICAgICAgaWYgKHVwbG9hZFJvd3MuaW5kZXhPZihyb3cpID09PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlucEVsZW0uc3R5bGUud2lkdGggPSBgJHtpbnBFbGVtLm9mZnNldFdpZHRoICsgMjB9cHhgXHJcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5wRWxlbS5zdHlsZS5oZWlnaHQgPSBgJHtpbnBFbGVtLnNjcm9sbEhlaWdodH1weGBcclxuICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgY2hhbmdlICgpIHtcclxuICAgICAgICAgICAgICAgIGlmICh1cGxvYWRSb3dzLmluZGV4T2Yocm93KSA9PT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgdXBsb2FkUm93cy5wdXNoKHJvdylcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgIGtleWRvd24gKGV2bnQ6IGFueSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaW5wRWxlbSA9IGV2bnQudGFyZ2V0XHJcbiAgICAgICAgICAgICAgICBpZiAoZXZudC5hbHRLZXkgJiYgZXZudC5rZXlDb2RlID09PSAxMykge1xyXG4gICAgICAgICAgICAgICAgICBldm50LnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICAgICAgICAgICAgZXZudC5zdG9wUHJvcGFnYXRpb24oKVxyXG4gICAgICAgICAgICAgICAgICBjb25zdCByYW5nZURhdGEgPSBnZXRDdXJzb3JQb3NpdGlvbihpbnBFbGVtKVxyXG4gICAgICAgICAgICAgICAgICBsZXQgcG9zID0gcmFuZ2VEYXRhLmVuZFxyXG4gICAgICAgICAgICAgICAgICBsZXQgY2VsbFZhbHVlID0gaW5wRWxlbS52YWx1ZVxyXG4gICAgICAgICAgICAgICAgICBjZWxsVmFsdWUgPSBgJHtjZWxsVmFsdWUuc2xpY2UoMCwgcG9zKX1cXG4ke2NlbGxWYWx1ZS5zbGljZShwb3MsIGNlbGxWYWx1ZS5sZW5ndGgpfWBcclxuICAgICAgICAgICAgICAgICAgaW5wRWxlbS52YWx1ZSA9IGNlbGxWYWx1ZVxyXG4gICAgICAgICAgICAgICAgICBtb2RlbC51cGRhdGUgPSB0cnVlXHJcbiAgICAgICAgICAgICAgICAgIG1vZGVsLnZhbHVlID0gY2VsbFZhbHVlXHJcbiAgICAgICAgICAgICAgICAgIGlucEVsZW0uc3R5bGUuaGVpZ2h0ID0gYCR7KE1hdGguZmxvb3IoaW5wRWxlbS5vZmZzZXRIZWlnaHQgLyByb3dIZWlnaHQpICsgMSkgKiByb3dIZWlnaHR9cHhgXHJcbiAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJhbmdlRGF0YS5zdGFydCA9IHJhbmdlRGF0YS5lbmQgPSArK3Bvc1xyXG4gICAgICAgICAgICAgICAgICAgIHNldEN1cnNvclBvc2l0aW9uKGlucEVsZW0sIHJhbmdlRGF0YSlcclxuICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgXSlcclxuICAgICAgXVxyXG4gICAgfSxcclxuICAgIHJlbmRlckNlbGwgKGg6IENyZWF0ZUVsZW1lbnQsIGVkaXRSZW5kZXI6IENvbHVtbkNlbGxSZW5kZXJPcHRpb25zLCBwYXJhbXM6IENvbHVtbkNlbGxSZW5kZXJQYXJhbXMpIHtcclxuICAgICAgY29uc3QgeyByb3csIGNvbHVtbiB9ID0gcGFyYW1zXHJcbiAgICAgIHJldHVybiBbXHJcbiAgICAgICAgaCgnc3BhbicsIHtcclxuICAgICAgICAgIGRvbVByb3BzOiB7XHJcbiAgICAgICAgICAgIGlubmVySFRNTDogWEVVdGlscy5lc2NhcGUoWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpKS5yZXBsYWNlKC9cXG4vZywgJzxicj4nKVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcbiAgICAgIF1cclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDln7rkuo4gdnhlLXRhYmxlIOihqOagvOeahOWinuW8uuaPkuS7tu+8jOWunueOsOeugOWNleeahCBFWENFTCDooajmoLxcclxuICovXHJcbmV4cG9ydCBjb25zdCBWWEVUYWJsZVBsdWdpbkV4Y2VsID0ge1xyXG4gIGluc3RhbGwgKHh0YWJsZTogdHlwZW9mIFZYRVRhYmxlKSB7XHJcbiAgICBjb25zdCB7IHJlbmRlcmVyLCB2IH0gPSB4dGFibGVcclxuICAgIGlmICh2ICE9PSAndjInKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignW3Z4ZS10YWJsZS1wbHVnaW4tZXhjZWxdIFYyIHZlcnNpb24gaXMgcmVxdWlyZWQuJylcclxuICAgIH1cclxuICAgIC8vIOa3u+WKoOWIsOa4suafk+WZqFxyXG4gICAgcmVuZGVyZXIubWl4aW4ocmVuZGVyTWFwKVxyXG4gICAgLy8g5rOo5YaM57uE5Lu2XHJcbiAgICByZWdpc3RlckNvbXBvbmVudCh4dGFibGUpXHJcbiAgfVxyXG59XHJcblxyXG5pZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LlZYRVRhYmxlKSB7XHJcbiAgd2luZG93LlZYRVRhYmxlLnVzZShWWEVUYWJsZVBsdWdpbkV4Y2VsKVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBWWEVUYWJsZVBsdWdpbkV4Y2VsXHJcbiJdfQ==
