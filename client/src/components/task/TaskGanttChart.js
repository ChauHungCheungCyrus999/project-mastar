import React, { useState, useEffect, useRef } from 'react';
import { Grid, Stack, Typography, Button, ButtonGroup, Tooltip } from '@mui/material';
import { ViewMode, Gantt } from "gantt-task-react";
// import SplitPane from 'react-split-pane';
// import './split-pane-resizer.css';

import CAlert from '../custom/CAlert';

import TaskTable from "./TaskTable";
import { TaskGanttChartViewSwitcher } from "./TaskGanttChartViewSwitcher";

import TaskGanttChartTable from "./TaskGanttChartTable";
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
  const { t, i18n } = useTranslation();

  // Alert
  const alertRef = useRef();

  const [view, setView] = useState(ViewMode.Month);
  
  // Date Mode
  const [dateMode, setDateMode] = useState('estimated');

  // Update
  const [mode, setMode] = useState("update");
  const [editedTask, setEditedTask] = useState(null);
  const [isEditFormOpen, setEditFormOpen] = useState(false);

  // Delete
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [openConfirmDeleteDialog, setOpenConfirmDeleteDialog] = useState(false);

  const [selectedTask, setSelectedTask] = useState(null);

  const handleCloseForm = (event, reason) => {
    handleCloseEditForm(setEditedTask, setEditFormOpen);
  };

  // Update/Duplicate Task
  const onEdit = (task, mode) => {
    handleEdit(task.id, mode, tasks, setMode, setEditedTask, setEditFormOpen);
  };
  
  const onSaveTask = (updatedTask) => {
    handleSaveTask(updatedTask, tasks, setTasks);
  };
  
  const onDuplicate = (duplicatedTask) => {
    handleDuplicate(duplicatedTask, setTasks, setEditFormOpen);
  };

  // Delete Task
  const onDeleteClick = (task) => {
    handleDelete(task.id, setOpenConfirmDeleteDialog, setTaskToDelete);
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

  // Progress
  const calculateProgress = status => {
    switch (status) {
      case '':
      case null:
      case 'To Do':
      case 'On Hold':
      case 'Cancelled':
        return 0;
      case 'In Progress':
        return 50;
      case 'Under Review':
        return 75;
      case 'Done':
        return 100;
      default:
        return 0;
    }
  };

  const [ganttTasks, setGanttTasks] = useState(() => {
    return [];
  });
  
  const updateGanttTasks = () => {
    if (tasks && tasks?.length > 0) {
      const updatedGanttTasks = tasks
        ?.filter(task => {
          if (dateMode === 'estimated') {
            return task.startDate && task.endDate;
          } else if (dateMode === 'actual') {
            return task.actualStartDate && task.actualEndDate;
          }
          return false;
        })
        ?.map((task) => ({
          id: task._id.toString(),
          name: task.taskName,
          start: dateMode === 'estimated' ? new Date(task.startDate) : new Date(task.actualStartDate),
          end: dateMode === 'estimated' ? new Date(task.endDate) : new Date(task.actualEndDate),
          progress: calculateProgress(task.status),
          styles: {
            progressColor: '#6c757d',
            progressSelectedColor: '#193f70',
          },
        }))
        .sort((a, b) => (a.start && b.start ? a.start - b.start : 0));
      setGanttTasks(updatedGanttTasks);
    } else {
      setGanttTasks([]);
    }
  };
  
  useEffect(() => {
    updateGanttTasks();
  }, [tasks, dateMode]);

  const [isChecked, setIsChecked] = useState(true);
  let columnWidth = 40;
  if (view === ViewMode.Week) {
    columnWidth = 65;
  } else if (view === ViewMode.Month) {
    columnWidth = 65;
  } else if (view === ViewMode.Year) {
    columnWidth = 150;
  }

  const saveTasks = () => {
    ganttTasks.forEach(ganttTask => {
      const matchingTask = tasks.find(
        task => (task._id === ganttTask.id) && (task.startDate != formatToIsoDate(ganttTask.start) || task.endDate != formatToIsoDate(ganttTask.end))
      );
      if (matchingTask) {
        let newTask = { ...matchingTask };
        if (dateMode === 'estimated') {
          newTask.startDate = formatToIsoDate(ganttTask.start);
          newTask.endDate = formatToIsoDate(ganttTask.end);
        } else {
          newTask.actualStartDate = formatToIsoDate(ganttTask.start);
          newTask.actualEndDate = formatToIsoDate(ganttTask.end);
        }
        onSaveTask(newTask);
        alertRef.current.displayAlert('success', t('saveSuccess'));
      }
    });
  }

  // Update startDate or endDate in TaskGanttChart from GanttChart
  const handleTaskChange = (updatedTask) => {
    try {
      const updatedTasks = tasks?.map((task) =>
        task._id == updatedTask.id ? 
        { 
          ...task, 
          ...(dateMode === 'estimated' 
            ? { startDate: updatedTask.start, endDate: updatedTask.end } 
            : { actualStartDate: updatedTask.start, actualEndDate: updatedTask.end }),
          updatedDate: new Date() 
        } : task
      );
      setTasks(updatedTasks);

      setGanttTasks((prevTasks) => {
        return prevTasks.filter(task => task.start && task.end)?.map((t) => (t.id === updatedTask.id ? updatedTask : t));
      });
    } catch (error) {
      console.error('Error updating tasks:', error);
    }
  };

  const handleProgressChange = async (task) => {
    setTasks(ganttTasks?.map((t) => (t.id === task.id ? task : t)));
  };

  const handleDblClick = (task) => {
    setEditedTask(task);
    onEdit(task, "update");
    setEditFormOpen(true);
  };

  const handleSelect = (task, isSelected) => {
    setSelectedTask(task);
  };

  const handleExpanderClick = (task) => {
    setTasks(ganttTasks?.map((t) => (t.id === task.id ? task : t)));
  };

  // Update startDate or endDate from TaskGanttChartTable
  const handleTaskDateChange = (updatedTask) => {
    const updatedTasks = tasks?.map((task) =>
      task._id === updatedTask._id ? {
        ...task,
        startDate: dateMode === 'estimated' ? updatedTask.startDate : updatedTask.actualStartDate,
        endDate: dateMode === 'estimated' ? updatedTask.endDate : updatedTask.actualEndDate,
        updatedDate: new Date()
      } : task
    );
    setTasks(updatedTasks);
  };
  

  return (
    <>
      <TaskGanttChartViewSwitcher
        dateMode={dateMode}
        setDateMode={setDateMode}
        onViewModeChange={(viewMode) => setView(viewMode)}
        onViewListChange={setIsChecked}
        isChecked={isChecked}
      />
  
      {ganttTasks?.filter(task => task.start && task.end)?.length > 0 ? (
        <>
          <Grid container spacing={2} mt={1}>
            {isChecked && (
              <Grid item xs={12}>
                <TaskGanttChartTable
                  project={project}
                  tasks={tasks}
                  onTaskDateChange={handleTaskDateChange}
                  dateMode={dateMode}
                />
              </Grid>
            )}
            <Grid item xs={12} sx={{ mt: '30px' }}>
              <Gantt
                tasks={ganttTasks?.filter(task => task.start && task.end)}
                viewMode={view}
                locale={i18n.language}
                onSelect={handleSelect}
                onDateChange={handleTaskChange}
                onDelete={onDeleteClick}
                onDoubleClick={handleDblClick}
                listCellWidth={''}
                columnWidth={columnWidth}
                rowHeight={18}
                taskListTable={{ locale: i18n.language }}
              />

              <Typography variant="caption" color="error">
                {t('ganttChartNotice')}
              </Typography>

              {isEditFormOpen && (
                <TaskEditForm
                  taskId={editedTask._id}
                  setTasks={setTasks}
                  mode="update"
                  open={isEditFormOpen}
                  handleClose={handleCloseForm}
                  handleSave={handleSaveTask}
                  setTaskToDelete={setTaskToDelete}
                  setOpenConfirmDeleteDialog={setOpenConfirmDeleteDialog}
                />
              )}

              {/* Confirmation Delete */}
              <ConfirmDeleteDialog
                title={t('deleteTask')}
                content={t('deleteTaskConfirm')}
                open={openConfirmDeleteDialog}
                onCancel={onCancelDelete}
                onConfirm={onConfirmDelete}
              />
            </Grid>
          </Grid>

          <Button variant="contained" onClick={saveTasks}>
            {t('save')}
          </Button>
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