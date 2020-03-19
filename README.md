# vxe-table-plugin-excel

[![gitee star](https://gitee.com/xuliangzhan_admin/vxe-table-plugin-excel/badge/star.svg?theme=dark)](https://gitee.com/xuliangzhan_admin/vxe-table-plugin-excel/stargazers)
[![npm version](https://img.shields.io/npm/v/vxe-table-plugin-excel.svg?style=flat-square)](https://www.npmjs.org/package/vxe-table-plugin-excel)
[![npm downloads](https://img.shields.io/npm/dm/vxe-table-plugin-excel.svg?style=flat-square)](http://npm-stat.com/charts.html?package=vxe-table-plugin-excel)
[![gzip size: JS](http://img.badgesize.io/https://unpkg.com/vxe-table-plugin-excel/dist/index.min.js?compression=gzip&label=gzip%20size:%20JS)](https://unpkg.com/vxe-table-plugin-excel/dist/index.min.js)
[![gzip size: CSS](http://img.badgesize.io/https://unpkg.com/vxe-table-plugin-excel/dist/style.min.css?compression=gzip&label=gzip%20size:%20CSS)](https://unpkg.com/vxe-table-plugin-excel/dist/style.min.css)
[![npm license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/xuliangzhan/vxe-table-plugin-excel/blob/master/LICENSE)

基于 [vxe-table](https://github.com/xuliangzhan/vxe-table) 2.x 表格的增强插件，实现简单的 Excel 表格（实验功能，仅供参考）

## Installing

```shell
npm install xe-utils vxe-table vxe-table-plugin-excel
```

```javascript
import Vue from 'vue'
import VXETable from 'vxe-table'
import VXETablePluginExcel from 'vxe-table-plugin-excel'
import 'vxe-table-plugin-excel/dist/style.css'

Vue.use(VXETable)
VXETable.use(VXETablePluginExcel)
```

## Demo

```html
<vxe-excel
  ref="xExcel"
  max-height="600"
  :columns="columns"
  :data="tableData">
</vxe-excel>
```

```javascript
export default {
  data () {
    let columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N']
    return {
      columns: [
        {
          type: 'index',
          width: 50,
          align: 'center',
          headerAlign: 'center'
        }
      ].concat(columns.map(name => {
        return {
          field: name,
          title: name,
          minWidth: 76,
          headerAlign: 'center',
          editRender: {
            name: 'cell'
          }
        }
      })),
      tableData: Array.from(new Array(20)).map((num, index) => {
        let item = {}
        columns.forEach(name => {
          item[name] = ''
        })
        return item
      })
    }
  }
}
```

## License

MIT License, 2019-present, Xu Liangzhan
