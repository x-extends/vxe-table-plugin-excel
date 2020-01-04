import XEUtils from 'xe-utils/methods/xe-utils'
import VXETable from 'vxe-table/lib/vxe-table'

const excelEditConfig = {
  trigger: 'dblclick',
  mode: 'cell',
  showIcon: false,
  showStatus: false
}

const excelContextMenu = {
  header: {
    options: [
      [
        {
          code: 'exportAll',
          name: '隐藏列'
        },
        {
          code: 'exportAll',
          name: '取消所有隐藏'
        }
      ]
    ]
  },
  body: {
    options: [
      [
        {
          code: 'clip',
          name: '剪贴(Ctrl+X)'
        },
        {
          code: 'copy',
          name: '复制(Ctrl+C)'
        },
        {
          code: 'paste',
          name: '粘贴(Ctrl+V)'
        }
      ],
      [
        {
          code: 'insert',
          name: '插入'
        },
        {
          code: 'remove',
          name: '删除'
        },
        {
          code: 'clearData',
          name: '清除内容(Del)'
        }
      ],
      // [
      //   {
      //     code: 'merge',
      //     name: '合并单元格'
      //   }
      // ],
      [
        {
          code: 'filter',
          name: '筛选',
          children: [
            {
              code: 'clearFilter',
              name: '清除筛选'
            },
            {
              code: 'filterSelect',
              name: '按所选单元格的值筛选'
            }
          ]
        },
        {
          code: 'sort',
          name: '排序',
          children: [
            {
              code: 'clearSort',
              name: '清除排序'
            },
            {
              code: 'sortAsc',
              name: '升序'
            },
            {
              code: 'sortDesc',
              name: '倒序'
            }
          ]
        }
      ],
      [
        {
          code: 'exportAll',
          name: '导出数据.csv'
        }
      ]
    ]
  }
}

export enum EXCEL_METHODS_NAME {
  CONTEXT_MENU_CLICK_EVENT = 'contextMenuClickEvent',
  CELL_SPAN_METHOD = 'cellSpanMethod'
}

export interface vExcelData {
  excelStore: {
    uploadRows: Array<any>;
  }
  mergeStore: {
    colList: Array<any>;
    rowList: Array<any>;
  }
}

function registerComponent ({ Vue, Table }: any) {
  const Excel: any = {
    name: 'VxeExcel',
    props: {
      columns: Array
    },
    data () {
      let data: vExcelData = {
        excelStore: {
          uploadRows: []
        },
        mergeStore: {
          colList: [],
          rowList: []
        }
      }
      return data
    },
    computed: {
      tableProps (this: any): any {
        let { $props, editConfig } = this
        return XEUtils.assign({}, $props, {
          border: true,
          resizable: true,
          showOverflow: null,
          // spanMethod: this.cellSpanMethod,
          contextMenu: excelContextMenu,
          mouseConfig: { selected: true, checked: true },
          keyboardConfig: { isArrow: true, isDel: true, isEnter: true, isTab: true, isCut: true, isEdit: true },
          editConfig: Object.assign({}, excelEditConfig, editConfig),
          optimization: {
            scrollX: {
              gt: 100
            },
            scrollY: {
              gt: 100
            }
          }
        })
      }
    },
    watch: {
      columns (this: any, value: Array<any>) {
        this.loadColumn(value)
      }
    },
    mounted (this: any) {
      let { columns } = this
      if (columns && columns.length) {
        this.loadColumn(this.columns)
      }
    },
    render (this: any, h: Function) {
      let { $slots, $listeners, tableProps } = this
      return h('vxe-table', {
        class: 'vxe-excel',
        props: tableProps,
        on: XEUtils.assign({}, $listeners, {
          'context-menu-click': this.contextMenuClickEvent
        }),
        ref: 'xTable'
      }, $slots.default)
    },
    methods: {
      [EXCEL_METHODS_NAME.CONTEXT_MENU_CLICK_EVENT] (this: any, { menu, row, column }: any, evnt: any) {
        let $table = this.$refs.xTable
        let { property } = column
        switch (menu.code) {
          case 'clip':
            $table.handleCopyed(true, evnt)
            break
          case 'copy':
            $table.handleCopyed(false, evnt)
            break
          case 'paste':
            $table.handlePaste(evnt)
            break
          case 'insert':
            $table.insertAt({}, row)
            break
          case 'remove':
            $table.remove(row)
            break
          case 'clearData':
            $table.clearData(row, property)
            break
          case 'clearFilter':
            $table.clearFilter(column)
            break
          case 'filterSelect':
            $table.filter(property)
              .then((options: Array<any>) => {
                if (options.length) {
                  let option = options[0]
                  option.data = XEUtils.get(row, property)
                  option.checked = true
                }
              }).then(() => $table.updateData())
            break
          case 'clearSort':
            $table.clearSort()
            break
          case 'sortAsc':
            $table.sort(property, 'asc')
            break
          case 'sortDesc':
            $table.sort(property, 'desc')
            break
          case 'exportAll':
            $table.exportData({ isHeader: false })
            break
          case 'merge':
            const { columns, rows } = $table.getMouseCheckeds()
            const { colList, rowList } = this.mergeStore
            if (rows.length && columns.length) {
              rows.forEach((row: any) => rowList.indexOf(row) === -1 ? rowList.push(row) : 0)
              columns.forEach((column: any) => colList.indexOf(column) === -1 ? colList.push(column) : 0)
            }
            break
        }
      },
      [EXCEL_METHODS_NAME.CELL_SPAN_METHOD] (this: any, params: any) {
        let { row, $rowIndex, column, data } = params
        const { colList, rowList } = this.mergeStore
        if (colList.indexOf(column) > -1) {
          let prevRow = data[$rowIndex - 1]
          let nextRow = data[$rowIndex + 1]
          let isMerged = rowList.indexOf(row) > -1
          if (prevRow && isMerged && rowList.indexOf(prevRow) > -1) {
            return { rowspan: 0, colspan: 0 }
          } else {
            let countRowspan = 1
            if (isMerged) {
              while (nextRow && rowList.indexOf(nextRow) > -1) {
                nextRow = data[++countRowspan + $rowIndex]
              }
            }
            if (countRowspan > 1) {
              return { rowspan: countRowspan, colspan: 1 }
            }
          }
        }
      }
    }
  }
  // 继承 Table
  XEUtils.assign(Excel.props, Table.props)
  XEUtils.each(Table.methods, (cb: Function, name: EXCEL_METHODS_NAME) => {
    Excel.methods[name] = function (this: any) {
      return this.$refs.xTable[name].apply(this.$refs.xTable, arguments)
    }
  })
  Vue.component(Excel.name, Excel)
}

