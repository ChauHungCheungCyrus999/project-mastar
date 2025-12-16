import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

import { useTranslation } from 'react-i18next';

const TaskGanttChartTable = ({ tasks }) => {
  const { t } = useTranslation();

  const excludedColumns = ["_id", "projectId", "description", "priority", "difficultyLevel", "color", "createdDate", "updatedDate"];

  const renderTableHeader = () => {
    if (tasks.length === 0) return null;

    const columnNames = Object.keys(tasks[0]);
    const filteredColumnNames = columnNames.filter((columnName) => !excludedColumns.includes(columnName));
    return (
      <TableRow style={{ whiteSpace: 'nowrap' }}>
        {filteredColumnNames.map((columnName) => (
          <TableCell key={columnName} sx={{ pt: 1, pb: 1.1 }}>
            {t(columnName)}
          </TableCell>
        ))}
      </TableRow>
    );
  };

  const renderTasks = () => {
    if (tasks.length === 0) return null;

    return tasks.map((task, index) => (
      <TableRow key={index} style={{ whiteSpace: 'nowrap' }}>
        {Object.entries(task).map(([key, value]) => {
          if (excludedColumns.includes(key))
            return null;
          return (
            <TableCell key={key} sx={{ pt: 1.5, pb: 1.5 }}>
              {value}
            </TableCell>
          );
        })}
      </TableRow>
    ));
  };

  return (
    <TableContainer sx={{ m: 1 }}>
      <Table>
        <TableHead>{renderTableHeader()}</TableHead>
        <TableBody>{renderTasks()}</TableBody>
      </Table>
    </TableContainer>
  );
};

export default TaskGanttChartTable;