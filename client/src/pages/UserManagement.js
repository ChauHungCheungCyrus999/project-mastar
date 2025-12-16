import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Paper } from '@mui/material';
import { Home, PeopleAltOutlined } from '@mui/icons-material';

import MainContent from '../components/MainContent';
import FullFeaturedCrudGrid from '../components/custom/FullFeaturedCrudGrid';

import { useTranslation } from 'react-i18next';


// Import axios for making HTTP requests
import axios from 'axios';

const UserManagement = () => {
  const navigate = useNavigate();

  const { t } = useTranslation();

  const breadcrumbItems = [
    { label: 'home', href: '/', icon: <Home sx={{ mr: 0.5 }} fontSize="inherit" /> },
    { label: 'userManagement', icon: <PeopleAltOutlined sx={{ mr: 0.5 }} fontSize="inherit" /> },
  ];

  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const defaultPageSize = 10;

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
        { field: 'firstName', headerName: t('firstName'), type: "string", width: 150, editable: true },
        { field: 'lastName', headerName: t('lastName'), type: "string", width: 150, editable: true },
        { field: 'gender', headerName: t('gender'), type: "singleSelect", valueOptions: ['Male', 'Female'], width: 120, editable: true },
        { field: 'email', headerName: t('email'), type: "string", width: 200, editable: true },
        { field: 'phone', headerName: t('phone'), type: "string", width: 150, editable: true },
        { field: 'organization', headerName: t('organization'), type: "string", width: 200, editable: true },
        { field: 'department', headerName: t('department'), type: "string", width: 150, editable: true },
        { field: 'jobTitle', headerName: t('jobTitle'), type: "string", width: 150, editable: true },
        { field: 'username', headerName: t('username'), width: 150 },
        { field: 'password', headerName: t('password'), width: 150 },
        { field: 'createdDate', headerName: t('createdDate'), type: "dateTime", width: 200 },
        { field: 'updatedDate', headerName: t('updatedDate'), type: "dateTime", width: 200 },
        { field: 'active', headerName: t('active'), type: "boolean", width: 120, editable: true },
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
      const response = await axios.put(`${process.env.REACT_APP_SERVER_HOST}/api/user/${updatedRow._id}`, updatedRow);
      const updatedUser = response.data;
      // Process the updated user data and update the rows state
      console.log('Updated user:', updatedUser);
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const onDeleteRow = async (deletedRow) => {
    try {
      await axios.delete(`${process.env.REACT_APP_SERVER_HOST}/api/user/${deletedRow._id}`);
      // Remove the deleted row from the rows state
      console.log('Deleted user:', deletedRow);
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
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
          createRowData={createRowData}
          noActionColumn={noActionColumn}
          onProcessRowUpdateError={onProcessRowUpdateError}
        />
      </Paper>
    </MainContent>
  );
};

export default UserManagement;