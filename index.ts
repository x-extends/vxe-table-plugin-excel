/* eslint-disable no-unused-vars */
import Vue, { CreateElement } from 'vue'
import XEUtils from 'xe-utils/methods/xe-utils'
import {
  VXETable,
  ColumnConfig,
  ColumnEditRenderOptions,
  ColumnEditRenderParams,
  ColumnCellRenderOptions,
  ColumnCellRenderParams,
  MenuLinkParams
} from 'vxe-table/lib/vxe-table'
/* eslint-enable no-unused-vars */

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

function registerComponent (params: any) {
  const _Vue: typeof Vue = params.Vue
  const Table: any = params.Table
  const Excel: { [key: string]: any } = {
    name: 'VxeExcel',
    props: {
      columns: Array
    },
    data () {
      return {
        excelStore: {
          uploadRows: []
        }
      }
    },
    computed: {
      tableProps (this: any) {
        const { $props, editConfig, sortConfig, filterConfig } = this
        return XEUtils.assign({}, $props, {
          border: true,
          resizable: true,
          showOverflow: null,
          contextMenu: excelContextMenu,
          mouseConfig: { selected: true, range: true },
          keyboardConfig: { isArrow: true, isDel: true, isEnter: true, isTab: true, isCut: true, isEdit: true },
          editConfig: Object.assign({}, excelEditConfig, editConfig),
          sortConfig: Object.assign({ showIcon: false }, sortConfig),
          filterConfig: Object.assign({ showIcon: false }, filterConfig),
          optimization: {
            scrollX: {
              gt: 100
            },
            scrollY: {
              gt: 200
            }
          }
        })
      }
    },
    watch: {
      columns (this: any, value: ColumnConfig[]) {
        this.loadColumn(value)
      }
    },
    mounted (this: any) {
      const { columns } = this
      if (columns && columns.length) {
        this.loadColumn(this.columns)
      }
    },
    render (this: any, h: CreateElement) {
      const { $slots, $listeners, tableProps } = this
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
      contextMenuClickEvent (this: any, params: MenuLinkParams, evnt: any) {
        const { menu, row, column } = params
        const $table = this.$refs.xTable
        const { property } = column
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
            $table.setFilter(column, [
              { data: XEUtils.get(row, property), checked: true }
            ])
            $table.updateData()
            $table.clearIndexChecked()
            $table.clearHeaderChecked()
            $table.clearChecked()
            $table.clearSelected()
            $table.clearCopyed()
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
        }
      }
    }
  }
  // 继承 Table
  XEUtils.assign(Excel.props, Table.props)
  XEUtils.each(Table.methods, (cb: Function, name: string) => {
    Excel.methods[name] = function (this: any) {
      return this.$refs.xTable[name].apply(this.$refs.xTable, arguments)
    }
  })
  _Vue.component(Excel.name, Excel)
}

const rowHeight: number = 24

interface posRangeData {
  text: string;
  start: number;
  end: number;
}

function getCursorPosition (textarea: any): posRangeData {
  const rangeData: posRangeData = { text: '', start: 0, end: 0 }
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
    autofocus: 'textarea',
    renderEdit (h: CreateElement, editRender: ColumnEditRenderOptions, params: ColumnEditRenderParams) {
      const { $table, row } = params
      const $excel: any = $table.$parent
      const { excelStore } = $excel
      const { uploadRows } = excelStore
      const column: any = params.column
      const model: { value: any, update: boolean } = column.model
      return [
        h('div', {
          class: 'vxe-textarea vxe-excel-cell',
          style: {
            height: `${column.renderHeight}px`
          }
        }, [
          h('textarea', {
            class: 'vxe-textarea--inner',
            style: {
              width: `${column.renderWidth}px`
            },
            domProps: {
              value: model.value
            },
            on: {
              input (evnt: any) {
                const inpElem = evnt.target
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
              change () {
                if (uploadRows.indexOf(row) === -1) {
                  uploadRows.push(row)
                }
              },
              keydown (evnt: any) {
                const inpElem = evnt.target
                if (evnt.altKey && evnt.keyCode === 13) {
                  evnt.preventDefault()
                  evnt.stopPropagation()
                  const rangeData = getCursorPosition(inpElem)
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
    renderCell (h: CreateElement, editRender: ColumnCellRenderOptions, params: ColumnCellRenderParams) {
      const { row, column } = params
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
 * 基于 vxe-table 表格的增强插件，实现简单的 EXCEL 表格
 */
export const VXETablePluginExcel = {
  install (xtable: typeof VXETable) {
    const { renderer, v } = xtable
    if (v !== 'v2') {
      throw new Error('[vxe-table-plugin-excel] V2 version is required.')
    }
    // 添加到渲染器
    renderer.mixin(renderMap)
    // 注册组件
    registerComponent(xtable)
  }
}

if (typeof window !== 'undefined' && window.VXETable) {
  window.VXETable.use(VXETablePluginExcel)
}

export default VXETablePluginExcel
