import React, { useState, useEffect, useRef } from 'react';
import { useMediaQuery, Button, TextField, IconButton, Tooltip, Typography, Paper, Switch, FormControlLabel, Chip } from '@mui/material';
import { Add, Delete, Edit } from '@mui/icons-material';
import axios from 'axios';

import CDataGrid from '../custom/CDataGrid';
import CAlert from '../custom/CAlert';
import CDialog from '../custom/CDialog';
import ConfirmDeleteDialog from '../custom/ConfirmDeleteDialog';

import { useTranslation } from 'react-i18next';
import SimpleColorPicker from '../SimpleColorPicker';

const TagManagement = () => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery('(max-width:600px)');
  const alertRef = useRef();

  const projectId = window.location.href.split("/")[4];

  const columns = [
    {
      field: 'name.enUS',
      headerName: `${t('tagName')} (${t('enUS')})`,
      width: 250,
      valueGetter: (params) => params.row.name.enUS
    },
    {
      field: 'name.zhHK',
      headerName: `${t('tagName')} (${t('zhHK')})`,
      width: 250,
      valueGetter: (params) => params.row.name.zhHK
    },
    {
      field: 'name.zhCN',
      headerName: `${t('tagName')} (${t('zhCN')})`,
      width: 250,
      valueGetter: (params) => params.row.name.zhCN
    },
    {
      field: 'color', headerName: t('color'), width: 100, editable: false,
      renderCell: (params) => {
        return params.value ? <Chip label=" " size="small" sx={{ borderRadius: '30%', backgroundColor: params.value }} /> : null;
      },
    },
    { field: 'active', headerName: t('active'), width: 100, type: 'boolean' },
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
            <IconButton onClick={() => handleEditTag(params.row._id)}>
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

  const [tags, setTags] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create');
  const [selectedTag, setSelectedTag] = useState({
    name: { enUS: '', zhHK: '', zhCN: '' },
    color: '',
    active: true,
    project: projectId,
  });
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteTagId, setdeleteTagId] = useState('');

  const [selectedTagIds, setSelectedTagIds] = useState([]); // State for selected tags
  const [openBulkDeleteDialog, setOpenBulkDeleteDialog] = useState(false); // State for bulk delete dialog

  const rows = tags.map((tag) => ({
    _id: tag._id,
    name: tag.name,
    color: tag.color,
    active: tag.active,
    project: tag.project,
  }));

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/tags/project/${projectId}`);
      setTags(response.data);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const createTag = async (tag) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_SERVER_HOST}/api/tag`, tag);
      setTags([...tags, response.data]);
      alertRef.current.displayAlert('success', t('createSuccess'));
    } catch (error) {
      console.error('Error creating tags:', error);
      alertRef.current.displayAlert('error', t('createFail'));
    }
  };

  const updateTag = async (id, tag) => {
    try {
      await axios.put(`${process.env.REACT_APP_SERVER_HOST}/api/tag/${id}`, tag);
      const updatedTags = tags.map((c) =>
        c._id === id ? { ...c, ...tag } : c
      );
      setTags(updatedTags);
      alertRef.current.displayAlert('success', t('saveSuccess'));
    } catch (error) {
      console.error('Error updating tag:', error);
      alertRef.current.displayAlert('error', t('saveFail'));
    }
  };

  const deleteTag = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_SERVER_HOST}/api/tag/${id}`);
      const updatedTags = tags.filter((c) => c._id !== id);
      setTags(updatedTags);
      alertRef.current.displayAlert('success', t('deleteSuccess'));
    } catch (error) {
      console.error('Error deleting tag:', error);
      alertRef.current.displayAlert('error', t('deleteFail'));
    }
  };

  // Bulk delete function
  const handleDeleteMultipleTags = async () => {
    try {
      for (const id of selectedTagIds) {
        await axios.delete(`${process.env.REACT_APP_SERVER_HOST}/api/tag/${id}`);
      }
      setTags((prev) => prev.filter((tag) => !selectedTagIds.includes(tag._id)));
      setSelectedTagIds([]);
      alertRef.current.displayAlert('success', t('deleteSuccess'));
    } catch (error) {
      console.error('Error deleting tags:', error);
      alertRef.current.displayAlert('error', t('deleteFail'));
    } finally {
      setOpenBulkDeleteDialog(false);
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
    setSelectedTag({
      name: { enUS: '', zhHK: '', zhCN: '' },
      color: '',
      active: true,
      project: projectId,
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTag({
      _id: '',
      name: { enUS: '', zhHK: '', zhCN: '' },
      color: '',
      active: true
    });
  };

  const handleSaveTag = () => {
    if (selectedTag.name.enUS.trim() === '') {
      alertRef.current.displayAlert('error', t('tagNameEnUsRequired'));
      return;
    }
    if (selectedTag.name.zhHK.trim() === '') {
      alertRef.current.displayAlert('error', t('tagNameZhHKRequired'));
      return;
    }
    if (selectedTag.name.zhCN.trim() === '') {
      alertRef.current.displayAlert('error', t('tagNameZhCNRequired'));
      return;
    }

    if (dialogMode === 'create') {
      createTag(selectedTag);
    } else {
      updateTag(selectedTag._id, selectedTag);
    }
    handleCloseDialog();
  };

  const handleEditTag = (id) => {
    const selectedTag = tags.find((category) => category._id === id);
    if (selectedTag) {
      setSelectedTag(selectedTag);
      setDialogMode('edit');
      setOpenDialog(true);
    } else {
      alertRef.current.displayAlert('error', t('categoryNotFound'));
    }
  };

  const handleOpenDeleteDialog = (id) => {
    setOpenDeleteDialog(true);
    setdeleteTagId(id);
  };

  const handleCancelDelete = () => {
    setOpenDeleteDialog(false);
    setdeleteTagId('');
  };

  const handleConfirmDelete = () => {
    deleteTag(deleteTagId);
    setOpenDeleteDialog(false);
  };

  const handleColor = (updatedColor) => {
    setSelectedTag({ ...selectedTag, color: updatedColor.hex });
  };

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
            {t('tagManagement')}
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
              onClick={handleOpenBulkDeleteDialog}
              disabled={selectedTagIds.length === 0}
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
          onSelectionChange={(ids) => setSelectedTagIds(ids)} // Track selected rows
        />
      </Paper>

      <CDialog
        mode="update"
        item="tag"
        title={dialogMode === 'create' ? t('createTag') : t('editTag')}
        open={openDialog}
        aria-labelledby="category-dialog-title"
        onClose={handleCloseDialog}
        handleSubmit={handleSaveTag}
      >
        <TextField
          autoFocus
          margin="dense"
          label={`${t('tagName')} (${t('enUS')})`}
          type="text"
          size="small"
          required
          fullWidth
          value={selectedTag.name.enUS}
          onChange={(e) =>
            setSelectedTag({ ...selectedTag, name: { ...selectedTag.name, enUS: e.target.value } })
          }
        />
        <TextField
          margin="dense"
          label={`${t('tagName')} (${t('zhHK')})`}
          type="text"
          size="small"
          required
          fullWidth
          value={selectedTag.name.zhHK}
          onChange={(e) =>
            setSelectedTag({ ...selectedTag, name: { ...selectedTag.name, zhHK: e.target.value } })
          }
        />
        <TextField
          margin="dense"
          label={`${t('tagName')} (${t('zhCN')})`}
          type="text"
          size="small"
          required
          fullWidth
          value={selectedTag.name.zhCN}
          onChange={(e) =>
            setSelectedTag({ ...selectedTag, name: { ...selectedTag.name, zhCN: e.target.value } })
          }
        />

        <Typography color="text.secondary" sx={{ flex: '0 0 auto', mt: 2 }}>{t('color')}</Typography>
        <SimpleColorPicker color={selectedTag?.color} handleColor={handleColor} displayPreviousColor={false} />

        <FormControlLabel
          control={
            <Switch
              checked={selectedTag.active}
              onChange={(e) =>
                setSelectedTag({ ...selectedTag, active: e.target.checked })
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
        onCancel={handleCloseBulkDeleteDialog}
        onConfirm={handleDeleteMultipleTags}
      />

      <CAlert ref={alertRef} />
    </>
  );
};

export default TagManagement;