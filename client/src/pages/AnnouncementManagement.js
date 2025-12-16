import React, { useContext, useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  useMediaQuery,
  CssBaseline,
  Paper,
  Box,
  Button,
  TextField,
  InputLabel,
  IconButton,
  Tooltip,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Switch,
  FormControlLabel,
  Stack,
  Grid
} from '@mui/material';
import { DataGrid, zhTW, zhCN } from '@mui/x-data-grid';
import { Add, Edit, Delete, Close, Home, Folder, Campaign, Preview, FullscreenExit, Fullscreen } from '@mui/icons-material';

import axios from 'axios';

import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { useTranslation } from 'react-i18next';
import UserContext from '../UserContext';
import { htmlToDraftContent, draftToHtmlContent } from '../utils/RichTextUtils';

import MainContent from '../components/MainContent';
import AttachmentList from '../components/AttachmentList';
import TeamMemberSelector from '../components/custom/TeamMemberSelector';
import RichTextArea from '../components/custom/RichTextArea';
import AccountAvatar from '../components/AccountAvatar';
import AnnouncementDialog from '../components/AnnouncementDialog';
import ProjectFolder from '../components/ProjectFolder';
import ProjectSelector from '../components/custom/ProjectSelector';
import CDialog from '../components/custom/CDialog';
import ConfirmDeleteDialog from '../components/custom/ConfirmDeleteDialog';

import CDataGrid from '../components/custom/CDataGrid';
import CAlert from '../components/custom/CAlert';

