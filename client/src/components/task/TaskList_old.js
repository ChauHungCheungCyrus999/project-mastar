import React, { useContext, useState, useEffect, useRef } from 'react';
import { Paper, Skeleton, List, ListItem, ListItemAvatar, ListItemButton, ListItemText, Avatar, Typography, Grid, Stack, Tooltip, Tabs, Tab, Divider, useMediaQuery, IconButton, Box } from '@mui/material';
import { Done, RotateLeftOutlined, RateReviewOutlined, AccessAlarmOutlined, AssignmentOutlined, PauseOutlined, CloseOutlined, Edit, Delete, MoreVert } from '@mui/icons-material';

import { useTranslation } from 'react-i18next';

import { formatDate } from '../../utils/DateUtils.js';

import TaskEditForm from '../task/TaskEditForm';
import StatusChip from '../StatusChip';
import PriorityChip from '../PriorityChip';
import DifficultyLevelChip from '../DifficultyLevelChip';
import MilestoneFlag from '../MilestoneFlag';
import TagChip from '../TagChip';
import AccountAvatar from '../AccountAvatar';
import ConfirmDeleteDialog from '../custom/ConfirmDeleteDialog';
import CContextMenu from '../custom/CContextMenu';
import CAlert from '../../components/custom/CAlert';

import {
  handleCloseEditForm,
  handleEdit,
  handleSaveTask,
  handleDuplicate,
  handleDelete,
  confirmDelete,
  cancelDelete,
  handleMarkAsCompleted
} from '../../utils/TaskUtils.js';
import hexToRGB from '../../utils/ColorUtils.js';

import UserContext from '../../UserContext';

