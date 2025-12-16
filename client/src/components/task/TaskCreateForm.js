import React, { useContext, useState, useRef } from 'react';
import {
  useMediaQuery, Grid, Box,
  TextField, FormControl, InputLabel, Select, MenuItem, Typography, Divider, Tabs, Tab
} from '@mui/material';
import { Description, ListAlt, Comment } from '@mui/icons-material';

import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { formatFileNameDate } from '../../utils/DateUtils';
import { draftToHtmlContent } from '../../utils/RichTextUtils';

import { useTranslation } from 'react-i18next';

import AttachmentList from '../AttachmentList';
import SubtaskList from './SubtaskList';
import SimpleColorPicker from '../SimpleColorPicker';
import StatusSelector from '../custom/StatusSelector';
import PrioritySelector from '../custom/PrioritySelector';
import DifficultyLevelSelector from '../custom/DifficultyLevelSelector';

import CDialog from '../custom/CDialog';
import RichTextArea from '../custom/RichTextArea';
import MilestoneSelector from '../custom/MilestoneSelector';
import TagSelector from '../custom/TagSelector';
import TeamMemberSelector from '../custom/TeamMemberSelector';
import CAlert from '../custom/CAlert';

import UserContext from '../../UserContext';

const TaskCreateForm = ({ projectId, open, handleClose, handleAddTask, dateMode, defaultStartDate, defaultEndDate }) => {
  const { user, setUser } = useContext(UserContext);

  const isTablet = useMediaQuery('(max-width:900px)');

  const { t } = useTranslation();

  const [taskName, setTaskName] = useState('');
  const [milestone, setMilestone] = useState(null);
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState([]);
  const [description, setDescription] = useState('');
  const [personInCharge, setPersonInCharge] = useState([]);
  const [status, setStatus] = useState('To Do');
  const [priority, setPriority] = useState('');
  const [difficultyLevel, setDifficultyLevel] = useState('');
  const [color, setColor] = useState('transparent');

  const [startDate, setStartDate] = useState(dateMode === 'estimated' ? defaultStartDate : '');
  const [endDate, setEndDate] = useState(dateMode === 'estimated' ? defaultEndDate : '');
  const [actualStartDate, setActualStartDate] = useState(dateMode === 'actual' ? defaultStartDate : '');
  const [actualEndDate, setActualEndDate] = useState(dateMode === 'actual' ? defaultEndDate : '');

  const [createdBy, setCreatedBy] = useState(user._id);
  const [createdDate, setCreatedDate] = useState(new Date());
  const [updatedBy, setUpdatedBy] = useState(user._id);
  const [updatedDate, setUpdatedDate] = useState(new Date());
  
  const [attachments, setAttachments] = useState([]);
  const [subtasks, setSubtasks] = useState([]);

  const [value, setValue] = useState(0);
  const basicInfoRef = useRef(null);
  const subtasksRef = useRef(null);

  const handleTabChange = (event, newValue) => {
    setValue(newValue);
    let scrollToRef;
    if (newValue === 0) scrollToRef = basicInfoRef;
    else if (newValue === 1) scrollToRef = subtasksRef;

    scrollToRef?.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Alert
  const alertRef = useRef();

  const [error, setError] = useState(false);


  // Rich Text Description
  const handleDescriptionChange = (value) => {
    //console.log("description = " + JSON.stringify(value));
    //console.log("JSON.stringify(value.getCurrentContent()) = " + JSON.stringify(value.getCurrentContent()));
    //console.log("stateToHTML(value.getCurrentContent()) = " + stateToHTML(value.getCurrentContent()));
    setDescription(draftToHtmlContent(value));
  };


  // Task Color
  const handleColor = (updatedColor) => {
    if (updatedColor == "")
      setColor("transparent");
    else
      setColor(updatedColor.hex);
    //console.log(updatedColor.hex);
  };


  // Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!taskName) {
      setError(true);
      return;
    }
    if (!status) {
      setError(true);
      return;
    }
    else {
      setError(false);
    }

    // Create a clean task object, filtering out empty/null values
    const newTask = {
      taskName,
      category,
      tags: tags.filter(tag => tag && tag._id), // Filter out invalid tags
      description,
      personInCharge: personInCharge.filter(person => person && person._id), // Filter out invalid persons
      status,
      priority,
      difficultyLevel,
      startDate,
      endDate,
      actualStartDate,
      actualEndDate,
      createdBy: user._id,
      updatedBy: user._id,
      createdDate,
      updatedDate,
      attachments,
      subtasks,
      color,
      project: projectId,
    };

    // Only add milestone if it has a valid value
    if (milestone && milestone._id) {
      newTask.milestone = milestone._id;
    }

    console.log("Task Created = " + JSON.stringify(newTask));

    try {
      await handleAddTask(newTask);
      alertRef.current.displayAlert('success', t('createSuccess'));

      // Only reset form and close if task creation was successful
      setTaskName('');
      setMilestone(null);
      setDescription('');
      setCategory('');
      setTags([]);
      setPersonInCharge([]);
      setStatus('To Do');
      setPriority('');
      setDifficultyLevel('');
      setColor('');
      setStartDate();
      setEndDate();
      setActualStartDate();
      setActualEndDate();
      setCreatedBy(user._id);
      setUpdatedBy(user._id);
      setCreatedDate(new Date());
      setUpdatedDate(new Date());
      setAttachments([]);
      setSubtasks([]);

      handleClose();
    } catch (error) {
      // Error is already handled in handleAddTask, just show error alert
      alertRef.current.displayAlert('error', 'Failed to create task');
    }
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
        setStartDate(date);
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
    if (endDate && date.isAfter(endDate)) {
      return true;
    }*/
    return false;
  };

  // Drag-and-drop attachments
  const handleDrop = (droppedFile) => {
    // Handle dropped files
    setAttachments((prevFiles) => [...prevFiles, droppedFile]);
  };

  // Paste Images for Upload from clipboard
  const handlePaste = (event) => {
    const items = event.clipboardData.items;
    const pastedFiles = [];
    const formattedDate = formatFileNameDate();
  
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === 'file' && item.type.includes('image')) {
        const file = {
          name: `screenshot_${formattedDate}`,
          base64: null,
        };
        const reader = new FileReader();
        reader.onload = () => {
          const base64File = reader.result;
          file.base64 = base64File;
          //console.log('pastedFile = ' + JSON.stringify(file));
          pastedFiles.push(file);
          handleDrop(file);
        };
        reader.readAsDataURL(item.getAsFile());
      }
    }
  };

  const quillRef = useRef(null);

  const handleGetText = () => {
    if (quillRef.current) {
      const text = quillRef.current.getText();
      console.log(text);
    }
  };

  return (
    <div /*onPaste={handlePaste}*/>
      <CDialog
        mode="create"
        item="task"
        open={open}
        onClose={handleClose}
        handleSubmit={handleSubmit}
        title={t('createTask')}
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
              </Tabs>
            </Box>

            <div ref={basicInfoRef}>
              {/*<Typography sx={{ mb: '1rem' }}>{t('basic')}</Typography>*/}
              
              <TextField
                label={t('taskName')}
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                error={taskName === "" && error}
                fullWidth
                margin="dense"
                size="small"
                required
              />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={12} md={6}>
                  <MilestoneSelector
                    projectId={projectId}
                    milestone={milestone}
                    setMilestone={setMilestone}
                  />
                </Grid>
                <Grid item xs={12} sm={12} md={6}>
                  <TextField
                    label={t('category')}
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    fullWidth
                    margin="dense"
                    size="small"
                  />
                </Grid>
              </Grid>

              <InputLabel id="description-label" sx={{ mt: '1rem' }}>{t('description')}</InputLabel>
              <RichTextArea
                description=""
                handleDescriptionChange={handleDescriptionChange}
              />
              {/*<TextField
                label={t('description')}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                fullWidth
                multiline
                rows={4}
                margin="dense"
                size="small"
              />*/}

              {/*<TextField
                label={t('projectId')}
                name="projectId"
                value={projectId}
                fullWidth
                margin="dense"
                size="small"
                required
                disabled
                //sx={{ display: 'none' }}
              />*/}

              {/*<Box sx={{ mt:'1rem' }}>
                <AttachmentList
                  mode="upload"
                  files={attachments}
                  setFiles={setAttachments}
                  folder="tasks"
                />
              </Box>*/}
            </div>

            <Divider sx={{ my: '2rem' }} />

            <div ref={subtasksRef}>
              <SubtaskList mode="edit" subtasks={subtasks} setSubtasks={setSubtasks} />
            </div>

            {isTablet && (
              <Divider sx={{ my: '2rem' }} />
            )}
          </Grid>

          <Grid item xs={12} sm={12} md={4}>
            <Box sx={{ position: 'sticky', top: 0 }}>
              <Typography color="text.secondary" sx={{ flex: '0 0 auto' }}>{t('color')}</Typography>
              <SimpleColorPicker handleColor={handleColor} />
              
              <TagSelector tags={tags} setTags={setTags} />
              
              <TeamMemberSelector label={t('personInCharge')} personInCharge={personInCharge} setPersonInCharge={setPersonInCharge} />
              {/*<TextField
                label={t('personInCharge')}
                value={personInCharge}
                onChange={(e) => setPersonInCharge(e.target.value)}
                fullWidth
                margin="dense"
                size="small"
                sx={{ mb: '1rem' }}
              />*/}

              <Grid container spacing={{ xs:0, sm:2 }}>
                <Grid item xs={12} sm={4}>
                  <StatusSelector value={status} onChange={(e) => setStatus(e.target.value)} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <PrioritySelector value={priority} onChange={(e) => setPriority(e.target.value)} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <DifficultyLevelSelector value={difficultyLevel} onChange={(e) => setDifficultyLevel(e.target.value)} />
                </Grid>
              </Grid>

              <Grid container spacing={2} sx={{ mt: '0.1rem' }}>
                <Grid item xs={6}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label={t('estimatedStartDate')}
                      name="startDate"
                      format="YYYY-MM-DD"
                      value={startDate ? dayjs(startDate) : null}
                      //defaultValue={dayjs(new Date())}
                      //onChange={(date) => setStartDate({ target: { name: 'startDate', value: date } })}
                      onChange={handleStartDateChange}
                      shouldDisableDate={shouldDisableDate}
                      slotProps={{
                        textField: { fullWidth: true, size: 'small' },
                        actionBar: { actions: ["clear", "today"] }
                      }}
                      margin="dense"
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={6}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label={t('estimatedEndDate')}
                      name="endDate"
                      format="YYYY-MM-DD"
                      value={endDate ? dayjs(endDate) : null}
                      //defaultValue={dayjs(new Date())}
                      //onChange={(date) => setEndDate({ target: { name: 'endDate', value: date } })}
                      onChange={handleEndDateChange}
                      shouldDisableDate={shouldDisableDate}
                      slotProps={{
                        textField: { fullWidth: true, size: 'small' },
                        actionBar: { actions: ["clear", "today"] }
                      }}
                      margin="dense"
                    />
                  </LocalizationProvider>
                </Grid>
              </Grid>

              <Grid container spacing={2} sx={{ mt: '0.1rem' }}>
                <Grid item xs={6}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label={t('actualStartDate')}
                      name="actualStartDate"
                      format="YYYY-MM-DD"
                      value={actualStartDate ? dayjs(actualStartDate) : null}
                      //defaultValue={dayjs(new Date())}
                      //onChange={(date) => setActualStartDate({ target: { name: 'actualStartDate', value: date } })}
                      onChange={handleActualStartDateChange}
                      shouldDisableDate={shouldDisableDate}
                      slotProps={{
                        textField: { fullWidth: true, size: 'small' },
                        actionBar: { actions: ["clear", "today"] }
                      }}
                      margin="dense"
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={6}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label={t('actualEndDate')}
                      name="actualEndDate"
                      format="YYYY-MM-DD"
                      value={actualEndDate ? dayjs(actualEndDate) : null}
                      //defaultValue={dayjs(new Date())}
                      //onChange={(date) => setActualEndDate({ target: { name: 'actualEndDate', value: date } })}
                      onChange={handleActualEndDateChange}
                      shouldDisableDate={shouldDisableDate}
                      slotProps={{
                        textField: { fullWidth: true, size: 'small' },
                        actionBar: { actions: ["clear", "today"] }
                      }}
                      margin="dense"
                    />
                  </LocalizationProvider>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </CDialog>

      <CAlert ref={alertRef} />
    </div>
  );
};

export default TaskCreateForm;
