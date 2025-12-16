import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Grid, Typography, Skeleton, Button, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AutoAwesome, DashboardCustomize } from '@mui/icons-material';
import { useTheme, createTheme, ThemeProvider } from '@mui/material/styles';

import CreateProjectBtn from '../components/project/CreateProjectBtn';
import TaskCounts from '../components/task-dashboard/TaskCounts';
import ProjectTaskCount from '../components/project-dashboard/ProjectTaskCount';
import UserUpcomingTasks from '../components/project-dashboard/UserUpcomingTasks';
import UserOverdueTasks from '../components/project-dashboard/UserOverdueTasks';

import {
  handleCreate,
  handleSaveProject,
  confirmDelete,
} from '../utils/ProjectUtils.js';

import CssBaseline from '@mui/material/CssBaseline';

import { useTranslation } from 'react-i18next';

import UserContext from '../UserContext';
import ProjectList from '../components/project-dashboard/ProjectList';
import AnnouncementList from '../components/project-dashboard/AnnouncementList';

const ProjectDashboard = () => {
  const theme = useTheme();

  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create
  const [isDialogOpen, setDialogOpen] = useState(false);

  // Redirect if user is not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Set app title
  useEffect(() => {
    document.title = t('appName');
    return () => {
      document.title = t('appName');
    };
  }, [t]);

  // Fetch projects
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/projects`);
      setProjects(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setIsLoading(false);
    }
  };

  const handleCreateProject = () => {
    setDialogOpen(true);
  };

  const handleCloseCreateDialog = (event, reason) => {
    if (reason && reason === 'backdropClick') return;
    setDialogOpen(false);
  };

  const onCreate = async (newProject, setProjects) => {
    handleCreate(newProject, setProjects);
  };

  const onSaveProject = (updatedProject) => {
    handleSaveProject(updatedProject, projects, setProjects);
  };

  const onConfirmDelete = (projectId) => {
    confirmDelete(projectId, setProjects);
  };

  if (isLoading) {
    return (
      <Box sx={{ m: '1rem' }}>
        <Skeleton variant="subtitle2" width={300} height={40} />
        <Skeleton variant="text" width={400} height={40} />
        <Skeleton variant="rounded" width="100%" height={300} />
      </Box>
    );
  }

  return (
    <div>
      <CssBaseline />

      <CreateProjectBtn setProjects={setProjects} mode="fab" />

      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Box id="user-greeting">
          <Typography variant="subtitle2">
            <span style={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>{t('welcome')}</span>, <span style={{ color: theme.palette.primary.main, fontWeight: 'bold', /*borderBottomWidth: '5px', borderBottomStyle: 'solid', borderBottomColor: theme.palette.primary.light*/ }}>{`${user.firstName} ${user.lastName}`}</span>{`${t('exclamationMark')}`} <AutoAwesome sx={{ color: '#FDCC0D' }} />
          </Typography>
          <Typography variant="body2" style={{ fontStyle: 'italic' }}>{t('exploreProject')}</Typography>
        </Box>

        <Tooltip title={t('dashboardConfigDesc')}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<DashboardCustomize />}
            onClick={() => navigate('/dashboard-config')}
          >
            {t('dashboardConfig')}
          </Button>
        </Tooltip>
      </Box>
      
      <Box sx={{ mt: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={12} lg={6}>
            <ProjectList
              projects={projects}
              handleCreateProject={handleCreateProject}
              navigate={navigate}
              onProjectSettings={(projectId) =>
                navigate(`/project/${projectId}/project-settings`)
              }
              onAnnouncement={(projectId) =>
                navigate(`/project/${projectId}/announcement-management`)
              }
              onEdit={(projectId, mode) => {
                const project = projects.find((p) => p._id === projectId);
                if (project) {
                  setProjects((prev) =>
                    prev.map((p) =>
                      p._id === projectId ? { ...p, mode: mode } : p
                    )
                  );
                }
              }}
              onSaveProject={onSaveProject}
              onDeleteClick={(projectId) =>
                setProjects((prev) => prev.filter((p) => p._id !== projectId))
              }
              onConfirmDelete={onConfirmDelete}
              user={user}
            />
          </Grid>
          <Grid item xs={12} md={12} lg={6}>
            <AnnouncementList
              dashboardId="Project Dashboard"
              cardId="Announcement"
            />
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ mt: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={12} lg={6}>
            <UserUpcomingTasks />
          </Grid>
          <Grid item xs={12} md={12} lg={6}>
            <UserOverdueTasks />
          </Grid>
        </Grid>
      </Box>

      <Box maxWidth="100%" sx={{ mt: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4} lg={3}>
            <TaskCounts
              dashboardId="Project Dashboard"
              cardId="Status Distribution"
              criteria="status"
              displayProjectSelector={true}
              displayMilestoneSelector={true}
            />
          </Grid>
          <Grid item xs={12} md={4} lg={3}>
            <TaskCounts
              dashboardId="Project Dashboard"
              cardId="Priority Distribution"
              criteria="priority"
              displayProjectSelector={true}
              displayMilestoneSelector={true}
            />
          </Grid>
          <Grid item xs={12} md={4} lg={3}>
            <TaskCounts
              dashboardId="Project Dashboard"
              cardId="Difficulty Level Distribution"
              criteria="difficultyLevel"
              displayProjectSelector={true}
              displayMilestoneSelector={true}
            />
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ mb: 2 }}>
        <ProjectTaskCount />
      </Box>
    </div>
  );
};

export default ProjectDashboard;