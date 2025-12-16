import React, { useState, useEffect, useRef } from "react";
import { TextField, InputAdornment, IconButton, Button, Link, Grid, Checkbox } from "@mui/material";
import CssBaseline from '@mui/material/CssBaseline';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import FormControlLabel from '@mui/material/FormControlLabel';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Avatar from '@mui/material/Avatar';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Visibility, VisibilityOff } from "@mui/icons-material";

import { useContext } from 'react';
import UserContext from '../UserContext';

import styles from './LandingPage.module.css';

import Logo from '../components/Logo';
import TriangleGrid from '../components/shapes/TriangleGrid';
import LanguageSwitcher from '../components/LanguageSwitcher';
import Footer from '../components/Footer';

import CAlert from '../components/custom/CAlert';

import { useTranslation } from 'react-i18next';

const defaultTheme = createTheme();

export default function Login() {
  const { setUser } = useContext(UserContext);

  const { t } = useTranslation();

  const navigate = useNavigate();

  // Alert
  const alertRef = useRef();

  // Update page title
  useEffect(() => {
    document.title = t('appName') + ' - ' + t('signIn'); // Set the new page title
    return () => {
      document.title = t('appName') + ' - ' + t('signIn'); // Reset the page title when the component unmounts
    };
  }, []);

  useEffect(() => {
    document.body.classList.add(styles['landing-page-body']);
  }, []);

  const [state, setState] = useState({
    username: '',
    password: ''
  });

  const [rememberMe, setRememberMe] = useState(false);

  const onChange = (e) => setState({ ...state, [e.target.name]: e.target.value });

  const handleSubmit = (event) => {
    event.preventDefault();
  
    axios.post(`${process.env.REACT_APP_SERVER_HOST}/login`, {
      username: state.username,
      password: state.password,
    })
    .then((res) => {
      console.log('Login successful');
      console.log('res.data.user = ' + JSON.stringify(res.data));

      localStorage.setItem('token', res.data.token);

      const userData = {
        ...res.data.user,
        rememberMe: rememberMe,
        token: res.data.token
      };
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);

      navigate('/');
      navigate(0);
    })
    .catch((error) => {
      console.error('Error logging in:', error);
      if (error.response && error.response.data && error.response.data.errorMessage) {
        alertRef.current.displayAlert('error', error.response.data.errorMessage);
      }
    });
  };

  const handleRememberMeChange = (event) => {
    setRememberMe(event.target.checked);
  };

  // Show Password
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <ThemeProvider theme={createTheme()}>
      <CssBaseline />

      <Grid container component="main" sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        //backgroundImage: 'url(/static/landing/login-bg.jpg)',
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
            backgroundColor: 'rgba(245, 245, 245, 0.7)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)'
          }}>
            <Logo theme="dark" />
            
            <LanguageSwitcher />
            
            {/*<Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              <LockOutlinedIcon />
            </Avatar>*/}
            <Container sx={{ mt: '1rem', mb: '3rem' }}>
              <TriangleGrid />
            </Container>

            <Typography component="h1" variant="h5">
              {t('signIn')}
            </Typography>
            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label={t('username')}
                name="username"
                autoComplete="username"
                autoFocus
                onChange={onChange}
                size="small"
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label={t('password')}
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="current-password"
                onChange={onChange}
                size="small"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              {/*<FormControlLabel control={<Checkbox value="remember" color="primary" onChange={handleRememberMeChange} />} label="Remember me" />*/}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                size="small"
              >
                {t('signIn')}
              </Button>
              <Grid container>
                <Grid item xs>
                  {/*<Link href="/forgot-password" variant="body2">
                    Forgot password?
                  </Link>*/}
                </Grid>
                <Grid item>
                  <Link href="/register" variant="body2">
                    {t('dontHaveAccount')}
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