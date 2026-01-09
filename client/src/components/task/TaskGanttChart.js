import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Grid, Box, Typography, Button, ButtonGroup, Paper, Tooltip, ToggleButtonGroup, ToggleButton, Collapse } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

import CAlert from '../custom/CAlert';
import TaskGanttChartTable from "./TaskGanttChartTable";
import { TaskGanttChartViewSwitcher } from "./TaskGanttChartViewSwitcher";
import TaskEditForm from "./TaskEditForm";
import TaskPopper from "./TaskPopper";
import ConfirmDeleteDialog from '../custom/ConfirmDeleteDialog';

import {
  handleCloseEditForm,
  handleEdit, handleSaveTask, handleDuplicate,
  handleDelete, confirmDelete, cancelDelete
} from '../../utils/TaskUtils.js';
import { formatToIsoDate } from '../../utils/DateUtils.js';
import { useTranslation } from 'react-i18next';

const TaskGanttChart = ({ project, tasks, setTasks }) => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const alertRef = useRef();

  // Get current locale for date formatting
  const getDateLocale = () => {
    switch (i18n.language) {
      case 'zh-tw':
      case 'zh-hk':
        return 'zh-TW';
      case 'zh-cn':
        return 'zh-CN';
      default:
        return 'en-US';
    }
  };

  // Date Mode
  const [dateMode, setDateMode] = useState('estimated');
  const [dateGranularity, setDateGranularity] = useState('month');
  const [isChecked, setIsChecked] = useState(true);

  // Milestone collapse/expand state
  const [collapsedMilestones, setCollapsedMilestones] = useState(new Set());

  // Update
  const [editedTask, setEditedTask] = useState(null);
  const [isEditFormOpen, setEditFormOpen] = useState(false);

  // Delete
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [openConfirmDeleteDialog, setOpenConfirmDeleteDialog] = useState(false);

  // TaskPopper hover state
  const [hoveredTask, setHoveredTask] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  // Drag and drop state
  const [isDragging, setIsDragging] = useState(false);
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [dragStartX, setDragStartX] = useState(0);
  const [tempPosition, setTempPosition] = useState(null);
  const [hasDragged, setHasDragged] = useState(false); // Track if user actually dragged
  
  // Pending changes state
  const [pendingChanges, setPendingChanges] = useState(new Map());
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleCloseForm = () => {
    handleCloseEditForm(setEditedTask, setEditFormOpen);
  };

  const onEdit = (taskId) => {
    // Get the task with any pending changes applied
    const originalTask = tasks.find(t => t._id === taskId);
    const pendingTask = pendingChanges.get(taskId);
    const taskToEdit = pendingTask || originalTask;
    
    handleEdit(taskId, 'update', [taskToEdit], () => {}, setEditedTask, setEditFormOpen);
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

  const handleTaskMouseEnter = (task, event) => {
    setHoveredTask(task);
    setAnchorEl(event.currentTarget);
  };

  const handleTaskMouseLeave = () => {
    setHoveredTask(null);
    setAnchorEl(null);
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

  // Drag and drop handlers
  const handleMouseDown = (task, event) => {
    if (event.button !== 0) return; // Only left click
    
    event.preventDefault();
    event.stopPropagation();
    
    const rect = event.currentTarget.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    
    setIsDragging(true);
    setDraggedTask(task);
    setDragOffset(offsetX);
    setDragStartX(event.clientX);
    setTempPosition(null);
    setHasDragged(false); // Reset drag tracking
    
    // Change cursor for better UX
    document.body.style.cursor = 'grabbing';
  };

  const handleMouseMove = (event) => {
    if (!isDragging || !draggedTask || !ganttData) return;
    
    event.preventDefault();
    
    const deltaX = event.clientX - dragStartX;
    
    // Mark as dragged if moved more than 5 pixels
    if (Math.abs(deltaX) > 5) {
      setHasDragged(true);
    }
    
    // Find the timeline element by querying the document
    const timelineElement = document.querySelector('[data-timeline]');
    if (!timelineElement) return;
    
    const timelineRect = timelineElement.getBoundingClientRect();
    const timelineWidth = timelineRect.width;
    
    // Calculate days moved based on pixel movement
    const daysMoved = Math.round((deltaX / timelineWidth) * ganttData.totalDays);
    
    if (daysMoved !== 0) {
      const currentStartDate = new Date(dateMode === 'estimated' ? draggedTask.startDate : draggedTask.actualStartDate);
      const currentEndDate = new Date(dateMode === 'estimated' ? draggedTask.endDate : draggedTask.actualEndDate);
      
      const newStartDate = new Date(currentStartDate);
      newStartDate.setDate(currentStartDate.getDate() + daysMoved);
      
      const newEndDate = new Date(currentEndDate);
      newEndDate.setDate(currentEndDate.getDate() + daysMoved);
      
      setTempPosition({
        startDate: newStartDate,
        endDate: newEndDate,
        daysMoved
      });
    }
  };

  const handleMouseUp = () => {
    const wasJustClick = isDragging && draggedTask && !hasDragged;
    
    if (!isDragging || !draggedTask || !tempPosition) {
      // Reset drag state
      setIsDragging(false);
      setDraggedTask(null);
      setDragOffset(0);
      setDragStartX(0);
      setTempPosition(null);
      setHasDragged(false);
      document.body.style.cursor = 'default';
      
      // If it was just a click (no drag), open edit dialog
      if (wasJustClick) {
        setTimeout(() => onEdit(draggedTask._id), 10); // Small delay to ensure drag state is cleared
      }
      return;
    }

    // Store the pending change instead of applying immediately
    const updatedTask = {
      ...draggedTask,
      [dateMode === 'estimated' ? 'startDate' : 'actualStartDate']: tempPosition.startDate.toISOString(),
      [dateMode === 'estimated' ? 'endDate' : 'actualEndDate']: tempPosition.endDate.toISOString(),
      updatedDate: new Date().toISOString()
    };

    // Add to pending changes
    setPendingChanges(prev => {
      const newChanges = new Map(prev);
      newChanges.set(draggedTask._id, updatedTask);
      return newChanges;
    });
    
    setHasUnsavedChanges(true);
    
    // Show pending change feedback
    alertRef.current?.displayAlert('info', t('taskDatesPending') || 'Task dates changed. Click Save to apply changes.');

    // Reset drag state
    setIsDragging(false);
    setDraggedTask(null);
    setDragOffset(0);
    setDragStartX(0);
    setTempPosition(null);
    setHasDragged(false);
    document.body.style.cursor = 'default';
  };

  // Handle saving all pending changes
  const handleSavePendingChanges = () => {
    if (pendingChanges.size === 0) return;
    
    // Apply all pending changes
    pendingChanges.forEach((updatedTask) => {
      handleTaskDateChange(updatedTask);
    });
    
    // Clear pending changes
    setPendingChanges(new Map());
    setHasUnsavedChanges(false);
    
    alertRef.current?.displayAlert('success', t('taskDatesUpdated') || `${pendingChanges.size} task dates updated successfully`);
  };
  
  // Handle discarding all pending changes
  const handleDiscardPendingChanges = () => {
    setPendingChanges(new Map());
    setHasUnsavedChanges(false);
    
    alertRef.current?.displayAlert('info', t('changesDiscarded') || 'All pending changes discarded');
  };

  // Calculate display position for dragged task
  const getTaskDisplayInfo = (task) => {
    // Check if task has pending changes
    const pendingTask = pendingChanges.get(task._id);
    if (pendingTask) {
      const start = new Date(dateMode === 'estimated' ? pendingTask.startDate : pendingTask.actualStartDate);
      const end = new Date(dateMode === 'estimated' ? pendingTask.endDate : pendingTask.actualEndDate);
      const startOffset = Math.ceil((start - ganttData.minDate) / (1000 * 60 * 60 * 24));
      const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      
      return { ...task, startOffset, duration, start, end, isPending: true };
    }
    
    // Check if currently being dragged
    if (isDragging && draggedTask && task._id === draggedTask._id && tempPosition) {
      const start = tempPosition.startDate;
      const end = tempPosition.endDate;
      const startOffset = Math.ceil((start - ganttData.minDate) / (1000 * 60 * 60 * 24));
      const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      
      return { ...task, startOffset, duration, start, end };
    }
    
    return task;
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

    // Process tasks with timing data
    const processedTasks = validTasks
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
      .sort((a, b) => a.start - b.start);

    // Group tasks by milestone
    const groupedByMilestone = {};
    processedTasks.forEach(task => {
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

    // Create structured data with milestone headers and tasks
    const structuredData = [];
    Object.entries(groupedByMilestone).forEach(([milestoneKey, group]) => {
      // Calculate total duration for this milestone (in days)
      const totalDuration = group.tasks.reduce((sum, task) => {
        return sum + (task.duration || 0);
      }, 0);

      // Add milestone with its tasks
      structuredData.push({
        isMilestoneHeader: true,
        milestoneKey: milestoneKey,
        milestoneName: group.milestoneName,
        taskCount: group.tasks.length,
        totalDuration: totalDuration,
        tasks: group.tasks
      });
    });

    return {
      tasks: structuredData,
      minDate,
      maxDate,
      totalDays
    };
  }, [tasks, dateMode, dateGranularity, t, collapsedMilestones]);

  // Global mouse event listeners for drag operations (after ganttData is defined)
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (event) => handleMouseMove(event);
      const handleGlobalMouseUp = () => handleMouseUp();
      
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
        document.body.style.cursor = 'default';
      };
    }
  }, [isDragging, draggedTask, ganttData, dragStartX, tempPosition, hasDragged]);

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
        month: current.toLocaleString(getDateLocale(), { month: 'short' }),
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
        month: current.toLocaleString(getDateLocale(), { month: 'short' }),
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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="h6">
                        {t('ganttChart')}
                      </Typography>
                      {hasUnsavedChanges && (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={handleSavePendingChanges}
                            sx={{ fontWeight: 600 }}
                          >
                            💾 {t('saveChanges') || `Save (${pendingChanges.size})`}
                          </Button>
                          <Button
                            variant="outlined"
                            color="secondary"
                            size="small"
                            onClick={handleDiscardPendingChanges}
                          >
                            ✖️ {t('discard') || 'Discard'}
                          </Button>
                        </Box>
                      )}
                    </Box>
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
                    <Box sx={{ minWidth: 'max-content' }} data-timeline>
                      {/* Month Headers */}
                      <Box sx={{ display: 'flex', borderBottom: `2px solid ${theme.palette.divider}`, mb: 1 }}>
                        <Box sx={{ width: '350px', flexShrink: 0, fontWeight: 'bold', p: 1, position: 'sticky', left: 0, backgroundColor: theme.palette.background.paper, zIndex: 2 }}>
                          {t('taskName')}
                        </Box>
                        <Box sx={{ display: 'flex', flex: 1, minWidth: '1600px' }}>
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
                  {ganttData.tasks.map((milestone, idx) => {
                    // Each item is a milestone with its tasks
                    if (milestone.isMilestoneHeader) {
                      const isCollapsed = collapsedMilestones.has(milestone.milestoneKey);
                      
                      const toggleMilestone = () => {
                        setCollapsedMilestones(prev => {
                          const newSet = new Set(prev);
                          if (newSet.has(milestone.milestoneKey)) {
                            newSet.delete(milestone.milestoneKey);
                          } else {
                            newSet.add(milestone.milestoneKey);
                          }
                          return newSet;
                        });
                      };

                      return (
                        <Box key={`milestone-${idx}`}>
                          {/* Milestone Header */}
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              borderBottom: `1px solid ${theme.palette.divider}`,
                              backgroundColor: theme.palette.primary.main,
                              minHeight: '40px',
                              cursor: 'pointer',
                              transition: 'background-color 0.2s ease',
                              '&:hover': {
                                backgroundColor: theme.palette.primary.dark,
                                '& > *': { backgroundColor: theme.palette.primary.dark }
                              }
                            }}
                            onClick={toggleMilestone}
                          >
                            <Box
                              sx={{
                                width: '350px',
                                flexShrink: 0,
                                p: 1,
                                fontSize: '1rem',
                                fontWeight: 700,
                                color: theme.palette.primary.contrastText,
                                position: 'sticky',
                                left: 0,
                                backgroundColor: 'inherit',
                                zIndex: 2,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                transition: 'background-color 0.2s ease'
                              }}
                            >
                              <Box
                                sx={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                  transform: isCollapsed ? 'rotate(0deg)' : 'rotate(90deg)',
                                }}
                              >
                                <ChevronRightIcon />
                              </Box>
                              {milestone.milestoneName} ({milestone.taskCount} {milestone.taskCount === 1 ? t('task') : t('tasks')})
                            </Box>
                            <Box
                              sx={{
                                flex: 1,
                                p: 1,
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                color: theme.palette.primary.contrastText,
                                minWidth: '1600px',
                                transition: 'background-color 0.2s ease'
                              }}
                            >
                              {t('totalDuration') || 'Total Duration'}: {milestone.totalDuration} {milestone.totalDuration === 1 ? (t('day') || 'day') : (t('days') || 'days')}
                            </Box>
                          </Box>

                          {/* Collapsible Tasks */}
                          <Collapse 
                            in={!isCollapsed} 
                            timeout={800}
                            easing={{
                              enter: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                              exit: 'cubic-bezier(0.23, 1, 0.32, 1)',
                            }}
                          >
                            <Box>
                              {milestone.tasks.map((task, taskIdx) => {
                                const displayTask = getTaskDisplayInfo(task);
                                const isBeingDragged = isDragging && draggedTask && task._id === draggedTask._id;
                                
                                return (
                                <Box
                                  key={task._id}
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    borderBottom: `1px solid ${theme.palette.divider}`,
                                    '&:hover': { 
                                      backgroundColor: theme.palette.action.hover,
                                      '& > *': { backgroundColor: theme.palette.action.hover }
                                    },
                                    minHeight: '40px',
                                    transition: 'background-color 0.2s ease',
                                    opacity: isBeingDragged ? 0.7 : 1,
                                  }}
                                  onMouseEnter={(e) => !isDragging && handleTaskMouseEnter(task, e)}
                                  onMouseLeave={() => !isDragging && handleTaskMouseLeave()}
                                >
                                  {/* Task Name */}
                                  <Box
                                    sx={{
                                      width: '350px',
                                      flexShrink: 0,
                                      p: 1,
                                      fontSize: '0.875rem',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                      position: 'sticky',
                                      left: 0,
                                      backgroundColor: 'inherit',
                                      zIndex: 1,
                                      transition: 'background-color 0.2s ease'
                                    }}
                                  >
                                    <Tooltip title={task.taskName}>
                                      <span>{task.taskName}</span>
                                    </Tooltip>
                                  </Box>

                                  {/* Timeline */}
                                  <Box sx={{ 
                                    position: 'relative', 
                                    flex: 1, 
                                    height: '40px', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    minWidth: '1600px',
                                    backgroundColor: 'inherit',
                                    transition: 'background-color 0.2s ease'
                                  }}>
                                    <Box
                                      sx={{
                                        position: 'absolute',
                                        left: `${(displayTask.startOffset / ganttData.totalDays) * 100}%`,
                                        width: `${(displayTask.duration / ganttData.totalDays) * 100}%`,
                                        height: '24px',
                                        backgroundColor: getStatusColor(task.status),
                                        borderRadius: '4px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.75rem',
                                        color: 'white',
                                        fontWeight: 500,
                                        boxShadow: isBeingDragged ? 4 : (displayTask.isPending ? 3 : 1),
                                        minWidth: '2px',
                                        cursor: 'grab',
                                        userSelect: 'none',
                                        transition: isBeingDragged ? 'none' : 'box-shadow 0.2s ease',
                                        border: isBeingDragged 
                                          ? `2px solid ${theme.palette.primary.main}` 
                                          : displayTask.isPending 
                                            ? `2px solid ${theme.palette.warning.main}` 
                                            : 'none',
                                        opacity: displayTask.isPending ? 0.8 : 1,
                                        '&:hover': {
                                          boxShadow: 3,
                                          transform: 'translateY(-1px)',
                                        },
                                        '&:active': {
                                          cursor: 'grabbing',
                                        }
                                      }}
                                      onMouseDown={(e) => handleMouseDown(task, e)}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        // Only handle click if not currently dragging and hasn't been dragged
                                        if (!isDragging && !hasDragged) {
                                          onEdit(task._id);
                                        }
                                      }}
                                    >
                                      <Tooltip title={
                                        isBeingDragged && tempPosition
                                          ? `${tempPosition.startDate.toLocaleDateString()} - ${tempPosition.endDate.toLocaleDateString()} (${tempPosition.daysMoved > 0 ? '+' : ''}${tempPosition.daysMoved} days)`
                                          : `${displayTask.start.toLocaleDateString()} - ${displayTask.end.toLocaleDateString()}`
                                      }>
                                        <span style={{ padding: '0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                          {displayTask.duration}d
                                        </span>
                                      </Tooltip>
                                    </Box>
                                  </Box>
                                </Box>
                              )})}
                            </Box>
                          </Collapse>
                        </Box>
                      );
                    }
                    return null;
                  })}
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

          {/* TaskPopper for hover details */}
          {hoveredTask && anchorEl && (
            <TaskPopper
              task={hoveredTask}
              anchorEl={anchorEl}
              open={Boolean(hoveredTask && anchorEl)}

            />
          )}
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