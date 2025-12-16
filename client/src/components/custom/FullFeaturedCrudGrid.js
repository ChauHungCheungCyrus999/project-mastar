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

function FullFeaturedCrudGrid({ columns, rows, defaultPageSize, onSaveRow, onDeleteRow, createRowData, noActionColumn, onProcessRowUpdateError, ...props }) {
  const { t, i18n } = useTranslation();
  let locale = null;
  if (i18n.language === 'zh-cn') {
    locale = zhCN.components.MuiDataGrid.defaultProps.localeText;
  } else if (i18n.language === 'zh-hk') {
    locale = zhTW.components.MuiDataGrid.defaultProps.localeText;
  }

  const [internalRows, setInternalRows] = useState(rows);
  const [rowModesModel, setRowModesModel] = useState(
    {}
  );

  useEffect(()=>{
    setInternalRows(rows);
  }, [rows]);

  const handleRowEditStart = (
    params,
    event
  ) => {
    event.defaultMuiPrevented = true;
  };

  const handleRowEditStop = (
    params,
    event
  ) => {
    event.defaultMuiPrevented = true;
  };

  const handleEditClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleDeleteClick = (id) => () => {
    setInternalRows(internalRows.filter((row) => row.id !== id));
    onDeleteRow(id, internalRows.find((row) => row.id === id), internalRows);
  };

  const handleCancelClick = (id) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true }
    });

    const editedRow = internalRows.find((row) => row.id === id);
    if (editedRow.isNew) {
      setInternalRows(internalRows.filter((row) => row.id !== id));
    }
  };

  const processRowUpdate = (newRow) => {
    const updatedRow = { ...newRow};
    if(!updatedRow.isNew) updatedRow.isNew = false;
    const oldRow = internalRows.find((r)=>r.id === updatedRow.id);
    setInternalRows(internalRows.map((row) => (row.id === newRow.id ? updatedRow : row)));
    onSaveRow(updatedRow.id, updatedRow, oldRow, internalRows);
    return updatedRow;
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
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <Tooltip title={t('save')}>
              <GridActionsCellItem
                icon={<SaveIcon />}
                label={t('save')}
                onClick={handleSaveClick(id)}
              />
            </Tooltip>
            ,
            <Tooltip title={t('cancel')}>
              <GridActionsCellItem
                icon={<CancelIcon />}
                label={t('cancel')}
                className="textPrimary"
                onClick={handleCancelClick(id)}
                color="inherit"
              />
            </Tooltip>
          ];
        }

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
      editMode="row"
      rowModesModel={rowModesModel}
      onRowModesModelChange={(newModel) => setRowModesModel(newModel)}
      onRowEditStart={handleRowEditStart}
      onRowEditStop={handleRowEditStop}
      processRowUpdate={processRowUpdate}
      onProcessRowUpdateError={onProcessRowUpdateError}
      slots={{
        toolbar: DefaultToolbar,
      }}
      slotProps={{
        toolbar: { rows: internalRows, setRows: setInternalRows, setRowModesModel, createRowData, columns },
        loadingOverlay: {
          variant: 'skeleton',
          noRowsVariant: 'skeleton',
        },
      }}
      experimentalFeatures={{ newEditingApi: true }}

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