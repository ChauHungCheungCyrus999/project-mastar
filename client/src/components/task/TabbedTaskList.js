import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery, Paper, Skeleton, Box, Stack, List, ListItemButton, ListItem, ListItemIcon, Avatar, Typography, Grid, IconButton, Tooltip, Tabs, Tab, Divider, Chip } from '@mui/material';
import { Done, AccessAlarmOutlined, RateReviewOutlined, PauseOutlined, RotateLeftOutlined, CloseOutlined, AssignmentOutlined } from '@mui/icons-material';
import SplitPane, { Pane } from 'react-split-pane';
import './split-pane-resizer.css';
import EditIcon from '@mui/icons-material/Edit';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import PrintIcon from '@mui/icons-material/Print';

import axios from 'axios';

import TaskEditForm from './TaskEditForm';
import ConfirmDeleteDialog from '../custom/ConfirmDeleteDialog';
import AttachmentList from '../AttachmentList';

import StatusChip from '../StatusChip';
import PriorityChip from '../PriorityChip';
import DifficultyLevelChip from '../DifficultyLevelChip';
import MilestoneFlag from '../MilestoneFlag';
import TagChip from '../TagChip';
import AccountAvatar from '../AccountAvatar';
import SubtaskList from '../task/SubtaskList';
import CommentList from '../task/CommentList';

import CAlert from '../custom/CAlert';

import { useTranslation } from 'react-i18next';

import {
  handleCloseEditForm,
  handleEdit, handleSaveTask, handleDuplicate,
  handleDelete, confirmDelete, cancelDelete,
} from '../../utils/TaskUtils.js';
import hexToRGB from '../../utils/ColorUtils.js';
import { displayHtml } from '../../utils/RichTextUtils';
import { formatDate } from '../../utils/DateUtils.js';

