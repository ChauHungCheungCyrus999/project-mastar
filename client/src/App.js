import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

import { createTheme, alpha, ThemeProvider } from '@mui/material/styles';

import { useTranslation } from 'react-i18next';

import { UserContext, UserProvider } from './UserContext';

import LandingPage from './pages/LandingPage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Login from './pages/Login';
import Register from './pages/Register';
//import ForgotPassword from './pages/ForgotPassword';
import Loading from './components/Loading';

import MainAppBar from './components/MainAppBar';
import ThemeCustomizer from './components/ThemeCustomizer';

import UserProfile from './pages/UserProfile';
import DashboardConfig from './pages/DashboardConfig';
import Notifications from './pages/Notifications';
import AccountSettings from './pages/AccountSettings';
import Announcement from './pages/Announcement';
import Help from './pages/Help';
import AuditLog from './pages/AuditLog';
import ProjectDashboard from './pages/ProjectDashboard';
import ProjectSettings from './pages/ProjectSettings';
import TaskDashboard from './pages/TaskDashboard';
import TaskProgress from './pages/TaskProgress';
import ProjectCalendar from './pages/ProjectCalendar';
import EventPage from './pages/EventPage';
import Team from './pages/Team';
import TaskPage from './pages/TaskPage';
import AccessControl from './pages/AccessControl';
import UserManagement from './pages/UserManagement';
import AnnouncementManagement from './pages/AnnouncementManagement';
import AnnouncementPage from './pages/AnnouncementPage';
import ErrorPage from './pages/ErrorPage';

import { initUser } from './components/init/InitUser';

