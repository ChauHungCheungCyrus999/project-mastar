import React, { useEffect } from 'react';
import { useMediaQuery } from '@mui/material';
import {
  DataGrid,
  useGridApiRef,
  zhTW,
  zhCN,
  GridToolbarContainer,
  GridToolbar,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarExportContainer,
  GridCsvExportMenuItem,
  GridPrintExportMenuItem,
  GridToolbarQuickFilter,
} from '@mui/x-data-grid';
import * as XLSX from 'xlsx/xlsx.mjs';
import GridExcelExportMenuItem from '../task/GridExcelExportMenuItem';
import GridJsonExportMenuItem from '../task/GridJsonExportMenuItem';

import { useTranslation } from 'react-i18next';

function CDataGrid({
  displayCheckbox = false,
  displayToolbar,
  columns,
  rows,
  size,
  onSelectionChange,
}) {
  const isTablet = useMediaQuery('(max-width:900px)');

  const { t, i18n } = useTranslation();
  let locale = null;
  if (i18n.language === 'zh-cn') {
    locale = zhCN.components.MuiDataGrid.defaultProps.localeText;
  } else if (i18n.language === 'zh-hk') {
    locale = zhTW.components.MuiDataGrid.defaultProps.localeText;
  }

  const csvOptions = {
    delimiter: ',',
    fileName: document.title,
    utf8WithBom: true,
    disableToolbarButton: true,
  };
  const printOptions = {
    hideFooter: true,
    hideToolbar: true,
    disableToolbarButton: true,
  };
  function CustomExportButton(props) {
    return (
      <GridToolbarExportContainer {...props}>
        <GridExcelExportMenuItem columns={columns} />
        <GridCsvExportMenuItem options={csvOptions} />
        <GridJsonExportMenuItem fileName={document.title} />
        <GridPrintExportMenuItem options={printOptions} />
      </GridToolbarExportContainer>
    );
  }

  // DataGrid toolbar
  function CustomToolbar(props) {
    return (
      <GridToolbarContainer
        sx={{ direction: 'row', justifyContent: 'space-between' }}
      >
        <GridToolbarContainer>
          <GridToolbarColumnsButton />
          <GridToolbarFilterButton />
          <GridToolbarDensitySelector />
          <CustomExportButton />
        </GridToolbarContainer>

        <GridToolbarQuickFilter sx={{ mr: '0.5rem' }} />
      </GridToolbarContainer>
    );
  }

  // Save DataGrid Toolbar state
  const apiRef = useGridApiRef();
  useEffect(() => {
    try {
      const stateJSON = localStorage.getItem('dataGridTableState');
      if (stateJSON) apiRef.current.restoreState(JSON.parse(stateJSON));
    } catch (e) {
      console.log(e);
    }
  }, []);

  return (
    <div
      style={{
        width: '100%',
        height: size === 'small' ? '500px' : isTablet ? '100vh' : '76.5vh',
        maxHeight: '100vh',
      }}
    >
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={10}
        checkboxSelection={displayCheckbox}
        disableSelectionOnClick
        density="compact"
        slots={{ toolbar: displayToolbar === false ? null : CustomToolbar }}
        apiRef={apiRef}
        localeText={locale}
        getRowId={(row) => row._id}
        slotProps={{
          loadingOverlay: {
            variant: 'skeleton',
            noRowsVariant: 'skeleton',
          },
        }}
        // FIX: Use `onRowSelectionModelChange` instead of `onSelectionModelChange`
        onRowSelectionModelChange={(ids) => onSelectionChange && onSelectionChange(ids)}
        onColumnVisibilityModelChange={() => {
          const state = apiRef.current.exportState();
          localStorage.setItem('dataGridTableState', JSON.stringify(state));
        }}
        onColumnWidthChange={() => {
          const state = apiRef.current.exportState();
          localStorage.setItem('dataGridTableState', JSON.stringify(state));
        }}
      />
    </div>
  );
}

export default CDataGrid;