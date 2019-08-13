import VXETable from 'xe-table'

export interface VXETablePluginExcelStatic {
  install(VXETable: typeof VXETable): void;
}

/**
 * vxe-table renderer plugins for element-ui.
 */
declare var VXETablePluginExcel: VXETablePluginExcelStatic;

export default VXETablePluginExcel;