const TaskList = ({ tasks, setTasks, height="100%", theme, showTaskDetails, displayTab=true }) => {
  const { t } = useTranslation();
  const { user } = useContext(UserContext);
  const projectId = window.location.href.split("/")[4];

  // Alert
  const alertRef = useRef();

  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 10);
  }, []);

  const [mode, setMode] = useState("update");
  const [editedTask, setEditedTask] = useState(null);
  const [isEditFormOpen, setEditFormOpen] = useState(false);
  
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [openConfirmDeleteDialog, setOpenConfirmDeleteDialog] = useState(false);

  const [contextMenu, setContextMenu] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  const handleListItemClick = (task) => {
    setEditedTask(task);
    setEditFormOpen(true);
  };

  const handleContextMenu = (event, task) => {
    event.preventDefault();
    event.stopPropagation();
    setContextMenu({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4
    });
    setSelectedTask(task);
  };

  const handleCloseMenu = () => {
    setContextMenu(null);
    setSelectedTask(null);
  };

  const handleMenuAction = (event, action) => {
    if (action === 'edit') onEdit(selectedTask._id, 'update');
    if (action === 'duplicate') onEdit(selectedTask._id, "duplicate");
    if (action === 'delete') onDeleteClick(selectedTask._id);
    if (action === 'markAsCompleted') onMarkAsCompleted(selectedTask._id);
    if (action === 'share') onShare(event, selectedTask._id);
    handleCloseMenu();
  };

  const handleCloseForm = (event, reason) => {
    handleCloseEditForm(setEditedTask, setEditFormOpen);
  };

  const onEdit = (taskId, mode) => {
    handleEdit(taskId, mode, tasks, setMode, setEditedTask, setEditFormOpen);
  };

  const onSaveTask = (updatedTask) => {
    handleSaveTask(updatedTask, tasks, setTasks);
  };

  const onDuplicate = (duplicatedTask) => {
    handleDuplicate(duplicatedTask, setTasks, setEditFormOpen);
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

  const onMarkAsCompleted = async (taskId) => {
    await handleMarkAsCompleted(taskId, tasks, setTasks, user, "Done");
  };

  const onShare = (event, taskId) => {
    const link = `${process.env.REACT_APP_CLIENT_HOST}/project/${projectId}/task/${taskId}`;
    navigator.clipboard.writeText(link);
    alertRef.current.displayAlert('success', t('copySuccess'));
    handleCloseMenu(event);
  };

  const [overdueTasks, setOverdueTasks] = useState([]);
  useEffect(() => {
    const overdueTasks = tasks.filter(task => task.endDate && task.endDate < new Date() + 1 && task.status !== 'Done' && task.status !== 'Cancelled');
    setOverdueTasks(overdueTasks);
  }, [tasks]);

  const [selectedTab, setSelectedTab] = useState(() => {
    return displayTab ? (localStorage.getItem("selectedTab") || "All") : "All";
  });

  useEffect(() => {
    localStorage.setItem("selectedTab", selectedTab);
  }, [selectedTab]);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const filteredTasks = tasks.filter((task) => 
    (selectedTab === "All" || task.status === selectedTab) || (selectedTab === "Overdue" && overdueTasks.includes(task))
  );

  const getTaskCountByStatus = (status) => {
    if (status === "Overdue")
      return tasks.filter(task => task.endDate && task.endDate < new Date() + 1 && task.status !== 'Done' && task.status !== 'Cancelled').length;
    return tasks.filter(task => task.status === status).length;
  };

  const colorStatuses = [
    { label: t('all'), backgroundColor: '#193f70', count: tasks.length, value: "All" },
    { label: t('toDo'), backgroundColor: '#89CFF0', count: getTaskCountByStatus("To Do"), value: "To Do", icon: <AssignmentOutlined /> },
    { label: t('inProgress'), backgroundColor: '#FFE5A0', count: getTaskCountByStatus("In Progress"), value: "In Progress", icon: <RotateLeftOutlined /> },
    { label: t('underReview'), backgroundColor: '#E6CFF2', count: getTaskCountByStatus("Under Review"), value: "Under Review", icon: <RateReviewOutlined /> },
    { label: t('done'), backgroundColor: '#D4EDBC', count: getTaskCountByStatus("Done"), value: "Done", icon: <Done /> },
    { label: t('onHold'), backgroundColor: '#FFBD9C', count: getTaskCountByStatus("On Hold"), value: "On Hold", icon: <PauseOutlined /> },
    { label: t('cancelled'), backgroundColor: '#A9A9A9', count: getTaskCountByStatus("Cancelled"), value: "Cancelled", icon: <CloseOutlined /> },
    //{ label: t('overdue'), backgroundColor: '#FF6347', count: getTaskCountByStatus("Overdue"), value: "Overdue" }
  ];

  const isTablet = useMediaQuery('(max-width:900px)');

  if (isLoading) {
    return (
      <Paper elevation={0} style={{ backgroundColor: 'transparent' }}>
        {displayTab && (
          <>
            <Tabs variant="scrollable" scrollButtons="auto">
              {colorStatuses.map((status, index) => (
                <Tab
                  key={index}
                  label={<Skeleton width={80} />}
                  sx={{
                    //borderTopLeftRadius: '10%',
                    //borderTopRightRadius: '10%',
                    border: '1px solid lightGray'
                  }}
                />
              ))}
            </Tabs>
            <Divider />
          </>
        )}
  
        <List dense={true} style={{ padding: 0, width: '100%', height: height, maxHeight: '62vh', overflowY: 'auto' }}>
          {[...Array(5)].map((_, index) => (
            <ListItem key={index} sx={{ borderBottom: index < 4 ? '1px solid #ccc' : 'none' }}>
              <ListItemAvatar>
                <Avatar variant="rounded" sx={{
                  width: isTablet? 30 : 30,
                  height: isTablet? 30 : 30
                }}>
                  <Skeleton variant="rounded" width={40} height={40} />
                </Avatar>
              </ListItemAvatar>
  
              <Grid container alignItems="center">
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle1" component="div">
                    <Skeleton width="60%" />
                  </Typography>
                  <Typography variant="subtitle2" component="div">
                    <Skeleton width="40%" />
                  </Typography>
                </Grid>
  
                <Grid item xs={12} sm={6} md={3}>
                  <Grid container spacing={1} alignItems="center">
                    <Grid item>
                      <Skeleton variant="circular" width={24} height={24} />
                    </Grid>
                  </Grid>
                  <Grid container spacing={1} alignItems="center">
                    <Grid item>
                      <Skeleton variant="rounded" width={60} height={20} />
                    </Grid>
                    <Grid item>
                      <Skeleton variant="rounded" width={60} height={20} />
                    </Grid>
                  </Grid>
                </Grid>
  
                <Grid item xs={6} sm={3} md={2}>
                  <Skeleton width="80%" />
                </Grid>
                <Grid item xs={6} sm={3} md={2}>
                  <Skeleton width="80%" />
                </Grid>
  
                <Grid item xs={6} sm={3} md={1}>
                  <Skeleton variant="rounded" width={40} height={20} />
                </Grid>
              </Grid>
            </ListItem>
          ))}
        </List>
      </Paper>
    );
  }
  
  return (
    <Paper elevation={0} style={{ backgroundColor: 'transparent' }}>
      {displayTab && (
        <Paper variant="none" elevation={0} style={{ position: 'sticky', top: 0, zIndex: 100 }}>
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ minHeight: "30px", height: "35px", alignItems: "center" }}
            TabIndicatorProps={{
              sx: {
                //bgcolor: "orange",
                height: "20px"
              }
            }}
          >
            {colorStatuses.map((status, index) => (
              <Tab
                key={index}
                label={`${status.label} (${status.count})`}
                value={status.value}
                icon={status.icon}
                iconPosition="start"
                sx={{
                  //borderTopLeftRadius: '10%',
                  //borderTopRightRadius: '10%',
                  //border: '1px solid lightGray',
                  //backgroundColor: status.backgroundColor,
                  borderLeft: `10px solid ${status.backgroundColor}`
                }}
              />
            ))}
          </Tabs>

          <Divider />
        </Paper>
      )}

      {filteredTasks.length === 0 ? (
        <Box 
          sx={{ 
            width: '100%', 
            minHeight: height, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}
        >
          <Typography variant="body1">{t('noTaskInStatus')}</Typography>
        </Box>
      ) : (
        <List dense={true} style={{
          padding: 0,
          margin: "0 0.5",
          width: '100%',
          height: height,
          //maxHeight: '62vh',
          overflowY: 'auto',
          flexDirection: isTablet ? 'column' : 'row',
        }}>
          {filteredTasks.map((task, index) => (
            isTablet ? (
              <ListItem
                key={task._id}
                disablePadding
                onClick={() => handleListItemClick(task)}
                onContextMenu={(e) => handleContextMenu(e, task)}
                secondaryAction={
                  <>
                    <AccountAvatar users={task.personInCharge} size="small" displayPopper={true} />
                    {/*{task.status && <StatusChip status={task.status} />}
                    {task.difficultyLevel && <DifficultyLevelChip mode="icon" difficultyLevel={task.difficultyLevel} />}
                    {task.priority && <PriorityChip priority={task.priority} />}*/}
                  </>
                }
              >
                <ListItemButton>
                  {/*<ListItemAvatar>
                    <Avatar variant="rounded" sx={{ color: 'white', bgcolor: `rgba(${hexToRGB(task.color)})` }}>
                      {task.status === "Done" ? <Done />
                        : task.endDate && new Date(task.endDate) < new Date() + 1 && task.status !== "Done" && task.status !== "Cancelled" ? <AccessAlarmOutlined />
                        : task.status === "On Hold" ? <PauseOutlined />
                        : task.status === "In Progress" ? <RotateLeftOutlined />
                        : task.status === "Under Review" ? <RateReviewOutlined />
                        : task.status === "Cancelled" ? <CloseOutlined />
                        : <AssignmentOutlined />
                      }
                    </Avatar>
                  </ListItemAvatar>*/}
                  <ListItemText
                    id={task._id}
                    primary={
                      <Typography variant="body1">{task.taskName}</Typography>
                    }
                    secondary={
                      <Stack direction="row">
                        {showTaskDetails?.milestone && task?.milestone && (
                          <Box mr={1}>
                            <MilestoneFlag milestone={task?.milestone} />
                          </Box>
                        )}
                        {showTaskDetails?.category && (
                          <Typography variant="body2">{task.category}</Typography>
                        )}
                      </Stack>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ) : (
              <ListItem
                key={task._id}
                onClick={() => handleListItemClick(task)}
                onContextMenu={(e) => handleContextMenu(e, task)}
                sx={{
                  borderBottom: index < tasks.length - 1 ? '1px solid #ccc' : 'none',
                  flexDirection: 'row',
                  alignItems: 'center'
                }}
                secondaryAction={
                  <Box>
                    <Tooltip title={t('options')}>
                      <IconButton edge="end" onClick={(e) => handleContextMenu(e, task)}>
                        <MoreVert />
                      </IconButton>
                    </Tooltip>
                  </Box>
                }
              >
                <ListItemAvatar>
                  <Avatar variant="rounded" sx={{
                    color: 'white',
                    bgcolor: `rgba(${hexToRGB(task.color)})`,
                    width: isTablet? 30 : 30,
                    height: isTablet? 30 : 30,
                    fontSize: isTablet? '1rem':'1rem',
                  }}>
                    {task.status === "Done" ? <Done />
                      : task.endDate && new Date(task.endDate) < new Date() + 1 && task.status !== "Done" && task.status !== "Cancelled" ? <AccessAlarmOutlined />
                      : task.status === "On Hold" ? <PauseOutlined />
                      : task.status === "In Progress" ? <RotateLeftOutlined />
                      : task.status === "Under Review" ? <RateReviewOutlined />
                      : task.status === "Cancelled" ? <CloseOutlined />
                      : <AssignmentOutlined />
                    }
                  </Avatar>
                </ListItemAvatar>

                <Grid container alignItems="center">
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" component="div" style={{ fontWeight: 'bold' }}>
                      {task.taskName}
                    </Typography>
                    
                    {showTaskDetails?.category && (
                      <Typography variant="body2">{task.category}</Typography>
                    )}
                    
                    {showTaskDetails.tags && task.tags && (
                      <TagChip tags={task.tags} />
                    )}
                  </Grid>

                  <Grid item xs={12} sm={6} md={2}>
                    <Grid container spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      <Grid item>
                        {showTaskDetails?.milestone && task?.milestone && (
                          <MilestoneFlag milestone={task?.milestone} />
                        )}
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={12} sm={6} md={2}>
                    <Grid container spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      <Grid item>
                        {showTaskDetails?.personInCharge && (
                          <AccountAvatar users={task.personInCharge} size="small" displayPopper={true} />
                        )}
                      </Grid>
                    </Grid>
                    <Grid container spacing={1} alignItems="center">
                      <Grid item>
                        {showTaskDetails?.status && task.status && <StatusChip status={task.status} />}
                      </Grid>
                      <Grid item>
                        {showTaskDetails?.difficultyLevel && task.difficultyLevel && (
                          <DifficultyLevelChip mode="icon" difficultyLevel={task.difficultyLevel} />
                        )}
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={6} sm={3} md={2}>
                    {showTaskDetails?.estimatedDate && (
                      <ListItemText primary={t('estimated')} secondary={
                        (task.startDate ? formatDate(task.startDate) : t('unknown'))
                        + " - "
                        + (task.endDate ? formatDate(task.endDate) : t('unknown'))
                      } />
                    )}
                  </Grid>
                  <Grid item xs={6} sm={3} md={2}>
                    {showTaskDetails?.actualDate && (
                      <ListItemText primary={t('actual')} secondary={
                        (task.actualStartDate ? formatDate(task.actualStartDate) : t('unknown'))
                        + " - "
                        + (task.actualEndDate ? formatDate(task.actualEndDate) : t('unknown'))
                      } />
                    )}
                  </Grid>

                  <Grid item xs={6} sm={3} md={1}>
                    {showTaskDetails?.priority && task.priority && <PriorityChip priority={task.priority} />}
                  </Grid>
                </Grid>
              </ListItem>
            )
          ))}
        </List>
      )}

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

      {contextMenu && (
        <CContextMenu
          anchorEl={null}
          contextMenu={contextMenu}
          handleCloseMenu={handleCloseMenu}
          onMarkAsCompleted={(event) => handleMenuAction(event, 'markAsCompleted')}
          onShare={(event) => handleMenuAction(event, 'share')}
          onEdit={(event) => handleMenuAction(event, 'edit')}
          onDuplicate={(event) => handleMenuAction(event, 'duplicate')}
          onDelete={(event) => handleMenuAction(event, 'delete')}
          mode="task"
          role={user.role}
          projectId={projectId}
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
    </Paper>
  );
};

export default TaskList;