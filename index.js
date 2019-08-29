import XEUtils from 'xe-utils/methods/xe-utils'

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

const Excel = {
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
    tableProps () {
      let { $props, editConfig } = this
      return XEUtils.assign({}, $props, {
        border: true,
        resizable: true,
        showOverflow: null,
        contextMenu: excelContextMenu,
        mouseConfig: { selected: true, checked: true },
        keyboardConfig: { isArrow: true, isDel: true, isTab: true, isCut: true, isEdit: true },
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
      })
    }
  },
  watch: {
    columns (value) {
      this.loadColumn(value)
    }
  },
  mounted () {
    let { columns } = this
    if (columns && columns.length) {
      this.loadColumn(this.columns)
    }
  },
  render (h) {
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
    contextMenuClickEvent ({ menu, row, column }, evnt) {
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
            .then(options => {
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
          $table.exportCsv({ isHeader: false })
          break
      }
    }
  }
}

const rowHeight = 24

function getCursorPosition (textarea) {
  let rangeData = { text: '', start: 0, end: 0 }
  if (textarea.setSelectionRange) {
    rangeData.start = textarea.selectionStart
    rangeData.end = textarea.selectionEnd
    rangeData.text = (rangeData.start !== rangeData.end) ? textarea.value.substring(rangeData.start, rangeData.end) : ''
  } else if (document.selection) {
    let index = 0
    let range = document.selection.createRange()
    let textRange = document.body.createTextRange()
    textRange.moveToElementText(textarea)
    rangeData.text = range.text
    rangeData.bookmark = range.getBookmark()
    for (; textRange.compareEndPoints('StartToStart', range) < 0 && range.moveStart('character', -1) !== 0; index++) {
      if (textarea.value.charAt(index) === '\n') {
        index++
      }
    }
    rangeData.start = index
    rangeData.end = rangeData.text.length + rangeData.start
  }
  return rangeData
}

function setCursorPosition (textarea, rangeData) {
  if (textarea.setSelectionRange) {
    textarea.focus()
    textarea.setSelectionRange(rangeData.start, rangeData.end)
  } else if (textarea.createTextRange) {
    let textRange = textarea.createTextRange()
    if (textarea.value.length === rangeData.start) {
      textRange.collapse(false)
      textRange.select()
    } else {
      textRange.moveToBookmark(rangeData.bookmark)
      textRange.select()
    }
  }
}

/**
 * 渲染函数
 */
const renderMap = {
  cell: {
    autofocus: '.vxe-textarea',
    renderEdit (h, editRender, params, { $excel }) {
      let { excelStore } = $excel
      let { uploadRows } = excelStore
      let { row, column } = params
      let { model } = column
      return [
        h('div', {
          class: 'vxe-input--wrapper vxe-excel-cell',
          style: {
            height: `${column.renderHeight - 1}px`
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
              input (evnt) {
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
              change (evnt) {
                if (uploadRows.indexOf(row) === -1) {
                  uploadRows.push(row)
                }
              },
              keydown (evnt) {
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
    renderCell (h, editRender, params) {
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

export const VXETablePluginExcel = {
  install (VXETable) {
    let { Vue, Table, renderer, v } = VXETable
    if (v === 'v1') {
      throw new Error('[vxe-table-plugin-excel] >= V2 version is required.')
    }
    // 继承 Table
    XEUtils.assign(Excel.props, Table.props)
    XEUtils.each(Table.methods, (cb, name) => {
      Excel.methods[name] = function () {
        return this.$refs.xTable[name].apply(this.$refs.xTable[name], arguments)
      }
    })
    // 添加到渲染器
    renderer.mixin(renderMap)
    // 注册组件
    Vue.component(Excel.name, Excel)
  }
}

if (typeof window !== 'undefined' && window.VXETable) {
  window.VXETable.use(VXETablePluginExcel)
}

export default VXETablePluginExcel
