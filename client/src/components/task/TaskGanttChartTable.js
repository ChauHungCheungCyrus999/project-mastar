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

// Component for displaying tasks in a Gantt chart table with editable dates and column visibility
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

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Reset to first page when tasks change
  useEffect(() => {
    setCurrentPage(1);
  }, [tasks]);

  // Calculates the number of working days (man-days) between start and end dates, excluding weekends and holidays
  const calculateManDay = (startDate, endDate, holidays) => {
    if (!startDate || !endDate) return 0;
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

  // Checks if a given date is a holiday by comparing its formatted date to the holidays array
  const isHoliday = (date, holidays) => {
    const formattedDate = date.toISOString().substring(0, 10);
    return holidays.includes(formattedDate);
  };

  // Fetches holidays for Hong Kong within the date range of all tasks
  useEffect(() => {
    const hd = new DateHolidays.default();
    hd.init('HK');
    
    if (tasks && tasks.length > 0) {
      // Filter tasks with valid dates
      const validTasks = tasks.filter(task => task.startDate && task.endDate && !isNaN(new Date(task.startDate).getTime()) && !isNaN(new Date(task.endDate).getTime()));
      
      if (validTasks.length === 0) {
        setHolidays([]);
        return;
      }

      // Get the largest start date and end date from the valid tasks
      let maxStartDate = new Date(validTasks[0].startDate);
      let maxEndDate = new Date(validTasks[0].endDate);

      for (let i = 1; i < validTasks.length; i++) {
        const startDate = new Date(validTasks[i].startDate);
        const endDate = new Date(validTasks[i].endDate);

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
    } else {
      setHolidays([]);
    }
  }, [tasks]);

  // Add "Duration" and "Man-day" column
  /*
  const tasksWithDuration = tasks
    .map(task => {
      const start = dateMode === 'estimated' ? task.startDate : task.actualStartDate;
      const end = dateMode === 'estimated' ? task.endDate : task.actualEndDate;
      return {
        ...task,
        duration: start && end ? differenceInDays(new Date(end), new Date(start)) : 0,
        manDay: start && end ? calculateManDay(start, end, holidays) : 0
      };
    });
  */
  const tasksWithDuration = tasks;

  // Updates the task's end date based on a new duration value (total days)
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

  // Updates the task's end date based on a new man-day value (working days)
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

  // Handles changes to the duration field and updates the task's end date
  const handleDurationChange = (task, duration) => {
    const updatedTask = updateEndDateByDuration(task, duration);
    onTaskDateChange(updatedTask);
  };

  // Handles changes to the man-day field and updates the task's end date
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

  // Retrieves stored visible columns from localStorage
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

  // Toggles the visibility of a column in the table
  const handleColumnToggle = (columnName) => {
    if (visibleColumns.includes(columnName)) {
      setVisibleColumns(visibleColumns.filter((col) => col !== columnName));
    } else {
      setVisibleColumns([...visibleColumns, columnName]);
    }
  };

  // Shows all available columns in the table
  const handleShowAll = () => {
    const columnNames = tasksWithDuration && tasksWithDuration?.length > 0 ? Object.keys(tasksWithDuration[0]) : [];
    const filteredColumnNames = columnNames.filter((columnName) => !excludedColumns.includes(columnName));
    setVisibleColumns(filteredColumnNames);
    storeVisibleColumns(filteredColumnNames);
  };

  // Hides all columns in the table
  const handleHideAll = () => {
    setVisibleColumns([]);
    storeVisibleColumns([]);
  };

  // Opens the column visibility menu
  const handleMenuOpen = (event) => {
    setAnchorel(event.currentTarget);
  };

  // Closes the column visibility menu
  const handleMenuClose = () => {
    setAnchorel(null);
  };

  // Checks if a column is currently visible
  const isColumnVisible = (columnName) => {
    return visibleColumns.includes(columnName);
  };


  // LocalStorage
  const storeVisibleColumns = (columns) => {
    localStorage.setItem('visibleColumns', JSON.stringify(columns));
  };

  // Loads stored visible columns on component mount
  useEffect(() => {
    const storedColumns = getStoredVisibleColumns();
    setVisibleColumns(storedColumns);
  }, []);

  // Stores visible columns whenever they change
  useEffect(() => {
    storeVisibleColumns(visibleColumns);
  }, [visibleColumns]);

  
  const columnNames = Object.keys(tasksWithDuration?.[0] ?? {});
  const filteredColumnNames = columnNames.filter((columnName) => !excludedColumns.includes(columnName));

  // Renders the table header with visible columns
  const renderTableHeader = () => {
    if (!tasksWithDuration || tasksWithDuration?.length === 0)
      return null;

    return (
      <TableRow style={{ whiteSpace: 'nowrap' }}>
        {filteredColumnNames.map((columnName) => {
          if (isColumnVisible(columnName)) {
            return (
              <TableCell
                key={columnName}
                sx={{
                  pt: 2,
                  pb: 2,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: theme.palette.text.primary,
                  backgroundColor: theme.palette.grey[100],
                  borderBottom: `2px solid ${theme.palette.primary.main}`,
                  position: 'sticky',
                  top: 0,
                  zIndex: 1
                }}
              >
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

  // Renders the table rows for each task with pagination
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

    // Pagination logic
    const totalTasks = sortedTasks.length;
    const totalPages = Math.ceil(totalTasks / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentTasks = sortedTasks.slice(startIndex, endIndex);

    return currentTasks.map((task, index) => (
      <TableRow key={startIndex + index} style={{ whiteSpace: 'nowrap' }} hover>
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
          if (columnName === 'personInCharge') {
            return (
              <TableCell
                key={columnName}
                sx={{
                  borderTop: '1px solid #e6e4e4',
                  borderBottom: '1px solid #e6e4e4',
                  maxWidth: '180px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
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
                  padding: '4px 8px',
                  minWidth: '140px'
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
                    sx={{
                      width: '120px',
                      '& .MuiInputBase-root': {
                        height: '32px',
                        fontSize: '0.75rem'
                      },
                      '& .MuiInputBase-input': {
                        padding: '4px 8px'
                      }
                    }}
                    slotProps={{
                      textField: {
                        size: 'small',
                        sx: {
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '4px'
                          }
                        }
                      },
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
                  padding: '4px 8px',
                  minWidth: '140px'
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
                    sx={{
                      width: '120px',
                      '& .MuiInputBase-root': {
                        height: '32px',
                        fontSize: '0.75rem'
                      },
                      '& .MuiInputBase-input': {
                        padding: '4px 8px'
                      }
                    }}
                    slotProps={{
                      textField: {
                        size: 'small',
                        sx: {
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '4px'
                          }
                        }
                      },
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
          } else {
            return (
              <TableCell
                key={columnName}
                sx={{
                  maxWidth: '200px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
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
      {/* Column Visibility Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '16px',
        padding: '8px 16px',
        backgroundColor: theme.palette.background.paper,
        borderRadius: '8px',
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <Button
          size="small"
          startIcon={<ViewColumnIcon />}
          variant="outlined"
          sx={{
            borderRadius: '6px',
            textTransform: 'none',
            fontWeight: 500
          }}
          onClick={handleMenuOpen}
        >
          {t('columns')}
        </Button>

        <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
          {visibleColumns.length} of {filteredColumnNames.length} columns visible
        </Typography>
      </div>

      {/* Column Visibility Menu */}
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
        PaperProps={{
          sx: {
            maxHeight: 300,
            width: 250,
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            mt: 1
          }
        }}
      >
        {tasksWithDuration && tasksWithDuration?.length > 0 && Object.keys(tasksWithDuration[0]).map((columnName) => {
          if (excludedColumns.includes(columnName))
            return null;
          return (
            <MenuItem key={columnName} dense sx={{ py: 0.5 }}>
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={isColumnVisible(columnName)}
                    onChange={() => handleColumnToggle(columnName)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: theme.palette.primary.main,
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: theme.palette.primary.main,
                      },
                    }}
                  />
                }
                label={<Typography variant="body2" sx={{ fontSize: '0.875rem' }}>{t(columnName)}</Typography>}
                sx={{ width: '100%', ml: 0 }}
              />
            </MenuItem>
          );
        })}

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          margin: '8px 16px',
          paddingTop: '8px',
          borderTop: `1px solid ${theme.palette.divider}`
        }}>
          <Button
            size="small"
            onClick={handleShowAll}
            sx={{
              textTransform: 'none',
              fontSize: '0.75rem',
              minWidth: 'auto',
              px: 1
            }}
          >
            {t('showAll')}
          </Button>
          <Button
            size="small"
            onClick={handleHideAll}
            sx={{
              textTransform: 'none',
              fontSize: '0.75rem',
              minWidth: 'auto',
              px: 1
            }}
          >
            {t('hideAll')}
          </Button>
        </div>
      </Menu>

      {/* Enhanced Table Container */}
      <TableContainer sx={{
        borderRadius: '8px',
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        backgroundColor: theme.palette.background.paper,
        '& .MuiTable-root': {
          borderCollapse: 'separate',
          borderSpacing: '0',
        }
      }}>
        <Table size="small" sx={{
          '& .MuiTableHead-root': {
            backgroundColor: theme.palette.grey[50],
            '& .MuiTableCell-head': {
              fontWeight: 600,
              fontSize: '0.875rem',
              color: theme.palette.text.primary,
              borderBottom: `2px solid ${theme.palette.divider}`,
              padding: '12px 16px',
              whiteSpace: 'nowrap'
            }
          },
          '& .MuiTableBody-root': {
            '& .MuiTableRow-root': {
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              },
              '& .MuiTableCell-body': {
                padding: '8px 16px',
                borderBottom: `1px solid ${theme.palette.divider}`,
                fontSize: '0.875rem',
                whiteSpace: 'nowrap',
                maxWidth: '200px',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }
            }
          }
        }}>
          <TableHead>{renderTableHeader()}</TableHead>
          <TableBody>{renderTasks()}</TableBody>
        </Table>
      </TableContainer>

      {/* Pagination Controls */}
      {tasksWithDuration && tasksWithDuration.length > itemsPerPage && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '16px',
          padding: '12px 16px',
          backgroundColor: theme.palette.background.paper,
          borderRadius: '8px',
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <Typography variant="body2" color="text.secondary">
            Showing {Math.min((currentPage - 1) * itemsPerPage + 1, tasksWithDuration.length)} to {Math.min(currentPage * itemsPerPage, tasksWithDuration.length)} of {tasksWithDuration.length} tasks
          </Typography>

          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              sx={{
                minWidth: 'auto',
                px: 2,
                textTransform: 'none',
                borderRadius: '6px'
              }}
            >
              Previous
            </Button>

            <Typography variant="body2" sx={{
              display: 'flex',
              alignItems: 'center',
              mx: 1,
              fontWeight: 500
            }}>
              Page {currentPage} of {Math.ceil(tasksWithDuration.length / itemsPerPage)}
            </Typography>

            <Button
              size="small"
              variant="outlined"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(tasksWithDuration.length / itemsPerPage)))}
              disabled={currentPage === Math.ceil(tasksWithDuration.length / itemsPerPage)}
              sx={{
                minWidth: 'auto',
                px: 2,
                textTransform: 'none',
                borderRadius: '6px'
              }}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default TaskGanttChartTable;