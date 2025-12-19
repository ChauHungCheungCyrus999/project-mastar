import React, { useContext, useState, useEffect, useRef } from 'react';
import {
  useMediaQuery, Grid, Box,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  TextField, FormControl, InputLabel, Select, MenuItem, Alert, Snackbar, OutlinedInput, Chip, Typography, FormControlLabel, Checkbox, Button, Divider, Tabs, Tab
} from '@mui/material';
import { Description, ListAlt, Comment } from '@mui/icons-material';
import axios from 'axios';

import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { useTranslation } from 'react-i18next';

import SimpleColorPicker from '../SimpleColorPicker';
import AttachmentList from '../AttachmentList';
import SubtaskList from './SubtaskList';
import CommentList from './CommentList';
import StatusSelector from '../custom/StatusSelector';
import PrioritySelector from '../custom/PrioritySelector';
import DifficultyLevelSelector from '../custom/DifficultyLevelSelector';

import CDialog from '../custom/CDialog';
import RichTextArea from '../custom/RichTextArea';
import MilestoneSelector from '../custom/MilestoneSelector';
import TagSelector from '../custom/TagSelector';
import TeamMemberSelector from '../custom/TeamMemberSelector';
import ProjectSelector from '../custom/ProjectSelector';
import CAlert from '../custom/CAlert';

import { formatDate, formatFileNameDate } from '../../utils/DateUtils';
import { htmlToDraftContent, draftToHtmlContent } from '../../utils/RichTextUtils';

import UserContext from '../../UserContext';

import { fetchUser } from '../../database/UserController';

