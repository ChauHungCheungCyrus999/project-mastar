import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Skeleton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Switch, Button, Chip, TextField,
  Menu, MenuItem,
  FormControlLabel,
  Typography,
} from '@mui/material';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';

import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { addDays, differenceInDays } from 'date-fns';

import StatusChip from '../StatusChip';
import PriorityChip from '../PriorityChip';
import DifficultyLevelChip from '../DifficultyLevelChip';
import TagChip from '../TagChip';

import { formatDate } from '../../utils/DateUtils.js';
import { capitalizeWordsExceptFirst } from '../../utils/StringUtils.js';

import * as DateHolidays from 'date-holidays';

import { useTranslation } from 'react-i18next';

const TaskGanttChartTable = ({ project, tasks, onTaskDateChange, dateMode }) => {
  const theme = useTheme();
  
  // Skeleton
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false);
    }, 10);
  }, []);
  
  // Holiday
  const [holidays, setHolidays] = useState([]);

  const calculateManDay = (startDate, endDate, holidays) => {
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    let manDays = 0;
  
    // 0 = Sunday, 6 = Saturday
    while (start && start <= end) {
      if (start.getDay() !== 0 && start.getDay() !== 6 && !isHoliday(start, holidays)) {
        manDays++;
      }
  
      start.setDate(start.getDate() + 1);
    }
  
    return manDays;
  };

  const isHoliday = (date, holidays) => {
    const formattedDate = date.toISOString().substring(0, 10);
    return holidays.includes(formattedDate);
  };

  useEffect(() => {
    const hd = new DateHolidays.default();
    hd.init('HK');
    
    if (tasks) {
      // Get the largest start date and end date from the tasks
      let maxStartDate = new Date(tasks[0]?.startDate);
      let maxEndDate = new Date(tasks[0]?.endDate);

      for (let i = 1; i < tasks.length; i++) {
        const startDate = new Date(tasks[i]?.startDate);
        const endDate = new Date(tasks[i]?.endDate);

        if (startDate > maxStartDate) {
          maxStartDate = startDate;
        }

        if (endDate > maxEndDate) {
          maxEndDate = endDate;
        }
      }

      const startYear = maxStartDate.getFullYear();
      const endYear = maxEndDate.getFullYear();
      //const startYear = new Date(tasks[0]?.startDate).getFullYear();
      //const endYear = new Date(tasks[tasks.length - 1]?.endDate).getFullYear();

      // Get holidays
      const holidays = [];
  
      for (let year = startYear; year <= endYear; year++) {
        const yearHolidays = hd.getHolidays(year);
        yearHolidays.forEach(holiday => {
          holidays.push(holiday.date.substring(0, 10));
        });
      }
  
      //console.log(holidays);
      setHolidays(holidays);
    }
  }, []);

  // Add "Duration" and "Man-day" column
  const tasksWithDuration = tasks
    .filter(task => {
      if (dateMode === 'estimated') {
        return task.startDate && task.endDate;
      } else {
        return task.actualStartDate && task.actualEndDate;
      }
    })
    .map(task => {
      return {
        ...task,
        duration: differenceInDays(new Date(task.endDate), new Date(task.startDate)),
        manDay: calculateManDay(task.startDate, task.endDate, holidays)
      };
    });

  const updateEndDateByDuration = (task, duration) => {
    if (isNaN(duration) || duration <= 0) {
      return task; // Return the task as it is if duration is invalid or empty
    }

    const newEndDate = addDays(new Date(task.startDate), duration);
    return {
      ...task,
      duration,
      endDate: newEndDate.toISOString() // Update the endDate
    };
  };

  const updateEndDateByManDay = (task, manDay) => {
    if (isNaN(manDay) || manDay <= 0) {
      return task; // Return the task as it is if manDay is invalid or empty
    }

    const newEndDate = addDays(new Date(task.startDate), manDay);
    return {
      ...task,
      manDay,
      endDate: newEndDate.toISOString() // Update the endDate
    };
  };

  const handleDurationChange = (task, duration) => {
    const updatedTask = updateEndDateByDuration(task, duration);
    onTaskDateChange(updatedTask);
  };

  const handleManDayChange = (task, manDay) => {
    const updatedTask = updateEndDateByManDay(task, manDay);
    onTaskDateChange(updatedTask);
  };

  
  const { t } = useTranslation();
  const [anchorel, setAnchorel] = useState(null);

  const excludedColumns = [
    "_id",
    "projectId",
    "description",
    "color",
    "project",
    "__v",
  ];

  // LocalStorage
  const getStoredVisibleColumns = () => {
    const storedColumns = localStorage.getItem('visibleColumns');
    return storedColumns ? JSON.parse(storedColumns) : [];
  };

  const [visibleColumns, setVisibleColumns] = useState(() => {
    const storedColumns = getStoredVisibleColumns();
    return storedColumns.length > 0 ? storedColumns : [
      'taskName',
      //'category',
      //'tags',
      'personInCharge',
      'status',
      //'priority',
      //'difficultyLevel',
      'startDate',
      'endDate',
      'actualStartDate',
      'actualEndDate',
      //"createdDate",
      //"updatedDate",
      //"attachments",
      "duration",
      "manDay"
    ];
  });

  const handleColumnToggle = (columnName) => {
    if (visibleColumns.includes(columnName)) {
      setVisibleColumns(visibleColumns.filter((col) => col !== columnName));
    } else {
      setVisibleColumns([...visibleColumns, columnName]);
    }
  };

  const handleShowAll = () => {
    const columnNames = tasksWithDuration && tasksWithDuration?.length > 0 ? Object.keys(tasksWithDuration[0]) : [];
    const filteredColumnNames = columnNames.filter((columnName) => !excludedColumns.includes(columnName));
    setVisibleColumns(filteredColumnNames);
    storeVisibleColumns(filteredColumnNames);
  };

  const handleHideAll = () => {
    setVisibleColumns([]);
    storeVisibleColumns([]);
  };

  const handleMenuOpen = (event) => {
    setAnchorel(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorel(null);
  };

  const isColumnVisible = (columnName) => {
    return visibleColumns.includes(columnName);
  };


  // LocalStorage
  const storeVisibleColumns = (columns) => {
    localStorage.setItem('visibleColumns', JSON.stringify(columns));
  };

  useEffect(() => {
    const storedColumns = getStoredVisibleColumns();
    setVisibleColumns(storedColumns);
  }, []);

  useEffect(() => {
    storeVisibleColumns(visibleColumns);
  }, [visibleColumns]);

  
  const columnNames = Object.keys(tasksWithDuration?.[0] ?? {});
  const filteredColumnNames = columnNames.filter((columnName) => !excludedColumns.includes(columnName));

  const renderTableHeader = () => {
    if (!tasksWithDuration || tasksWithDuration?.length === 0)
      return null;
      
    return (
      <TableRow style={{ whiteSpace: 'nowrap' }}>
        {filteredColumnNames.map((columnName) => {
          if (isColumnVisible(columnName)) {
            return (
              <TableCell key={columnName} sx={{ pt: 1.03, pb: 1.03 }}>
                {t(columnName)}
              </TableCell>
            );
          } else {
            return null;
          }
        })}
      </TableRow>
    );
  };

  if (isLoading) {
    return (
      <TableContainer sx={{ m: 1 }}>
        <Table
          size="small"
          //stickyHeader
          sx={{
            "& .MuiTableRow-root:hover": {
              backgroundColor: theme.palette.action.hover
            }
          }}
        >
          <TableHead>
            <TableRow>
              {filteredColumnNames.map((columnName) => (
                <TableCell key={columnName}>
                  <Skeleton width={100} />
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {[...Array(5)].map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {filteredColumnNames.map((columnName, colIndex) => (
                  <TableCell key={colIndex}>
                    <Skeleton
                      variant={columnName === 'tags' || columnName === 'status' || columnName === 'priority' || columnName === 'difficultyLevel' ? 'rounded' : 'text'}
                      width={columnName === 'tags' || columnName === 'status' || columnName === 'priority' || columnName === 'difficultyLevel' ? 60 : 100}
                      height={columnName === 'tags' || columnName === 'status' || columnName === 'priority' || columnName === 'difficultyLevel' ? 24 : undefined}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  const renderTasks = () => {
    if (!tasksWithDuration || tasksWithDuration?.length === 0)
      return null;

    // Sort tasks by startDate
    const sortedTasks = tasksWithDuration.sort((a, b) => {
      const startDateA = a.startDate ? dayjs(a.startDate) : null;
      const startDateB = b.startDate ? dayjs(b.startDate) : null;

      if (startDateA && startDateB) {
        return startDateA.diff(startDateB);
      } else if (startDateA) {
        return -1;
      } else if (startDateB) {
        return 1;
      } else {
        return 0;
      }
    });

    return sortedTasks.map((task, index) => (
      <TableRow key={index} style={{ whiteSpace: 'nowrap' }} hover>
        {filteredColumnNames.map((columnName) => {
          const value = task[columnName];
    
          if (excludedColumns.includes(columnName) || !isColumnVisible(columnName))
            return null;

          if (columnName === 'tags') {
            return (
              value ? (
                <TableCell key={columnName}>
                  <TagChip tags={value} />
                </TableCell>
              ) : <TableCell key={columnName}>{value}</TableCell>
            );
          }
          else if (columnName === 'personInCharge') {
            return (
              <TableCell
                key={columnName}
                sx={{
                  borderTop: '1px solid #e6e4e4',
                  borderBottom: '1px solid #e6e4e4',
                }}
              >
                {task.personInCharge
                  ? task.personInCharge.map((person) => {
                    return `${person?.firstName} ${person?.lastName}` || '';
                  }).join(t('comma'))
                  : ''}
              </TableCell>
            );
          }
          else if (columnName === 'startDate' || columnName === 'endDate') {
            return (
              <TableCell
                key={columnName}
                sx={{
                  borderTop: '1px solid #e6e4e4',
                  borderBottom: '1px solid #e6e4e4',
                }}
              >
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    format="YYYY-MM-DD"
                    value={value ? dayjs(value) : null}
                    onChange={(date) => {
                      if (dayjs(date).isValid() && date > 1900) {
                        onTaskDateChange({ ...task, [columnName]: date });
                      } else {
                        // Use original value instead
                        onTaskDateChange({ ...task, [columnName]: value });
                      }
                    }}
                    sx={{ width: '150px' }}
                    slotProps={{
                      textField: { fullWidth: true, size: 'small' },
                      actionBar: { actions: ["clear", "today"] }
                    }}
                  />
                </LocalizationProvider>
              </TableCell>
            );
          }
          else if (columnName === 'actualStartDate' || columnName === 'actualEndDate') {
            return (
              <TableCell
                key={columnName}
                sx={{
                  borderTop: '1px solid #e6e4e4',
                  borderBottom: '1px solid #e6e4e4',
                }}
              >
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    format="YYYY-MM-DD"
                    value={value ? dayjs(value) : null}
                    /*onChange={(date) => {
                      if (dayjs(date).isValid() && date > 1900) {
                        onTaskDateChange({ ...task, [columnName]: date });
                      } else {
                        // Use original value instead
                        onTaskDateChange({ ...task, [columnName]: value });
                      }
                    }}*/
                    sx={{ width: '150px' }}
                    slotProps={{
                      textField: { fullWidth: true, size: 'small' },
                      actionBar: { actions: ["clear", "today"] }
                    }}
                  />
                </LocalizationProvider>
              </TableCell>
            );
          } else if (columnName === 'status') {
            return (
              value ? (
                <TableCell key={columnName}>
                  <StatusChip status={value} />
                </TableCell>
              ) : <TableCell key={columnName}>{value}</TableCell>
            );
          } else if (columnName === 'priority') {
            return (
              value ? (
                <TableCell key={columnName}>
                  <PriorityChip priority={t(capitalizeWordsExceptFirst(value))} />
                </TableCell>
              ) : <TableCell key={columnName}>{value}</TableCell>
            );
          } else if (columnName === 'difficultyLevel') {
            return (
              value ? (
                <TableCell key={columnName}>
                  <DifficultyLevelChip mode="icon" difficultyLevel={t(capitalizeWordsExceptFirst(value))} />
                </TableCell>
              ) : <TableCell key={columnName}>{value}</TableCell>
            );
          } else if (columnName === 'createdDate' || columnName === 'updatedDate') {
            return (
              <TableCell key={columnName}>
                {formatDate(value)}
              </TableCell>
            );
          } if (columnName === 'duration') {
            return (
              <TableCell key={columnName}>
                <TextField
                  type="number"
                  size="small"
                  value={value}
                  onChange={(event) => handleDurationChange(task, parseInt(event.target.value))}
                  style={{ width:"80px" }}
                />
              </TableCell>
            );
          } /*if (columnName === 'manDay') {
            return (
              <TableCell key={columnName}>
                <TextField
                  type="number"
                  size="small"
                  value={value}
                  onChange={(event) => handleManDayChange(task, parseInt(event.target.value))}
                  style={{ width:"80px" }}
                />
              </TableCell>
            );
          }*/ else {
            return (
              <TableCell key={columnName}>
                {value}
              </TableCell>
            );
          }
        })}
      </TableRow>
    ));
  };

  return (
    <>
      <div>
        <Button
          size="small"
          startIcon={<ViewColumnIcon />}
          sx={{ ml: '1rem' }}
          onClick={handleMenuOpen}
        >
          {t('columns')}
        </Button>

        <Menu
          anchorEl={anchorel}
          open={Boolean(anchorel)}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          size="small"
        >
          {tasksWithDuration && tasksWithDuration?.length > 0 && Object.keys(tasksWithDuration[0]).map((columnName) => {
            if (excludedColumns.includes(columnName))
              return null;
            return (
              <MenuItem key={columnName} dense>
                <FormControlLabel
                  control={
                    <Switch
                      size="small"
                      checked={isColumnVisible(columnName)}
                      onChange={() => handleColumnToggle(columnName)}
                    />
                  }
                  label={<Typography variant="body2">{t(columnName)}</Typography>}
                />
              </MenuItem>
            );
          })}

          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0 5px' }}>
            <Button onClick={handleShowAll}>
              {<Typography variant="body2">{t('showAll')}</Typography>}
            </Button>
            <Button onClick={handleHideAll}>
              {<Typography variant="body2">{t('hideAll')}</Typography>}
            </Button>
          </div>
        </Menu>
      </div>
      
      <TableContainer sx={{ m: 1 }}>
        <Table size="small">
          <TableHead>{renderTableHeader()}</TableHead>
          <TableBody>{renderTasks()}</TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default TaskGanttChartTable;