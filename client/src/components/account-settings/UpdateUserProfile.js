import React, { useContext, useState, useRef } from 'react';
import {
  CssBaseline,
  Container, Grid, Button, Box,
  Typography, TextField, Radio, RadioGroup,
  FormControl, FormLabel, FormControlLabel,
  Snackbar, Alert
} from '@mui/material';
import axios from 'axios';

import CAlert from '../custom/CAlert';

import UserContext from '../../UserContext';

import { useTranslation } from 'react-i18next';

const UpdateUserProfile = () => {
  const { user, setUser } = useContext(UserContext);
  const { t } = useTranslation();

  // Alert
  const alertRef = useRef();

  // Validation
  const validateEmail = (email) => {
    // Email format regex pattern
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };


  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [gender, setGender] = useState(user.gender);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [organization, setOrganization] = useState(user.organization);
  const [department, setDepartment] = useState(user.department);
  const [jobTitle, setJobTitle] = useState(user.jobTitle);
  const [createdDate, setCreatedDate] = useState(user.createdDate);

  const handleSubmit = async (e) => {
    e.preventDefault();

    /*if (firstName==="" || lastName==="" || gender==="" || email==="" || phone==="" || organization==="" || department==="" || jobTitle==="") {
      setAlertSeverity("error");
      setAlertMsg(t('This field should not be empty!'));
      setShowAlert(true);
      return;
    }*/

    if (!validateEmail(email)) {
      alertRef.current.displayAlert('error', t('invalidEmailFormat'));
      return;
    }
  
    const userData = {
      firstName,
      lastName,
      gender,
      email,
      phone,
      organization,
      department,
      jobTitle,
      createdDate,
      updatedDate: new Date()
    };

    console.log(userData);
  
    try {
      const response = await axios.put(`${process.env.REACT_APP_SERVER_HOST}/api/user/${user._id}/update`, userData);
      if (response.status === 200) {
        console.log('User information updated successfully!');
        // Update the user context with the updated user data
        setUser(response.data);
        alertRef.current.displayAlert('success', t('userInfoUpdateSuccess'));
      } else {
        console.error('Failed to update user information.');
        alertRef.current.displayAlert('error', t('userInfoUpdateFail'));
      }
    } catch (error) {
      console.error('An error occurred while updating user information:', error);
      alertRef.current.displayAlert('error', t('userInfoUpdateFail'));
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
        <Typography component="h1" variant="h5">{t('updateUserProfile')}</Typography>

        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label={t('firstName')}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                fullWidth
                required
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label={t('lastName')}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                fullWidth
                required
                size="small"
              />
            </Grid>
            <Grid item container alignItems="center">
              <Grid item xs={4}>
                <FormLabel component="legend">{t('gender')}</FormLabel>
              </Grid>
              <Grid item xs={8} container justifyContent="flex-end">
                <RadioGroup
                  name="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  row
                >
                  <FormControlLabel
                    value="Male"
                    control={<Radio />}
                    label={t('male')}
                  />
                  <FormControlLabel
                    value="Female"
                    control={<Radio />}
                    label={t('female')}
                  />
                </RadioGroup>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label={t('email')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                fullWidth
                required
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label={t('phone')}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                fullWidth
                required
                size="small"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label={t('organization')}
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                fullWidth
                required
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label={t('department')}
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                fullWidth
                required
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label={t('jobTitle')}
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                fullWidth
                required
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
            {t('update')}
          </Button>
        </Box>
      </Box>

      <CAlert ref={alertRef} />
    </Container>
  );
};

export default UpdateUserProfile;