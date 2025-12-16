import React, { useContext, useState, useEffect, useRef } from 'react';
import { DataGrid, zhTW, zhCN } from '@mui/x-data-grid';
import {
  CssBaseline,
  Box,
  Paper,
  Button,
  TextField,
  IconButton,
  Tooltip,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

import axios from 'axios';

import CDataGrid from '../../components/custom/CDataGrid';
import CAlert from '../../components/custom/CAlert';

import { useTranslation } from 'react-i18next';

import UserContext from '../../UserContext';

const RoleManagement = () => {
  const { t } = useTranslation();

  // Alert
  const alertRef = useRef();

  const { user } = useContext(UserContext);

  const columns = [
    { field: 'name', headerName: t('roleName'), width: 200 },
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
            <IconButton
              onClick={() => {
                console.log('Role to edit: ' + params.row._id);
                handleEditRole(params.row._id, 'update');
              }}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title={t('delete')}>
            <IconButton
              onClick={() => {
                console.log('Task to delete: ' + params.row._id);
                handleOpenDeleteConfirmation(params.row._id);
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </>
      )
    }
  ];

  const [roles, setRoles] = useState([]/*initRoles*/);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create');
  const [selectedRole, setSelectedRole] = useState({
    _id: '',
    name: '',
    description: '',
    createdBy: user._id,
    createdDate: new Date(),
    updatedBy: user._id,
    updatedDate: new Date()
  });
  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false);
  const [deleteRoleId, setDeleteRoleId] = useState('');

  // Bulk delete state
  const [selectedRoleIds, setSelectedRoleIds] = useState([]);
  const [openBulkDeleteConfirmation, setOpenBulkDeleteConfirmation] = useState(false);

  const rows = roles.map((role) => ({
    _id: role._id,
    name: role.name,
    description: role.description,
    createdBy: role.createdBy,
    createdDate: role.createdDate,
    updatedBy: role.updatedBy,
    updatedDate: role.updatedDate
  }));

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/roles`);
      setRoles(response.data);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const createRole = async (role) => {
    try {
      const { _id, ...roleData } = role;

      const currentDate = new Date();
      roleData.createdBy = roleData.createdBy || user._id;
      roleData.createdDate = roleData.createdDate || currentDate;
      roleData.updatedBy = roleData.updatedBy || user._id;
      roleData.updatedDate = roleData.updatedDate || currentDate;

      const response = await axios.post(`${process.env.REACT_APP_SERVER_HOST}/api/role`, roleData);
      setRoles([...roles, response.data]);
      alertRef.current.displayAlert('success', t('createSuccess'));
    } catch (error) {
      console.error('Error creating role:', error);
      alertRef.current.displayAlert('error', t('createFail'));
    }
  };

  const updateRole = async (id, role) => {
    try {
      const currentDate = new Date();
      role.updatedBy = role.updatedBy || user._id;
      role.updatedDate = role.updatedDate || currentDate;

      await axios.put(`${process.env.REACT_APP_SERVER_HOST}/api/role/${id}`, role);
      const updatedRoles = roles.map((r) => (r._id === id ? { ...r, ...role } : r));
      setRoles(updatedRoles);
      alertRef.current.displayAlert('success', t('saveSuccess'));
    } catch (error) {
      console.error('Error updating role:', error);
      alertRef.current.displayAlert('error', t('saveFail'));
    }
  };

  const deleteRole = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_SERVER_HOST}/api/role/${id}`);
      const updatedRoles = roles.filter((r) => r._id !== id);
      setRoles(updatedRoles);
      alertRef.current.displayAlert('success', t('deleteSuccess'));
    } catch (error) {
      console.error('Error deleting role:', error);
      alertRef.current.displayAlert('error', t('deleteFail'));
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedRole({ _id: '', name: '', description: '' });
  };

  const handleSaveRole = () => {
    if (selectedRole.name.trim() === '') {
      alertRef.current.displayAlert('error', t('roleNameRequired'));
      return;
    }

    if (dialogMode === 'create') {
      createRole(selectedRole);
    } else {
      updateRole(selectedRole._id, selectedRole);
    }
    handleCloseDialog();
  };

  const handleEditRole = (id) => {
    const selectedRole = roles.find((role) => role._id === id);
    if (selectedRole) {
      setSelectedRole(selectedRole);
      setDialogMode('edit');
      setOpenDialog(true);
    } else {
      alertRef.current.displayAlert('error', t('roleNotFound'));
    }
  };

  const handleOpenDeleteConfirmation = (id) => {
    setOpenDeleteConfirmation(true);
    setDeleteRoleId(id);
  };

  const handleCloseDeleteConfirmation = () => {
    setOpenDeleteConfirmation(false);
    setDeleteRoleId('');
  };

  const handleDeleteRole = () => {
    deleteRole(deleteRoleId);
    handleCloseDeleteConfirmation();
  };

  // Bulk deletion handlers
  const handleOpenBulkDeleteConfirmation = () => {
    setOpenBulkDeleteConfirmation(true);
  };

  const handleCloseBulkDeleteConfirmation = () => {
    setOpenBulkDeleteConfirmation(false);
  };

  const handleDeleteMultipleRoles = async () => {
    try {
      for (const id of selectedRoleIds) {
        await axios.delete(`${process.env.REACT_APP_SERVER_HOST}/api/role/${id}`);
      }
      setRoles((prev) => prev.filter((r) => !selectedRoleIds.includes(r._id)));
      setSelectedRoleIds([]);
      alertRef.current.displayAlert('success', t('deleteSuccess'));
    } catch (error) {
      console.error('Error deleting roles:', error);
      alertRef.current.displayAlert('error', t('deleteFail'));
    } finally {
      setOpenBulkDeleteConfirmation(false);
    }
  };

  return (
    <>
      <CssBaseline />

      <Paper variant="outlined" sx={{ p: 2 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle2" gutterBottom>
            {t('roleManagement')}
          </Typography>
          <Stack direction="row" spacing={2} mb={2}>
            <Button
              variant="contained"
              color="error"
              size="small"
              startIcon={<DeleteIcon />}
              onClick={handleOpenBulkDeleteConfirmation}
              disabled={selectedRoleIds.length === 0}
            >
              {t('deleteSelected')}
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={handleOpenDialog}
            >
              {t('create')}
            </Button>
          </Stack>
        </div>

        <CDataGrid
          displayCheckbox={true}
          displayToolbar={true}
          columns={columns}
          rows={rows}
          onSelectionChange={(ids) => setSelectedRoleIds(ids)} // Capture selected row IDs
        />
      </Paper>

      {/* Dialog for creating/editing role */}
      <Dialog
        open={openDialog}
        aria-labelledby="role-dialog-title"
        onClose={handleCloseDialog}
      >
        <DialogTitle id="role-dialog-title">
          <Typography variant="subtitle2">
            {dialogMode === 'create' ? t('createRole') : t('editRole')}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t('roleName')}
            type="text"
            size="small"
            required
            fullWidth
            value={selectedRole.name}
            onChange={(e) =>
              setSelectedRole({ ...selectedRole, name: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label={t('description')}
            type="text"
            size="small"
            fullWidth
            value={selectedRole.description}
            onChange={(e) =>
              setSelectedRole({ ...selectedRole, description: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={handleCloseDialog}>
            {t('cancel')}
          </Button>
          <Button variant="contained" onClick={handleSaveRole}>
            {t('save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for delete confirmation */}
      <Dialog
        open={openDeleteConfirmation}
        onClose={handleCloseDeleteConfirmation}
        aria-labelledby="delete-confirmation-dialog-title"
      >
        <DialogTitle id="delete-confirmation-dialog-title">
          {t('deleteRole')}
        </DialogTitle>
        <DialogContent>
          <Typography variant="subtitle2">{t('confirmDeleteRole')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirmation}>{t('cancel')}</Button>
          <Button onClick={handleDeleteRole}>{t('delete')}</Button>
        </DialogActions>
      </Dialog>

      {/* Bulk delete confirmation dialog */}
      <Dialog
        open={openBulkDeleteConfirmation}
        onClose={handleCloseBulkDeleteConfirmation}
        aria-labelledby="bulk-delete-confirmation-dialog-title"
      >
        <DialogTitle id="bulk-delete-confirmation-dialog-title">
          {t('deleteSelected')}
        </DialogTitle>
        <DialogContent>
          <Typography variant="subtitle2">{t('deleteSelectedConfirm')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBulkDeleteConfirmation}>{t('cancel')}</Button>
          <Button onClick={handleDeleteMultipleRoles} color="error">
            {t('delete')}
          </Button>
        </DialogActions>
      </Dialog>

      <CAlert ref={alertRef} />
    </>
  );
};

export default RoleManagement;