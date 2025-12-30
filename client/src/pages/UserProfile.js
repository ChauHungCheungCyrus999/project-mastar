import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import {
  Paper, Grid, Box,
  Typography, Tabs, Tab, Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import UserContext from '../UserContext';
import { useTranslation } from 'react-i18next';
import { Home, Person } from '@mui/icons-material';
import useMediaQuery from '@mui/material/useMediaQuery';

import MainContent from '../components/MainContent';
import ContactInfo from '../components/team/ContactInfo';
import TaskTable from '../components/task/TaskTable';

import { fetchUser } from '../database/UserController';

import { initUser } from '../components/init/InitUser';
import { initProjects } from "../components/init/InitProjects";
import { initTasks } from "../components/init/InitTasks";

const UserProfile = () => {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isTablet = useMediaQuery('(max-width:900px)');

  const breadcrumbItems = [
    { label: 'home', href: '/', icon: <Home sx={{ mr: 0.5 }} fontSize="inherit" /> },
    { label: 'userProfile', icon: <Person sx={{ mr: 0.5 }} fontSize="inherit" /> },
  ];

  const userId = window.location.href.split("/")[4];
  const [selectedUser, setSelectedUser] = useState(/*initUser()*/);

  const [projects, setProjects] = useState([]/*initProjects()*/);
  const [tasks, setTasks] = useState([]/*initTasks()*/);
  const [selectedTab, setSelectedTab] = useState(0);

  const fetchUserById = async () => {
    try {
      const user = await fetchUser(userId);
      setSelectedUser(user);
      console.log("user = " + JSON.stringify(user));
      console.log('selectedUser = ' + JSON.stringify(selectedUser));
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/user/${userId}/projects`);
      setProjects(response.data);
      console.log('projects = ' + JSON.stringify(response.data));
    } catch (error) {
      console.log('Error fetching projects:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      console.log('projects['+selectedTab+'] = ' + JSON.stringify(projects[selectedTab]));
      const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/tasks/project/${projects[selectedTab]._id}/user/${selectedUser._id}`);
      setTasks(response.data);
      console.log('tasks = ' + JSON.stringify(response.data));
    } catch (error) {
      console.log('Error fetching tasks:', error);
    }
  };

  useEffect(() => {
    fetchUserById();
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [selectedUser]);

  useEffect(() => {
    if (projects.length > 0) {
      fetchTasks();
    }
  }, [selectedTab, projects]);

  // Tab
  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  return (
    <MainContent pageTitle="userProfile" breadcrumbItems={breadcrumbItems}>
      {(
        user.email === process.env.REACT_APP_ADMIN_EMAIL ||
        user?.permissions?.some(permission => permission === "readUserProfileContactInfo") ||
        selectedUser
      ) ? (
        <>
          <Typography component="h1" variant="subtitle2">{t('contactInfo')}</Typography>
          <ContactInfo selectedTeamMember={selectedUser} />
        </>
      ) : (
        <Grid container justifyContent="center" alignItems="center" style={{ height: '100vh' }}>
          <Grid item>
            <Typography sx={{ m:2 }}>{t('userNotFound')}</Typography>

            <Button
              variant="contained"
              onClick={() => navigate(-1)}
              sx={{ m:2 }}
            >
              {t('backToLastPage')}
            </Button>
          </Grid>
        </Grid>
      )}

      {(user.email === process.env.REACT_APP_ADMIN_EMAIL || user._id === userId) && projects.length > 0 && (
        <>
          <Typography component="h1" variant="subtitle2" sx={{ mt: '1rem' }}>{t('projectsAndTasks')}</Typography>
          <Paper>
            <Grid container direction={isTablet ? "column" : "row"}>
              <Grid item xs={12} md={2} sx={{ overflowY: isTablet ? 'hidden' : 'auto', maxHeight: 'calc(100vh - 64px)' }}>
                <Tabs
                  orientation={isTablet ? "horizontal" : "vertical"}
                  variant="scrollable"
                  value={selectedTab}
                  onChange={handleTabChange}
                  aria-label={t('teamMembers')}
                  sx={{
                    borderColor: 'divider',
                    overflowWrap: 'anywhere'
                  }}
                >
                  {projects?.map((project, index) => (
                    <Tab key={index} label={`${project.title || ''}`} sx={{ alignItems: 'flex-start', justifyContent: 'flex-start' }} />
                  ))}
                </Tabs>
              </Grid>
              <Grid item xs={12} md={10}>
                <Box p={isTablet? 0:2} sx={{ overflow: 'scroll', maxWidth: '95vw', maxHeight: 'calc(100vh - 64px)' }}>
                  {projects.length > 0 && (
                    <TaskTable
                      project={projects[selectedTab]}
                      tasks={tasks}
                      setTasks={setTasks}
                      displayCheckbox={false}
                      displayToolbar={true}
                      size="small"
                    />
                  )}
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </>
      )}
    </MainContent>
  );
};

export default UserProfile;