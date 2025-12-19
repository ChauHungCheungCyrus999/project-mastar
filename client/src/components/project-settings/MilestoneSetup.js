import React, { useContext, useState, useEffect, useRef } from 'react';
import { useMediaQuery, Grid, Button, Chip, TextField, IconButton, Tooltip, Typography, Paper, Switch, FormControlLabel, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { Add, Delete, Edit } from '@mui/icons-material';
import axios from 'axios';
import dayjs from 'dayjs';

import CDataGrid from '../custom/CDataGrid';
import CAlert from '../custom/CAlert';
import CDialog from '../custom/CDialog';
import ConfirmDeleteDialog from '../custom/ConfirmDeleteDialog';
import SimpleColorPicker from '../SimpleColorPicker';
import StatusChip from '../StatusChip';
import PriorityChip from '../PriorityChip';
import DifficultyLevelChip from '../DifficultyLevelChip';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { useTranslation } from 'react-i18next';

import UserContext from '../../UserContext';

const MilestoneSetup = () => {
  const { user } = useContext(UserContext);

  const { t } = useTranslation();
  const isMobile = useMediaQuery('(max-width:600px)');
  const alertRef = useRef();

  const projectId = window.location.href.split("/")[4];
  const [milestones, setMilestones] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create');
  const [selectedMilestone, setSelectedMilestone] = useState({
    title: '',
    description: '',
    status: 'To Do',
    priority: '',
    difficultyLevel: '',
    color: '',
    startDate: null,
    endDate: null,
    actualStartDate: null,
    actualEndDate: null,
    active: true,
    project: projectId,
    createdBy: user._id,
    updatedBy: user._id
  });
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteMilestoneId, setDeleteMilestoneId] = useState('');

  const [selectedMilestoneIds, setSelectedMilestoneIds] = useState([]);
  const [openBulkDeleteDialog, setOpenBulkDeleteDialog] = useState(false);  

  useEffect(() => {
    fetchMilestones();
  }, []);

  const fetchMilestones = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/milestones/project/${projectId}`);
      setMilestones(response.data);
    } catch (error) {
      console.error('Error fetching milestones:', error);
    }
  };

  const createMilestone = async (milestone) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_SERVER_HOST}/api/milestone`, milestone);
      setMilestones([...milestones, response.data]);
      alertRef.current.displayAlert('success', t('createSuccess'));
    } catch (error) {
      console.error('Error creating milestone:', error);
      alertRef.current.displayAlert('error', t('createFail'));
    }
  };

  const updateMilestone = async (id, milestone) => {
    try {
      await axios.put(`${process.env.REACT_APP_SERVER_HOST}/api/milestone/${id}`, milestone);
      const updatedMilestones = milestones.map((m) =>
        m._id === id ? { ...m, ...milestone } : m
      );
      setMilestones(updatedMilestones);
      alertRef.current.displayAlert('success', t('saveSuccess'));
    } catch (error) {
      console.error('Error updating milestone:', error);
      alertRef.current.displayAlert('error', t('saveFail'));
    }
  };

  const deleteMilestone = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_SERVER_HOST}/api/milestone/${id}`);
      const updatedMilestones = milestones.filter((m) => m._id !== id);
      setMilestones(updatedMilestones);
      alertRef.current.displayAlert('success', t('deleteSuccess'));
    } catch (error) {
      console.error('Error deleting milestone:', error);
      alertRef.current.displayAlert('error', t('deleteFail'));
    }
  };

  // Bulk delete function
  const handleDeleteMultipleMilestones = async () => {
    try {
      for (const id of selectedMilestoneIds) {
        await axios.delete(`${process.env.REACT_APP_SERVER_HOST}/api/milestone/${id}`);
      }
      setMilestones((prev) => prev.filter((m) => !selectedMilestoneIds.includes(m._id))); // Remove deleted milestones from state
      setSelectedMilestoneIds([]); // Clear selection
      alertRef.current.displayAlert('success', t('deleteSuccess'));
    } catch (error) {
      console.error('Error deleting milestones:', error);
      alertRef.current.displayAlert('error', t('deleteFail'));
    } finally {
      setOpenBulkDeleteDialog(false); // Close the confirmation dialog
    }
  };

  const handleOpenBulkDeleteDialog = () => {
    setOpenBulkDeleteDialog(true);
  };

  const handleCloseBulkDeleteDialog = () => {
    setOpenBulkDeleteDialog(false);
  };

  const handleOpenDialog = () => {
    setDialogMode('create');
    setSelectedMilestone({
      title: '',
      description: '',
      status: 'To Do',
      priority: '',
      difficultyLevel: '',
      color: '',
      startDate: null,
      endDate: null,
      actualStartDate: null,
      actualEndDate: null,
      active: true,
      project: projectId,
      createdBy: user._id,
      updatedBy: user._id
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedMilestone({
      title: '',
      description: '',
      status: 'To Do',
      priority: '',
      difficultyLevel: '',
      color: '',
      startDate: null,
      endDate: null,
      actualStartDate: null,
      actualEndDate: null,
      active: true
    });
  };

  const handleSaveMilestone = () => {
    if (selectedMilestone.title.trim() === '') {
      alertRef.current.displayAlert('error', t('milestoneTitleRequired'));
      return;
    }

    if (dialogMode === 'create') {
      createMilestone(selectedMilestone);
    } else {
      updateMilestone(selectedMilestone._id, selectedMilestone);
    }
    handleCloseDialog();
  };

  const handleEditMilestone = (id) => {
    const selected = milestones.find((m) => m._id === id);
    if (selected) {
      setSelectedMilestone(selected);
      setDialogMode('edit');
      setOpenDialog(true);
    } else {
      alertRef.current.displayAlert('error', t('milestoneNotFound'));
    }
  };

  const handleOpenDeleteDialog = (id) => {
    setOpenDeleteDialog(true);
    setDeleteMilestoneId(id);
  };

  const handleCancelDelete = () => {
    setOpenDeleteDialog(false);
    setDeleteMilestoneId('');
  };

  const handleConfirmDelete = () => {
    deleteMilestone(deleteMilestoneId);
    setOpenDeleteDialog(false);
  };

  const handleColor = (updatedColor) => {
    setSelectedMilestone({ ...selectedMilestone, color: updatedColor.hex });
  };

  const columns = [
    { field: 'title', headerName: t('milestoneTitle'), width: 300 },
    //{ field: 'description', headerName: t('description'), width: 300 },
    {
      field: 'status', headerName: t('status'), width: 120,
      renderCell: (params) => {
        return params.value ? <StatusChip status={params.value} /> : null;
      }
    },
    {
      field: 'priority', headerName: t('priority'), width: 70,
      renderCell: (params) => {
        return params.value ? <PriorityChip priority={params.value} /> : null;
      }
    },
    {
      field: 'difficultyLevel', headerName: t('difficultyLevel'), width: 120,
      renderCell: (params) => {
        return params.value ? <DifficultyLevelChip mode="icon" difficultyLevel={params.value} /> : null;
      }
    },
    {
      field: 'color', headerName: t('color'), width: 50, editable: false,
      renderCell: (params) => {
        return params.value ? <Chip label=" " size="small" sx={{ borderRadius: '30%', backgroundColor: params.value }} /> : null;
      },
    },
    {
      field: 'startDate',
      headerName: t('startDate'),
      width: 150,
      type: 'date',
      valueGetter: (params) => params.value ? dayjs(params.value).toDate() : null
    },
    {
      field: 'endDate',
      headerName: t('endDate'),
      width: 150,
      type: 'date',
      valueGetter: (params) => params.value ? dayjs(params.value).toDate() : null
    },
    {
      field: 'actualStartDate',
      headerName: t('actualStartDate'),
      width: 150,
      type: 'date',
      valueGetter: (params) => params.value ? dayjs(params.value).toDate() : null
    },
    {
      field: 'actualEndDate',
      headerName: t('actualEndDate'),
      width: 150,
      type: 'date',
      valueGetter: (params) => params.value ? dayjs(params.value).toDate() : null
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: t('action'),
      width: 200,
      disableColumnMenu: true,
      disableColumnFilter: true,
      disableColumnSelector: true,
      disableExport: true,
      sortable: false,
      renderCell: (params) => (
        <>
          <Tooltip title={t('edit')}>
            <IconButton onClick={() => handleEditMilestone(params.row._id)}>
              <Edit />
            </IconButton>
          </Tooltip>

          <Tooltip title={t('delete')}>
            <IconButton onClick={() => handleOpenDeleteDialog(params.row._id)}>
              <Delete />
            </IconButton>
          </Tooltip>
        </>
      )
    }
  ];

  const rows = milestones.map((milestone) => ({
    _id: milestone._id,
    title: milestone.title,
    description: milestone.description,
    status: milestone.status,
    priority: milestone.priority,
    difficultyLevel: milestone.difficultyLevel,
    color: milestone.color,
    startDate: milestone.startDate,
    endDate: milestone.endDate,
    actualStartDate: milestone.actualStartDate,
    actualEndDate: milestone.actualEndDate,
  }));

  return (
    <>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <div style={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: isMobile ? 'flex-start' : 'space-between',
          alignItems: isMobile ? 'flex-start' : 'center',
          gap: isMobile ? '0px' : '0'
        }}>
          <Typography variant='subtitle1' gutterBottom sx={{ mb: isMobile ? 1 : 0 }}>
            {t('milestoneSetup')}
          </Typography>
          <div style={{ 
            display: 'flex', gap: '8px',
            
          }}>
          <Button
              variant="contained"
              color="error"
              size="small"
              sx={{ mb: isMobile ? 1 : 0, mr: 0 }}
              startIcon={<Delete />}
              onClick={handleOpenBulkDeleteDialog} // Open the bulk delete confirmation dialog
              disabled={selectedMilestoneIds.length === 0}
            >
              {t('deleteSelected')}
            </Button>
            <Button variant="contained" size="small" sx={{ mb: isMobile ? 1 : 0 }} startIcon={<Add />} onClick={handleOpenDialog}>
              {t('create')}
            </Button>
          </div>
        </div>

        <CDataGrid
          displayCheckbox={true}
          displayToolbar={true}
          columns={columns}
          rows={rows}
          onSelectionChange={(ids) => setSelectedMilestoneIds(ids)}
        />
      </Paper>

      <CDialog
        mode="update"
        item="milestone"
        title={dialogMode === 'create' ? t('createMilestone') : t('updateMilestone')}
        open={openDialog}
        aria-labelledby="milestone-dialog-title"
        onClose={handleCloseDialog}
        handleSubmit={handleSaveMilestone}
      >
        <Typography color="text.secondary" sx={{ flex: '0 0 auto' }}>{t('color')}</Typography>
        <SimpleColorPicker color={selectedMilestone?.color} handleColor={handleColor} displayPreviousColor={false} />

        <TextField
          autoFocus
          margin="dense"
          label={t('milestoneTitle')}
          type="text"
          size="small"
          required
          fullWidth
          value={selectedMilestone.title}
          onChange={(e) =>
            setSelectedMilestone({ ...selectedMilestone, title: e.target.value })
          }
        />
        <TextField
          margin="dense"
          label={t('description')}
          type="text"
          size="small"
          fullWidth
          multiline
          rows={4}
          value={selectedMilestone.description}
          onChange={(e) =>
            setSelectedMilestone({ ...selectedMilestone, description: e.target.value })
          }
        />
        <Grid container spacing={{ xs:0, sm:2 }}>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth margin="dense" size="small">
              <InputLabel>{t('status')}</InputLabel>
              <Select
                label={t('status')}
                value={selectedMilestone.status}
                onChange={(e) =>
                  setSelectedMilestone({ ...selectedMilestone, status: e.target.value })
                }
              >
                <MenuItem value="To Do" dense>
                  <StatusChip status="To Do" />
                </MenuItem>
                <MenuItem value="In Progress" dense>
                  <StatusChip status="In Progress" />
                </MenuItem>
                <MenuItem value="Under Review" dense>
                  <StatusChip status="Under Review" />
                </MenuItem>
                <MenuItem value="Done" dense>
                  <StatusChip status="Done" />
                </MenuItem>
                <MenuItem value="On Hold" dense>
                  <StatusChip status="On Hold" />
                </MenuItem>
                <MenuItem value="Cancelled" dense>
                  <StatusChip status="Cancelled" />
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth margin="dense" size="small">
              <InputLabel>{t('priority')}</InputLabel>
              <Select
                label={t('priority')}
                value={selectedMilestone.priority}
                onChange={(e) =>
                  setSelectedMilestone({ ...selectedMilestone, priority: e.target.value })
                }
              >
                <MenuItem value="Very High" dense>
                  <PriorityChip priority="Very High" mode="select" />
                </MenuItem>
                <MenuItem value="High" dense>
                  <PriorityChip priority="High" mode="select" />
                </MenuItem>
                <MenuItem value="Medium" dense>
                  <PriorityChip priority="Medium" mode="select" />
                </MenuItem>
                <MenuItem value="Low" dense>
                  <PriorityChip priority="Low" mode="select" />
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth margin="dense" size="small">
              <InputLabel>{t('difficultyLevel')}</InputLabel>
              <Select
                label={t('difficultyLevel')}
                value={selectedMilestone.difficultyLevel}
                onChange={(e) =>
                  setSelectedMilestone({ ...selectedMilestone, difficultyLevel: e.target.value })
                }
              >
                <MenuItem value="Easy" dense>
                  <DifficultyLevelChip mode="text" difficultyLevel="Easy" />
                </MenuItem>
                <MenuItem value="Moderate" dense>
                  <DifficultyLevelChip mode="text" difficultyLevel="Moderate" />
                </MenuItem>
                <MenuItem value="Difficult" dense>
                  <DifficultyLevelChip mode="text" difficultyLevel="Difficult" />
                </MenuItem>
                <MenuItem value="Very Difficult" dense>
                  <DifficultyLevelChip mode="text" difficultyLevel="Very Difficult" />
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        
        <Grid container spacing={2} sx={{ mt: '0.1rem' }}>
          <Grid item xs={6}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label={t('estimatedStartDate')}
                name="startDate"
                format="YYYY-MM-DD"
                value={selectedMilestone.startDate ? dayjs(selectedMilestone.startDate) : null}
                 //defaultValue={dayjs(new Date())}
                onChange={(date) => setSelectedMilestone({ ...selectedMilestone, startDate: date })}
                //shouldDisableDate={shouldDisableDate}
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
                value={selectedMilestone.endDate ? dayjs(selectedMilestone.endDate) : null}
                onChange={(date) => setSelectedMilestone({ ...selectedMilestone, endDate: date })}
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
                label={t('actualStartDate')}
                name="actualStartDate"
                format="YYYY-MM-DD"
                value={selectedMilestone.actualStartDate ? dayjs(selectedMilestone.actualStartDate) : null}
                onChange={(date) => setSelectedMilestone({ ...selectedMilestone, actualStartDate: date })}
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
                value={selectedMilestone.endDate ? dayjs(selectedMilestone.endDate) : null}
                //defaultValue={dayjs(new Date())}
                onChange={(date) => setSelectedMilestone({ ...selectedMilestone, endDate: date })}
                //shouldDisableDate={shouldDisableDate}
                slotProps={{
                  textField: { fullWidth: true, size: 'small' },
                  actionBar: { actions: ["clear", "today"] }
                }}
                margin="dense"
              />
            </LocalizationProvider>
          </Grid>
        </Grid>
          
        <FormControlLabel
          control={
            <Switch
              checked={selectedMilestone.active}
              onChange={(e) =>
                setSelectedMilestone({ ...selectedMilestone, active: e.target.checked })
              }
            />
          }
          label={t('active')}
        />
      </CDialog>

      <ConfirmDeleteDialog
        title={t('deleteSelected')}
        content={t('deleteSelectedConfirm')}
        open={openDeleteDialog}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />

      <ConfirmDeleteDialog
        title={t('deleteSelected')}
        content={t('deleteSelectedConfirm')}
        open={openBulkDeleteDialog}
        onCancel={handleCloseBulkDeleteDialog} // Close the dialog without deleting
        onConfirm={handleDeleteMultipleMilestones} // Trigger bulk deletion on confirm
      />

      <CAlert ref={alertRef} />
    </>
  );
};

export default MilestoneSetup;