const AnnouncementManagement = () => {
  const token = localStorage.getItem('token');

  const { t, i18n } = useTranslation();
  let locale = null;
  if (i18n.language === 'zh-cn') {
    locale = zhCN.components.MuiDataGrid.defaultProps.localeText;
  } else if (i18n.language === 'zh-hk') {
    locale = zhTW.components.MuiDataGrid.defaultProps.localeText;
  }

  const isMobile = useMediaQuery('(max-width:600px)');
  
  const alertRef = useRef();
  const { user } = useContext(UserContext);

  const { projectId } = useParams();
  const [project, setProject] = useState();

  useEffect(() => {
    if (projectId && projectId !== 'undefined') {
      fetchProject();
    }
  }, []);

  const fetchProject = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/project/${projectId}`);
      setProject(response.data);
    } catch (error) {
      console.error('Error fetching project:', error);
    }
  };
  
  const breadcrumbItems = [
    { label: 'home', href: '/', icon: <Home sx={{ mr: 0.5 }} fontSize="inherit" /> },
    { label: project?.title || t('projects'), icon: <Folder sx={{ mr: 0.5 }} fontSize="inherit" /> },
    { label: 'announcement', icon: <Campaign sx={{ mr: 0.5 }} fontSize="inherit" /> },
  ];

  // State variables
  const [announcements, setAnnouncements] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [mode, setMode] = useState('create');

  const [openPreviewDialog, setOpenPreviewDialog] = useState(false); // State for the preview dialog
  const [previewAnnouncement, setPreviewAnnouncement] = useState(null); // State to hold the data for preview

  const [selectedAnnouncement, setSelectedAnnouncement] = useState({
    title: '',
    content: '',
    startDate: '',
    endDate: '',
    active: true,
    attachments: [],
    visibleTo: [],
    createdBy: user._id,
    createdDate: new Date(),
    updatedBy: user._id,
    updatedDate: new Date(),
    project: projectId || '',  // Default to '' if no project is selected
  });
  
  const [content, setContent] = useState();
  const [startDate, setStartDate] = useState(selectedAnnouncement?.startDate);
  const [endDate, setEndDate] = useState(selectedAnnouncement?.endDate);
  const [attachments, setAttachments] = useState(selectedAnnouncement?.attachments || []);
  const [personInCharge, setPersonInCharge] = useState(selectedAnnouncement?.visibleTo || []);

  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false);
  const [deleteAnnouncementId, setDeleteAnnouncementId] = useState('');

  const [selectedAnnouncementIds, setSelectedAnnouncementIds] = useState([]);
  const [openBulkDeleteConfirmation, setOpenBulkDeleteConfirmation] = useState(false);

  // Function to handle bulk deletion
  const handleDeleteMultipleAnnouncements = async () => {
    try {
      for (const id of selectedAnnouncementIds) {
        await axios.delete(`${process.env.REACT_APP_SERVER_HOST}/api/announcement/${id}`);
      }
      setAnnouncements((prev) => prev.filter((a) => !selectedAnnouncementIds.includes(a._id))); // Remove deleted announcements from state
      setSelectedAnnouncementIds([]); // Clear selection
      alertRef.current.displayAlert('success', t('deleteSuccess'));
    } catch (error) {
      console.error('Error deleting announcements:', error);
      alertRef.current.displayAlert('error', t('deleteFail'));
    } finally {
      setOpenBulkDeleteConfirmation(false); // Close the confirmation dialog
    }
  };

  const handleOpenBulkDeleteConfirmation = () => {
    setOpenBulkDeleteConfirmation(true);
  };

  const handleCloseBulkDeleteConfirmation = () => {
    setOpenBulkDeleteConfirmation(false);
  };

  // Rich Text Description
  const [initialized, setInitialized] = useState(false);
  useEffect(() => {
    if (!initialized) {
      setContent(htmlToDraftContent(selectedAnnouncement?.content));
      setInitialized(true);
    }
  }, [initialized, htmlToDraftContent(selectedAnnouncement?.content)]);

  const handleContentChange = (value) => {
    const updatedContent = draftToHtmlContent(value);
  
    setSelectedAnnouncement((prev) => ({
      ...prev, // Preserve all existing fields (e.g., title, startDate, endDate)
      content: updatedContent, // Only update the `content` field
    }));
  };

  // Function to handle preview dialog open
  const handleOpenPreviewDialog = (announcement) => {
    setPreviewAnnouncement(announcement);
    setOpenPreviewDialog(true);
  };

  // Function to handle preview dialog close
  const handleClosePreviewDialog = () => {
    setOpenPreviewDialog(false);
    setPreviewAnnouncement(null);
  };

  // DataGrid rows
  const rows = announcements?.map((announcement) => ({
    ...announcement,
    id: announcement._id, // Map `_id` to `id` for DataGrid
  }));

  // DataGrid columns
  const columns = [
    { field: 'project',
      headerName: t('project'),
      width: 200,
      renderCell: (params) => (
        <ProjectFolder project={params.value} />
      ),
    },
    { field: 'title', headerName: t('title'), width: 200 },
    { field: 'content', headerName: t('content'), width: 400 },
    {
      field: 'startDate',
      headerName: t('startDate'),
      width: 150,
      valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString() : null,
    },
    {
      field: 'endDate',
      headerName: t('endDate'),
      width: 150,
      valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString() : null,
    },
    {
      field: 'visibleTo',
      headerName: t('visibleTo'),
      width: 200,
      renderCell: (params) => {
        const visibleTo = params.value || [];
        return (<AccountAvatar users={visibleTo} size="small" />);
      },
    },
    {
      field: 'active',
      headerName: t('active'),
      width: 100,
      renderCell: (params) => (params.value ? t('yes') : t('no')),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: t('action'),
      width: 150,
      renderCell: (params) => (
        <>
          <Tooltip title={t('edit')}>
            <IconButton onClick={() => handleEditAnnouncement(params.row)}>
              <Edit />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('delete')}>
            <IconButton onClick={() => handleOpenDeleteConfirmation(params.row.id)}>
              <Delete />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('preview')}>
            <IconButton onClick={() => handleOpenPreviewDialog(params.row)}>
              <Preview />
            </IconButton>
          </Tooltip>
        </>
      ),
    },
  ];

  // Fetch announcements on component mount
  useEffect(() => {
    fetchAnnouncements();
  }, [projectId]);

  const fetchAnnouncements = async () => {
    if (!token) {
      console.error('User token is not available');
      return;
    }
    try {
      if (projectId !== 'undefined') {
        const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/announcements/${projectId}`);
        setAnnouncements(response.data);
      }
      else {
        const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/announcements`, {
          headers: {
            Authorization: `Bearer ${token}` // Assuming JWT token is used for authentication
          }
        });
        setAnnouncements(response.data);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
      alertRef.current.displayAlert('error', t('fetchFail'));
    }
  };

  const createAnnouncement = async (announcement) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_SERVER_HOST}/api/announcement`, announcement);
      setAnnouncements([...announcements, response.data]);
      alertRef.current.displayAlert('success', t('createSuccess'));
    } catch (error) {
      console.error('Error creating announcement:', error);
      alertRef.current.displayAlert('error', t('createFail'));
    }
  };

  const updateAnnouncement = async (id, announcement) => {
    try {
      const response = await axios.put(`${process.env.REACT_APP_SERVER_HOST}/api/announcement/${id}`, {
        ...announcement,
      });
  
      setAnnouncements((prevAnnouncements) =>
        prevAnnouncements.map((a) => (a._id === id ? response.data : a))
      );
  
      alertRef.current.displayAlert('success', t('saveSuccess'));
    } catch (error) {
      console.error('Error updating announcement:', error);
      alertRef.current.displayAlert('error', t('saveFail'));
    }
  };

  const deleteAnnouncement = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_SERVER_HOST}/api/announcement/${id}`);
      setAnnouncements(announcements.filter((a) => a._id !== id));
      alertRef.current.displayAlert('success', t('deleteSuccess'));
    } catch (error) {
      console.error('Error deleting announcement:', error);
      alertRef.current.displayAlert('error', t('deleteFail'));
    }
  };

  const handleOpenDialog = () => {
    setSelectedAnnouncement({
      title: '',
      content: '',
      startDate: '',
      endDate: '',
      active: true,
      attachments: [],
      visibleTo: [],
      createdBy: user._id,
      createdDate: new Date(),
      updatedBy: user._id,
      updatedDate: new Date(),
      project: projectId || '',
    });
  
    setStartDate('');
    setEndDate('');
    setAttachments([]);
    setPersonInCharge([]);
    setMode('create');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedAnnouncement({
      title: '',
      content: '',
      startDate: '',
      endDate: '',
      active: true,
      attachments: [],
      visibleTo: [],
      createdBy: user._id,
      createdDate: new Date(),
      updatedBy: user._id,
      updatedDate: new Date(),
      project: projectId || '',
    });
    setStartDate('');
    setEndDate('');
    setAttachments([]);
    setPersonInCharge([]);
  };

  const handleSaveAnnouncement = () => {
    if (!selectedAnnouncement.title.trim()) {
      alertRef.current.displayAlert('error', t('saveFail'));
      return;
    }

    if (mode === 'create') {
      createAnnouncement({
        ...selectedAnnouncement,
        startDate,
        endDate,
        attachments,
        visibleTo: projectId !== 'undefined' ? personInCharge : personInCharge?.map(person => person._id),
        project: projectId !== 'undefined' ? projectId : ''
      });
      handleCloseDialog();
    } else {
      updateAnnouncement(selectedAnnouncement._id, {
        ...selectedAnnouncement,
        startDate,
        endDate,
        attachments,
        visibleTo: personInCharge,
        project: projectId
      });
    }
  };

  const handleEditAnnouncement = (announcement) => {
    setSelectedAnnouncement({
      ...announcement,
      startDate: announcement.startDate ? new Date(announcement.startDate).toISOString().split('T')[0] : '',
      endDate: announcement.endDate ? new Date(announcement.endDate).toISOString().split('T')[0] : '',
      attachments: announcement.attachments || [],
    });
  
    setMode('update');
    setStartDate(announcement.startDate || "");
    setEndDate(announcement.endDate || "");
    setAttachments(announcement.attachments || []);
  
    // Ensure visibleTo is properly mapped to personInCharge
    setPersonInCharge(announcement.visibleTo || []);
    setOpenDialog(true);
  };

  const handleOpenDeleteConfirmation = (id) => {
    setDeleteAnnouncementId(id);
    setOpenDeleteConfirmation(true);
  };

  const handleCloseDeleteConfirmation = () => {
    setDeleteAnnouncementId('');
    setOpenDeleteConfirmation(false);
  };

  const handleDeleteAnnouncement = () => {
    deleteAnnouncement(deleteAnnouncementId);
    handleCloseDeleteConfirmation();
  };

  const handlePersonInChargeChange = (selectedPersons) => {
    setPersonInCharge(selectedPersons);
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

  return (
    <MainContent
      pageTitle="announcement"
      breadcrumbItems={breadcrumbItems}
      actions={
        <Stack direction="row">
          <Button
            variant="contained"
            color="error"
            size="small"
            sx={{ mb: 2, mr: 2 }}
            startIcon={<Delete />}
            onClick={handleOpenBulkDeleteConfirmation} // Bulk delete action
            disabled={selectedAnnouncementIds?.length === 0}
          >
            {t('deleteSelected')}
          </Button>
          <Button
            variant="contained"
            size="small"
            sx={{ mb: 2 }}
            startIcon={<Add />}
            onClick={handleOpenDialog}
          >
            {t('create')}
          </Button>
        </Stack>
      }
    >
      <CssBaseline />
      <Paper variant="outlined" sx={{ p: 2 }}>
        {/*<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant='subtitle2' gutterBottom>
            {t('announcementManagement')}
          </Typography>

          <Button variant="contained" size="small" sx={{ mb: 2 }} startIcon={<Add />} onClick={handleOpenDialog}>
            {t('create')}
          </Button>
        </div>*/}

        <CDataGrid
          displayCheckbox={true}
          displayToolbar={true}
          columns={columns}
          rows={rows}
          onSelectionChange={(ids) => setSelectedAnnouncementIds(ids)} // Correctly updates state
        />
      </Paper>

      {/* Dialog for Creating/Editing Announcement */}
      <CDialog
        mode={mode}
        item="announcement"
        open={openDialog}
        onClose={handleCloseDialog}
        handleSubmit={handleSaveAnnouncement}
        handlePreview={() => handleOpenPreviewDialog(selectedAnnouncement)}
        title={
          <Typography variant="subtitle2">
            {mode === 'create' ? t('createAnnouncement') : t('editAnnouncement')}
          </Typography>
        }
        maxWidth="md"
      >
        {user.email === process.env.REACT_APP_ADMIN_EMAIL && (
            <ProjectSelector
              projectId={selectedAnnouncement.project || ''}
              displayAllOption={true}
              onChange={(projectId) => {
                setSelectedAnnouncement({
                  ...selectedAnnouncement,
                  project: (projectId === '' || projectId === "undefined") ? null : projectId
                });
              }}
            />
          )}

          <TextField
            autoFocus
            size="small"
            margin="dense"
            label={t('title')}
            type="text"
            required
            fullWidth
            value={selectedAnnouncement.title}
            onChange={(e) => setSelectedAnnouncement({ ...selectedAnnouncement, title: e.target.value })}
            sx={{ mb:'1rem' }}
          />
          <RichTextArea
            description={selectedAnnouncement.content}
            handleDescriptionChange={handleContentChange}
          />
          {/*<TextField
            size="small"
            margin="dense"
            label={t('content')}
            type="text"
            required
            fullWidth
            multiline
            rows={3}
            value={selectedAnnouncement.content}
            onChange={(e) => setSelectedAnnouncement({ ...selectedAnnouncement, content: e.target.value })}
          />*/}

          <Grid container spacing={2} sx={{ mt: '0.1rem' }}>
            <Grid item xs={6}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label={t('startDate')}
                  name="startDate"
                  format="YYYY-MM-DD"
                  value={selectedAnnouncement.startDate ? dayjs(selectedAnnouncement.startDate) : null}
                  //defaultValue={dayjs(new Date())}
                  //onChange={(date) => handleChange({ target: { name: 'startDate', value: date } })}
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
            <Grid item xs={6} mb={1}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label={t('endDate')}
                  name="endDate"
                  format="YYYY-MM-DD"
                  value={selectedAnnouncement.endDate ? dayjs(selectedAnnouncement.endDate) : null}
                  //defaultValue={dayjs(new Date())}
                  //onChange={(date) => handleChange({ target: { name: 'endDate', value: date } })}
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

          <TeamMemberSelector
            label={t('visibleTo')}
            personInCharge={personInCharge}
            setPersonInCharge={setPersonInCharge}
            onChange={handlePersonInChargeChange}
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={selectedAnnouncement.active}
                onChange={(e) => setSelectedAnnouncement({ ...selectedAnnouncement, active: e.target.checked })}
                required
                size="small"
              />
            }
            label={t('active')}
            sx={{ m:'1rem 0' }}
          />

          {mode === 'update' && (
            <AttachmentList
              mode="upload"
              files={selectedAnnouncement?.attachments || []} // Ensure attachments are passed as an array
              setFiles={(updatedFiles) => {
                setSelectedAnnouncement((prevAnnouncement) => ({
                  ...prevAnnouncement,
                  attachments: updatedFiles, // Update attachments in the announcement
                }));
              }}
              setAttachments={setAttachments}
              editedObject={selectedAnnouncement}
              setEditedObject={setSelectedAnnouncement}
              handleSave={handleSaveAnnouncement}
              folder="announcements"
            />
          )}
      </CDialog>

      {/* Delete Confirmation Dialog for Single Item */}
      <ConfirmDeleteDialog
        title={t('deleteAnnouncement')}
        content={t('deleteAnnouncementConfirm')}
        open={openDeleteConfirmation}
        onCancel={handleCloseDeleteConfirmation}
        onConfirm={handleDeleteAnnouncement}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        title={t('deleteSelected')}
        content={t('deleteSelectedConfirm')}
        open={openBulkDeleteConfirmation}
        onCancel={handleCloseBulkDeleteConfirmation}
        onConfirm={handleDeleteMultipleAnnouncements}
      />

      <AnnouncementDialog
        open={openPreviewDialog}
        onClose={handleClosePreviewDialog}
        announcement={previewAnnouncement}
      />

      <CAlert ref={alertRef} />
    </MainContent>
  );
};

export default AnnouncementManagement;