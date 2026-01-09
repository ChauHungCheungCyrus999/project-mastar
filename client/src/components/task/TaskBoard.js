import React, { useContext, useState, useEffect, useRef } from 'react';
import {
  Typography, Badge, Tooltip, Paper,
  List, ListItem, ListItemIcon,
  Container, Box, Grid, Skeleton
} from '@mui/material';
import { Done, RateReviewOutlined, PauseOutlined, RotateLeftOutlined, CloseOutlined, AssignmentOutlined } from '@mui/icons-material';

import ConfirmDeleteDialog from '../custom/ConfirmDeleteDialog';
import TaskCard  from './TaskCard';
import TaskEditForm from './TaskEditForm';
import CAlert from '../custom/CAlert';

import {
  handleCloseEditForm,
  handleEdit, handleSaveTask, handleDuplicate,
  handleDelete, confirmDelete, cancelDelete,
  handleMarkAsCompleted
} from '../../utils/TaskUtils.js';
import { capitalizeWordsExceptFirst } from '../../utils/StringUtils.js';

import { useTranslation } from 'react-i18next';

import UserContext from '../../UserContext';

const TaskBoard = ({ project, tasks, setTasks, showTaskDetails }) => {
  const { user, setUser } = useContext(UserContext);

  const { t } = useTranslation();

  // Alert
  const alertRef = useRef();

  // Skeleton
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false);
    }, 10);
  }, []);

  // Update
  const [mode, setMode] = useState("update");
  const [editedTask, setEditedTask] = useState(null);
  const [isEditFormOpen, setEditFormOpen] = useState(false);

  // Delete
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [openConfirmDeleteDialog, setOpenConfirmDeleteDialog] = useState(false);

  // Close Task Edit Form
  const handleCloseForm = (event, reason) => {
    /*if (reason && reason === "backdropClick")
      return;*/
    handleCloseEditForm(setEditedTask, setEditFormOpen);
  };

  // Update/Duplicate Task
  const onEdit = (taskId, mode) => {
    handleEdit(taskId, mode, tasks, setMode, setEditedTask, setEditFormOpen);
  };
  
  const onSaveTask = (updatedTask) => {
    handleSaveTask(updatedTask, tasks, setTasks);
  };
  
  const onDuplicate = (duplicatedTask) => {
    handleDuplicate(duplicatedTask, setTasks, setEditFormOpen);
  };

  // Delete Task
  const onDeleteClick = (taskId) => {
    handleDelete(taskId, setOpenConfirmDeleteDialog, setTaskToDelete);
  };

  const onConfirmDelete = () => {
    confirmDelete(taskToDelete, setTasks, setOpenConfirmDeleteDialog, user)
      .then(() => {
        alertRef.current.displayAlert('success', t('deleteSuccess'));
      })
      .catch((error) => {
        console.error('Error deleting task:', error);
        if (error.response?.status === 403) {
          alertRef.current.displayAlert('error', error.response.data.error || t('deleteFail'));
        } else {
          alertRef.current.displayAlert('error', t('deleteFail'));
        }
      });
  };

  const onCancelDelete = () => {
    cancelDelete(setOpenConfirmDeleteDialog);
  };

  // Mark As Completed
  const onMarkAsCompleted = async (taskId) => {
    await handleMarkAsCompleted(taskId, tasks, setTasks, user, "Done");
  };

  // Display Status
  const [statusValue, setStatusValue] = useState({
	  //"": false,
    "To Do": true,
    "In Progress": true,
    "Under Review": true,
    "Done": true,
    "On Hold": true,
    "Cancelled": true
  });


  // Group tasks by status
  const groupedTasks = tasks.reduce((result, task) => {
    const { status } = task;
    if (!result[status]) {
      result[status] = [];
    }
    result[status].push(task);
    return result;
  }, {});

  const colorStatuses = [
    { status: 'Unassigned', backgroundColor: '', color: 'black' },
    { status: 'To Do', backgroundColor: '#89CFF0', color: 'black', icon: <AssignmentOutlined /> },
    { status: 'In Progress', backgroundColor: '#FFE5A0', color: 'black', icon: <RotateLeftOutlined /> },
    { status: 'Under Review', backgroundColor: '#E6CFF2', color: 'black', icon: <RateReviewOutlined /> },
    { status: 'Done', backgroundColor: '#D4EDBC', color: 'black', icon: <Done /> },
    { status: 'On Hold', backgroundColor: '#FFBD9C', color: 'black', icon: <PauseOutlined /> },
    { status: 'Cancelled', backgroundColor: '#C9C9C9', color: 'black', icon: <CloseOutlined /> }
  ];

  const getStatusColor = (status) => {
    const foundStatus = colorStatuses.find((item) => {
      const transformedStatus = item.status;
      //console.log('Transformed Status:', transformedStatus);
      //console.log('Current Status:', status);
      return transformedStatus === status;
    });
    return foundStatus ? foundStatus.backgroundColor : '#dcdcdc';
  };
  

  if (isLoading) {
    return (
      <Grid container spacing={1} sx={{ mt: 0.5 }}>
        {Array.from(new Array(5)).map((_, index) => (
          <Grid item xs={12} sm={6} md={4} lg={4} xl={2.4} key={index}>
            <Skeleton variant="text" height={40} sx={{ mb: 1 }} />
            <Skeleton variant="rounded" width="100%" height={550} />
          </Grid>
        ))}
      </Grid>
    );
  }
  
  return (
    <div>      
      {/* Task board */}
      <Grid container spacing={1} sx={{ mt: 0.5 }}>
        {/* Render all statuses */}
        {Object.keys(statusValue).map((status) => (
          // Check if the status is enabled in the statusValue object before rendering the Grid
          statusValue[status] && status !== "Cancelled"/* && groupedTasks[status] && groupedTasks[status].length > 0*/ && (
            <Grid item xs={12} sm={6} md={4} lg={4} xl={2.4} key={status}>
              <div style={{ borderRadius: '8px' }}>
              <Typography
                variant="body1"
                component="h2"
                sx={{
                  color: 'text.primary',
                  borderBottom: `5px solid ${getStatusColor(status)}`,
                  mb: '0.5rem',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {colorStatuses.find((item) => item.status === status)?.icon}
                <Box sx={{ ml: '0.5rem' }}>
                  <Typography variant="body1" color="text.primary">
                    {status === "" ? t('unassigned') : t(capitalizeWordsExceptFirst(status))}
                  </Typography>
                </Box>
                <Badge
                  badgeContent={groupedTasks[status] ? groupedTasks[status].length : 0}
                  sx={{
                    ml: '1.5rem',
                    mb: '0.3rem',
                    '& .MuiBadge-badge': {
                      backgroundColor: getStatusColor(status),
                      color: 'black',
                    },
                  }}
                />
              </Typography>
                <Paper elevation={0} style={{ height: '65.5vh', overflow: 'auto', padding: '5px' }}>
                  {groupedTasks[status] && groupedTasks[status].length > 0 ? (
                    groupedTasks[status]
                      /*.sort((a, b) => new Date(b.updatedDate) - new Date(a.updatedDate))*/
                      .map((task, index) => (
                        <TaskCard
                          key={index}
                          task={task}
                          tasks={tasks}
                          setTasks={setTasks}
                          setMode={setMode}
                          setEditedTask={setEditedTask}
                          setEditFormOpen={setEditFormOpen}
                          handleMarkAsCompleted={onMarkAsCompleted}
                          handleEdit={onEdit}
                          handleDuplicate={onDuplicate}
                          setTaskToDelete={setTaskToDelete}
                          handleDelete={onDeleteClick}
                          setOpenConfirmDeleteDialog={setOpenConfirmDeleteDialog}
                          showTaskDetails={showTaskDetails}
                          onShowAlert={(message, type) => alertRef.current.displayAlert(type, message)}
                        />
                      ))
                  ) : (
                    <Typography variant="body1"></Typography>
                  )}
                </Paper>
              </div>
            </Grid>
          )
        ))}
      </Grid>

      {isEditFormOpen && (
        <TaskEditForm
          taskId={editedTask._id}
          setTasks={setTasks}
          mode={mode}
          open={isEditFormOpen}
          handleClose={handleCloseForm}
          handleSave={onSaveTask}
          handleDuplicate={onDuplicate}
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

      <CAlert ref={alertRef} />
    </div>
  );
};

export default TaskBoard;
