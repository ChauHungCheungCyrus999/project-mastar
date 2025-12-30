import React, { useState, useEffect } from 'react';
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
import {
  GridRowModes,
  DataGrid,
  GridActionsCellItem,
  zhTW, zhCN
} from "@mui/x-data-grid";
import { Tooltip } from '@mui/material';

import DefaultToolbar from "./DefaultToolbar";

import { useTranslation } from 'react-i18next';

function FullFeaturedCrudGrid({ columns, rows, defaultPageSize, onSaveRow, onDeleteRow, createRowData, noActionColumn, onProcessRowUpdateError, onAddClick, onEditClick, ...props }) {
  const { t, i18n } = useTranslation();
  let locale = null;
  if (i18n.language === 'zh-cn') {
    locale = zhCN.components.MuiDataGrid.defaultProps.localeText;
  } else if (i18n.language === 'zh-hk') {
    locale = zhTW.components.MuiDataGrid.defaultProps.localeText;
  }

  const [internalRows, setInternalRows] = useState(rows);

  useEffect(()=>{
    setInternalRows(rows);
  }, [rows]);

  const handleEditClick = (id) => () => {
    if (onEditClick) onEditClick(id);
  };

  const handleDeleteClick = (id) => () => {
    onDeleteRow(id, internalRows.find((row) => row.id === id), internalRows);
  };

  const appendedColumns = noActionColumn ? columns : [
    ...columns,
    {
      field: "actions",
      type: "actions",
      headerName: t('action'),
      width: 100,
      cellClassName: "actions",
      getActions: ({ id }) => {
        return [
          <Tooltip title={t('edit')}>
            <GridActionsCellItem
              icon={<EditIcon />}
              label={t('edit')}
              className="textPrimary"
              onClick={handleEditClick(id)}
              color="inherit"
            />
          </Tooltip>
          ,
          <Tooltip title={t('delete')}>
            <GridActionsCellItem
              icon={<DeleteIcon />}
              label={t('delete')}
              onClick={handleDeleteClick(id)}
              color="inherit"
            />
          </Tooltip>
        ];
      }
    }
  ];

  //pagination
  const [pageSize, setPageSize] = useState(defaultPageSize);

  return (
    <DataGrid
      rows={internalRows}
      columns={appendedColumns}
      onProcessRowUpdateError={onProcessRowUpdateError}
      slots={{
        toolbar: DefaultToolbar,
      }}
      slotProps={{
        toolbar: { rows: internalRows, setRows: setInternalRows, createRowData, columns, onAddClick },
        loadingOverlay: {
          variant: 'skeleton',
          noRowsVariant: 'skeleton',
        },
      }}

      //pagination
      pageSize={pageSize}
      onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
      {...props}

      // i18n
      localeText={locale}
    />
  );
}

FullFeaturedCrudGrid.defaultProps = {
  //action
  onSaveRow: (id, updatedRow/*, oldRow, rows*/)=>{
    console.log("save row", updatedRow);
  },
  onDeleteRow: (id, oldRow/*, rows*/) => {
    console.log("delete row", oldRow);
  },

  noActionColumn: false,

  onProcessRowUpdateError: (error) => {
    console.error(error);
  },

  initialState: {
    columns: {
      columnVisibilityModel: {
        id: true
      }
    }
  },
  autoHeight: true,

  //pagination
  pagination: true,
  defaultPageSize: 25,
  rowsPerPageOptions: [5, 10, 25, 50, 100],
}

export default FullFeaturedCrudGrid;