import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Grid, Box, Typography, Button, ButtonGroup, Paper, Tooltip, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import CAlert from '../custom/CAlert';
import TaskGanttChartTable from "./TaskGanttChartTable";
import { TaskGanttChartViewSwitcher } from "./TaskGanttChartViewSwitcher";
import TaskEditForm from "./TaskEditForm";
import ConfirmDeleteDialog from '../custom/ConfirmDeleteDialog';

import {
  handleCloseEditForm,
  handleEdit, handleSaveTask, handleDuplicate,
  handleDelete, confirmDelete, cancelDelete
} from '../../utils/TaskUtils.js';
import { formatToIsoDate } from '../../utils/DateUtils.js';
import { useTranslation } from 'react-i18next';

const TaskGanttChart = ({ project, tasks, setTasks }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const alertRef = useRef();

  // Date Mode
  const [dateMode, setDateMode] = useState('estimated');
  const [dateGranularity, setDateGranularity] = useState('month');
  const [isChecked, setIsChecked] = useState(true);

  // Update
  const [editedTask, setEditedTask] = useState(null);
  const [isEditFormOpen, setEditFormOpen] = useState(false);

  // Delete
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [openConfirmDeleteDialog, setOpenConfirmDeleteDialog] = useState(false);

  const handleCloseForm = () => {
    handleCloseEditForm(setEditedTask, setEditFormOpen);
  };

  const onEdit = (taskId) => {
    handleEdit(taskId, 'update', tasks, () => {}, setEditedTask, setEditFormOpen);
  };

  const onSaveTask = (updatedTask) => {
    handleSaveTask(updatedTask, tasks, setTasks);
  };

  const onDeleteClick = (taskId) => {
    handleDelete(taskId, setOpenConfirmDeleteDialog, setTaskToDelete);
  };

  const onConfirmDelete = () => {
    confirmDelete(taskToDelete, setTasks, setOpenConfirmDeleteDialog)
      .then(() => {
        alertRef.current.displayAlert('success', t('deleteSuccess'));
      })
      .catch((error) => {
        console.error('Error deleting task:', error.message);
        alertRef.current.displayAlert('error', t('deleteFail'));
      });
  };

  const onCancelDelete = () => {
    cancelDelete(setOpenConfirmDeleteDialog);
  };

  const handleTaskDateChange = (updatedTask) => {
    const updatedTasks = tasks?.map((task) =>
      task._id === updatedTask._id ? {
        ...task,
        startDate: updatedTask.startDate,
        endDate: updatedTask.endDate,
        actualStartDate: updatedTask.actualStartDate,
        actualEndDate: updatedTask.actualEndDate,
        updatedDate: new Date().toISOString()
      } : task
    );
    setTasks(updatedTasks);
  };

  // Custom Gantt Chart Logic
  const ganttData = useMemo(() => {
    const validTasks = tasks?.filter(task => {
      const start = dateMode === 'estimated' ? task.startDate : task.actualStartDate;
      const end = dateMode === 'estimated' ? task.endDate : task.actualEndDate;
      return start && end;
    }) || [];

    if (validTasks.length === 0) return null;

    // Find date range
    const dates = validTasks.flatMap(task => {
      const start = dateMode === 'estimated' ? task.startDate : task.actualStartDate;
      const end = dateMode === 'estimated' ? task.endDate : task.actualEndDate;
      return [new Date(start), new Date(end)];
    });

    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));
    
    // Add padding
    minDate.setDate(minDate.getDate() - 7);
    maxDate.setDate(maxDate.getDate() + 7);

    const totalDays = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24));

    return {
      tasks: validTasks
        .map(task => {
          const start = new Date(dateMode === 'estimated' ? task.startDate : task.actualStartDate);
          const end = new Date(dateMode === 'estimated' ? task.endDate : task.actualEndDate);
          const startOffset = Math.ceil((start - minDate) / (1000 * 60 * 60 * 24));
          const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
          
          return {
            ...task,
            startOffset,
            duration,
            start,
            end
          };
        })
        .sort((a, b) => a.start - b.start),
      minDate,
      maxDate,
      totalDays
    };
  }, [tasks, dateMode, dateGranularity]);

  // Generate date headers based on granularity
  const generateDateHeaders = () => {
    if (!ganttData) return [];
    
    if (dateGranularity === 'year') {
      return generateYearHeaders();
    } else if (dateGranularity === 'day') {
      return generateDayHeaders();
    } else {
      return generateMonthHeaders();
    }
  };

  // Generate year headers
  const generateYearHeaders = () => {
    if (!ganttData) return [];
    
    const years = [];
    const current = new Date(ganttData.minDate);
    const end = new Date(ganttData.maxDate);
    
    while (current <= end) {
      const yearStart = new Date(current.getFullYear(), 0, 1);
      const yearEnd = new Date(current.getFullYear(), 11, 31);
      const displayEnd = yearEnd > end ? end : yearEnd;
      
      const daysInView = Math.ceil((displayEnd - (current > yearStart ? current : yearStart)) / (1000 * 60 * 60 * 24)) + 1;
      
      years.push({
        label: current.getFullYear().toString(),
        days: daysInView
      });
      
      current.setFullYear(current.getFullYear() + 1);
      current.setMonth(0);
      current.setDate(1);
    }
    
    return years;
  };

  // Generate day headers
  const generateDayHeaders = () => {
    if (!ganttData) return [];
    
    const days = [];
    const current = new Date(ganttData.minDate);
    const end = new Date(ganttData.maxDate);
    
    while (current <= end) {
      days.push({
        month: current.toLocaleString('en-US', { month: 'short' }),
        day: current.getDate().toString(),
        days: 1
      });
      
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  // Generate month headers
  const generateMonthHeaders = () => {
    if (!ganttData) return [];
    
    const months = [];
    const current = new Date(ganttData.minDate);
    const end = new Date(ganttData.maxDate);
    
    while (current <= end) {
      const monthStart = new Date(current);
      const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);
      const displayEnd = monthEnd > end ? end : monthEnd;
      
      const daysInView = Math.ceil((displayEnd - monthStart) / (1000 * 60 * 60 * 24)) + 1;
      
      months.push({
        month: current.toLocaleString('en-US', { month: 'short' }),
        year: current.getFullYear().toString(),
        days: daysInView
      });
      
      current.setMonth(current.getMonth() + 1);
      current.setDate(1);
    }
    
    return months;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Done': return theme.palette.success.main;
      case 'In Progress': return theme.palette.info.main;
      case 'Under Review': return theme.palette.warning.main;
      case 'To Do': return theme.palette.grey[400];
      case 'On Hold': return theme.palette.warning.light;
      case 'Cancelled': return theme.palette.error.light;
      default: return theme.palette.grey[300];
    }
  };

  return (
    <>
      {tasks?.length > 0 ? (
        <>
          <Grid container spacing={2}>
            {/* Custom Gantt Chart */}
            {ganttData && (
              <Grid item xs={12}>
                <Paper sx={{ p: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, gap: 2 }}>
                    <Typography variant="h6">
                      {t('ganttChart')}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {/* Granularity Toggle */}
                      <ToggleButtonGroup
                        value={dateGranularity}
                        exclusive
                        onChange={(event, newGranularity) => {
                          if (newGranularity !== null) {
                            setDateGranularity(newGranularity);
                          }
                        }}
                        size="small"
                        sx={{
                          backgroundColor: theme.palette.background.paper,
                          '& .MuiToggleButton-root': {
                            px: 1.5,
                            py: 0.5,
                            textTransform: 'none',
                            fontWeight: 500,
                            fontSize: '0.875rem',
                            border: `1px solid ${theme.palette.divider}`,
                            '&.Mui-selected': {
                              backgroundColor: theme.palette.secondary.main,
                              color: theme.palette.secondary.contrastText,
                              '&:hover': {
                                backgroundColor: theme.palette.secondary.dark
                              }
                            }
                          }
                        }}
                      >
                        <ToggleButton value="year">📅 {t('year')}</ToggleButton>
                        <ToggleButton value="month">📆 {t('month')}</ToggleButton>
                        <ToggleButton value="day">📋 {t('day')}</ToggleButton>
                      </ToggleButtonGroup>

                      {/* Date Mode Toggle */}
                      <ToggleButtonGroup
                        value={dateMode}
                        exclusive
                        onChange={(event, newMode) => {
                          if (newMode !== null) {
                            setDateMode(newMode);
                          }
                        }}
                        size="small"
                        sx={{
                          backgroundColor: theme.palette.background.paper,
                          '& .MuiToggleButton-root': {
                            px: 2,
                            py: 0.5,
                            textTransform: 'none',
                            fontWeight: 500,
                            border: `1px solid ${theme.palette.divider}`,
                            '&.Mui-selected': {
                              backgroundColor: theme.palette.primary.main,
                              color: theme.palette.primary.contrastText,
                              '&:hover': {
                                backgroundColor: theme.palette.primary.dark
                              }
                            }
                          }
                        }}
                      >
                        <ToggleButton value="estimated">
                          📅 {t('estimated')}
                        </ToggleButton>
                        <ToggleButton value="actual">
                          ⏱️ {t('actual')}
                        </ToggleButton>
                      </ToggleButtonGroup>
                    </Box>
                  </Box>
                  
                  {/* Scrollable Gantt Content */}
                  <Box sx={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '600px' }}>
                    <Box sx={{ minWidth: 'max-content' }}>
                      {/* Month Headers */}
                      <Box sx={{ display: 'flex', borderBottom: `2px solid ${theme.palette.divider}`, mb: 1 }}>
                        <Box sx={{ width: '250px', flexShrink: 0, fontWeight: 'bold', p: 1, position: 'sticky', left: 0, backgroundColor: theme.palette.background.paper, zIndex: 2 }}>
                          {t('taskName')}
                        </Box>
                        <Box sx={{ display: 'flex', flex: 1, minWidth: '1200px' }}>
                      {generateDateHeaders().map((header, idx) => {
                        const isMonthView = dateGranularity === 'month';
                        const isDayView = dateGranularity === 'day';
                        
                        return (
                        <Box
                          key={idx}
                          sx={{
                            flex: header.days,
                            textAlign: 'center',
                            borderLeft: `1px solid ${theme.palette.divider}`,
                            p: 1,
                            fontWeight: 'bold',
                            fontSize: '0.875rem',
                            backgroundColor: theme.palette.grey[50],
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center'
                          }}
                        >
                          {isMonthView && (
                            <>
                              <div>{header.month}</div>
                              <div style={{ fontSize: '0.75rem', color: '#666' }}>{header.year}</div>
                            </>
                          )}
                          {isDayView && (
                            <>
                              <div>{header.month}</div>
                              <div style={{ fontSize: '0.75rem', color: '#666' }}>{header.day}</div>
                            </>
                          )}
                          {!isMonthView && !isDayView && (
                            <div>{header.label}</div>
                          )}
                        </Box>
                        );
                      })}
                    </Box>
                  </Box>

                  {/* Task Rows */}
                  {ganttData.tasks.map((task, idx) => (
                    <Box
                      key={task._id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        '&:hover': { backgroundColor: theme.palette.action.hover },
                        cursor: 'pointer',
                        minHeight: '40px'
                      }}
                      onClick={() => onEdit(task._id)}
                    >
                      {/* Task Name */}
                      <Box
                        sx={{
                          width: '250px',
                          flexShrink: 0,
                          p: 1,
                          fontSize: '0.875rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          position: 'sticky',
                          left: 0,
                          backgroundColor: theme.palette.background.paper,
                          zIndex: 1
                        }}
                      >
                        <Tooltip title={task.taskName}>
                          <span>{task.taskName}</span>
                        </Tooltip>
                      </Box>

                      {/* Timeline */}
                      <Box sx={{ position: 'relative', flex: 1, height: '40px', display: 'flex', alignItems: 'center', minWidth: '1200px' }}>
                        <Box
                          sx={{
                            position: 'absolute',
                            left: `${(task.startOffset / ganttData.totalDays) * 100}%`,
                            width: `${(task.duration / ganttData.totalDays) * 100}%`,
                            height: '24px',
                            backgroundColor: getStatusColor(task.status),
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            color: 'white',
                            fontWeight: 500,
                            boxShadow: 1,
                            minWidth: '2px'
                          }}
                        >
                          <Tooltip title={`${task.start.toLocaleDateString()} - ${task.end.toLocaleDateString()}`}>
                            <span style={{ padding: '0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {task.duration}d
                            </span>
                          </Tooltip>
                        </Box>
                      </Box>
                    </Box>
                  ))}
                    </Box>
                  </Box>

                  <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                    {t('ganttChartNotice')}
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>

          {isEditFormOpen && (
            <TaskEditForm
              taskId={editedTask._id}
              setTasks={setTasks}
              mode="update"
              open={isEditFormOpen}
              handleClose={handleCloseForm}
              handleSave={onSaveTask}
              setTaskToDelete={setTaskToDelete}
              setOpenConfirmDeleteDialog={setOpenConfirmDeleteDialog}
            />
          )}

          <ConfirmDeleteDialog
            title={t('deleteTask')}
            content={t('deleteTaskConfirm')}
            open={openConfirmDeleteDialog}
            onCancel={onCancelDelete}
            onConfirm={onConfirmDelete}
          />
        </>
      ) : (
        <Typography style={{ color: 'red' }}>
          {t('noStartEndDateForAnyTasks')}
        </Typography>
      )}

      <CAlert ref={alertRef} />
    </>
  );
};

export default TaskGanttChart;