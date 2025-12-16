import React, { useContext, useState, useRef } from 'react';
import {
  CssBaseline,
  Container, Grid, Box,
  Typography, TextField, Button,
} from '@mui/material';
import axios from 'axios';

import CAlert from '../custom/CAlert';

import UserContext from '../../UserContext';

import { useTranslation } from 'react-i18next';

const Security = () => {
  const { user, setUser } = useContext(UserContext);

  // Alert
  const alertRef = useRef();

  const { t } = useTranslation();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleCurrentPasswordChange = (event) => {
    setCurrentPassword(event.target.value);
  };

  const handleNewPasswordChange = (event) => {
    setNewPassword(event.target.value);
  };

  const validatePassword = (password) => {
    // Password format regex pattern
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,32}$/;
    return passwordPattern.test(password);
  };

  const handleConfirmPasswordChange = (event) => {
    setConfirmPassword(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    if (newPassword !== confirmPassword) {
      setError(t('passwordNotMatch'));
      return;
    } else {
      setError('');
    }

    if (!validatePassword(newPassword)) {
      setError(t('passwordRequirements'));
      return;
    } else {
      setError('');
    }

    try {
      const response = await axios.put(`${process.env.REACT_APP_SERVER_HOST}/api/user/${user._id}/change-password`, {
        currentPassword,
        newPassword,
      });
  
      if (response.status === 200) {
        console.log('Password updated successfully:', response.data);
  
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setError('');
  
        alertRef.current.displayAlert('success', t('passwordUpdateSuccess'));
      } 
      /*else if (response.status === 401) {
        console.error('Invalid current password');
        alertRef.current.displayAlert('error', t('invalidCurrentPassword'));
      }*/
      else {
        console.error('Failed to update password');
        alertRef.current.displayAlert('error', t('passwordUpdateFailed'));
      }
    }
    catch (error) {
      console.error('An error occurred while updating password:', error);
      alertRef.current.displayAlert('error', t('passwordUpdateFailed'));
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />

      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px',
      }}>
        <Typography component="h1" variant="h5">{t('changePassword')}</Typography>

        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                type="password"
                label={t('currentPassword')}
                value={currentPassword}
                onChange={handleCurrentPasswordChange}
                required
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                type="password"
                label={t('newPassword')}
                value={newPassword}
                onChange={handleNewPasswordChange}
                required
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                type="password"
                label={t('confirmPassword')}
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                required
                fullWidth
                error={error !== ''}
                helperText={error}
                size="small"
              />
            </Grid>
          </Grid>
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="small"
            sx={{ mt: 3, mb: 2 }}
          >
            {t('changePassword')}
          </Button>
        </Box>
      </Box>

      <CAlert ref={alertRef} />
    </Container>
  );
};

export default Security;