const TabbedTaskList = ({ project, tasks, setTasks, showTaskDetails, displayTab=true }) => {
  const theme = useTheme();
  
  const { t } = useTranslation();

  const isTablet = useMediaQuery('(max-width:900px)');

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


  // Milestone State
  const [milestones, setMilestones] = useState([]);
  const [selectedMilestone, setSelectedMilestone] = useState('all'); // Default to "All Milestones"

  useEffect(() => {
    const fetchMilestones = async () => {
      try {
        const milestonesRes = await axios.get(
          `${process.env.REACT_APP_SERVER_HOST}/api/milestones/project/${project._id}/active`
        );
        setMilestones(milestonesRes.data);
      } catch (error) {
        console.error('Error fetching milestones:', error);
      }
    };

    fetchMilestones();
  }, [project._id]);

  const handleMilestoneClick = (milestoneId) => {
    //setSelectedMilestone((prev) => (prev === milestoneId ? 'all' : milestoneId));
    setSelectedMilestone(milestoneId);
  };

  // Filtered tasks based on selected milestone
  const milestoneFilteredTasks =
    selectedMilestone === 'all'
      ? tasks
      : tasks.filter((task) =>
          selectedMilestone === 'others'
            ? !task.milestone || !milestones.some((m) => m._id === task.milestone?._id)
            : task.milestone?._id === selectedMilestone
        );


  // Update
  const [mode, setMode] = useState("update");
  const [editedTask, setEditedTask] = useState(null);
  const [isEditFormOpen, setEditFormOpen] = useState(false);

  // Delete
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [openConfirmDeleteDialog, setOpenConfirmDeleteDialog] = useState(false);

  // Set the first task as the selected task by default
  const [selectedTask, setSelectedTask] = useState(tasks.length > 0 ? tasks[0] : null);

  useEffect(() => {
    if (tasks.length > 0 && selectedTask === null) {
      setSelectedTask(tasks[0]); // Set the first task as the selected task by default
    }
  }, []);

  const handleListItemClick = (task) => {
    setSelectedTask(task);
    //setFormOpen(true);
  };

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

  // Overdue Tasks
  const [overdueTasks, setOverdueTasks] = useState([]);
  useEffect(() => {
    const overdueTasks = tasks.filter(task => task.endDate && task.endDate < new Date() + 1 && task.status !== 'Done' && task.status !== 'Cancelled');
    setOverdueTasks(overdueTasks);
  }, [tasks]);

  // Status Tab
  const [selectedTab, setSelectedTab] = useState("All");

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const filteredTasks = milestoneFilteredTasks.filter((task) => 
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

  if (isLoading) {
    return (
      <Grid container>
        {displayTab && (
          <Grid item xs={12}>
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
          </Grid>
        )}
        <Grid item xs={12} sm={4}>
          <List dense={true}>
            {[...Array(5)].map((_, index) => (
              <ListItem key={index} sx={{ borderBottom: '1px solid lightGray'}}>
                <ListItemIcon>
                  <Skeleton variant="rounded" sx={{
                    width: isTablet? 30 : 30,
                    height: isTablet? 30 : 30
                  }}>
                    <Avatar />
                  </Skeleton>
                </ListItemIcon>
                <Box sx={{ width: '80%' }}>
                  <Skeleton variant="text" />
                  <Skeleton variant="text" width="60%" />
                </Box>
              </ListItem>
            ))}
          </List>
        </Grid>
        <Grid item xs={12} sm={8}>
          <Box padding={3}>
            <Skeleton variant="rounded" height={40} />
            <Box sx={{ mt: 2 }}>
              <Skeleton variant="text" width="50%" />
              <Skeleton variant="text" width="30%" />
            </Box>
            <Box sx={{ mt: 2 }}>
              <Skeleton variant="rounded" height={200} />
            </Box>
          </Box>
        </Grid>
      </Grid>
    );
  }

  return (
    <>
      {displayTab && (
        <>
          {/* Milestone Chips */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            <Chip
              label={t('all')}
              onClick={() => handleMilestoneClick('all')}
              color={selectedMilestone === 'all' ? 'primary' : 'default'}
              variant={selectedMilestone === 'all' ? 'filled' : 'outlined'}
              clickable
            />

            {milestones.map((milestone) => (
              <Chip
                key={milestone._id}
                label={milestone.title}
                onClick={() => handleMilestoneClick(milestone._id)}
                color={selectedMilestone === milestone._id ? 'primary' : 'default'}
                variant={selectedMilestone === milestone._id ? 'filled' : 'outlined'}
                clickable
              />
            ))}

            {tasks.some((task) => !task.milestone) && (
              <Chip
                label={t('uncategorized')}
                onClick={() => handleMilestoneClick('others')}
                color={selectedMilestone === 'others' ? 'primary' : 'default'}
                variant={selectedMilestone === 'others' ? 'filled' : 'outlined'}
                clickable
              />
            )}
          </Box>

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
                  /*paddingInline:'0.5em',*/ 
                  //borderTopLeftRadius: '10%',
                  //borderTopRightRadius: '10%',
                  //border: '1px solid lightGray',
                  borderLeft: `10px solid ${status.backgroundColor}`
                }}
              />
            ))}
          </Tabs>

          <Divider />
        </>
      )}
      
      <Grid container style={{ height: '62vh' }}>
        <SplitPane
          split="vertical"
          minSize={100}
          defaultSize={400}
          style={{ position: 'relative', overflow: 'hidden' }}
        >
          <div style={{ height: '100%', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
            <List dense={true} style={{ flex: 1, overflowY: 'auto', padding: 0 }}>
              {filteredTasks
                .filter((task) => statusValue[task.status])
                .map((task, index) => (
                  <ListItemButton
                    key={task._id}
                    onClick={() => handleListItemClick(task)}
                    sx={{
                      borderBottom: index < tasks.length - 1 ? '1px solid #ccc' : 'none',
                      backgroundColor: selectedTask === task ? theme.palette.action.selected : '',
                    }}
                  >
                    <ListItemIcon>
                      <Tooltip title={t(task.status)}>
                        <Avatar variant="rounded" sx={{
                          bgcolor: `rgba(${hexToRGB(task.color)})`,
                          width: isTablet? 30 : 30,
                          height: isTablet? 30 : 30,
                          fontSize: isTablet? '1rem':'1rem',
                        }}>
                          {task.status === 'Done' ? (
                            <Done />
                          ) : task.endDate && new Date(task.endDate) < new Date()+1 && task.status !== 'Done' && task.status !== 'Cancelled' ? (
                            <AccessAlarmOutlined />
                          ) : task.status === 'On Hold' ? (
                            <PauseOutlined />
                          ) : task.status === 'In Progress' ? (
                            <RotateLeftOutlined />
                          ) : task.status === 'Under Review' ? (
                            <RateReviewOutlined />
                          ) : task.status === 'Cancelled' ? (
                            <CloseOutlined />
                          ) : (
                            <AssignmentOutlined />
                          )}
                        </Avatar>
                      </Tooltip>
                    </ListItemIcon>

                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={11}>
                        <Typography variant="body2" component="div" style={{ fontWeight: 'bold' }}>
                          {task.taskName}
                        </Typography>
                        <Stack direction="row">
                          {/*{showTaskDetails?.milestone && task?.milestone && (
                            <Box mr={1}>
                              <MilestoneFlag milestone={task?.milestone} />
                            </Box>
                          )}*/}
                          {showTaskDetails?.category && (
                            <Typography variant="body2">{task.category}</Typography>
                          )}
                        </Stack>
                      </Grid>
                      <Grid item xs={1} container justify="flex-end">
                        <PriorityChip priority={task.priority} />
                      </Grid>
                    </Grid>
                  </ListItemButton>
                ))}
            </List>
          </div>

          <div id="printable-area" style={{ height: '100%', overflow: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column' }}>
            {selectedTask && (
              <Grid container>
                <Grid item xs={12}>
                  <Grid container spacing={2} alignItems="flex-start">
                    <Grid item xs={true}>
                      <Box display="flex" flexDirection="column" alignItems="flex-start">
                        {showTaskDetails?.milestone && selectedTask?.milestone && (
                          <Box mb={1}>
                            <MilestoneFlag milestone={selectedTask?.milestone} />
                          </Box>
                        )}
                        <Typography variant="subtitle1" component="div">
                          {selectedTask.taskName}
                        </Typography>
                        {showTaskDetails.category && (
                          <Typography variant="body1" component="div" color="text.secondary">
                            {selectedTask.category}
                          </Typography>
                        )}
                        {showTaskDetails.tags && selectedTask.tags && (
                          <TagChip tags={selectedTask.tags} />
                        )}
                      </Box>
                    </Grid>
                    <Grid item>
                      <Box display="flex" justifyContent="flex-end" alignItems="flex-start">
                        <Tooltip title={t('print')}>
                          <IconButton
                            onClick={() => {
                              const printWindow = window.open('', '_blank');
                              const printableArea = document.getElementById('printable-area');
                              const originalContents = document.body.innerHTML;
                              const printableContents = printableArea.innerHTML;

                              document.body.innerHTML = printableContents;
                              window.print();
                              document.body.innerHTML = originalContents;
                            }}
                          >
                            <PrintIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t('edit')}>
                          <IconButton
                            onClick={() => {
                              console.log('Task to edit: ' + selectedTask._id);
                              onEdit(selectedTask._id, "update");
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t('duplicate')}>
                          <IconButton
                            onClick={() => {
                              console.log('Task to duplicate: ' + selectedTask._id);
                              onEdit(selectedTask._id, "duplicate");
                            }}
                          >
                            <ContentCopyIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t('delete')}>
                          <IconButton
                            onClick={() => {
                              console.log('Task to delete: ' + selectedTask._id);
                              onDeleteClick(selectedTask._id);
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Grid>
                  </Grid>
                  
                  <Grid item xs={12} sm={12} md={12}>
                    <Grid container spacing={1} alignItems="center" sx={{ mt:1, mb: 1 }}>
                      <Grid item>
                        {showTaskDetails.estimatedDate && (
                          <Typography variant="body1">
                            {t('estimatedDate') + t('colon')}
                            {selectedTask.startDate ? formatDate(selectedTask.startDate) : t('unknown')}
                            {" ~ "}
                            {selectedTask.endDate ? formatDate(selectedTask.endDate) : t('unknown')}
                          </Typography>
                        )}
                        {showTaskDetails.actualDate && (
                          <Typography variant="body1">
                            {t('actualDate') + t('colon')}
                            {selectedTask.actualStartDate ? formatDate(selectedTask.actualStartDate) : t('unknown')}
                            {" ~ "}
                            {selectedTask.actualEndDate ? formatDate(selectedTask.actualEndDate) : t('unknown')}
                          </Typography>
                        )}
                      </Grid>
                    </Grid>
                    <Grid container spacing={1} alignItems="center" sx={{ mt:1, mb: 1 }}>
                      <Grid item>
                        {showTaskDetails.personInCharge && (
                          <AccountAvatar users={selectedTask.personInCharge} size="small" displayPopper={true} />
                        )}
                      </Grid>
                    </Grid>
                    <Grid container spacing={1} alignItems="center">
                      <Grid item>
                        {showTaskDetails.status && selectedTask.status && <StatusChip status={selectedTask.status} />}
                      </Grid>
                      <Grid item>
                        {showTaskDetails.difficultyLevel && selectedTask.difficultyLevel && (
                          <DifficultyLevelChip mode="icon" difficultyLevel={selectedTask.difficultyLevel} />
                        )}
                      </Grid>
                      <Grid item>
                        {showTaskDetails.priority && selectedTask.priority && <PriorityChip priority={selectedTask.priority} />}
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12}>
                  <Box style={{
                    overflowX: 'auto',
                    maxWidth: '100%',
                    overflowWrap: 'anywhere'
                  }}>
                    <Typography component="div">
                      {displayHtml(selectedTask.description)}
                    </Typography>
                  </Box>
                </Grid>

                {selectedTask.attachments.length >= 1 && (
                  <Paper variant="outlined" sx={{ width: '100%', mt:2, p:'1rem' }}>
                    <AttachmentList mode="read" files={selectedTask.attachments} folder="tasks" />
                  </Paper>
                )}
                
                {selectedTask.subtasks.length >= 1 && (
                  <Paper variant="outlined" sx={{ width: '100%', mt:2, p:'1rem' }}>
                    <SubtaskList mode="read" subtasks={selectedTask.subtasks} />
                  </Paper>
                )}

                {selectedTask.comments.length >= 1 && (
                  <Paper variant="outlined" sx={{ width: '100%', mt:2, p:'1rem' }}>
                    <CommentList mode="read" task={selectedTask} comments={selectedTask.comments} />
                  </Paper>
                )}
              </Grid>
            )}
          </div>
        </SplitPane>
      </Grid>

      {/* Edit Form */}
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
    </>
  );
};

export default TabbedTaskList;