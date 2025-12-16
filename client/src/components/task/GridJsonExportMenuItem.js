import { MenuItem } from '@mui/material';
import { gridFilteredSortedRowIdsSelector, gridVisibleColumnFieldsSelector, useGridApiContext } from '@mui/x-data-grid';

import { useTranslation } from 'react-i18next';

/* Export Menu Item (CSV, JSON) */
const getJson = (apiRef) => {
  // Select rows and columns
  const filteredSortedRowIds = gridFilteredSortedRowIdsSelector(apiRef);
  const visibleColumnsField = gridVisibleColumnFieldsSelector(apiRef);

  // Format the data. Here we only keep the value
  const data = filteredSortedRowIds.map((id) => {
    const row = {};
    visibleColumnsField.forEach((field) => {
      row[field] = apiRef.current.getCellParams(id, field).value;
    });
    return row;
  });

  // Check if all __check__ fields are false
  const allUnchecked = data.every((row) => !row.__check__);

  // Filter data based on __check__ field
  const filteredData = allUnchecked
    ? data
    : data.filter((row) => row.__check__);

  // remove the attribute "__check__" in json
  const sanitizedData = filteredData.map((row) => {
    const { __check__, ...rest } = row;
    return rest;
  });

  // Stringify with some indentation
  return JSON.stringify(sanitizedData, null, 2);
};

const exportBlob = (blob, filename) => {
  // Save the blob in a json file
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();

  setTimeout(() => {
    URL.revokeObjectURL(url);
  });
};

export default function GridJsonExportMenuItem({ fileName, ...props }) {
  const { t } = useTranslation();
  
  const apiRef = useGridApiContext();

  const { hideMenu } = props;

  return (
    <MenuItem
      onClick={() => {
        const jsonString = getJson(apiRef);
        const blob = new Blob([jsonString], {
          type: 'text/json',
        });
        exportBlob(blob, fileName);

        // Hide the export menu after the export
        hideMenu?.();
      }}
    >
      {t('exportJson')}
    </MenuItem>
  );
}