import VXETable from 'vxe-table'

export interface VXETablePluginStatic {
  install(xTable: typeof VXETable): void;
}

/**
 * 基于 vxe-table 表格的增强插件，实现简单的 Excel 表格
 */
declare var VXETablePluginExcel: VXETablePluginStatic;

export default VXETablePluginExcel;