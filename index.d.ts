import VXETable from 'vxe-table'

export interface VXETablePluginExcelStatic {
  install(xTable: typeof VXETable): void;
}

/**
 * vxe-table renderer plugins for element-ui.
 */
declare var VXETablePluginExcel: VXETablePluginExcelStatic;

export default VXETablePluginExcel;