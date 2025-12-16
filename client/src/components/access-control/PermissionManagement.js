import React, { useContext, useState, useEffect, useRef } from 'react';
import { DataGrid, zhTW, zhCN } from '@mui/x-data-grid';
import {
  CssBaseline,
  Box, Paper,
  Button, TextField, IconButton, Tooltip, Typography,
  Dialog, DialogActions, DialogContent, DialogTitle
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

import axios from 'axios';

import CDataGrid from '../../components/custom/CDataGrid';
import CAlert from '../../components/custom/CAlert';

import { useTranslation } from 'react-i18next';

import { initPermissions } from "../../components/init/InitPermissions";

import UserContext from '../../UserContext';

const PermissionManagement = () => {
  const { t, i18n } = useTranslation();

  // Alert
  const alertRef = useRef();

  const { user, setUser } = useContext(UserContext);

  const columns = [
    { field: 'name', headerName: t('permissionName'), width: 200 },
    { field: 'description', headerName: t('description'), width: 800 },
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
            <IconButton onClick={() => {
              console.log('Permission to edit: ' + params.row._id);
              handleEditPermission(params.row._id, "update");
            }}>
              <EditIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title={t('delete')}>
            <IconButton onClick={() => {
              console.log('Permission to delete: ' + params.row._id);
              handleOpenDeleteConfirmation(params.row._id);
            }}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </>
      )
    }
  ];

  const [permissions, setPermissions] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create');
  const [selectedPermission, setSelectedPermission] = useState({
    _id: '',
    name: '',
    description: '',
    createdBy: user._id,
    createdDate: new Date(),
    updatedBy: user._id,
    updatedDate: new Date()
  });
  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false);
  const [deletePermissionId, setDeletePermissionId] = useState('');

  // State for bulk delete
  const [selectedPermissionIds, setSelectedPermissionIds] = useState([]);
  const [openBulkDeleteConfirmation, setOpenBulkDeleteConfirmation] = useState(false);

  const rows = permissions.map((permission) => ({
    _id: permission._id,
    name: permission.name,
    description: permission.description,
    createdBy: permission.createdBy,
    createdDate: permission.createdDate,
    updatedBy: permission.updatedBy,
    updatedDate: permission.updatedDate,
  }));

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/permissions`);
      setPermissions(response.data);
    } catch (error) {
      console.error('Error fetching permissions:', error);
    }
  };

  const createPermission = async (permission) => {
    try {
      const { _id, ...permissionData } = permission;

      const currentDate = new Date();
      permissionData.createdBy = permissionData.createdBy || user._id;
      permissionData.createdDate = permissionData.createdDate || currentDate;
      permissionData.updatedBy = permissionData.updatedBy || user._id;
      permissionData.updatedDate = permissionData.updatedDate || currentDate;

      const response = await axios.post(`${process.env.REACT_APP_SERVER_HOST}/api/permission`, permissionData);
      setPermissions([...permissions, response.data]);
      alertRef.current.displayAlert('success', t('createSuccess'));
    } catch (error) {
      console.error('Error creating permission:', error);
      alertRef.current.displayAlert('error', t('createFail'));
    }
  };

  const updatePermission = async (id, permission) => {
    try {
      const currentDate = new Date();
      permission.updatedBy = permission.updatedBy || user._id;
      permission.updatedDate = permission.updatedDate || currentDate;

      await axios.put(`${process.env.REACT_APP_SERVER_HOST}/api/permission/${id}`, permission);
      const updatedPermissions = permissions.map((p) =>
        p._id === id ? { ...p, ...permission } : p
      );
      setPermissions(updatedPermissions);
      alertRef.current.displayAlert('success', t('saveSuccess'));
    } catch (error) {
      console.error('Error updating permission:', error);
      alertRef.current.displayAlert('error', t('saveFail'));
    }
  };

  const deletePermission = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_SERVER_HOST}/api/permission/${id}`);
      const updatedPermissions = permissions.filter((p) => p._id !== id);
      setPermissions(updatedPermissions);
      alertRef.current.displayAlert('success', t('deleteSuccess'));
    } catch (error) {
      console.error('Error deleting permission:', error);
      alertRef.current.displayAlert('error', t('deleteFail'));
    }
  };

  const deleteMultiplePermissions = async () => {
    try {
      for (const id of selectedPermissionIds) {
        await axios.delete(`${process.env.REACT_APP_SERVER_HOST}/api/permission/${id}`);
      }
      setPermissions((prev) => prev.filter((p) => !selectedPermissionIds.includes(p._id)));
      setSelectedPermissionIds([]);
      alertRef.current.displayAlert('success', t('deleteSuccess'));
    } catch (error) {
      console.error('Error deleting permissions:', error);
      alertRef.current.displayAlert('error', t('deleteFail'));
    } finally {
      setOpenBulkDeleteConfirmation(false);
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPermission({ _id: '', name: '', description: '' });
  };

  const handleSavePermission = () => {
    if (selectedPermission.name.trim() === '') {
      alertRef.current.displayAlert('error', t('permissionNameRequired'));
      return;
    }

    if (dialogMode === 'create') {
      createPermission(selectedPermission);
    } else {
      updatePermission(selectedPermission._id, selectedPermission);
    }
    handleCloseDialog();
  };

  const handleEditPermission = (id) => {
    const selectedPermission = permissions.find((permission) => permission._id === id);
    if (selectedPermission) {
      setSelectedPermission(selectedPermission);
      setDialogMode('edit');
      setOpenDialog(true);
    } else {
      alertRef.current.displayAlert('error', t('permissionNotFound'));
    }
  };

  const handleOpenDeleteConfirmation = (id) => {
    setOpenDeleteConfirmation(true);
    setDeletePermissionId(id);
  };

  const handleCloseDeleteConfirmation = () => {
    setOpenDeleteConfirmation(false);
    setDeletePermissionId('');
  };

  const handleDeletePermission = () => {
    deletePermission(deletePermissionId);
    handleCloseDeleteConfirmation();
  };

  const handleOpenBulkDeleteConfirmation = () => {
    setOpenBulkDeleteConfirmation(true);
  };

  const handleCloseBulkDeleteConfirmation = () => {
    setOpenBulkDeleteConfirmation(false);
  };

  return (
    <>
      <CssBaseline />

      <Paper variant="outlined" sx={{ p: 2 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant='subtitle2' gutterBottom>
            {t('permissionManagement')}
          </Typography>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button
              variant="contained"
              color="error"
              size="small"
              sx={{ mb: 2 }}
              startIcon={<DeleteIcon />}
              onClick={handleOpenBulkDeleteConfirmation}
              disabled={selectedPermissionIds.length === 0}
            >
              {t('deleteSelected')}
            </Button>
            <Button
              variant="contained"
              size="small"
              sx={{ mb: 2 }}
              startIcon={<AddIcon />}
              onClick={handleOpenDialog}
            >
              {t('create')}
            </Button>
          </div>
        </div>

        <CDataGrid
          displayCheckbox={true}
          displayToolbar={true}
          columns={columns}
          rows={rows}
          onSelectionChange={(ids) => setSelectedPermissionIds(ids)}
        />
      </Paper>

      {/* Dialog for creating/editing permission */}
      <Dialog
        open={openDialog}
        aria-labelledby="permission-dialog-title"
        onClose={handleCloseDialog}
      >
        <DialogTitle id="permission-dialog-title">
          <Typography variant="subtitle2">{dialogMode === 'create' ? t('createPermission') : t('editPermission')}</Typography>
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t('permissionName')}
            type="text"
            size="small"
            required
            fullWidth
            value={selectedPermission.name}
            onChange={(e) =>
              setSelectedPermission({ ...selectedPermission, name: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label={t('description')}
            type="text"
            size="small"
            fullWidth
            value={selectedPermission.description}
            onChange={(e) =>
              setSelectedPermission({ ...selectedPermission, description: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={handleCloseDialog}>{t('cancel')}</Button>
          <Button variant="contained" onClick={handleSavePermission}>{t('save')}</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for delete confirmation */}
      <Dialog
        open={openDeleteConfirmation}
        onClose={handleCloseDeleteConfirmation}
        aria-labelledby="delete-confirmation-dialog-title"
      >
        <DialogTitle id="delete-confirmation-dialog-title">
          <Typography variant="subtitle2">{t('deletePermission')}</Typography>
        </DialogTitle>
        <DialogContent>
          {t('confirmDeletePermission')}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirmation}>{t('cancel')}</Button>
          <Button onClick={handleDeletePermission}>{t('delete')}</Button>
        </DialogActions>
      </Dialog>

      {/* Bulk delete confirmation dialog */}
      <Dialog
        open={openBulkDeleteConfirmation}
        onClose={handleCloseBulkDeleteConfirmation}
        aria-labelledby="bulk-delete-confirmation-dialog-title"
      >
        <DialogTitle id="bulk-delete-confirmation-dialog-title">
          <Typography variant="subtitle2">{t('deleteSelected')}</Typography>
        </DialogTitle>
        <DialogContent>
          {t('deleteSelectedConfirm')}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBulkDeleteConfirmation}>{t('cancel')}</Button>
          <Button onClick={deleteMultiplePermissions}>{t('delete')}</Button>
        </DialogActions>
      </Dialog>

      <CAlert ref={alertRef} />
    </>
  );
};

export default PermissionManagement;