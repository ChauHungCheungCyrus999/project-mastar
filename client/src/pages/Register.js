import React, { useState, useEffect, useRef } from "react";
import {
  Avatar, Button, Typography,TextField, Checkbox,
  CssBaseline,
  FormControlLabel,
  Link,
  Container, Grid, Box,
  Snackbar, Alert,
  FormControl, FormLabel, InputLabel, Select, MenuItem, RadioGroup, Radio
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import styles from './LandingPage.module.css';

import Logo from '../components/Logo';
import LanguageSwitcher from '../components/LanguageSwitcher';
import Footer from '../components/Footer';
import TriangleGrid from '../components/shapes/TriangleGrid';

import CAlert from '../components/custom/CAlert';

import { useTranslation } from 'react-i18next';

const defaultTheme = createTheme();

function Register() {
  const { t } = useTranslation();

  const navigate = useNavigate();

  // Alert
  const alertRef = useRef();

  const [agreeToTerms, setAgreeToTerms] = useState(false);

  // Update page title
  useEffect(() => {
    document.title = t('appName') + ' - ' + t('signUp'); // Set the new page title
    return () => {
      document.title = t('appName') + ' - ' + t('signUp'); // Reset the page title when the component unmounts
    };
  }, []);

  useEffect(() => {
    document.body.classList.add(styles['landing-page-body']);
  }, []);

  const [state, setState] = useState({
    firstName: "",
    lastName: "",

    gender: "",
    email: "",
    phone: "",

    organization: "",
    department: "",
    jobTitle: "",
    //role: "",

    username: "",
    password: "",
    confirm_password: ""
  });

  const [gender, setGender] = useState('');
  //const [selectedRole, setSelectedRole] = useState('');

  const handleGenderChange = (event) => {
    setGender(event.target.value);
  };

  /*const handleRoleChange = (event) => {
    setSelectedRole(event.target.value);
    setState({ ...state, role: event.target.value });
  };*/
  
  const onChange = (e) =>
    setState({ ...state, [e.target.name]: e.target.value });

  const handleSubmit = (event) => {
    event.preventDefault();

    if (state.firstName === "") {
      alertRef.current.displayAlert('error', t('firstNameRequired'));
      return;
    }
    
    if (state.lastName === "") {
      alertRef.current.displayAlert('error', t('lastNameRequired'));
      return;
    }
    
    if (gender === "") {
      alertRef.current.displayAlert('error', t('genderRequired'));
      return;
    }
    
    if (state.email === "") {
      alertRef.current.displayAlert('error', t('emailRequired'));
      return;
    }
    if (!validateEmail(state.email)) {
      alertRef.current.displayAlert('error', t('invalidEmailFormat'));
      return;
    }
    
    /*if (state.phone === "") {
      alertRef.current.displayAlert('error', t('phoneRequired'));
      return;
    }
    
    if (state.organization === "") {
      alertRef.current.displayAlert('error', t('organizationRequired'));
      return;
    }
    
    if (state.department === "") {
      alertRef.current.displayAlert('error', t('departmentRequired'));
      return;
    }
    
    if (state.jobTitle === "") {
      alertRef.current.displayAlert('error', t('jobTitleRequired'));
      return;
    }*/

    if (state.username === "") {
      alertRef.current.displayAlert('error', t('usernameRequired'));
      return;
    }
    if (state.username.length <= 4) {
      alertRef.current.displayAlert('error', t('usernameMoreThan4Char'));
      return;
    }

    if (!validatePassword(state.password)) {
      alertRef.current.displayAlert('error', t('passwordRequirements'));
      return;
    }

    if (state.password !== state.confirm_password) {
      alertRef.current.displayAlert('error', t('passwordNotMatch'));
      return;
    }

    if (!agreeToTerms) {
      alertRef.current.displayAlert('error', t('mustAgreeToTerms'));
      return;
    }

    let newUser = {
      firstName: state.firstName,
      lastName: state.lastName,

      gender: gender,
      email: state.email,
      phone: state.phone,

      organization: state.organization,
      department: state.department,
      jobTitle: state.jobTitle,
      //role: state.role,

      username: state.username,
      password: state.password,
      createdDate: new Date(),
      updatedDate: new Date(),
      active: true
    };
    //console.log("newUser = " + JSON.stringify(newUser));

    axios
      .post(`${process.env.REACT_APP_SERVER_HOST}/register`, newUser)
      .then((res) => {
        alertRef.current.displayAlert('success', res.data.title);
        navigate("/login");
      })
      .catch((err) => {
        alertRef.current.displayAlert('error', JSON.stringify(err.response.data.errorMessage));
      });
  };


  // Validation
  const validateEmail = (email) => {
    // Email format regex pattern
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const validatePassword = (password) => {
    // Password format regex pattern
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,32}$/;
    return passwordPattern.test(password);
  };
  

  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />

      <Grid container component="main" sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        //backgroundImage: 'url(/landing/login-bg.jpg)',
        //backgroundImage: 'url(https://source.unsplash.com/random?wallpapers)',
        //backgroundRepeat: 'no-repeat',
        //backgroundColor: (t) =>
        //  t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
        //backgroundSize: 'cover',
        //backgroundPosition: 'center',
      }}>
        <Container component="main" maxWidth="xs">
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '20px',
            borderRadius: '10px',
            backgroundColor: 'rgba(245, 245, 245, 0.8)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
          }}>
            <Logo theme="dark" />

            <LanguageSwitcher />

            {/*<Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
              <LockOutlinedIcon />
            </Avatar>*/}

            <Container sx={{ mt: '1rem', mb: '3rem' }}>
              <TriangleGrid />
            </Container>

            <Typography component="h1" variant="h5">
              {t('signUp')}
            </Typography>

            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    autoComplete="given-name"
                    name="firstName"
                    required
                    fullWidth
                    id="firstName"
                    label={t('firstName')}
                    autoFocus
                    value={state.firstName}
                    onChange={onChange}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    id="lastName"
                    label={t('lastName')}
                    name="lastName"
                    autoComplete="family-name"
                    value={state.lastName}
                    onChange={onChange}
                    size="small"
                  />
                </Grid>
                <Grid item container alignItems="center">
                  <Grid item xs={4}>
                    <FormLabel component="legend">{t('gender')}</FormLabel>
                  </Grid>
                  <RadioGroup row name="gender" value={gender} onChange={handleGenderChange}>
                    <FormControlLabel value="Male" control={<Radio />} label={t('male')} />
                    <FormControlLabel value="Female" control={<Radio />} label={t('female')} />
                  </RadioGroup>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="email"
                    label={t('email')}
                    name="email"
                    autoComplete="email"
                    value={state.email}
                    onChange={onChange}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    //required
                    fullWidth
                    id="phone"
                    label={t('phone')}
                    name="phone"
                    autoComplete="tel"
                    value={state.phone}
                    onChange={onChange}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    //required
                    fullWidth
                    id="organization"
                    label={t('organization')}
                    name="organization"
                    autoComplete="off"
                    value={state.organization}
                    onChange={onChange}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    //required
                    fullWidth
                    id="department"
                    label={t('department')}
                    name="department"
                    autoComplete="off"
                    value={state.department}
                    onChange={onChange}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    //required
                    fullWidth
                    id="jobTitle"
                    label={t('jobTitle')}
                    name="jobTitle"
                    autoComplete="off"
                    value={state.jobTitle}
                    onChange={onChange}
                    size="small"
                  />
                </Grid>
                {/*<Grid item xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel id="user-role-label">{t('role')}</InputLabel>
                    <Select
                      //labelId="user-role-label"
                      id="user-role"
                      name="role"
                      value={selectedRole}
                      onChange={handleRoleChange}
                      size="small"
                    >
                      <MenuItem value="Project Manager">{t('projectManager')}</MenuItem>
                      <MenuItem value="Team Member">{t('teamMember')}</MenuItem>
                      <MenuItem value="Stakeholder">{t('stakeholder')}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>*/}
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="username"
                    label={t('username')}
                    name="username"
                    autoComplete="off"
                    value={state.username}
                    onChange={onChange}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    name="password"
                    label={t('password')}
                    type="password"
                    id="password"
                    autoComplete="new-password"
                    value={state.password}
                    onChange={onChange}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    name="confirm_password"
                    label={t('confirmPassword')}
                    type="password"
                    id="confirm_password"
                    autoComplete="off"
                    value={state.confirm_password}
                    onChange={onChange}
                    size="small"
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={agreeToTerms}
                        onChange={(e) => setAgreeToTerms(e.target.checked)}
                        color="primary"
                      />
                    }
                    label={
                      <Typography variant="body2">
                        {t('agreeToTerms')} <Link href="/terms-of-service" target="_blank">{t('termsOfService')}</Link> {t('and')} <Link href="/privacy-policy" target="_blank">{t('privacyPolicy')}</Link>{t('fullStop')}
                      </Typography>
                    }
                  />
                </Grid>

                {/*<Grid item xs={12}>
                  <FormControlLabel
                    control={<Checkbox value="allowExtraEmails" color="primary" />}
                    label="I want to receive inspiration, marketing promotions and updates via email."
                  />
                </Grid>*/}
              </Grid>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                size="small"
              >
                {t('signUp')}
              </Button>
              <Grid container justifyContent="flex-end">
                <Grid item>
                  <Link href="/login" variant="body2">
                    {t('alreadyHaveAccount')}
                  </Link>
                </Grid>
              </Grid>
            </Box>
          </Box>
          <Footer />
        </Container>
        <CAlert ref={alertRef} />
      </Grid>
    </ThemeProvider>
  );
}

export default Register;