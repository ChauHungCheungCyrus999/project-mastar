import React, { useContext, useState, useEffect, useRef } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Paper, Skeleton, List, ListItem, ListItemAvatar, ListItemButton, ListItemText, Avatar, Typography, Grid, Stack, Tooltip, Tabs, Tab, Divider, useMediaQuery, IconButton, Box,
  TableContainer, Table, TableHead, TableRow, TableBody, TableCell, TableSortLabel
} from '@mui/material';
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
import MoveTaskDialog from './MoveTaskDialog';

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

const TaskList = ({ tasks, setTasks, height="100%", showTaskDetails, displayTab=true }) => {
  const theme = useTheme();
  
  const { t } = useTranslation();
  const { user } = useContext(UserContext);
  const projectId = window.location.href.split("/")[4];
  const isMobile = useMediaQuery('(max-width:600px)');

  // Alert
  const alertRef = useRef();

  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 10);
  }, []);

  // Sorting
  const [order, setOrder] = useState('asc'); // 'asc' or 'desc'
  const [orderBy, setOrderBy] = useState('taskName'); // Default column to sort
  
  const statusOrder = ['To Do', 'In Progress', 'Under Review', 'On Hold', 'Done', 'Cancelled'];
  const priorityOrder = ['Very Low', 'Low', 'Medium', 'High', 'Very High'];
  const difficultyLevelOrder = ['Easy', 'Moderate', 'Difficulty', 'Very Difficult'];

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedTasks = tasks.sort((a, b) => {
    let valueA = a[orderBy];
    let valueB = b[orderBy];

    // Handle nested fields or custom sorting logic
    if (orderBy === 'milestone') {
      valueA = a.milestone || '';
      valueB = b.milestone || '';
    } else if (orderBy === 'category') {
      valueA = a.category || '';
      valueB = b.category || '';
    } else if (orderBy === 'personInCharge') {
      valueA = a.personInCharge || '';
      valueB = b.personInCharge || '';
    } else if (orderBy === 'status') {
      valueA = statusOrder.indexOf(a.status) !== -1 ? statusOrder.indexOf(a.status) : Infinity;
      valueB = statusOrder.indexOf(b.status) !== -1 ? statusOrder.indexOf(b.status) : Infinity;
    } else if (orderBy === 'priority') {
      valueA = priorityOrder.indexOf(a.priority) !== -1 ? priorityOrder.indexOf(a.priority) : Infinity;
      valueB = priorityOrder.indexOf(b.priority) !== -1 ? priorityOrder.indexOf(b.priority) : Infinity;
    } else if (orderBy === 'difficultyLevel') {
      valueA = difficultyLevelOrder.indexOf(a.difficultyLevel) !== -1 ? difficultyLevelOrder.indexOf(a.difficultyLevel) : Infinity;
      valueB = difficultyLevelOrder.indexOf(b.difficultyLevel) !== -1 ? difficultyLevelOrder.indexOf(b.difficultyLevel) : Infinity;
    } else if (orderBy === 'estimatedDate') {
      valueA = a.startDate || '';
      valueB = b.startDate || '';
    }  else if (orderBy === 'actualDate') {
      valueA = a.actualStartDate || '';
      valueB = b.actualStartDate || '';
    }  else if (orderBy === 'taskName') {
      valueA = a.taskName?.toLowerCase() || '';
      valueB = b.taskName?.toLowerCase() || '';
    }

    if (valueA < valueB) {
      return order === 'asc' ? -1 : 1;
    }
    if (valueA > valueB) {
      return order === 'asc' ? 1 : -1;
    }
    return 0;
  });


  const [mode, setMode] = useState("update");
  const [editedTask, setEditedTask] = useState(null);
  const [isEditFormOpen, setEditFormOpen] = useState(false);
  
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [openConfirmDeleteDialog, setOpenConfirmDeleteDialog] = useState(false);

  const [contextMenu, setContextMenu] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  // Move
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [taskToMove, setTaskToMove] = useState(null);

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
    if (action === 'move') onMoveClick(selectedTask._id);
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

  // Move Task
  const onMoveClick = (taskId) => {
    const task = tasks.find(t => t._id === taskId);
    if (task) {
      setTaskToMove(task);
      setMoveDialogOpen(true);
    }
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
    <Paper elevation={0} style={{ backgroundColor: 'background.paper' }}>
      {displayTab && (
        <Paper variant="none" elevation={0} style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: 'background.default' }}>
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
                  fontSize: '0.8rem',
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

      {sortedTasks.length === 0 ? (
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
        <TableContainer style={{ height: height, maxHeight: '62vh', overflowY: 'auto' }}>
          <Table
            size="small"
            stickyHeader
            sx={{
              "& .MuiTableRow-root:hover": {
                backgroundColor: theme.palette.action.hover
              }
            }}
          >
            {!isMobile && (
              <TableHead style={{ whiteSpace: "nowrap" }}>
                <TableRow>
                  <TableCell
                    sortDirection={orderBy === 'taskName' ? order : false}
                    style={{ fontWeight: 'bold' }}
                  >
                    <TableSortLabel
                      active={orderBy === 'taskName'}
                      direction={orderBy === 'taskName' ? order : 'asc'}
                      onClick={(event) => handleRequestSort(event, 'taskName')}
                    >
                      {t('taskName')}
                    </TableSortLabel>
                  </TableCell>
                  {showTaskDetails?.milestone && (
                    <TableCell
                      sortDirection={orderBy === 'status' ? order : false}
                      style={{ fontWeight: 'bold' }}
                    >
                      <TableSortLabel
                        active={orderBy === 'milestone'}
                        direction={orderBy === 'milestone' ? order : 'asc'}
                        onClick={(event) => handleRequestSort(event, 'milestone')}
                      >
                        {t('milestone')}
                      </TableSortLabel>
                    </TableCell>
                  )}
                  {showTaskDetails?.category && (
                    <TableCell
                      sortDirection={orderBy === 'category' ? order : false}
                      style={{ fontWeight: 'bold' }}
                    >
                      <TableSortLabel
                        active={orderBy === 'category'}
                        direction={orderBy === 'category' ? order : 'asc'}
                        onClick={(event) => handleRequestSort(event, 'category')}
                      >
                        {t('category')}
                      </TableSortLabel>
                    </TableCell>
                  )}
                  {showTaskDetails?.personInCharge && (
                    <TableCell
                      sortDirection={orderBy === 'personInCharge' ? order : false}
                      style={{ fontWeight: 'bold' }}
                    >
                      <TableSortLabel
                        active={orderBy === 'personInCharge'}
                        direction={orderBy === 'personInCharge' ? order : 'asc'}
                        onClick={(event) => handleRequestSort(event, 'personInCharge')}
                      >
                        {t('personInCharge')}
                      </TableSortLabel>
                    </TableCell>
                  )}
                  {showTaskDetails?.status && (
                    <TableCell
                      sortDirection={orderBy === 'status' ? order : false}
                      style={{ fontWeight: 'bold' }}
                    >
                      <TableSortLabel
                        active={orderBy === 'status'}
                        direction={orderBy === 'status' ? order : 'asc'}
                        onClick={(event) => handleRequestSort(event, 'status')}
                      >
                        {t('status')}
                      </TableSortLabel>
                    </TableCell>
                  )}
                  {showTaskDetails?.difficultyLevel && (
                    <TableCell
                      sortDirection={orderBy === 'difficultyLevel' ? order : false}
                      style={{ fontWeight: 'bold' }}
                    >
                      <TableSortLabel
                        active={orderBy === 'difficultyLevel'}
                        direction={orderBy === 'difficultyLevel' ? order : 'asc'}
                        onClick={(event) => handleRequestSort(event, 'difficultyLevel')}
                      >
                        {t('difficultyLevel')}
                      </TableSortLabel>
                    </TableCell>
                  )}
                  {showTaskDetails?.estimatedDate && (
                    <TableCell
                      sortDirection={orderBy === 'estimatedDate' ? order : false}
                      style={{ fontWeight: 'bold' }}
                    >
                      <TableSortLabel
                        active={orderBy === 'estimatedDate'}
                        direction={orderBy === 'estimatedDate' ? order : 'asc'}
                        onClick={(event) => handleRequestSort(event, 'estimatedDate')}
                      >
                        {t('estimatedDate')}
                      </TableSortLabel>
                    </TableCell>
                  )}
                  {showTaskDetails?.actualDate && (
                    <TableCell
                      sortDirection={orderBy === 'actualDate' ? order : false}
                      style={{ fontWeight: 'bold' }}
                    >
                      <TableSortLabel
                        active={orderBy === 'actualDate'}
                        direction={orderBy === 'actualDate' ? order : 'asc'}
                        onClick={(event) => handleRequestSort(event, 'actualDate')}
                      >
                        {t('actualDate')}
                      </TableSortLabel>
                    </TableCell>
                  )}
                  {showTaskDetails?.priority && (
                    <TableCell
                      sortDirection={orderBy === 'priority' ? order : false}
                      style={{ fontWeight: 'bold' }}
                    >
                      <TableSortLabel
                        active={orderBy === 'priority'}
                        direction={orderBy === 'priority' ? order : 'asc'}
                        onClick={(event) => handleRequestSort(event, 'priority')}
                      >
                        {t('priority')}
                      </TableSortLabel>
                    </TableCell>
                  )}
                  {showTaskDetails?.action && (
                    <TableCell style={{ fontWeight: 'bold' }}>{t('action')}</TableCell>
                  )}
                </TableRow>
              </TableHead>
            )}
            <TableBody>
              {filteredTasks.map((task, index) => (
                <TableRow
                  key={task._id}
                  onClick={() => handleListItemClick(task)}
                  onContextMenu={(e) => handleContextMenu(e, task)}
                >
                  <TableCell>
                  <Grid container alignItems="center" spacing={1}>
                    <Grid item>
                      <Avatar
                        variant="rounded"
                        sx={{
                          color: 'white',
                          bgcolor: `rgba(${hexToRGB(task.color)})`,
                          width: 30,
                          height: 30,
                          fontSize: '1rem',
                        }}
                      >
                        {task.status === "Done" ? (
                          <Done />
                        ) : task.endDate && new Date(task.endDate) < new Date() + 1 && task.status !== "Done" && task.status !== "Cancelled" ? (
                          <AccessAlarmOutlined />
                        ) : task.status === "On Hold" ? (
                          <PauseOutlined />
                        ) : task.status === "In Progress" ? (
                          <RotateLeftOutlined />
                        ) : task.status === "Under Review" ? (
                          <RateReviewOutlined />
                        ) : task.status === "Cancelled" ? (
                          <CloseOutlined />
                        ) : (
                          <AssignmentOutlined />
                        )}
                      </Avatar>
                    </Grid>
                    <Grid item>
                      <Typography
                        variant="body1"
                        sx={{
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '100%',
                          '@media (max-width: 600px)': {
                            whiteSpace: 'normal',
                            wordWrap: 'break-word',
                          },
                        }}
                      >
                        {task.taskName}
                      </Typography>
                    </Grid>
                  </Grid>
                  </TableCell>
                  {showTaskDetails?.milestone && (
                    <TableCell>
                      {task?.milestone && (
                        <MilestoneFlag milestone={task?.milestone} />
                      )}
                    </TableCell>
                  )}
                  {showTaskDetails?.category && <TableCell>{task.category}</TableCell>}
                  {showTaskDetails?.personInCharge && (
                    <TableCell align="right">
                      <Box display="flex" justifyContent="flex-start">
                        <AccountAvatar users={task.personInCharge} size="small" displayPopper={true} />
                      </Box>
                    </TableCell>
                  )}
                  {showTaskDetails?.status && (
                    <TableCell>
                      <StatusChip status={task.status} />
                    </TableCell>
                  )}
                  {showTaskDetails?.difficultyLevel && (
                    <TableCell>
                      <DifficultyLevelChip mode="icon" difficultyLevel={task.difficultyLevel} />
                    </TableCell>
                  )}
                  {showTaskDetails?.estimatedDate && (
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      {(task.startDate ? formatDate(task.startDate) : t('unknown')) + '\u00A0 - \u00A0' + (task.endDate ? formatDate(task.endDate) : t('unknown'))}
                    </TableCell>
                  )}
                  {showTaskDetails?.actualDate && (
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      {(task.actualStartDate ? formatDate(task.actualStartDate) : t('unknown')) + '\u00A0 - \u00A0' + (task.actualEndDate ? formatDate(task.actualEndDate) : t('unknown'))}
                    </TableCell>
                  )}
                  {showTaskDetails?.priority && (
                    <TableCell>
                      <PriorityChip priority={task.priority} />
                    </TableCell>
                  )}
                  {showTaskDetails?.action && (
                    <TableCell>
                      <Tooltip title={t('options')}>
                        <IconButton edge="end" onClick={(e) => handleContextMenu(e, task)}>
                          <MoreVert />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
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
          onMove={(event) => handleMenuAction(event, 'move')}
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

      {/* Move Task Dialog */}
      {taskToMove && (
        <MoveTaskDialog
          open={moveDialogOpen}
          onClose={() => setMoveDialogOpen(false)}
          taskId={taskToMove._id}
          currentProjectId={taskToMove.project._id}
          onTaskMoved={(taskId) => {
            if (setTasks && typeof setTasks === 'function') {
              setTasks(prevTasks => prevTasks.filter(t => t._id !== taskId));
            }
          }}
          onSuccess={(message, type) => alertRef.current.displayAlert(type, message)}
        />
      )}

      <CAlert ref={alertRef} />
    </Paper>
  );
};

export default TaskList;
