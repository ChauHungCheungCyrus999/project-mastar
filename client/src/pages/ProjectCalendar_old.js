import React, { useContext, useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Home, Folder, CalendarMonth } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import MainContent from '../components/MainContent';
import UserContext from '../UserContext';
import { useNavigate } from "react-router-dom";
import { useMediaQuery, Paper, Stack, ButtonGroup, Tooltip, Button, Skeleton, Grid } from '@mui/material';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import multiMonthPlugin from '@fullcalendar/multimonth';
import './project-calendar.css';

import CDialog from '../components/custom/CDialog';
import ListTableSwitcher from '../components/task/ListTableSwitcher';
import TaskEditForm from '../components/task/TaskEditForm';
import TaskCreateForm from '../components/task/TaskCreateForm';
import ConfirmDeleteDialog from '../components/custom/ConfirmDeleteDialog';
import CAlert from '../components/custom/CAlert';
import TaskPopper from '../components/task/TaskPopper';

import {
  handleCloseEditForm,
  handleEdit, handleSaveTask, handleDuplicate,
  handleDelete, confirmDelete, cancelDelete,
  handleMarkAsCompleted
} from '../utils/TaskUtils.js';
import { capitalizeWordsExceptFirst } from '../utils/StringUtils.js';

const ProjectCalendar = () => {
  const { user, setUser } = useContext(UserContext);
  const { t, i18n } = useTranslation();
  const isMobile = useMediaQuery('(max-width:600px)');
  
  const navigate = useNavigate();
  const { projectId } = useParams();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  
  const breadcrumbItems = [
    { label: 'home', href: '/', icon: <Home sx={{ mr: 0.5 }} fontSize="inherit" /> },
    { label: project?.title, href: `/project/${projectId}/dashboard`, icon: <Folder sx={{ mr: 0.5 }} fontSize="inherit" /> },
    { label: 'calendar', icon: <CalendarMonth sx={{ mr: 0.5 }} fontSize="inherit" /> },
  ];

  /*const fetchUserByProject = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/project/${projectId}/teamMember/${user._id}`);
      //console.log("user = " + JSON.stringify(response.data));
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user by project:', error);
    }
  };
  
  useEffect(() => {
    fetchUserByProject();
  }, []);*/

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/project/${projectId}`);
        setProject(response.data);
      } catch (error) {
        console.error('Error fetching project:', error);
      }
    };

    const fetchTasks = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/tasks/project/${projectId}`);
        setTasks(response.data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchProject();
    fetchTasks();
  }, [projectId]);

  // TaskCalendar logic
  const alertRef = useRef();

  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 10);
  }, []);

  const [popperAnchorEl, setPopperAnchorEl] = useState(null);
  const [selectedTaskForPopper, setSelectedTaskForPopper] = useState(null);
  const [popperOpen, setPopperOpen] = useState(false);

  const handleMouseEnter = (info) => {
    setPopperAnchorEl(info.el);
    setSelectedTaskForPopper(info.event.extendedProps.task);
    setPopperOpen(true);
  };

  const handleMouseLeave = () => {
    setPopperOpen(false);
    setSelectedTaskForPopper(null);
  };

  const renderEventContent = (eventInfo) => {
    return (
      <div
        onMouseEnter={() => handleMouseEnter(eventInfo)}
        onMouseLeave={handleMouseLeave}
      >
        <b>{eventInfo.timeText}</b>
        <i>{eventInfo.event.title}</i>
      </div>
    );
  };

  const colorStatuses = [
    { status: t('unassigned'), backgroundColor: '', color: 'black' },
    { status: t('toDo'), backgroundColor: '#89CFF0', color: 'black' },
    { status: t('inProgress'), backgroundColor: '#FFE5A0', color: 'black' },
    { status: t('underReview'), backgroundColor: '#E6CFF2', color: 'black' },
    { status: t('done'), backgroundColor: '#D4EDBC', color: 'black' },
    { status: t('onHold'), backgroundColor: '#FFBD9C', color: 'black' },
    { status: t('cancelled'), backgroundColor: '#C9C9C9', color: 'black' }
  ];

  const getStatusColor = (status) => {
    const foundStatus = colorStatuses.find(
      (item) => t(capitalizeWordsExceptFirst(item.status)) === status
    );
    return foundStatus ? foundStatus.backgroundColor : '#dcdcdc';
  };

  const [dateMode, setDateMode] = useState('estimated');
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createFormOpen, setCreateFormOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [taskUpdates, setTaskUpdates] = useState([]);

  const [taskToDelete, setTaskToDelete] = useState(null);
  const [openConfirmDeleteDialog, setOpenConfirmDeleteDialog] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (taskUpdates.length > 0) {
        event.preventDefault();
        event.returnValue = t('unsavedChangesWarning');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [taskUpdates, t]);

  const handleDateClick = (info) => {
    const clickedDate = info.dateStr;
    setSelectedDate(clickedDate);

    const tasksForDate = tasks.filter((task) => {
      const startDate = dateMode === 'estimated' ? task.startDate : task.actualStartDate;
      const endDate = dateMode === 'estimated' ? task.endDate : task.actualEndDate;
      return startDate <= clickedDate && endDate >= clickedDate;
    });

    if (tasksForDate.length > 0) {
      setSelectedTasks(tasksForDate);
      setDialogOpen(true);
    } else {
      setCreateFormOpen(true);
    }
  };

  const handleEventClick = (info) => {
    const taskId = info.event.id;
    const task = tasks.find((task) => task._id === taskId);
    setSelectedTask(task);
    setEditDialogOpen(true);
  };

  // Update tasks and taskUpdates when an event is dropped
  const handleEventDrop = (info) => {
    const updatedTask = {
      id: info.event.id,
      startDate: info.event.startStr,
      endDate: info.event.endStr
    };
  
    // Update tasks state immediately
    setTasks((prevTasks) =>
      prevTasks.map(task =>
        task._id === updatedTask.id ? { ...task, ...updatedTask } : task
      )
    );
  
    // Update taskUpdates state
    setTaskUpdates((prev) => {
      const existingUpdate = prev.find((u) => u.id === updatedTask.id);
      return existingUpdate
        ? prev.map((u) => (u.id === updatedTask.id ? updatedTask : u))
        : [...prev, updatedTask];
    });
  };

  const handleEventResize = (info) => {
    const updatedTask = {
      id: info.event.id,
      startDate: info.event.startStr,
      endDate: info.event.endStr
    };

    setTaskUpdates((prev) => [...prev, updatedTask]);
  };

  const handleSaveChanges = async () => {
    try {
      for (const update of taskUpdates) {
        const updateData = {
          ...update,
          updatedBy: user._id, // Ensure current user ID is included
        };
  
        await axios.put(
          `${process.env.REACT_APP_SERVER_HOST}/api/task/${update.id}`,
          updateData
        );
      }
  
      setTasks((prevTasks) =>
        prevTasks.map((task) => {
          const update = taskUpdates.find((u) => u.id === task._id);
          return update ? { ...task, ...update } : task;
        })
      );
  
      setTaskUpdates([]);
      alertRef.current.displayAlert('success', t('saveSuccess'));
    } catch (error) {
      console.error('Error updating tasks:', error.message);
      alertRef.current.displayAlert('error', t('saveFail'));
    }
  };

  const events = tasks.filter((task) => task.status !== 'Cancelled')
    .map(task => ({
      id: task._id,
      title: task.taskName,
      start: dateMode === 'estimated' ? task.startDate : task.actualStartDate,
      end: dateMode === 'estimated' ? task.endDate : task.actualEndDate,
      backgroundColor: getStatusColor(task.status),
      extendedProps: {
        task: task
      }
  }));

  const handleClose = () => {
    setDialogOpen(false);
    setSelectedTasks([]);
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
    setSelectedTask(null);
  };

  const handleAddTask = async (newTask) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_SERVER_HOST}/api/task`, newTask);
      setTasks((prevTasks) => [...prevTasks, response.data]);
    } catch (error) {
      console.error('Error adding task:', error.message);
    }
  };

  const onSaveTask = (updatedTask) => {
    handleSaveTask(updatedTask, tasks, setTasks);
  };

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

  if (isLoading) {
    return (
      <div>
        <Stack direction="row" justifyContent="space-between" spacing={2}>
          <Skeleton variant="rounded" width={150} height={40} />
          <Skeleton variant="rounded" width={150} height={40} />
        </Stack>
        <Grid container spacing={1} style={{ marginTop: '20px' }}>
          {Array.from(new Array(35)).map((_, index) => (
            <Grid item xs={12 / 7} key={index}>
              <Skeleton variant="rounded" width="100%" height={100} />
            </Grid>
          ))}
        </Grid>
        <Skeleton variant="rounded" width={100} height={40} style={{ marginTop: '20px' }} />
      </div>
    );
  }

  return (
    <MainContent pageTitle={t('calendar')} breadcrumbItems={breadcrumbItems}>
      {project && (
        <Paper variant="outlined" style={{ padding: isMobile? '0.5rem':'1rem' }}>
          <div className="task-calendar">
            <Stack direction="row" justifyContent="space-between">
              <ButtonGroup size="small" style={{ textAlign: 'center' }}>
                <Tooltip title={t('estimatedSchedule')} placement="top">
                  <Button
                    variant={dateMode === 'estimated' ? 'contained' : 'outlined'}
                    onClick={() => setDateMode('estimated')}
                  >
                    {t('estimatedSchedule')}
                  </Button>
                </Tooltip>
                <Tooltip title={t('actualSchedule')} placement="top">
                  <Button
                    variant={dateMode === 'actual' ? 'contained' : 'outlined'}
                    onClick={() => setDateMode('actual')}
                  >
                    {t('actualSchedule')}
                  </Button>
                </Tooltip>
              </ButtonGroup>
            </Stack>

            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin, listPlugin, multiMonthPlugin]}
              initialView="dayGridMonth"
              events={events}
              displayEventTime={false}
              dayMaxEventRows={5}
              editable={true}
              droppable={true}
              dateClick={handleDateClick}
              eventClick={handleEventClick}
              eventDrop={handleEventDrop}
              eventResize={handleEventResize}
              headerToolbar={{
                start: 'prevYear,prev,today,next,nextYear',
                center: 'title',
                end: 'multiMonthYear,dayGridMonth,dayGridWeek,dayGridDay,listYear,listMonth,listWeek,listDay',
              }}
              buttonText={{
                today: t('today'),
                year: t('year'),
                month: t('month'),
                week: t('week'),
                day: t('day'),
                listDay: t('listDay'),
                listWeek: t('listWeek'),
                listMonth: t('listMonth'),
                listYear: t('listYear'),
              }}
              height="auto"
              eventContent={renderEventContent}
              locale={i18n.language === 'en-us' ? 'en' : 'cn'}
            />

            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveChanges}
              disabled={taskUpdates.length === 0}
              style={{ marginTop: '20px' }}
            >
              {t('save')}
            </Button>

            <CDialog
              open={dialogOpen}
              onClose={handleClose}
              title={t('task')}
            >
              <ListTableSwitcher
                project={project}
                tasks={selectedTasks}
                setTasks={setSelectedTasks}
                displayProjectSelector={true}
                displayMilestoneSelector={true}
              />
            </CDialog>

            {selectedTask && (
              <TaskEditForm
                taskId={selectedTask._id}
                mode="update"
                open={editDialogOpen}
                handleClose={handleEditClose}
                handleSave={onSaveTask}
                handleDuplicate={() => {}}
                setTaskToDelete={setTaskToDelete}
                setOpenConfirmDeleteDialog={setOpenConfirmDeleteDialog}
              />
            )}

            {createFormOpen && (
              <TaskCreateForm
                projectId={project._id}
                open={createFormOpen}
                handleClose={() => setCreateFormOpen(false)}
                handleAddTask={handleAddTask}
                dateMode={dateMode}
                defaultStartDate={selectedDate}
                defaultEndDate={selectedDate}
              />
            )}

            <ConfirmDeleteDialog
              title={t('deleteTask')}
              content={t('deleteTaskConfirm')}
              open={openConfirmDeleteDialog}
              onCancel={onCancelDelete}
              onConfirm={onConfirmDelete}
            />

            <CAlert ref={alertRef} />

            <TaskPopper
              task={selectedTaskForPopper}
              anchorEl={popperAnchorEl}
              open={popperOpen}
            />
          </div>
        </Paper>
      )}
    </MainContent>
  );
};

export default ProjectCalendar;