const TaskEditForm = ({ taskId, mode, open, handleClose, handleSave, handleDuplicate, setOpenConfirmDeleteDialog, setTaskToDelete, onTaskMoved }) => {
  const { user, setUser } = useContext(UserContext);

  const isTablet = useMediaQuery('(max-width:900px)');

  const { t } = useTranslation();

  const [editedTask, setEditedTask] = useState(null);
  const [milestone, setMilestone] = useState(editedTask?.milestone);
  const [description, setDescription] = useState();
  const [subtasks, setSubtasks] = useState(editedTask?.subtasks || []);
  const [tags, setTags] = useState(editedTask?.tags);
  const [personInCharge, setPersonInCharge] = useState(editedTask?.personInCharge);
  const [startDate, setStartDate] = useState(editedTask?.startDate);
  const [endDate, setEndDate] = useState(editedTask?.endDate);
  const [actualStartDate, setActualStartDate] = useState(editedTask?.actualStartDate);
  const [actualEndDate, setActualEndDate] = useState(editedTask?.actualEndDate);
  const [attachments, setAttachments] = useState(editedTask?.attachments);
  const [comments, setComments] = useState(editedTask?.comments || []);
  const [createdBy, setCreatedBy] = useState(editedTask?.createdBy);
  const [updatedBy, setUpdatedBy] = useState(editedTask?.updatedBy);
  const [selectedProject, setSelectedProject] = useState(editedTask?.project);
  const [openConfirmMoveDialog, setOpenConfirmMoveDialog] = useState(false);
  const [newProjectId, setNewProjectId] = useState(null);

  const [value, setValue] = useState(0);
  const basicInfoRef = useRef(null);
  const subtasksRef = useRef(null);
  const commentsRef = useRef(null);

  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/task/${taskId}`);
        setEditedTask(response.data);
        setDisabled(response.data.createdBy._id !== user._id && user.email !== process.env.REACT_APP_ADMIN_EMAIL);
      } catch (error) {
        console.error('Error fetching task:', error);
      }
    };

    fetchTask();
  }, [taskId]);

  const handleTabChange = (event, newValue) => {
    setValue(newValue);
    let scrollToRef;
    if (newValue === 0) scrollToRef = basicInfoRef;
    else if (newValue === 1) scrollToRef = subtasksRef;
    else if (newValue === 2) scrollToRef = commentsRef;

    scrollToRef?.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Alert
  const alertRef = useRef();
  
  const [error, setError] = useState(false);

  // Rich Text Description
  const [initialized, setInitialized] = useState(false);
  useEffect(() => {
    if (!initialized) {
      setDescription(htmlToDraftContent(editedTask?.description));
      setInitialized(true);
    }
  }, [initialized, htmlToDraftContent(editedTask?.description)]);

  const handleDescriptionChange = (value) => {
    //console.log("draftToHtmlContent(value) = " + draftToHtmlContent(value));

    const updatedTask = {
      ...editedTask,
      description: draftToHtmlContent(value)
    };
    
    setEditedTask(updatedTask);
    //console.log("editedTask = " + JSON.stringify(editedTask));
  };

  const handleMilestoneChange = (selectedMilestone) => {
    setMilestone(selectedMilestone);
  };

  const handleTagsChange = (selectedTags) => {
    setTags(selectedTags);
  };

  const handlePersonInChargeChange = (selectedPersons) => {
    setPersonInCharge(selectedPersons);
  };

  const handleSubtasksChange = (updatedSubtasks) => {
    setSubtasks(updatedSubtasks);
    setEditedTask((prevTask) => ({
      ...prevTask,
      subtasks: updatedSubtasks,
    }));
  };

  // startDate < endDate
  const handleStartDateChange = (date) => {
    setStartDate(date);

    // Check if endDate is earlier than the selected startDate
    if (date) {
      if (endDate && date.isAfter(endDate)) {
        setEndDate(null);
      }
    }
  };

  const handleEndDateChange = (date) => {
    // Check if startDate is later than the selected endDate
    if (date) {
      if (startDate && date.isBefore(startDate)) {
        setStartDate(null);
      }
    }

    setEndDate(date);
  };

  // actualStartDate < actualEndDate
  const handleActualStartDateChange = (date) => {
    setActualStartDate(date);

    // Check if actualEndDate is earlier than the selected actualStartDate
    if (date) {
      if (actualEndDate && date.isAfter(actualEndDate)) {
        setActualEndDate(null);
      }
    }
  };

  const handleActualEndDateChange = (date) => {
    // Check if actualStartDate is later than the selected actualEndDate
    if (date) {
      if (actualStartDate && date.isBefore(actualStartDate)) {
        setActualStartDate(date);
      }
    }

    setActualEndDate(date);
  };

  const shouldDisableDate = (date) => {
    // Disable dates before the selected startDate and after the selected endDate
    /*if (startDate && date.isBefore(startDate)) {
      return true;
    }
    /*if (endDate && date.isAfter(endDate)) {
      return true;
    }*/
    return false;
  };


  // Field Value Change
  useEffect(() => {
    setSubtasks(editedTask?.subtasks || []);
  }, [editedTask]);
  
  const handleChange = (e) => {
    if (e && e.target) {
      const { name, value } = e.target;
      setEditedTask((prevTask) => ({
        ...prevTask,
        [name]: value,
        subtasks,
      }));
    }
  };
  

  // Form Submission
  const handleSubmit = () => {
    if (!editedTask.taskName) {
      setError(true);
      return;
    }
    if (!editedTask.status) {
      setError(true);
      return;
    }
    else {
      setError(false);
    }

    const updatedComments = comments.map(comment => ({
      ...comment,
      updatedBy: user._id,
      updatedAt: new Date(),
      createdBy: comment.createdBy || user._id, // Preserve existing createdBy or set to current user if undefined
    }));

    const updatedTask = {
      ...editedTask,
      //description: "",
      milestone: milestone !== "" ? milestone : null, // Handle 'none' as null
      tags,
      subtasks,
      personInCharge,
      startDate,
      endDate,
      actualStartDate,
      actualEndDate,
      updatedBy: user._id,
      updatedDate: new Date(),
      attachments,
      comments: updatedComments,
    };

    if (mode == 'update' || mode == 'share') {
      console.log("Updated Task = " + JSON.stringify(updatedTask));
      handleSave(updatedTask);
      alertRef.current.displayAlert('success', t('saveSuccess'));
    }
    else if (mode == 'duplicate') {
      console.log("Duplicated Task = " + JSON.stringify(updatedTask));
      handleDuplicate(updatedTask);
      alertRef.current.displayAlert('success', t('createSuccess'));
    }
  };


  // Change color of task card
  const handleColor = (updatedColor) => {
    editedTask.color = updatedColor.hex;
  };

  // Drag-and-drop attachments
  /*const handleDrop = (droppedFile) => {
    // Handle dropped files
    setAttachments((prevFiles) => {
      if (prevFiles === null || prevFiles === undefined) {
        prevFiles = [];
      }
      return [...prevFiles, droppedFile];
    });
  };*/

  // Move task to another project
  const handleConfirmMove = async () => {
    try {
      const response = await axios.put(`${process.env.REACT_APP_SERVER_HOST}/api/moveProject/task/${editedTask._id}/project/${newProjectId}`);
      setSelectedProject(newProjectId);
      alertRef.current.displayAlert('success', t('taskMoveSuccess'));

      // Notify parent component that task has been moved
      if (onTaskMoved) {
        onTaskMoved(editedTask._id);
      }

      // Close the dialog after a short delay to allow user to see the success message
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (error) {
      console.error('Error moving project:', error);
      alertRef.current.displayAlert('error', t('taskMoveFail'));
    }
    setOpenConfirmMoveDialog(false);
  };

  const confirmMoveTaskToAnotherProject = (projectId) => {
    setNewProjectId(projectId);
    setOpenConfirmMoveDialog(true);
  };

  const handleCancelMove = () => {
    setOpenConfirmMoveDialog(false);
  };

  // Paste Images for Upload from clipboard
  const handlePaste = async (event) => {
    const items = event.clipboardData.items;
  
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === 'file' && item.type.includes('image')) {
        const file = item.getAsFile();

        try {
          await uploadFileToServer(file);
        } catch (error) {
          console.error('File upload failed:', error);
        }
      }
    }
  };

  async function uploadFileToServer(file) {
    const formattedDate = formatFileNameDate();
    const fileName = `screenshot_${formattedDate}.${file.type.split('/')[1]}`;

    const formData = new FormData();
    formData.append('folder', 'tasks'); // Specify the folder where files should be uploaded

    formData.append('files', file, encodeURIComponent(fileName));

    try {
      const response = await axios.post(`${process.env.REACT_APP_SERVER_HOST}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const uploadedFiles = response.data.files;
      const newAttachments = uploadedFiles?.map((f) => ({
        ...f
      }));

      // Fetch the latest task data from the server to get current attachments
      let currentAttachments = [];
      
      if (editedTask?._id) {
        try {
          const latestTaskResponse = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/task/${editedTask._id}`);
          currentAttachments = latestTaskResponse.data?.attachments || [];
        } catch (fetchError) {
          console.warn('Could not fetch latest task data, using local state:', fetchError);
          currentAttachments = editedTask?.attachments || [];
        }
      } else {
        currentAttachments = editedTask?.attachments || [];
      }

      // Merge new attachments with current ones from server
      const mergedAttachments = [...currentAttachments, ...newAttachments];

      // Update local states
      setAttachments(mergedAttachments);

      const updatedTask = {
        ...editedTask,
        attachments: mergedAttachments,
      };

      setEditedTask(updatedTask);
      
      // Save with merged attachments
      await handleSave(updatedTask);

      alertRef.current.displayAlert('success', t('uploadSuccess'));
    } catch (error) {
      console.error('File upload error:', error);
      alertRef.current.displayAlert('error', t('uploadFail'));
    }
  }

  // Delete Task
  const confirmAndDeleteTask = () => {
    setOpenConfirmDeleteDialog(true);
    setTaskToDelete(editedTask._id);
    handleClose();
  };

  return (
    editedTask && (
      <div onPaste={handlePaste}>
        <CDialog
          mode={mode}
          item="task"
          open={open}
          onClose={handleClose}
          handleSubmit={handleSubmit}
          handleDelete={confirmAndDeleteTask}
          taskId={editedTask._id}
          title={`${(mode==="update" || mode === "share")? t('editTask') : t('duplicateTask')} - ${editedTask.taskName}`}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12} md={8}>
              <Box sx={{ position: 'sticky', top: 0, zIndex: 10 }}>
                <Tabs value={value} onChange={handleTabChange}
                  aria-label="task edit tabs"
                  sx={{
                    mb: '0.5rem',
                    backgroundColor: 'background.paper',
                    width: '100%',
                    minHeight: "30px",
                    height: "35px",
                    alignItems: "center"
                  }}
                  TabIndicatorProps={{
                    sx: {
                      //bgcolor: "orange",
                      height: "20px"
                    }
                  }}
                >
                  <Tab icon={<Description />} label={t('basic')} iconPosition="start" />
                  <Tab icon={<ListAlt />} label={t('subtasks')} iconPosition="start" />
                  <Tab icon={<Comment />} label={t('comments')} iconPosition="start" />
                </Tabs>
              </Box>
              
              <div ref={basicInfoRef}>
                {/*<Typography sx={{ mb: '1rem' }}>{t('basic')}</Typography>*/}
                
                <TextField
                  label={t('taskName')}
                  name="taskName"
                  value={editedTask.taskName}
                  onChange={handleChange}
                  error={editedTask.taskName === "" && error}
                  fullWidth
                  margin="dense"
                  size="small"
                  required
                  disabled={disabled}
                />

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={12} md={6}>
                    <MilestoneSelector
                      projectId={editedTask.project._id}
                      milestone={editedTask.milestone}
                      setMilestone={setMilestone}
                      onChange={handleMilestoneChange}
                      disabled={disabled}
                    />
                  </Grid>
                  <Grid item xs={12} sm={12} md={6}>
                    <TextField
                      label={t('category')}
                      name="category"
                      value={editedTask.category}
                      onChange={handleChange}
                      fullWidth
                      margin="dense"
                      size="small"
                      disabled={disabled}
                    />
                  </Grid>
                </Grid>

                <InputLabel id="description-label" sx={{ mt: '1rem' }}>{t('description')}</InputLabel>
                
                <RichTextArea
                  description={editedTask.description}
                  handleDescriptionChange={handleDescriptionChange}
                  disabled={disabled}
                />
                {/*<TextField
                  label={t('description')}
                  name="description"
                  value={editedTask.description}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={4}
                  margin="dense"
                  size="small"
                />*/}

                {/*{task.attachments && task.attachments.length > 0 && (
                  <div>
                    <Typography sx={{ mt: '1rem' }}>{t('attachments')}</Typography>
                    {task.attachments.map((attachment, index) => {
                      //let filename = attachment.name.toLowerCase();

                      // Skip rendering the deleted image
                      if (deletedAttachments.includes(attachment)) {
                        return null;
                      }

                      //if (filename.endsWith('.jpg') || filename.endsWith('.jpeg') || filename.endsWith('.png') || filename.endsWith('.gif')) {
                      //  return (
                      //    <div key={index}>
                      //      <a href={attachment.base64} target="_blank" rel="noopener noreferrer">
                      //        <img src={attachment.base64} alt={`Attachment ${index}`} style={{ maxWidth: '22%', margin: '1rem' }} />
                      //     </a>
                      //      <Button onClick={() => handleDeleteAttachment(attachment)}>Delete</Button>
                      //    </div>
                      //  );
                      //}
                      return (
                        <AttachmentList attachments={[attachment]} handleDeleteAttachment={handleDeleteAttachment} />
                      );
                    })}
                  </div>
                )}*/}
                <Box sx={{ mt: '2rem' }}>
                  <AttachmentList
                    mode="upload"
                    files={editedTask?.attachments || []} // Ensure attachments are passed as an array
                    setFiles={(updatedFiles) => {
                      setEditedTask((prevTask) => ({
                        ...prevTask,
                        attachments: updatedFiles, // Update attachments in the task
                      }));
                    }}
                    setAttachments={setAttachments}
                    editedObject={editedTask}
                    setEditedObject={setEditedTask}
                    handleSave={handleSave}
                    folder="tasks"
                  />
                </Box>
              </div>

              {(!disabled || editedTask.subtasks.length !==0) && (
                <Divider sx={{ my: '2rem' }} />
              )}
              
              <div ref={subtasksRef}>
                <SubtaskList
                  mode={disabled ? "read" : "edit"}
                  subtasks={editedTask.subtasks}
                  setSubtasks={handleSubtasksChange}
                />
              </div>

              <Divider sx={{ my: '2rem' }} />

              <div ref={commentsRef} style={{
                overflowX: 'auto',
                maxWidth: '100%',
                overflowWrap: 'anywhere'
              }}>
                <CommentList mode="edit" task={editedTask} comments={editedTask?.comments} setComments={setComments} />
              </div>
              
              {isTablet && (
                <Divider sx={{ my: '2rem' }} />
              )}
            </Grid>

            <Grid item xs={12} sm={12} md={4}>
              <Box sx={{ position: 'sticky', top: 0 }}>
                <Typography color="text.secondary" sx={{ flex: '0 0 auto' }}>{t('color')}</Typography>
                <SimpleColorPicker
                  color={editedTask.color}
                  handleColor={handleColor}
                  disabled={disabled}
                />

                <TagSelector
                  tags={editedTask.tags}
                  setTags={setTags}
                  onChange={handleTagsChange}
                  disabled={disabled}
                />
                
                {/*<TextField
                  label={t('personInCharge')}
                  name="personInCharge"
                  value={editedTask.personInCharge}
                  onChange={handleChange}
                  fullWidth
                  margin="dense"
                  size="small"
                />*/}

                <TeamMemberSelector
                  label={t('personInCharge')}
                  personInCharge={editedTask.personInCharge}
                  setPersonInCharge={setPersonInCharge}
                  onChange={handlePersonInChargeChange}
                  disabled={disabled}
                />
                {/*{teamMemberOptions.map((name) => (
                  <MenuItem key={name} value={name}>
                    {name}
                  </MenuItem>
                ))}*/}

                <Grid container spacing={{ xs:0, sm:2 }}>
                  <Grid item xs={12} sm={4}>
                    <StatusSelector
                      value={editedTask.status}
                      onChange={handleChange}
                      error={editedTask.status === "" && error}
                      //disabled={disabled}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <PrioritySelector
                      value={editedTask.priority}
                      onChange={handleChange}
                      disabled={disabled}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <DifficultyLevelSelector
                      value={editedTask.difficultyLevel}
                      onChange={handleChange}
                      disabled={disabled}
                    />
                  </Grid>
                </Grid>

                <Grid container spacing={2} sx={{ mt: '0.1rem' }}>
                  <Grid item xs={6}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label={t('estimatedStartDate')}
                        name="startDate"
                        format="YYYY-MM-DD"
                        value={editedTask.startDate ? dayjs(editedTask.startDate) : null}
                        //defaultValue={dayjs(new Date())}
                        //onChange={(date) => handleChange({ target: { name: 'startDate', value: date } 
                        onChange={handleStartDateChange}
                        shouldDisableDate={shouldDisableDate}
                        slotProps={{
                          textField: { fullWidth: true, size: 'small' },
                          actionBar: { actions: ["clear", "today"] }
                        }}
                        margin="dense"
                        disabled={disabled}
                      />
                    </LocalizationProvider>
                  </Grid>
                  <Grid item xs={6}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label={t('estimatedEndDate')}
                        name="endDate"
                        format="YYYY-MM-DD"
                        value={editedTask.endDate ? dayjs(editedTask.endDate) : null}
                        //defaultValue={dayjs(new Date())}
                        //onChange={(date) => handleChange({ target: { name: 'endDate', value: date } })}
                        onChange={handleEndDateChange}
                        shouldDisableDate={shouldDisableDate}
                        slotProps={{
                          textField: { fullWidth: true, size: 'small' },
                          actionBar: { actions: ["clear", "today"] }
                        }}
                        margin="dense"
                        disabled={disabled}
                      />
                    </LocalizationProvider>
                  </Grid>

                  <Grid item xs={6}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label={t('actualStartDate')}
                        name="actualStartDate"
                        format="YYYY-MM-DD"
                        value={editedTask.actualStartDate ? dayjs(editedTask.actualStartDate) : null}
                        //defaultValue={dayjs(new Date())}
                        //onChange={(date) => handleChange({ target: { name: 'actualStartDate', value: date } })}
                        onChange={handleActualStartDateChange}
                        shouldDisableDate={shouldDisableDate}
                        slotProps={{
                          textField: { fullWidth: true, size: 'small' },
                          actionBar: { actions: ["clear", "today"] }
                        }}
                        margin="dense"
                        //disabled={disabled}
                      />
                    </LocalizationProvider>
                  </Grid>
                  <Grid item xs={6}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label={t('actualEndDate')}
                        name="actualEndDate"
                        format="YYYY-MM-DD"
                        value={editedTask.actualEndDate ? dayjs(editedTask.actualEndDate) : null}
                        //defaultValue={dayjs(new Date())}
                        //onChange={(date) => handleChange({ target: { name: 'actualEndDate', value: date } })}
                        onChange={handleActualEndDateChange}
                        shouldDisableDate={shouldDisableDate}
                        slotProps={{
                          textField: { fullWidth: true, size: 'small' },
                          actionBar: { actions: ["clear", "today"] }
                        }}
                        margin="dense"
                        //disabled={disabled}
                      />
                    </LocalizationProvider>
                  </Grid>

                  <Grid item xs={6}>
                    <TextField
                      label={t('createdBy')}
                      name="createdBy"
                      value={editedTask.createdBy?.firstName + ' ' + editedTask.createdBy?.lastName}
                      fullWidth
                      margin="dense"
                      size="small"
                      disabled
                    />
                    <TextField
                      label={t('updatedBy')}
                      name="updatedBy"
                      value={editedTask.updatedBy?.firstName + ' ' + editedTask.updatedBy?.lastName}
                      fullWidth
                      margin="dense"
                      size="small"
                      disabled
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label={t('createdDate')}
                      name="createdDate"
                      value={formatDate(editedTask.createdDate)}
                      fullWidth
                      margin="dense"
                      size="small"
                      disabled
                    />
                    <TextField
                      label={t('updatedDate')}
                      name="updatedDate"
                      value={formatDate(editedTask.updatedDate)}
                      fullWidth
                      margin="dense"
                      size="small"
                      disabled
                    />
                  </Grid>

                  {/*<TextField
                    label={t('projectId')}
                    name="projectId"
                    value={editedTask.project}
                    fullWidth
                    margin="dense"
                    size="small"
                    required
                    disabled
                    //sx={{ display: 'none' }}
                  />*/}
                  <Grid item xs={12}>
                    <Typography color="text.secondary" sx={{ flex: '0 0 auto' }}>{t('moveToDifferentProject')}</Typography>
                    <ProjectSelector
                      projectId={editedTask.project._id}
                      onChange={confirmMoveTaskToAnotherProject}
                      displayAllOption={false}
                      disabled={disabled}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>
          
          <Dialog
            open={openConfirmMoveDialog}
            onClose={handleCancelMove}
            aria-labelledby="confirm-move-dialog-title"
            aria-describedby="confirm-move-dialog-description"
          >
            <DialogTitle id="confirm-move-dialog-title">
              <Typography variant="subtitle2">{t('moveTaskToAnotherProject')}</Typography>
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="confirm-move-dialog-description">
                {t('moveTaskToAnotherProjectConfirm', { fromProject: selectedProject, toProject: newProjectId })}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button variant="outlined" onClick={handleCancelMove} color="primary">
                {t('cancel')}
              </Button>
              <Button variant="contained" onClick={handleConfirmMove} color="primary" autoFocus>
                {t('confirm')}
              </Button>
            </DialogActions>
          </Dialog>
        
          <CAlert ref={alertRef} />
        </CDialog>
      </div>
    )
  );
};

export default TaskEditForm;
