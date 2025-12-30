import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Paper, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid } from '@mui/material';
import { Home, PeopleAltOutlined } from '@mui/icons-material';

import MainContent from '../components/MainContent';
import FullFeaturedCrudGrid from '../components/custom/FullFeaturedCrudGrid';
import CAlert from '../components/custom/CAlert';

import { useTranslation } from 'react-i18next';


// Import axios for making HTTP requests
import axios from 'axios';

const UserManagement = () => {
  const navigate = useNavigate();

  const { t } = useTranslation();

  // Alert
  const alertRef = useRef();

  const breadcrumbItems = [
    { label: 'home', href: '/', icon: <Home sx={{ mr: 0.5 }} fontSize="inherit" /> },
    { label: 'userManagement', icon: <PeopleAltOutlined sx={{ mr: 0.5 }} fontSize="inherit" /> },
  ];

  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const defaultPageSize = 10;
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({});
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/users`);
      const users = response.data;
      // Process the received users data and set the columns and rows state accordingly
      const columns = [
        { field: 'id', headerName: t('userId'), type: "string", width: 150, editable: false },
        { field: 'firstName', headerName: t('firstName'), type: "string", width: 150, editable: false },
        { field: 'lastName', headerName: t('lastName'), type: "string", width: 150, editable: false },
        { field: 'gender', headerName: t('gender'), type: "singleSelect", valueOptions: ['Male', 'Female'], width: 120, editable: false },
        { field: 'email', headerName: t('email'), type: "string", width: 200, editable: false },
        { field: 'phone', headerName: t('phone'), type: "string", width: 150, editable: false },
        { field: 'organization', headerName: t('organization'), type: "string", width: 200, editable: false },
        { field: 'department', headerName: t('department'), type: "string", width: 150, editable: false },
        { field: 'jobTitle', headerName: t('jobTitle'), type: "string", width: 150, editable: false },
        { field: 'username', headerName: t('username'), width: 150, editable: false },
        { field: 'password', headerName: t('password'), width: 150, editable: false },
        { field: 'createdDate', headerName: t('createdDate'), type: "dateTime", width: 200, editable: false },
        { field: 'updatedDate', headerName: t('updatedDate'), type: "dateTime", width: 200, editable: false },
        { field: 'active', headerName: t('active'), type: "boolean", width: 120, editable: false },
      ];
      
      const rows = users.map((user) => ({
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        gender: user.gender,
        email: user.email,
        phone: user.phone,
        organization: user.organization,
        department: user.department,
        jobTitle: user.jobTitle,
        username: user.username,
        password: user.password,
        createdDate: new Date(user.createdDate),
        updatedDate: new Date(user.updatedDate),
        active: user.active,
      }));

      setColumns(columns);
      setRows(rows);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const onSaveRow = async (updatedRow) => {
    console.log("updatedRow = " + JSON.stringify(updatedRow));
    try {
      const response = await axios.put(`${process.env.REACT_APP_SERVER_HOST}/api/user/${updatedRow._id}/update`, updatedRow);
      const updatedUser = response.data;
      // Process the updated user data and update the rows state
      console.log('Updated user:', updatedUser);
    } catch (error) {
      console.error('Failed to update user:', error);      const errorMessage = error.response?.data?.message || error.response?.data || error.message || 'Unknown error';
      alertRef.current.displayAlert('error', `Failed to update user: ${errorMessage}`);    }
  };

  const onDeleteRow = async (id, row, rows) => {
    setUserToDelete(row);
    setDeleteDialogOpen(true);
  };

  const onAddClick = () => {
    setNewUser({});
    setAddDialogOpen(true);
  };

  const onEditClick = (id) => {
    const user = rows.find(r => r.id === id);
    setUserToEdit({ ...user, password: '' });
    setEditDialogOpen(true);
  };

  const handleConfirmDeactivate = async () => {
    if (!userToDelete) return;
    try {
      await axios.put(`${process.env.REACT_APP_SERVER_HOST}/api/user/${userToDelete.id}/update`, { active: false });
      setRows(rows.map(r => r.id === userToDelete.id ? { ...r, active: false } : r));
      alertRef.current.displayAlert('success', 'User deactivated successfully');
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (error) {
      console.error('Failed to deactivate user:', error);
      const errorMessage = error.response?.data?.message || error.response?.data || error.message || 'Unknown error';
      alertRef.current.displayAlert('error', `Failed to deactivate user: ${errorMessage}`);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const handleAddUser = async () => {
    const userToCreate = {
      ...newUser,
      createdDate: new Date(),
      updatedDate: new Date(),
    };
    try {
      const response = await axios.post(`${process.env.REACT_APP_SERVER_HOST}/api/users`, userToCreate);
      const newUserData = response.data;
      const newRow = {
        id: newUserData._id,
        firstName: newUserData.firstName,
        lastName: newUserData.lastName,
        gender: newUserData.gender,
        email: newUserData.email,
        phone: newUserData.phone,
        organization: newUserData.organization,
        department: newUserData.department,
        jobTitle: newUserData.jobTitle,
        username: newUserData.username,
        password: newUserData.password,
        createdDate: new Date(newUserData.createdDate),
        updatedDate: new Date(newUserData.updatedDate),
        active: newUserData.active,
      };
      setRows([...rows, newRow]);
      alertRef.current.displayAlert('success', 'User added successfully');
      setAddDialogOpen(false);
      setNewUser({});
    } catch (error) {
      console.error('Failed to add user:', error);
      const errorMessage = error.response?.data?.message || error.response?.data || error.message || 'Unknown error';
      alertRef.current.displayAlert('error', `Failed to add user: ${errorMessage}`);
    }
  };

  const handleCancelAdd = () => {
    setAddDialogOpen(false);
    setNewUser({});
  };

  const handleEditUser = async () => {
    const updateData = { ...userToEdit };
    if (!updateData.password || updateData.password.trim() === '') {
      delete updateData.password;
    }
    try {
      const response = await axios.put(`${process.env.REACT_APP_SERVER_HOST}/api/user/${userToEdit.id}/update`, updateData);
      const updatedUser = response.data;
      setRows(rows.map(r => r.id === userToEdit.id ? {
        ...r,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        gender: updatedUser.gender,
        email: updatedUser.email,
        phone: updatedUser.phone,
        organization: updatedUser.organization,
        department: updatedUser.department,
        jobTitle: updatedUser.jobTitle,
        username: updatedUser.username,
        password: updatedUser.password,
        createdDate: new Date(updatedUser.createdDate),
        updatedDate: new Date(updatedUser.updatedDate),
        active: updatedUser.active,
      } : r));
      alertRef.current.displayAlert('success', 'User updated successfully');
      setEditDialogOpen(false);
      setUserToEdit({});
    } catch (error) {
      console.error('Failed to update user:', error);
      const errorMessage = error.response?.data?.message || error.response?.data || error.message || 'Unknown error';
      alertRef.current.displayAlert('error', `Failed to update user: ${errorMessage}`);
    }
  };

  const handleCancelEdit = () => {
    setEditDialogOpen(false);
    setUserToEdit({});
  };

  const createRowData = () => {
    // Implement the logic to create a new row object
    return {};
  };

  const noActionColumn = false;

  const onProcessRowUpdateError = (error) => {
    // Handle the error occurred during row update
    console.error('Row update error:', error);
  };

  return (
    <MainContent pageTitle="userManagement" breadcrumbItems={breadcrumbItems}>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <FullFeaturedCrudGrid
          columns={columns}
          rows={rows}
          defaultPageSize={defaultPageSize}
          onSaveRow={onSaveRow}
          onDeleteRow={onDeleteRow}
          onAddClick={onAddClick}
          onEditClick={onEditClick}
          createRowData={createRowData}
          noActionColumn={noActionColumn}
          onProcessRowUpdateError={onProcessRowUpdateError}
        />
      </Paper>
      <Dialog open={deleteDialogOpen} onClose={handleCancelDelete} sx={{ '& .MuiDialog-paper': { minWidth: '400px' } }}>
        <DialogTitle>Deactivate User</DialogTitle>
        <DialogContent>
          Are you sure you want to deactivate the user "{userToDelete?.username}"?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>{t('cancel')}</Button>
          <Button onClick={handleConfirmDeactivate} color="error" variant="contained">Deactivate</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={addDialogOpen} onClose={handleCancelAdd} sx={{ '& .MuiDialog-paper': { minWidth: '600px' } }}>
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="First Name"
                value={newUser.firstName || ''}
                onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={newUser.lastName || ''}
                onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                select
                label="Gender"
                value={newUser.gender || ''}
                onChange={(e) => setNewUser({ ...newUser, gender: e.target.value })}
                SelectProps={{ native: true }}
              >
                <option value=""></option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Email"
                value={newUser.email || ''}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Phone"
                value={newUser.phone || ''}
                onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Organization"
                value={newUser.organization || ''}
                onChange={(e) => setNewUser({ ...newUser, organization: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Department"
                value={newUser.department || ''}
                onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Job Title"
                value={newUser.jobTitle || ''}
                onChange={(e) => setNewUser({ ...newUser, jobTitle: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Username"
                value={newUser.username || ''}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="password"
                label="Password"
                value={newUser.password || ''}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                select
                label="Active"
                value={newUser.active || false}
                onChange={(e) => setNewUser({ ...newUser, active: e.target.value === 'true' })}
                SelectProps={{ native: true }}
              >
                <option value={true}>Yes</option>
                <option value={false}>No</option>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelAdd}>{t('cancel')}</Button>
          <Button onClick={handleAddUser} color="primary" variant="contained">{t('add')}</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={editDialogOpen} onClose={handleCancelEdit} sx={{ '& .MuiDialog-paper': { minWidth: '600px' } }}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="First Name"
                value={userToEdit.firstName || ''}
                onChange={(e) => setUserToEdit({ ...userToEdit, firstName: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={userToEdit.lastName || ''}
                onChange={(e) => setUserToEdit({ ...userToEdit, lastName: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                select
                label="Gender"
                value={userToEdit.gender || ''}
                onChange={(e) => setUserToEdit({ ...userToEdit, gender: e.target.value })}
                SelectProps={{ native: true }}
              >
                <option value=""></option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Email"
                value={userToEdit.email || ''}
                onChange={(e) => setUserToEdit({ ...userToEdit, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Phone"
                value={userToEdit.phone || ''}
                onChange={(e) => setUserToEdit({ ...userToEdit, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Organization"
                value={userToEdit.organization || ''}
                onChange={(e) => setUserToEdit({ ...userToEdit, organization: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Department"
                value={userToEdit.department || ''}
                onChange={(e) => setUserToEdit({ ...userToEdit, department: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Job Title"
                value={userToEdit.jobTitle || ''}
                onChange={(e) => setUserToEdit({ ...userToEdit, jobTitle: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Username"
                value={userToEdit.username || ''}
                onChange={(e) => setUserToEdit({ ...userToEdit, username: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="password"
                label="Password"
                value={userToEdit.password || ''}
                onChange={(e) => setUserToEdit({ ...userToEdit, password: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                select
                label="Active"
                value={userToEdit.active || false}
                onChange={(e) => setUserToEdit({ ...userToEdit, active: e.target.value === 'true' })}
                SelectProps={{ native: true }}
              >
                <option value={true}>Yes</option>
                <option value={false}>No</option>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelEdit}>{t('cancel')}</Button>
          <Button onClick={handleEditUser} color="primary" variant="contained">{t('save')}</Button>
        </DialogActions>
      </Dialog>
      <CAlert ref={alertRef} />
    </MainContent>
  );
};

export default UserManagement;