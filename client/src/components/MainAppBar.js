import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '@mui/material/styles';
import { styled, keyframes } from '@mui/material/styles';
import { Link, useNavigate } from 'react-router-dom';
import MuiDrawer from '@mui/material/Drawer';
import {
  useMediaQuery, CssBaseline,
  Paper, Box,
  IconButton, Tooltip, Typography, Divider, Toolbar,
  List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Stack, BottomNavigation, BottomNavigationAction, Menu, MenuItem
} from '@mui/material';
import { HomeOutlined, DashboardOutlined, AssignmentOutlined, FolderOutlined, CalendarMonthOutlined, GroupOutlined, CampaignOutlined, SettingsOutlined, HelpOutline, ExpandLess, ExpandMore } from '@mui/icons-material';

import Logo from '../components/Logo';
import ProjectSwitcher from './project/ProjectSwitcher';
import GlobalSearchBar from './GlobalSearchBar';
import ThemeSwitcher from './ThemeSwitcher';
import LanguageSwitcher from './LanguageSwitcher';
import NotificationDropdown from './NotificationDropdown';
import AccountBtn from './AccountBtn';
import ProjectFolder from './ProjectFolder';

import { useTranslation } from 'react-i18next';
import UserContext from '../UserContext';

const drawerWidth = 260;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(7)} + 1px)`,
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
  }),
);

function MainAppBar({ mode, setMode, setTheme, setAuthenticated, children }) {
  const theme = useTheme();

  const { user } = useContext(UserContext);
  const isMobile = useMediaQuery('(max-width:600px)');
  const [selectedNavigationAction, setSelectedNavigationAction] = useState(-1);
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const path = window.location.href.split("/")[3];
  const projectId = window.location.href.split("/")[4];
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const savedState = localStorage.getItem('isSidebarOpen');
    return savedState ? JSON.parse(savedState) : false;
  });
  const [selectedProject, setSelectedProject] = useState(null);
  const [animateDirection, setAnimateDirection] = useState(null);
  const [isProjectListExpanded, setIsProjectListExpanded] = useState(true);
  const [projectsMenuAnchorEl, setProjectsMenuAnchorEl] = useState(null);

  // Projects
  const [projects, setProjects] = useState([]);
  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/projects`);
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const [project, setProject] = useState({});
  const fetchProject = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/project/${projectId}`);
      setProject(response.data);
    } catch (error) {
      console.error('Error fetching project:', error);
    }
  }

  useEffect(() => {
    fetchProjects();

    if (projectId && projectId !== 'undefined') {
      fetchProject();
    }
  }, [user]);

  const handleProjectSelect = (project) => {
    setSelectedProject(project); // Update selected project state
  };

  const handleDrawerOpen = () => {
    setIsSidebarOpen(true);
    setAnimateDirection('clockwise');
    setTimeout(() => setAnimateDirection(null), 1000);
  };

  const handleDrawerClose = () => {
    setIsSidebarOpen(false);
    setAnimateDirection('anticlockwise');
    setTimeout(() => setAnimateDirection(null), 1000);
  };

  const handleBottomNavChange = (event, newValue) => {
    setSelectedNavigationAction(newValue);
    const routes = ['/dashboard', '/progress', '/calendar', '/team', '/announcement-management', '/project-settings'];
    if (projectId) {
      navigate(`/project/${projectId}${routes[newValue]}`);
    }
  };

  useEffect(() => {
    localStorage.setItem('isSidebarOpen', JSON.stringify(isSidebarOpen));
  }, [isSidebarOpen]);

  const isSelected = (page) => '/'+window.location.href.split("/").pop() === page;

  const rotateClockwise = keyframes`
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(180deg);
    }
  `;

  const rotateAnticlockwise = keyframes`
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(-180deg);
    }
  `;

  const RotatingImg = styled('img')(({ animateDirection }) => ({
    maxHeight: '25px',
    verticalAlign: 'middle',
    animation: animateDirection === 'clockwise' ? `${rotateClockwise} 0.4s linear` : animateDirection === 'anticlockwise' ? `${rotateAnticlockwise} 0.4s linear` : 'none',
  }));

  const handleExpandProjects = () => {
    setIsProjectListExpanded(!isProjectListExpanded);
  };

  const handleProjectsMenuOpen = (event) => {
    setProjectsMenuAnchorEl(event.currentTarget);
  };

  const handleProjectsMenuClose = () => {
    setProjectsMenuAnchorEl(null);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {!isMobile && (
        <Drawer variant="permanent" open={isSidebarOpen}
          ModalProps={{
            keepMounted: true,
          }}
          PaperProps={{
            sx: {
              color: 'lightGray',
              backgroundColor: mode === 'light' ? theme.palette.primary.main : theme.palette.primary.dark,
              display: 'flex',
              flexDirection: 'column',
              height: '100vh'
            }
          }}
        >
          <DrawerHeader>
            {isSidebarOpen && (
              <Tooltip title={t('collapseSidebar')}>
                <IconButton onClick={handleDrawerClose} style={{ color: 'lightGray' }}>
                  <RotatingImg
                    src={`/logo-mobile-${theme === 'dark' ? 'light' : 'light'}.png`}
                    animateDirection={animateDirection}
                  />
                </IconButton>
              </Tooltip>
            )}

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: isSidebarOpen ? 'flex-start' : 'center',
                flexShrink: 0,
              }}
            >
              <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={handleDrawerOpen}
                sx={{
                  ...(isSidebarOpen && { display: 'none' }),
                }}
              >
                <RotatingImg
                  src={`/logo-mobile-${theme === 'dark' ? 'light' : 'light'}.png`}
                  animateDirection={animateDirection}
                />
              </IconButton>    

              {isSidebarOpen && (
                <Logo theme="light" displayIcon={false} />
              )}
            </Box>
          </DrawerHeader>

          <Box sx={{ flex: 1 }}>
            <List>
              <Tooltip title={t('home')} placement='right'>
                <ListItemButton
                  component={Link} to={`/`} 
                  sx={{ bgcolor: isSelected('/') ? 'rgba(255, 255, 255, 0.1)' : 'transparent' }}
                >
                  <ListItemIcon>
                    <HomeOutlined style={{ color: 'lightGray' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={t('home')}
                    primaryTypographyProps={{
                      fontWeight: 'medium',
                      letterSpacing: 0,
                    }}
                  />
                </ListItemButton>
              </Tooltip>

              {isSidebarOpen ? (
                <Divider
                  variant="middle"
                  textAlign="left"
                  sx={{
                    fontSize: "0.7rem",
                    textTransform: "uppercase",
                    "&::before, &::after": {
                      borderColor: "white",
                    },
                  }}
                >
                  {t('projectHub')}
                </Divider>
              ) : (
                <Divider variant="middle" color="white" />
              )}

              {path !== 'project' && projects.length > 0 && (
                <>
                  <Tooltip title={t('projects')} placement="right">
                    <ListItemButton
                      onClick={isSidebarOpen ? handleExpandProjects : handleProjectsMenuOpen}
                      sx={{ bgcolor: 'transparent' }}
                    >
                      <ListItemIcon>
                        <FolderOutlined style={{ color: 'lightGray' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={t('projects')}
                        primaryTypographyProps={{
                          fontWeight: 'medium',
                          letterSpacing: 0,
                        }}
                      />
                      {/* Add Expand/Collapse Icon to the Right */}
                      {isSidebarOpen && (
                        isProjectListExpanded ? (
                          <ExpandLess style={{ color: 'lightGray' }} />
                        ) : (
                          <ExpandMore style={{ color: 'lightGray' }} />
                        )
                      )}
                    </ListItemButton>
                  </Tooltip>

                  {isSidebarOpen && isProjectListExpanded && (
                    <List component="nav" dense disablePadding>
                      {projects.map((project) => (
                        (user.email === process.env.REACT_APP_ADMIN_EMAIL || project?.teamMembers?.find((member) => member._id === user._id)) && (
                          <ListItemButton
                            key={project._id} 
                            component={Link} 
                            to={`/project/${project._id}/progress`}
                            onClick={() => handleProjectSelect(project)}
                          >
                            <MenuItem dense key={project._id} value={project._id} sx={{ width: '100%', '&:hover': { backgroundColor: 'transparent' } }}>
                              <ProjectFolder project={project} />
                            </MenuItem>
                          </ListItemButton>
                        )
                      ))}
                    </List>
                  )}

                  {/* Menu for collapsed sidebar */}
                  {!isSidebarOpen && (
                    <Menu
                      anchorEl={projectsMenuAnchorEl}
                      open={Boolean(projectsMenuAnchorEl)}
                      onClose={handleProjectsMenuClose}
                    >
                      <Typography variant="button" ml={2}>{t('projects')}</Typography>
                      {projects.map((project) => (
                        user.email === process.env.REACT_APP_ADMIN_EMAIL || project?.teamMembers?.find((member) => member._id === user._id)) && (
                          <MenuItem
                            dense
                            key={project._id}
                            component={Link}
                            value={project._id}
                            to={`/project/${project._id}/progress`}
                            onClick={handleProjectsMenuClose}
                            style={{ minWidth: '200px' }}
                          >
                            <ProjectFolder project={project} />
                          </MenuItem>
                        )
                      )}
                    </Menu>
                  )}
                </>
              )}

              {path === 'project' && projectId && (
                <>
                  <Tooltip title={t('dashboard')} placement='right'>
                    <ListItemButton component={Link} to={`/project/${projectId}/dashboard`}
                      sx={{ /*px: 1.2, py: 0.8,*/ bgcolor: isSelected('/dashboard') ? 'rgba(255, 255, 255, 0.1)' : 'transparent' }}>
                      <ListItemIcon>
                        <DashboardOutlined /*fontSize="small"*/ style={{ color: 'lightGray' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={t('dashboard')}
                        primaryTypographyProps={{
                          //fontSize: 15,
                          fontWeight: 'medium',
                          letterSpacing: 0,
                        }}
                      />
                    </ListItemButton>
                  </Tooltip>
                  <Tooltip title={t('progress')} placement='right'>
                    <ListItemButton component={Link} to={`/project/${projectId}/progress`}
                      sx={{ /*px: 1.2, py: 0.8,*/ bgcolor: isSelected('/progress') ? 'rgba(255, 255, 255, 0.1)' : 'transparent' }}>
                      <ListItemIcon>
                        <AssignmentOutlined /*fontSize="small"*/ style={{ color: 'lightGray' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={t('progress')}
                        primaryTypographyProps={{
                          //fontSize: 15,
                          fontWeight: 'medium',
                          letterSpacing: 0,
                        }}
                      />
                    </ListItemButton>
                  </Tooltip>
                  <Tooltip title={t('calendar')} placement='right'>
                    <ListItemButton component={Link} to={`/project/${projectId}/calendar`}
                      sx={{ /*px: 1.2, py: 0.8,*/ bgcolor: isSelected('/calendar') ? 'rgba(255, 255, 255, 0.1)' : 'transparent' }}>
                      <ListItemIcon>
                        <CalendarMonthOutlined /*fontSize="small"*/ style={{ color: 'lightGray' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={t('calendar')}
                        primaryTypographyProps={{
                          //fontSize: 15,
                          fontWeight: 'medium',
                          letterSpacing: 0,
                        }}
                      />
                    </ListItemButton>
                  </Tooltip>
                  <Tooltip title={t('team')} placement='right'>
                    <ListItemButton component={Link} to={`/project/${projectId}/team`}
                      sx={{ /*px: 1.2, py: 0.8,*/ bgcolor: isSelected('/team') ? 'rgba(255, 255, 255, 0.1)' : 'transparent' }}>
                      <ListItemIcon>
                        <GroupOutlined /*fontSize="small"*/ style={{ color: 'lightGray' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={t('team')}
                        primaryTypographyProps={{
                          //fontSize: 15,
                          fontWeight: 'medium',
                          letterSpacing: 0,
                        }}
                      />
                    </ListItemButton>
                  </Tooltip>
                </>
              )}
            </List>
          </Box>

          <Box sx={{ flexShrink: 0 }}>
            <List sx={{ width: '100%' }}>
              {((path === 'project' && projectId && project?.teamMembers?.find((member) => member._id === user._id)?.role === "Project Manager") || user.email === process.env.REACT_APP_ADMIN_EMAIL) && (
                isSidebarOpen ? (
                  <Divider
                    variant="middle"
                    textAlign="left"
                    sx={{
                      fontSize: "0.7rem",
                      textTransform: "uppercase",
                      "&::before, &::after": {
                        borderColor: "white",
                      },
                    }}
                  >
                    {t('settings')}
                  </Divider>
                ) : (
                  <Divider variant="middle" color="white" />
                )
              )}
              
              {((path === 'project' && projectId && project?.teamMembers?.find((member) => member._id === user._id)?.role === "Project Manager") || user.email === process.env.REACT_APP_ADMIN_EMAIL) && (
                <Tooltip title={t('announcement')} placement='right'>
                  <ListItemButton component={Link} to={`/project/${projectId}/announcement-management`} 
                    sx={{ /*px: 1.2, py: 0.8,*/ bgcolor: isSelected('/announcement-management') ? 'rgba(255, 255, 255, 0.1)' : 'transparent' }}>
                    <ListItemIcon>
                      <CampaignOutlined /*fontSize="small"*/ style={{ color: 'lightGray' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={t('announcement')}
                      primaryTypographyProps={{
                        //fontSize: 15,
                        fontWeight: 'medium',
                        letterSpacing: 0,
                      }}
                    />
                  </ListItemButton>
                </Tooltip>
              )}

              {path === 'project' && projectId && (user.email === process.env.REACT_APP_ADMIN_EMAIL || project?.teamMembers?.find((member) => member._id === user._id)?.role === "Project Manager") && (
                <Tooltip title={t('projectSettings')} placement='right'>
                  <ListItemButton component={Link} to={`/project/${projectId}/project-settings`} 
                    sx={{ /*px: 1.2, py: 0.8,*/ bgcolor: isSelected('/project-settings') ? 'rgba(255, 255, 255, 0.1)' : 'transparent' }}>
                    <ListItemIcon>
                      <SettingsOutlined /*fontSize="small"*/ style={{ color: 'lightGray' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={t('projectSettings')}
                      primaryTypographyProps={{
                        //fontSize: 15,
                        fontWeight: 'medium',
                        letterSpacing: 0,
                      }}
                    />
                  </ListItemButton>
                </Tooltip>
              )}
                
              {isSidebarOpen ? (
                <Divider
                  variant="middle"
                  textAlign="left"
                  sx={{
                    fontSize: "0.7rem",
                    textTransform: "uppercase",
                    "&::before, &::after": {
                      borderColor: "white",
                    },
                  }}
                >
                  {t('others')}
                </Divider>
              ) : (
                <Divider variant="middle" color="white" />
              )}
              
              <Tooltip title={t('help')} placement='right'>
                <ListItemButton component={Link} to={`/help`} 
                  sx={{ /*px: 1.2, py: 0.8,*/ bgcolor: isSelected('/help') ? 'rgba(255, 255, 255, 0.1)' : 'transparent' }}>
                  <ListItemIcon>
                    <HelpOutline /*fontSize="small"*/ style={{ color: 'lightGray' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={t('help')}
                    primaryTypographyProps={{
                      //fontSize: 15,
                      fontWeight: 'medium',
                      letterSpacing: 0,
                    }}
                  />
                </ListItemButton>
              </Tooltip>
            </List>
          </Box>
        </Drawer>
      )}

      <Box component="main" sx={{ flexGrow: 1, width: isMobile ? '100vw' : `calc(100% - ${drawerWidth}px)` }}>
        <Toolbar disableGutters variant="dense" style={{ position: 'sticky', top: 0, zIndex: 1000, backgroundColor: theme.palette.background.default }}>
          {path !== 'project' || isMobile ? (
            <Logo 
              theme={mode === 'dark' ? 'light' : 'dark'}
              style={{ maxHeight: isMobile ? '35px' : '50px', paddingLeft: isMobile ? '0.5rem' : '0', maxWidth: '250px', verticalAlign: 'middle' }}
            />
          ) : (
            <ProjectSwitcher />
          )}
          
          <Box sx={{ flexGrow: 1, maxWidth: '100vw' }} />

          <Stack direction="row" sx={{ display: { xs: 'none', sm: 'flex' } }}>
            <GlobalSearchBar userId={user._id} />
            <ThemeSwitcher mode={mode} setMode={setMode} setTheme={setTheme} />
            <LanguageSwitcher />
            <NotificationDropdown />
            <AccountBtn setAuthenticated={setAuthenticated} />
          </Stack>

          {/* Mobile */}
          <Stack direction="row" sx={{ display: { xs: 'flex', sm: 'none' } }}>
            <GlobalSearchBar userId={user._id} />
            <ThemeSwitcher mode={mode} setMode={setMode} setTheme={setTheme} />
            <LanguageSwitcher />
            <NotificationDropdown />
            <AccountBtn setAuthenticated={setAuthenticated} />
          </Stack>
        </Toolbar>
        
        <Box
          style={{
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            backgroundColor: theme.palette.background.default
          }}
          p={isMobile ? 1 : 2}
          pt={0}
        >
          { children }
        </Box>
      </Box>

      {isMobile && path === 'project' && projectId && (
        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100 }} elevation={3}>
          <BottomNavigation
            value={selectedNavigationAction}
            onChange={handleBottomNavChange}
            showLabels
            sx={{ position: 'fixed', bottom: 0, width: '100%', borderTop: '1px solid lightGray' }}
          >
            <BottomNavigationAction
              label={t('dashboard')}
              icon={<DashboardOutlined /*fontSize="small"*/ />}
              sx={{
                color: 'primary.main',
                bgcolor: selectedNavigationAction === 0 ? (theme === 'dark'? '#343434':'#e8f0ff') : 'transparent',
              }}
            />
            <BottomNavigationAction
              label={t('progress')}
              icon={<AssignmentOutlined /*fontSize="small"*/ />}
              sx={{
                color: 'primary.main',
                bgcolor: selectedNavigationAction === 1 ? (theme === 'dark'? '#343434':'#e8f0ff') : 'transparent',
              }}
            />
            <BottomNavigationAction
              label={t('calendar')}
              icon={<CalendarMonthOutlined /*fontSize="small"*/ />}
              sx={{
                color: 'primary.main',
                bgcolor: selectedNavigationAction === 2 ? (theme === 'dark'? '#343434':'#e8f0ff') : 'transparent',
              }}
            />
            <BottomNavigationAction
              label={t('team')}
              icon={<GroupOutlined /*fontSize="small"*/ />}
              sx={{
                color: 'primary.main',
                bgcolor: selectedNavigationAction === 3 ? (theme === 'dark'? '#343434':'#e8f0ff') : 'transparent',
              }}
            />
            <BottomNavigationAction
              label={t('announcement')}
              icon={<CampaignOutlined /*fontSize="small"*/ />}
              sx={{
                color: 'primary.main',
                bgcolor: selectedNavigationAction === 4 ? (theme === 'dark'? '#343434':'#e8f0ff') : 'transparent',
              }}
            />
            <BottomNavigationAction
              label={t('projectSettings')}
              icon={<SettingsOutlined /*fontSize="small"*/ />}
              sx={{
                color: 'primary.main',
                bgcolor: selectedNavigationAction === 5 ? (theme === 'dark'? '#343434':'#e8f0ff') : 'transparent',
              }}
            />
          </BottomNavigation>
        </Paper>
      )}
    </Box>
  );
}

export default MainAppBar;