const rowHeight: number = 24

interface posRangeData {
  text: string;
  start: number;
  end: number;
}

function getCursorPosition (textarea: any): posRangeData {
  let rangeData: posRangeData = { text: '', start: 0, end: 0 }
  if (textarea.setSelectionRange) {
    rangeData.start = textarea.selectionStart
    rangeData.end = textarea.selectionEnd
  }
  return rangeData
}

function setCursorPosition (textarea: any, rangeData: posRangeData) {
  if (textarea.setSelectionRange) {
    textarea.focus()
    textarea.setSelectionRange(rangeData.start, rangeData.end)
  }
}

/**
 * 渲染函数
 */
const renderMap = {
  cell: {
    autofocus: '.vxe-textarea',
    renderEdit (h: Function, editRender: any, params: any, { $excel }: any) {
      let { excelStore } = $excel
      let { uploadRows } = excelStore
      let { row, column } = params
      let { model } = column
      return [
        h('div', {
          class: 'vxe-input--wrapper vxe-excel-cell',
          style: {
            height: `${column.renderHeight}px`
          }
        }, [
          h('textarea', {
            class: 'vxe-textarea',
            style: {
              width: `${column.renderWidth}px`
            },
            domProps: {
              value: model.value
            },
            on: {
              input (evnt: any) {
                let inpElem = evnt.target
                model.update = true
                model.value = inpElem.value
                if (inpElem.scrollHeight > inpElem.offsetHeight) {
                  if (uploadRows.indexOf(row) === -1) {
                    inpElem.style.width = `${inpElem.offsetWidth + 20}px`
                  } else {
                    inpElem.style.height = `${inpElem.scrollHeight}px`
                  }
                }
              },
              change (evnt: any) {
                if (uploadRows.indexOf(row) === -1) {
                  uploadRows.push(row)
                }
              },
              keydown (evnt: any) {
                let inpElem = evnt.target
                if (evnt.altKey && evnt.keyCode === 13) {
                  evnt.preventDefault()
                  evnt.stopPropagation()
                  let rangeData = getCursorPosition(inpElem)
                  let pos = rangeData.end
                  let cellValue = inpElem.value
                  cellValue = `${cellValue.slice(0, pos)}\n${cellValue.slice(pos, cellValue.length)}`
                  inpElem.value = cellValue
                  model.update = true
                  model.value = cellValue
                  inpElem.style.height = `${(Math.floor(inpElem.offsetHeight / rowHeight) + 1) * rowHeight}px`
                  setTimeout(() => {
                    rangeData.start = rangeData.end = ++pos
                    setCursorPosition(inpElem, rangeData)
                  })
                }
              }
            }
          })
        ])
      ]
    },
    renderCell (h: Function, editRender: any, params: any) {
      let { row, column } = params
      return [
        h('span', {
          domProps: {
            innerHTML: XEUtils.escape(XEUtils.get(row, column.property)).replace(/\n/g, '<br>')
          }
        })
      ]
    }
  }
}

/**
 * 基于 vxe-table 表格的增强插件，实现简单的虚拟树表格
 */
export const VXETablePluginVirtualTree = {
  install (xtable: typeof VXETable) {
    let { renderer, v } = xtable
    if (v === 'v1') {
      throw new Error('[vxe-table-plugin-virtual-tree] >= V2 version is required.')
    }
    // 添加到渲染器
    renderer.mixin(renderMap)
    // 注册组件
    registerComponent(xtable)
  }
}

if (typeof window !== 'undefined' && window.VXETable) {
  window.VXETable.use(VXETablePluginVirtualTree)
}

export default VXETablePluginVirtualTree
