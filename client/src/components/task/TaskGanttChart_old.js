/*import { Gantt, Task } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';
import React, { useState } from 'react';
import { initTasks } from "../init/InitTasks";

const TaskGanttChart = () => {
  const [tasks, setTasks] = useState(initTasks());

  const calculateProgress = status => {
    switch (status) {
      case '':
      case 'To Do':
      case 'On Hold':
      case 'Cancelled':
        return 0;
      case 'In Progress':
        return 50;
      case 'Done':
        return 100;
      default:
        return 0;
    }
  };
  
  const [ganttTasks, setGanttTasks] = useState(
    tasks.map(task => ({
      id: task._id.toString(),
      name: task.taskName,
      start: new Date(task.startDate),
      end: new Date(task.endDate),
      progress: calculateProgress(task.status),
      styles: {
        progressColor: '#4797e6',
        progressSelectedColor: '#1976d2',
      },
    }))
  );

  const handleTaskDateChange = (taskId, start, end) => {
    setGanttTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, start, end } : task
      )
    );
  };

  return (
    <div style={{ marginTop: '1rem' }}>
      <Gantt tasks={ganttTasks} onDateChange={handleTaskDateChange} />
    </div>
  );
};

export default TaskGanttChart;*/


import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Button } from '@mui/material';
import { ViewMode, Gantt } from "gantt-task-react";
import { TaskGanttChartViewSwitcher } from "./TaskGanttChartViewSwitcher";
import axios from 'axios';

import { getStartEndDateForProject } from "../init/InitTasks";

import TaskEditForm from "./TaskEditForm";
import ConfirmDeleteDialog from '../custom/ConfirmDeleteDialog';
import { useTranslation } from 'react-i18next';