function App() {
  const { t } = useTranslation();

  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState('light');
  
  const defaultTheme = createTheme();
  //const [primaryColor, setPrimaryColor] = useState(localStorage.getItem('primaryColor') || '#193f70');

  const customShadows = [...defaultTheme.shadows];

  const brand = {
    50: 'hsl(210, 100%, 95%)',
    100: 'hsl(210, 100%, 92%)',
    200: 'hsl(210, 100%, 80%)',
    300: 'hsl(210, 100%, 65%)',
    400: 'hsl(210, 98%, 48%)',
    500: 'hsl(210, 98%, 42%)',
    600: 'hsl(210, 98%, 55%)',
    700: 'hsl(210, 100%, 35%)',
    800: 'hsl(210, 100%, 16%)',
    900: 'hsl(210, 100%, 21%)',
  };

  const secondary = {
    50: 'hsl(300, 100%, 95%)',
    100: 'hsl(300, 100%, 92%)',
    200: 'hsl(300, 100%, 80%)',
    300: 'hsl(300, 100%, 65%)',
    400: 'hsl(300, 98%, 48%)',
    500: 'hsl(300, 98%, 42%)',
    600: 'hsl(300, 98%, 55%)',
    700: 'hsl(300, 100%, 35%)',
    800: 'hsl(300, 100%, 16%)',
    900: 'hsl(300, 100%, 21%)',
  };

  const gray = {
    50: 'hsl(220, 35%, 97%)',
    100: 'hsl(220, 30%, 94%)',
    200: 'hsl(220, 20%, 88%)',
    300: 'hsl(220, 20%, 80%)',
    400: 'hsl(220, 20%, 65%)',
    500: 'hsl(220, 20%, 42%)',
    600: 'hsl(220, 20%, 35%)',
    700: 'hsl(220, 20%, 25%)',
    800: 'hsl(220, 30%, 6%)',
    900: 'hsl(220, 35%, 3%)',
  };

  const green = {
    50: 'hsl(120, 80%, 98%)',
    100: 'hsl(120, 75%, 94%)',
    200: 'hsl(120, 75%, 87%)',
    300: 'hsl(120, 61%, 77%)',
    400: 'hsl(120, 44%, 53%)',
    500: 'hsl(120, 59%, 30%)',
    600: 'hsl(120, 70%, 25%)',
    700: 'hsl(120, 75%, 16%)',
    800: 'hsl(120, 84%, 10%)',
    900: 'hsl(120, 87%, 6%)',
  };

  const orange = {
    50: 'hsl(45, 100%, 97%)',
    100: 'hsl(45, 92%, 90%)',
    200: 'hsl(45, 94%, 80%)',
    300: 'hsl(45, 90%, 65%)',
    400: 'hsl(45, 90%, 40%)',
    500: 'hsl(45, 90%, 35%)',
    600: 'hsl(45, 91%, 25%)',
    700: 'hsl(45, 94%, 20%)',
    800: 'hsl(45, 95%, 16%)',
    900: 'hsl(45, 93%, 12%)',
  };

  const red = {
    50: 'hsl(0, 100%, 97%)',
    100: 'hsl(0, 92%, 90%)',
    200: 'hsl(0, 94%, 80%)',
    300: 'hsl(0, 90%, 65%)',
    400: 'hsl(0, 90%, 40%)',
    500: 'hsl(0, 90%, 30%)',
    600: 'hsl(0, 91%, 25%)',
    700: 'hsl(0, 94%, 18%)',
    800: 'hsl(0, 95%, 12%)',
    900: 'hsl(0, 93%, 6%)',
  };

  const [theme, setTheme] = useState(() =>
    createTheme({
      /*components: {
        MuiButton: {
          light: '#9f6bb9',
          main: '#8746A8',
          dark: '#5e3175'
        },
        MuiCard: {},
        MuiCheckBox: {},
        MuiDialogContent: {},
        MuiFormControlLabel: {},
        MuiIconButton: {},
        MuiPaper: {},
        MuiTableCell: {},
        MuiTableRow: {},
        MuiTextField: {},
        MuiTimelineDot: {}
      },*/
      palette: {
        mode,
        primary: {
          light: brand[200],
          main: brand[400],
          dark: brand[700],
          contrastText: brand[50],
          ...(mode === 'dark' && {
            contrastText: brand[50],
            light: brand[300],
            main: brand[400],
            dark: brand[700],
          }),
        },
        secondary: {
          light: secondary[200],
          main: secondary[500],
          dark: secondary[800],
          contrastText: secondary[50],
          ...(mode === 'dark' && {
            contrastText: secondary[50],
            light: secondary[300],
            main: secondary[400],
            dark: secondary[700],
          }),
        },
        info: {
          light: brand[100],
          main: brand[300],
          dark: brand[600],
          contrastText: gray[50],
          ...(mode === 'dark' && {
            contrastText: brand[300],
            light: brand[500],
            main: brand[700],
            dark: brand[900],
          }),
        },
        warning: {
          light: orange[300],
          main: orange[400],
          dark: orange[800],
          ...(mode === 'dark' && {
            light: orange[400],
            main: orange[500],
            dark: orange[700],
          }),
        },
        error: {
          light: red[300],
          main: red[400],
          dark: red[800],
          ...(mode === 'dark' && {
            light: red[400],
            main: red[500],
            dark: red[700],
          }),
        },
        success: {
          light: green[300],
          main: green[400],
          dark: green[800],
          ...(mode === 'dark' && {
            light: green[400],
            main: green[500],
            dark: green[700],
          }),
        },
        grey: {
          ...gray,
        },
        divider: mode === 'dark' ? alpha(gray[700], 0.6) : alpha(gray[300], 0.4),
        background: {
          default: '#F5F5FF',
          paper: 'hsl(220, 35%, 97%)',
          //paper: '#F5F5FF',
          ...(mode === 'dark' && { default: gray[900], paper: 'hsl(220, 30%, 7%)' }),
          //...(mode === 'dark' && { default: gray[900], paper: '#121212' }),
        },
        text: {
          primary: gray[800],
          secondary: gray[600],
          warning: orange[400],
          ...(mode === 'dark' && { primary: 'hsl(0, 0%, 100%)', secondary: gray[400] }),
        },
        action: {
          hover: alpha(gray[200], 0.2),
          selected: `${alpha(gray[200], 0.3)}`,
          ...(mode === 'dark' && {
            hover: alpha(gray[600], 0.2),
            selected: alpha(gray[600], 0.3),
          }),
        },
      },
      typography: {
        fontFamily: 'Inter, sans-serif',
        h1: {
          fontSize: defaultTheme.typography.pxToRem(48),
          fontWeight: 600,
          lineHeight: 1.2,
          letterSpacing: -0.5,
        },
        h2: {
          fontSize: defaultTheme.typography.pxToRem(36),
          fontWeight: 600,
          lineHeight: 1.2,
        },
        h3: {
          fontSize: defaultTheme.typography.pxToRem(30),
          lineHeight: 1.2,
        },
        h4: {
          fontSize: defaultTheme.typography.pxToRem(24),
          fontWeight: 600,
          lineHeight: 1.5,
        },
        h5: {
          fontSize: defaultTheme.typography.pxToRem(20),
          fontWeight: 600,
        },
        h6: {
          fontSize: defaultTheme.typography.pxToRem(18),
          fontWeight: 600,
        },
        subtitle1: {
          fontSize: defaultTheme.typography.pxToRem(18),
        },
        subtitle2: {
          fontSize: defaultTheme.typography.pxToRem(14),
          fontWeight: 500,
        },
        body1: {
          fontSize: defaultTheme.typography.pxToRem(14),
        },
        body2: {
          fontSize: defaultTheme.typography.pxToRem(14),
          fontWeight: 400,
        },
        caption: {
          fontSize: defaultTheme.typography.pxToRem(12),
          fontWeight: 400,
        },
      },
      shape: {
        borderRadius: 8,
      },
      shadows: customShadows,
    })
  );

  useEffect(() => {
    checkAuthentication();

    const storedTheme = localStorage.getItem('theme') || 'light'; // Fallback to 'light'
    const primaryColor = localStorage.getItem('primaryColor') || '#193f70'; // Fallback color
  
    setMode(storedTheme);

    // Save default theme and color to localStorage if not already set
    if (!localStorage.getItem('theme')) {
      localStorage.setItem('theme', storedTheme);
    }
    if (!localStorage.getItem('primaryColor')) {
      localStorage.setItem('primaryColor', primaryColor);
    }
  
    setTheme(
      createTheme({
        palette: {
          mode: storedTheme,
          primary: {
            main: primaryColor,
          },
          background: {
            default: storedTheme === 'dark' ? '#121212' : '#F5F5FF', // Define default background
            paper: storedTheme === 'dark' ? '#1e1e1e' : '#ffffff', // Define paper background
          },
          text: {
            primary: storedTheme === 'dark' ? '#ffffff' : '#000000', // Define text colors
            secondary: storedTheme === 'dark' ? '#aaaaaa' : '#666666',
          },
        },
      })
    );
  }, []);

  const checkAuthentication = async () => {
    // Bypass Authentication
    /*setAuthenticated(true);
    let user = initUser();
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);*/

    // Check Authentication
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setAuthenticated(false);
        setLoading(false);
        return;
      }

      const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/protected`, {
        headers: {
          Authorization: token,
        },
      });

      if (response.status === 200) {
        setAuthenticated(true);
        const storedUser = JSON.parse(localStorage.getItem('user'));
        setUser(storedUser);

        // Web Push Notifications
        const subscribeUser = async () => {
          if ('serviceWorker' in navigator && 'PushManager' in window) {
            try {
              const registration = await navigator.serviceWorker.register('/service-worker.js');
              const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array('BHNXT50DUJsYtrt24psRdputkztj3rzxSn851BAbyxREmjo8ICQxiYFPsDRMeh0NpIl4tpQWpxbOjvCG-6MhuuI')
              });
      
              await axios.post(`${process.env.REACT_APP_SERVER_HOST}/subscribe`, { userId: storedUser._id, subscription });
              console.log('Subscribed successfully!');
            } catch (error) {
              console.error('Error subscribing:', error);
            }
          }
        };
      
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            subscribeUser();
          }
        });
        
        const urlBase64ToUint8Array = (base64String) => {
          const padding = '='.repeat((4 - base64String.length % 4) % 4);
          const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
          const rawData = window.atob(base64);
          const outputArray = new Uint8Array(rawData.length);
          for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
          }
          return outputArray;
        };
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      if (error.response && error.response.status === 401) {
        setAuthenticated(false);
      }
    }

    setLoading(false);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <UserProvider>
      <ThemeProvider theme={theme}>
        <Router>
          {authenticated && user ? (
            <>
              <MainAppBar
                mode={mode}
                setMode={setMode}
                setTheme={setTheme}
                setAuthenticated={setAuthenticated}
              >
                <Routes>
                  <Route path="/" element={<ProjectDashboard />} />
                  <Route path="/user-profile/:userId" element={<UserProfile />} />
                  <Route path="/dashboard-config" element={<DashboardConfig />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/account-settings" element={<AccountSettings />} />
                  <Route path="/announcement-management" element={<AnnouncementManagement />} />
                  <Route path="/announcement" element={<Announcement />} />
                  <Route path="/announcement/:announcementId" element={<AnnouncementPage />} />
                  <Route path="/help" element={<Help />} />
                  <Route path="/project/:projectId/project-settings" element={<ProjectSettings />} />
                  <Route path="/project/:projectId/dashboard" element={<TaskDashboard />} />
                  <Route path="/project/:projectId/progress" element={<TaskProgress />} />
                  <Route path="/project/:projectId/calendar" element={<ProjectCalendar />} />
                  <Route path="/project/:projectId/event/:eventId" element={<EventPage />} />
                  <Route path="/project/:projectId/team" element={<Team />} />
                  <Route path="/project/:projectId/task/:taskId" element={<TaskPage />} />
                  <Route path="/project/:projectId/announcement" element={<Announcement />} />
                  <Route path="/project/:projectId/announcement-management" element={<AnnouncementManagement />} />
                  <Route path="/project/:projectId/announcement/:announcementId" element={<AnnouncementPage />} />
                  {user?.email === process.env.REACT_APP_ADMIN_EMAIL && (
                    <>
                      <Route path="/audit-log" element={<AuditLog />} />
                      <Route path="/access-control" element={<AccessControl />} />
                      <Route path="/user-management" element={<UserManagement />} />
                    </>
                  )}
                  <Route path="*" element={<ErrorPage title={t('pageNotFound')} body={t('pageNotFoundDesc')} />} />
                </Routes>
              </MainAppBar>

              <ThemeCustomizer
                mode={mode}
                setMode={setMode}
                theme={theme}
                setTheme={(updatedTheme) => {
                  setTheme(updatedTheme);
                }}
              />
            </>
          ) : (
            <Routes>
              <Route path="/" element={<LandingPage mode={mode} setMode={setMode} setTheme={setTheme} />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy mode={mode} setMode={setMode} setTheme={setTheme} />} />
              <Route path="*" element={<ErrorPage />} />
            </Routes>
          )}
        </Router>
      </ThemeProvider>
    </UserProvider>
  );
}

export default App;