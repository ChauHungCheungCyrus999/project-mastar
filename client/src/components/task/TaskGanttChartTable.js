import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Skeleton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Switch, Button, Chip, TextField,
  Menu, MenuItem,
  FormControlLabel,
  Typography,
  IconButton,
  Box,
} from '@mui/material';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

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

  // Milestone collapse/expand state
  const [collapsedMilestones, setCollapsedMilestones] = useState(new Set());

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
    "attachments",
    "color",
    "project",
    "createdBy",
    "createdDate",
    "updatedBy",
    "updatedDate",
    "comments",
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
    setVisibleColumns(sortedFilteredColumnNames);
    storeVisibleColumns(sortedFilteredColumnNames);
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

  
  const columnNames = Array.from(new Set(tasksWithDuration.flatMap(task => Object.keys(task))));
  const filteredColumnNames = columnNames.filter((columnName) => !excludedColumns.includes(columnName));

  // Preferred order for columns in menu and table
  const preferredOrder = ['taskName', 'category', 'personInCharge', 'status', 'priority', 'difficultyLevel', 'startDate', 'endDate', 'actualStartDate', 'actualEndDate', 'milestone', 'subtasks', 'tags'];
  const sortedFilteredColumnNames = preferredOrder.filter(col => filteredColumnNames.includes(col)).concat(filteredColumnNames.filter(col => !preferredOrder.includes(col)));

  // Renders the table header with visible columns
  const renderTableHeader = () => {
    if (!tasksWithDuration || tasksWithDuration?.length === 0)
      return null;

    return (
      <TableRow style={{ whiteSpace: 'nowrap' }}>
        {sortedFilteredColumnNames.map((columnName) => {
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
              {sortedFilteredColumnNames.map((columnName) => (
                <TableCell key={columnName}>
                  <Skeleton width={100} />
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {[...Array(5)].map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {sortedFilteredColumnNames.map((columnName, colIndex) => (
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

    // Group tasks by milestone
    const groupedByMilestone = {};
    sortedTasks.forEach(task => {
      const milestoneKey = task.milestone?._id || task.milestone?.title || task.milestone?.name || 'no-milestone';
      const milestoneName = task.milestone?.title || task.milestone?.name || (t('noMilestone') || 'No Milestone');
      
      if (!groupedByMilestone[milestoneKey]) {
        groupedByMilestone[milestoneKey] = {
          milestoneName: milestoneName,
          tasks: []
        };
      }
      groupedByMilestone[milestoneKey].tasks.push(task);
    });

    // Create flattened array with milestone headers and tasks
    const flattenedRows = [];
    Object.entries(groupedByMilestone).forEach(([milestoneKey, group]) => {
      // Calculate total duration for this milestone (in days)
      const totalDuration = group.tasks.reduce((sum, task) => {
        if (task.startDate && task.endDate) {
          const duration = differenceInDays(new Date(task.endDate), new Date(task.startDate)) + 1;
          return sum + duration;
        }
        return sum;
      }, 0);

      // Calculate total man-days for this milestone
      const totalManDays = group.tasks.reduce((sum, task) => {
        if (task.startDate && task.endDate) {
          const manDay = calculateManDay(task.startDate, task.endDate, holidays);
          return sum + manDay;
        }
        return sum;
      }, 0);

      // Add milestone header row
      flattenedRows.push({
        isMilestoneHeader: true,
        milestoneKey: milestoneKey,
        milestoneName: group.milestoneName,
        taskCount: group.tasks.length,
        totalDuration: totalDuration,
        totalManDays: totalManDays
      });
      
      // Add all tasks for this milestone only if not collapsed
      if (!collapsedMilestones.has(milestoneKey)) {
        flattenedRows.push(...group.tasks);
      }
    });

    // Pagination logic
    const totalItems = flattenedRows.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = flattenedRows.slice(startIndex, endIndex);

    return currentItems.map((item, index) => {
      // Render milestone header row
      if (item.isMilestoneHeader) {
        const isCollapsed = collapsedMilestones.has(item.milestoneKey);
        
        const toggleMilestone = () => {
          setCollapsedMilestones(prev => {
            const newSet = new Set(prev);
            if (newSet.has(item.milestoneKey)) {
              newSet.delete(item.milestoneKey);
            } else {
              newSet.add(item.milestoneKey);
            }
            return newSet;
          });
        };

        return (
          <TableRow 
            key={`milestone-${startIndex + index}`}
            sx={{
              backgroundColor: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
                cursor: 'pointer',
              }
            }}
            onClick={toggleMilestone}
          >
            <TableCell 
              colSpan={sortedFilteredColumnNames.filter(col => isColumnVisible(col)).length}
              sx={{
                fontWeight: 700,
                fontSize: '1rem',
                color: theme.palette.primary.contrastText,
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: isCollapsed ? 'rotate(0deg)' : 'rotate(90deg)',
                }}
              >
                <ChevronRightIcon />
              </Box>
              {item.milestoneName} ({item.taskCount} {item.taskCount === 1 ? (t('task') || 'task') : (t('tasks') || 'tasks')}) - {t('totalDuration') || 'Total Duration'}: {item.totalDuration} {item.totalDuration === 1 ? (t('day') || 'day') : (t('days') || 'days')} | {t('totalManDays') || 'Total Man-days'}: {item.totalManDays} {item.totalManDays === 1 ? (t('day') || 'day') : (t('days') || 'days')}
            </TableCell>
          </TableRow>
        );
      }

      // Render task row
      const task = item;
      return (
        <TableRow key={startIndex + index} style={{ whiteSpace: 'nowrap' }} hover>
          {sortedFilteredColumnNames.map((columnName) => {
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
          } else if (columnName === 'project') {
            return (
              <TableCell key={columnName}>
                {value?.title || value?.name || ''}
              </TableCell>
            );
          } else if (columnName === 'createdBy' || columnName === 'updatedBy') {
            return (
              <TableCell key={columnName}>
                {value?.firstName && value?.lastName ? `${value.firstName} ${value.lastName}` : value?.username || ''}
              </TableCell>
            );
          } else if (columnName === 'milestone') {
            return (
              <TableCell key={columnName}>
                {value?.title || value?.name || ''}
              </TableCell>
            );
          } else if (columnName === 'attachments' || columnName === 'subtasks' || columnName === 'comments') {
            return (
              <TableCell key={columnName}>
                {Array.isArray(value) ? value.length : 0}
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
                {typeof value === 'object' ? JSON.stringify(value) : value}
              </TableCell>
            );
          }
        })}
      </TableRow>
      );
    });
  };

  return (
    <>
      {/* Column Visibility Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<ViewColumnIcon />}
          onClick={handleMenuOpen}
          size="small"
        >
          {t('columnVisibility') || 'Column Visibility'}
        </Button>
      </Box>

      {/* Column Visibility Menu */}
      <Menu
        anchorEl={anchorel}
        open={Boolean(anchorel)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        TransitionProps={{
          timeout: {
            enter: 400,
            exit: 300,
          },
        }}
        slotProps={{
          paper: {
            sx: {
              maxHeight: '400px',
              overflow: 'auto',
              '&.MuiPaper-root': {
                transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease-in-out',
              },
              // Smooth scroll behavior for menu content
              scrollBehavior: 'smooth',
              // Custom scrollbar styling
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#888',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: '#555',
              },
            },
          },
        }}
      >
        <MenuItem onClick={handleShowAll} dense>
          <Typography variant="body2">{t('showAll') || 'Show All'}</Typography>
        </MenuItem>
        <MenuItem onClick={handleHideAll} dense>
          <Typography variant="body2">{t('hideAll') || 'Hide All'}</Typography>
        </MenuItem>
        {sortedFilteredColumnNames.map((columnName) => (
          <MenuItem key={columnName} dense>
            <FormControlLabel
              control={
                <Switch
                  checked={isColumnVisible(columnName)}
                  onChange={() => handleColumnToggle(columnName)}
                  size="small"
                />
              }
              label={<Typography variant="body2">{t(columnName)}</Typography>}
            />
          </MenuItem>
        ))}
      </Menu>

      {/* Table Container */}
      <TableContainer sx={{ m: 1, maxHeight: '600px', overflow: 'auto' }}>
        <Table
          size="small"
          stickyHeader
          sx={{
            "& .MuiTableRow-root:hover": {
              backgroundColor: theme.palette.action.hover
            }
          }}
        >
          <TableHead>{renderTableHeader()}</TableHead>
          <TableBody>{renderTasks()}</TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default TaskGanttChartTable;