import React, { useEffect, useState, useRef } from 'react';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';
import {
  MenuItem, Select, InputLabel, Typography, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Switch, Button
} from '@mui/material';

import { initRoles } from "../../components/init/InitRoles";
import { initPermissions } from "../../components/init/InitPermissions";

import { useTranslation } from 'react-i18next';

import CAlert from '../custom/CAlert';

const GrantPermissions = () => {
  const theme = useTheme();

  const { t } = useTranslation();

  const [roles, setRoles] = useState([]/*initRoles*/);
  const [permissions, setPermissions] = useState([]/*initPermissions*/);
  const [selectedRole, setSelectedRole] = useState(null);
  const [rolePermissions, setRolePermissions] = useState([]);

  // Alert
  const alertRef = useRef();

  // Read Roles
  useEffect(() => {
    // Fetch roles from API
    axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/roles`)
      .then(response => {
        setRoles(response.data);
      })
      .catch(error => {
        console.error('Error fetching roles:', error);
      });

    // Fetch permissions from API
    axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/permissions`)
      .then(response => {
        setPermissions(response.data);
      })
      .catch(error => {
        console.error('Error fetching permissions:', error);
      });
  }, []);

  // Read Permissions
  useEffect(() => {
    if (selectedRole) {
      // Fetch role permissions from API
      axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/role/${selectedRole}/permissions`)
        .then(response => {
          const permissionsData = response.data;
          const selectedPermissions = permissionsData.map(permission => permission._id);
          setRolePermissions(selectedPermissions);
        })
        .catch(error => {
          console.error('Error fetching role permissions:', error);
        });
    }
  }, [selectedRole]);

  const handleRoleChange = (event) => {
    setSelectedRole(event.target.value);
  };

  const handlePermissionChange = (permissionId, value) => {
    setRolePermissions(prevState => {
      const updatedPermissions = [...prevState];
      const permissionIndex = updatedPermissions.indexOf(permissionId);
  
      if (value && permissionIndex === -1) {
        // Add permission ID to the array
        updatedPermissions.push(permissionId);
      } else if (!value && permissionIndex !== -1) {
        // Remove permission ID from the array
        updatedPermissions.splice(permissionIndex, 1);
      }
  
      return updatedPermissions;
    });
  };


  // Grant Permissions to Role
  const handleSavePermissions = () => {
    if (selectedRole) {
      const roleId = selectedRole;
      const updatedPermissions = rolePermissions;

      axios.put(`${process.env.REACT_APP_SERVER_HOST}/api/role/${roleId}/permissions`, { permissions: updatedPermissions })
        .then(response => {
          console.log('Permissions updated successfully:', response.data);
          alertRef.current.displayAlert('success', t('saveSuccess'));
        })
        .catch(error => {
          console.error('Error updating permissions:', error);
          alertRef.current.displayAlert('error', t('saveFail'));
        });
    }
  };
  
  useEffect(() => {
    console.log('rolePermissions:', JSON.stringify(rolePermissions));
  }, [rolePermissions]);

  
  return (
    <div>
      {/*<Typography variant="h5" gutterBottom>
        {t('grantPermissions')}
      </Typography>*/}

      <Paper variant="outlined" sx={{ p: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <InputLabel htmlFor="role-select">{t('role')}</InputLabel>
          <Select
            id="role-select"
            size="small"
            displayEmpty
            value={selectedRole}
            onChange={handleRoleChange}
            style={{ minWidth: "300px", marginLeft: '1rem' }}
          >
            {roles.map(role => (
              <MenuItem key={role._id} value={role._id}>{role.name}</MenuItem>
            ))}
          </Select>
          <div style={{ flex: 1 }} />
          {selectedRole && (
            <Button variant="contained" color="primary" onClick={handleSavePermissions}>
              {t('save')}
            </Button>
          )}
        </div>

        {selectedRole && (
          <TableContainer style={{ height: '69.5vh', marginTop: '1rem' }}>
            <Table
              size="small"
              stickyHeader
              sx={{
                "& .MuiTableRow-root:hover": {
                  backgroundColor: theme.palette.action.hover
                }
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell style={{ fontWeight:'bold' }}>{t('permission')}</TableCell>
                  <TableCell style={{ fontWeight:'bold' }}>{t('description')}</TableCell>
                  <TableCell style={{ fontWeight:'bold' }}>{t('grant')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {permissions.map(permission => (
                  <TableRow key={permission._id}>
                    <TableCell component="th" scope="row">{permission.name}</TableCell>
                    <TableCell component="th" scope="row">{permission.description}</TableCell>
                    <TableCell>
                      <Switch
                        checked={rolePermissions.includes(permission._id)}
                        onChange={(event) => handlePermissionChange(permission._id, event.target.checked)}
                        size="small"
                        color="primary"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <CAlert ref={alertRef} />
    </div>
  );
};

export default GrantPermissions;