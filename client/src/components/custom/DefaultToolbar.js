import React from 'react';
import {
  GridRowModes,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarExportContainer,
  GridCsvExportMenuItem,
  GridPrintExportMenuItem,
  GridToolbarFilterButton,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import GridExcelExportMenuItem from "./GridExcelExportMenuItem";
import GridJsonExportMenuItem from '../task/GridJsonExportMenuItem';
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";

import { useTranslation } from 'react-i18next';

function DefaultToolbar(props) {
  const { t } = useTranslation();

  const {rows, setRows, setRowModesModel, columns, createRowData } = props;

  const handleClick = () => {
    const newData = createRowData(rows);
    newData.isNew = true;
    if(!newData.hasOwnProperty("id"))
      newData.newId = Math.max(...rows.map((r)=>r.id * 1)) + 1;
    setRows((oldRows) => {
      return [...oldRows, newData]
    });
    setRowModesModel((oldModel) => {
      const firstEditable = columns.find(c => c.editable && !c.hide);
      return {
        ...oldModel,
        [newData.id]: {mode: GridRowModes.Edit, fieldToFocus: firstEditable.field}
      }
    });
  };

  return (
    <GridToolbarContainer>
      <Button color="primary" startIcon={<AddIcon />} onClick={handleClick}>
        {t('addRecord')}
      </Button>

      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />

      <GridToolbarExportContainer>
        <GridExcelExportMenuItem columns={columns} />
        <GridCsvExportMenuItem />
        <GridJsonExportMenuItem fileName={document.title + '.json'} />
        <GridPrintExportMenuItem />
      </GridToolbarExportContainer>

      <GridToolbarQuickFilter />
    </GridToolbarContainer>
  );
}

DefaultToolbar.defaultProps = {
  createRowData: (rows) => {
    const newId = Math.max(...rows.map((r)=>r.id * 1)) + 1;
    return {id: newId}
  }
}

export default DefaultToolbar;