const TaskGanttChart = ({ project, tasks, setTasks }) => {
  const { t, i18n } = useTranslation();

  const [view, setView] = useState(ViewMode.Day);
  const [isEditFormOpen, setEditFormOpen] = useState(false);
  const [editedTask, setEditedTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [openConfirmDeleteDialog, setOpenConfirmDeleteDialog] = useState(false);
  //const [isSaving, setIsSaving] = useState(false);
  
  // Progress
  const calculateProgress = status => {
    switch (status) {
      case '':
      case 'To Do':
      case 'On Hold':
      case 'Cancelled':
        return 0;
      case 'In Progress':
        return 50;
      case 'Done':
        return 100;
      default:
        return 0;
    }
  };

  const [ganttTasks, setGanttTasks] = useState(() => {
    if (tasks && tasks.length > 0) {
      return tasks
        .filter(task => task.startDate !== null && task.endDate !== null)
        .map(task => ({
          id: task._id.toString(),
          name: task.taskName,
          start: task.startDate ? new Date(task.startDate) : null,
          end: task.endDate ? new Date(task.endDate) : null,
          progress: calculateProgress(task.status),
          styles: {
            progressColor: '#6c757d',
            progressSelectedColor: '#193f70'
          },
        }));
    } else {
      return [];
    }
  });

  /*useEffect(() => {
    // Fetch tasks from the server
    const fetchTasks = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/task/project/${projectId}`);
        setTasks(response.data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };
  
    // Call the fetchTasks function
    fetchTasks();
  }, []);*/
  
  const updateGanttTasks = () => {
    if (tasks && tasks.length > 0) {
      const updatedGanttTasks = tasks
        .filter(task => task.startDate !== null && task.endDate !== null) // Filter out tasks with null startDate or endDate
        .map((task) => ({
          id: task._id.toString(),
          name: task.taskName,
          start: task.startDate ? new Date(task.startDate) : null,
          end: task.endDate ? new Date(task.endDate) : null,
          progress: calculateProgress(task.status),
          styles: {
            progressColor: '#6c757d',
            progressSelectedColor: '#193f70',
          },
        }));
      setGanttTasks(updatedGanttTasks);
    } else {
      setGanttTasks([]);
    }
  };
  
  useEffect(() => {
    updateGanttTasks();
  }, [tasks]);

  // Update
  const handleSaveTask = async (updatedTask) => {
    try {
      const response = await axios.put(`${process.env.REACT_APP_SERVER_HOST}/api/tasks/${updatedTask._id}`, updatedTask);
      const updatedTasks = tasks.map((task) =>
        task._id === updatedTask._id ? response.data : task
      );
      setTasks(updatedTasks);
      //handleCloseEditForm();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleEdit = (taskId) => {
    //console.log('taskId:', taskId);
    const taskToEdit = tasks.find((task) => task._id == taskId);
    //console.log('Edit task:', taskToEdit);
    if (taskToEdit) {
      setEditedTask(taskToEdit);
      setEditFormOpen(true);
    }
  };

  const handleCloseEditForm = (event, reason) => {
    if (reason && reason === "backdropClick")
      return;
    setEditedTask(null);
    setEditFormOpen(false);
  };

  const [isChecked, setIsChecked] = useState(true);
  let columnWidth = 60;
  if (view === ViewMode.Week) {
    columnWidth = 100;
  } else if (view === ViewMode.Month) {
    columnWidth = 100;
  } else if (view === ViewMode.Year) {
    columnWidth = 300;
  }

  const saveTasks = async (updatedTasks) => {
    //console.log('updatedTasks = ' + JSON.stringify(updatedTasks));
    
    const newTask = updatedTasks.map((task) => ({
      startDate: task.start,
      endDate: task.end
    }));
    //console.log('newTask = ' + JSON.stringify(newTask));

    try {
      const response = await axios.put(`${process.env.REACT_APP_SERVER_HOST}/api/tasks/${updatedTasks[0].id}/dates`, newTask[0]);
      if (response.status === 200) {
        const updatedTask = response.data;
        console.log('Task updated:', updatedTask);
        // Handle the updated task as needed
      } else {
        console.log('Failed to update task:', response.data.error);
      }
    } catch (error) {
      console.error('Error updating tasks:', error);
      // Handle the error as needed
    }
  };

  const handleTaskChange = (task) => {
    console.log("On date change Id:" + task.id);
    /*let newTasks = ganttTasks.map((t) => {
      console.log("t.id:", t.id);
      console.log("task.id:", task.id);
      console.log("t.id === task.id:", t.id === task.id);
      console.log("t:", JSON.stringify(t));
      console.log("task:", JSON.stringify(task));
      return t.id === task.id ? task : t;
    });
    // Update total duration of the project
    // if (task.project) {
    //   const [start, end] = getStartEndDateForProject(newTasks, task.project);
    //   const project = newTasks[newTasks.findIndex((t) => t.id === task.project)];
    //   if (
    //     project.start.getTime() !== start.getTime() ||
    //     project.end.getTime() !== end.getTime()
    //   ) {
    //     const changedProject = { ...project, start, end };
    //     newTasks = newTasks.map((t) =>
    //       t.id === task.project ? changedProject : t
    //     );
    //   }
    // }
    setTasks(newTasks);*/

    setGanttTasks((prevTasks) => {
      const updatedTasks = prevTasks.map((t) => (t.id === task.id ? task : t));
      //setIsSaving(true);
      saveTasks(updatedTasks);
      //handleSaveTask(updatedTasks);
      return updatedTasks;
    });
  };


  // Delete task
  /*const handleTaskDelete = (task) => {
    const conf = window.confirm("Are you sure to delete " + task.name + " ?");
    if (conf) {
      setTasks(ganttTasks.filter((t) => t.id !== task.id));
    }
    return conf;
  };*/
  /*const handleTaskDelete = (task) => {
    const conf = window.confirm(t('deleteTaskConfirm'));
    if (conf) {
      setGanttTasks((prevTasks) => {
        const updatedTasks = prevTasks.filter((t) => t.id !== task.id);
        //setIsSaving(true);
        saveTasks(updatedTasks);
        return updatedTasks;
      });
    }
    return conf;
  };*/

  const handleDelete = async (task) => {
    try {
      await axios.delete(`${process.env.REACT_APP_SERVER_HOST}/api/task/${task.id}`);
      setTasks((prevTasks) => prevTasks.filter((task) => task._id !== task.id));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const onDelete = (event) => {
    setOpenConfirmDeleteDialog(true);
  };

  const confirmDelete = () => {
    handleDelete(selectedTask);
    setOpenConfirmDeleteDialog(false);
  };

  const cancelDelete = () => {
    setOpenConfirmDeleteDialog(false);
  };


  const handleProgressChange = async (task) => {
    setTasks(ganttTasks.map((t) => (t.id === task.id ? task : t)));
    console.log("On progress change Id:" + task.id);
  };

  const handleDblClick = (task) => {
    setEditedTask(task);
    handleEdit(task.id);
    console.log(task.id);
    setEditFormOpen(true);
  };

  const handleSelect = (task, isSelected) => {
    setSelectedTask(task);
    console.log('Selected Task = ' + JSON.stringify(task));
    //console.log(task.id + " has " + (isSelected ? "selected" : "unselected"));
  };

  const handleExpanderClick = (task) => {
    setTasks(ganttTasks.map((t) => (t.id === task.id ? task : t)));
    console.log("On expander click Id:" + task.id);
  };
  
  return (
    <Card style={{ marginTop:'1rem' }}>
      <CardContent>
        <TaskGanttChartViewSwitcher
          onViewModeChange={(viewMode) => setView(viewMode)}
          onViewListChange={setIsChecked}
          isChecked={isChecked}
        />
        
        {ganttTasks.length > 0 && (
          <Gantt
            tasks={ganttTasks}
            viewMode={view}
            locale={i18n.language}
            onSelect={handleSelect}
            onDateChange={handleTaskChange}
            onDelete={onDelete}
            // onProgressChange={handleProgressChange}
            onDoubleClick={handleDblClick}
            // onExpanderClick={handleExpanderClick}
            listCellWidth={isChecked ? "155px" : ""}
            columnWidth={columnWidth}
            // ganttHeight={800}
            // barBackgroundColor="blue"
            rowHeight={40}
            // fontSize={12}
            taskListTable={{ locale: i18n.language }}
          />
        )}

        <Typography color="error">{t('ganttChartNotice')}</Typography>

        {isEditFormOpen && (
          <TaskEditForm
            taskId={editedTask._id}
            setTasks={setTasks}
            mode="update"
            open={isEditFormOpen}
            handleClose={handleCloseEditForm}
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
          onCancel={cancelDelete}
          onConfirm={confirmDelete}
        />
      </CardContent>

      {/*{isSaving ? (
        <Button disabled>Saving...</Button>
      ) : (
        <Button variant="contained" color="primary" onClick={() => saveTasks(ganttTasks)}>
          Save
        </Button>
      )}*/}
    </Card>
  );
};

export default TaskGanttChart;
