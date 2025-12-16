import React, { useContext, useState, useEffect, useRef } from 'react';
import {
  Grid,
  TextField,
  MenuItem,
  Typography,
  Box,
  Button,
  Divider,
  Switch,
  FormControlLabel,
} from '@mui/material';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import CDialog from '../custom/CDialog';
import CAlert from '../custom/CAlert';
//import StatusSelector from '../custom/StatusSelector';
//import PrioritySelector from '../custom/PrioritySelector';
import TeamMemberSelector from '../custom/TeamMemberSelector';
import AttachmentList from '../AttachmentList';
import SimpleColorPicker from '../SimpleColorPicker';

import UserContext from '../../UserContext';

import { useTranslation } from 'react-i18next';

const EventDialog = ({
  projectId,
  open,
  onClose,
  onSubmit,
  onDelete,
  initialData = {},
  mode = 'create',
  defaultStartDate,
  defaultEndDate,
}) => {
  const { user } = useContext(UserContext);

  const { t } = useTranslation();

  // Alert
  const alertRef = useRef();

  const [eventData, setEventData] = useState({
    title: '',
    category: '',
    description: '',
    allDay: true,
    startDate: defaultStartDate || '',
    endDate: defaultEndDate || '',
    location: '',
    recurrence: 'None',
    status: 'To Do',
    priority: '',
    visibility: 'Public',
    remarks: '',
    organizers: [],
    attendees: [],
    color: '',
    attachments: [],
    createdBy: user._id,
    createdDate: new Date(),
    updatedBy: user._id,
    updatedDate: new Date(),
    project: projectId,
  });

  const isReadOnly = (mode === 'update' && eventData.createdBy._id !== user._id) && user.email !== process.env.REACT_APP_ADMIN_EMAIL;

  const [errors, setErrors] = useState({}); // Tracks errors for validation

  const handleColor = (updatedColor) => {
    eventData.color = updatedColor.hex;
  };

  useEffect(() => {
    if (initialData && mode === 'update') {
      setEventData((prev) => ({
        ...prev,
        ...initialData,
      }));
    } else if (mode === 'create') {
      setEventData((prev) => ({
        ...prev,
        project: projectId,
      }));
    }
  }, [mode, projectId]);

  const handleChange = (field, value) => {
    setEventData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      // Clear the error if the field is updated
      setErrors((prevErrors) => ({ ...prevErrors, [field]: '' }));
    }
  };

  // Validate required fields
  const validateFields = () => {
    const newErrors = {};
    if (!eventData.title.trim()) newErrors.title = t('titleRequired');
    //if (!eventData.startDate) newErrors.startDate = t('startDateRequired');
    //if (!eventData.endDate) newErrors.endDate = t('endDateRequired');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateFields()) {
      //alertRef?.current?.displayAlert('error', t('validationError'));
      return;
    }

    const result = await onSubmit(eventData);
    if (result) {
      alertRef?.current?.displayAlert('success', t('saveSuccess'));
    } else {
      alertRef?.current?.displayAlert('error', t('saveFail'));
    }
  };

  return (
    <CDialog
      mode={mode}
      item="event"
      open={open}
      onClose={onClose}
      handleSubmit={handleSubmit}
      handleDelete={onDelete}
      title={mode === 'create' ? (
        <Typography variant="subtitle2">{t('createEvent')}</Typography>
      ) : (
        <Typography variant="subtitle2">{t('editEvent')}</Typography>
      )}
      maxWidth="md"
    >
      <Grid container spacing={2}>
        {/* Color */}
        <Grid item xs={12}>
          <Typography color="text.secondary" sx={{ flex: '0 0 auto' }}>{t('color')}</Typography>
          <SimpleColorPicker color={eventData.color} handleColor={handleColor} displayPreviousColor={false} />
        </Grid>

        {/* Title */}
        <Grid item xs={12}>
          <TextField
            label={t('title')}
            fullWidth
            size="small"
            required
            error={!!errors.title}
            helperText={errors.title}
            value={eventData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            disabled={isReadOnly}
          />
        </Grid>

        {/* Category */}
        <Grid item xs={12}>
          <TextField
            label={t('category')}
            fullWidth
            size="small"
            value={eventData.category}
            onChange={(e) => handleChange('category', e.target.value)}
            disabled={isReadOnly}
          />
        </Grid>

        {/* Description */}
        <Grid item xs={12}>
          <TextField
            label={t('description')}
            fullWidth
            multiline
            size="small"
            rows={3}
            value={eventData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            disabled={isReadOnly}
          />
        </Grid>

        {/* All Day Toggle */}
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={eventData.allDay}
                onChange={(e) => handleChange('allDay', e.target.checked)}
                disabled={isReadOnly}
              />
            }
            label={t('allDay')}
            labelPlacement="start"
            sx={{ justifyContent: 'space-between', width: '100%' }}
          />
        </Grid>

        {/* Dates */}
        <Grid item xs={6}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            {eventData.allDay ? (
              <DatePicker
                label={t('startDate')}
                value={eventData.startDate ? dayjs(eventData.startDate) : null}
                onChange={(date) => handleChange('startDate', date)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                    required: true,
                    error: !!errors.startDate,
                    helperText: errors.startDate,
                  },
                }}
                disabled={isReadOnly}
              />
            ) : (
              <DateTimePicker
                label={t('startDateTime')}
                value={eventData.startDate ? dayjs(eventData.startDate) : null}
                onChange={(date) => handleChange('startDate', date)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                    required: true,
                    error: !!errors.startDate,
                    helperText: errors.startDate,
                  },
                }}
                disabled={isReadOnly}
              />
            )}
          </LocalizationProvider>
        </Grid>
        <Grid item xs={6}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            {eventData.allDay ? (
              <DatePicker
                label={t('endDate')}
                value={eventData.endDate ? dayjs(eventData.endDate) : null}
                onChange={(date) => handleChange('endDate', date)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                    error: !!errors.endDate,
                    helperText: errors.endDate,
                  },
                }}
                disabled={isReadOnly}
              />
            ) : (
              <DateTimePicker
                label={t('endDateTime')}
                value={eventData.endDate ? dayjs(eventData.endDate) : null}
                onChange={(date) => handleChange('endDate', date)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                    error: !!errors.endDate,
                    helperText: errors.endDate,
                  },
                }}
                disabled={isReadOnly}
              />
            )}
          </LocalizationProvider>
        </Grid>

        {/* Location */}
        <Grid item xs={12}>
          <TextField
            label={t('location')}
            fullWidth
            size="small"
            value={eventData.location}
            onChange={(e) => handleChange('location', e.target.value)}
            disabled={isReadOnly}
          />
        </Grid>

        {/* Recurrence and Visibility */}
        <Grid item xs={6}>
          <TextField
            label={t('recurrence')}
            select
            required
            fullWidth
            size="small"
            value={eventData.recurrence}
            onChange={(e) => handleChange('recurrence', e.target.value)}
            disabled={isReadOnly}
          >
            {['None', 'Daily', 'Weekly', 'Monthly', 'Yearly'].map(
              (option) => (
                <MenuItem dense key={option} value={option}>
                  {t(option.toLowerCase())}
                </MenuItem>
              )
            )}
          </TextField>
        </Grid>
        <Grid item xs={6}>
          <TextField
            label={t('visibility')}
            select
            required
            fullWidth
            size="small"
            value={eventData.visibility}
            onChange={(e) => handleChange('visibility', e.target.value)}
            disabled={isReadOnly}
          >
            {['Public', 'Private'].map((option) => (
              <MenuItem dense key={option} value={option}>
                {t(option.toLowerCase())}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Status and Priority */}
        {/*<Grid item xs={6}>
          <StatusSelector
            value={eventData.status}
            onChange={(e) => handleChange('status', e.target.value)}
            disabled={isReadOnly}
          />
        </Grid>
        <Grid item xs={6}>
          <PrioritySelector
            value={eventData.priority}
            onChange={(e) => handleChange('priority', e.target.value)}
            hasNoneValue={true}
            disabled={isReadOnly}
          />
        </Grid>*/}

        {/* Organizers */}
        <Grid item xs={6}>
          <TeamMemberSelector
            label={t('organizers')}
            personInCharge={eventData.organizers}
            setPersonInCharge={(value) => handleChange('organizers', value)}
            disabled={isReadOnly}
          />
        </Grid>

        {/* Attendees */}
        <Grid item xs={6}>
          <TeamMemberSelector
            label={t('attendees')}
            personInCharge={eventData.attendees}
            setPersonInCharge={(value) => handleChange('attendees', value)}
            disabled={isReadOnly}
          />
        </Grid>

        {/* Remarks */}
        <Grid item xs={12}>
          <TextField
            label={t('remarks')}
            fullWidth
            multiline
            size="small"
            rows={3}
            value={eventData.remarks}
            onChange={(e) => handleChange('remarks', e.target.value)}
            disabled={isReadOnly}
          />
        </Grid>

        {/* Attachments */}
        {mode === 'update' && (
          <Grid item xs={12}>
            <AttachmentList
              mode="upload"
              files={eventData?.attachments || []} // Ensure attachments are passed as an array
              setFiles={(updatedFiles) => {
                setEventData((prevEvent) => ({
                  ...prevEvent,
                  attachments: updatedFiles, // Update attachments in the event
                }));
              }}
              setAttachments={(prev) => ({
                ...prev,
                ...eventData?.attachments,
              })}
              editedObject={eventData}
              setEditedObject={setEventData}
              handleSave={handleSubmit}
              folder="events"
            />
          </Grid>
        )}
      </Grid>

      <CAlert ref={alertRef} />
    </CDialog>
  );
};

export default EventDialog;