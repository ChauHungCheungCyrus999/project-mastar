import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { Skeleton, Grid, Box, Container, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

import CreateProjectBtn from '../components/project/CreateProjectBtn';
import ProjectCard from '../components/project/ProjectCard';
import ProjectCreateForm from "../components/project/ProjectCreateForm";
import ProjectEditForm from '../components/project/ProjectEditForm';
import ConfirmDeleteDialog from '../components/custom/ConfirmDeleteDialog';

import ProjectTaskCount from '../components/project-dashboard/ProjectTaskCount';
import UserUpcomingTasks from '../components/project-dashboard/UserUpcomingTasks';

import {
  handleCloseEditForm, handleCreate,
  handleEdit, handleSaveProject, /*handleDuplicate,*/
  handleDelete, confirmDelete, cancelDelete,
} from '../utils/ProjectUtils.js';

import { initProjects } from "../components/init/InitProjects";

import CssBaseline from '@mui/material/CssBaseline';

import { useTranslation } from 'react-i18next';

import UserContext from '../UserContext';

const ProjectDashboard = () => {
  const { user, setUser } = useContext(UserContext);
  
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const { t } = useTranslation();

  const [projects, setProjects] = useState([]/*initProjects()*/);
 
  // Skeleton
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false);
    }, 10);
  }, []);
  
  // Create
  const [isDialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    document.title = t('appName');
    return () => {
      document.title = t('appName');
    };
  }, []);

  useEffect(() => {
    fetchProjects();
  }, []);

  // Read
  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/projects`);
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  // Create
  const handleCreateProject = () => {
    setDialogOpen(true);
  };

  const handleCloseCreateDialog = (event, reason) => {
    if (reason && reason === "backdropClick")
      return;
    setDialogOpen(false);
  };
  

  // Update
  const [mode, setMode] = useState("update");
  const [editedProject, setEditedProject] = useState(null);
  const [isEditFormOpen, setEditFormOpen] = useState(false);

  // Delete
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [openConfirmDeleteDialog, setOpenConfirmDeleteDialog] = useState(false);

  // Close Project Edit Form
  const handleCloseForm = (event, reason) => {
    /*if (reason && reason === "backdropClick")
      return;*/
    handleCloseEditForm(setEditedProject, setEditFormOpen);
  };

  // Create
  const onCreate = async (newProject, setProjects) => {
    handleCreate(newProject, setProjects);
  };
  
  // Tag Setup
  const onTagManagement = (projectId) => {
    navigate(`/project/${projectId}/project-settings`);
    navigate(0);
  }

  // Update/Duplicate Project
  const onEdit = (projectId, mode) => {
    handleEdit(projectId, mode, projects, setMode, setEditedProject, setEditFormOpen);
  };
  
  const onSaveProject = (updatedProject) => {
    handleSaveProject(updatedProject, projects, setProjects);
  };
  
  /*const onDuplicate = (duplicatedProject) => {
    handleDuplicate(duplicatedProject, setProjects, setEditFormOpen);
  };*/

  const onDeleteClick = (projectId) => {
    handleDelete(projectId, setOpenConfirmDeleteDialog, setProjectToDelete);
  };

  const onConfirmDelete = () => {
    confirmDelete(projectToDelete, setProjects, setOpenConfirmDeleteDialog);
  };

  const onCancelDelete = () => {
    cancelDelete(setOpenConfirmDeleteDialog);
  };

  if (isLoading) {
    return (
      <Box sx={{ m: '1rem' }}>
        <Skeleton variant="subtitle2" width={300} height={40} />
        <Skeleton variant="text" width={400} height={40} />
  
        <Grid container spacing={2}>
          {[...Array(6)].map((item) => (
            <Grid item xs={12} md={4} lg={4} key={item}>
              <Skeleton variant="rounded" width="100%" height={300} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <div>
      <CssBaseline />

      <CreateProjectBtn setProjects={setProjects} mode="fab" />

      <Box id="user-greeting">
        <Typography variant="subtitle2" color="primary.main">
          {t('welcome') + t('comma') + user.firstName + " " + user.lastName + t('exclamationMark')}
          <AutoAwesomeIcon sx={{ color: '#FDCC0D' }} />
        </Typography>
        <Typography variant="body1" color="primary.dark">{t('exploreProject')}</Typography>
      </Box>

      {projects.length === 0 ? (
        <Grid container justifyContent="center">
          <Grid item>
            <Button
              variant="contained"
              onClick={handleCreateProject}
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            >
              {t('createFirstProject')}
            </Button>
          </Grid>
        </Grid>
      ) : (
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2} sx={{ mb: 1 }}>
            {projects.map((project, index) => {
              const userRole = project.teamMembers?.find(member => member._id === user._id)?.role;
              if (user.email === process.env.REACT_APP_ADMIN_EMAIL || userRole) {
                return (
                  <Grid item xs={12} md={4} lg={4} key={index}>
                    <div style={{ height: '100%' }}>
                      <ProjectCard project={project} handleTagManagement={onTagManagement} handleEdit={onEdit} handleDelete={onDeleteClick} role={userRole} />
                    </div>
                  </Grid>
                );
              }
              return null;
            })}
          </Grid>

          <Box sx={{ mb: 2 }}>
            <ProjectTaskCount />
          </Box>

          <UserUpcomingTasks />
        </Box>
      )}

      <ProjectCreateForm
        open={isDialogOpen}
        handleClose={handleCloseCreateDialog}
        handleAddProject={handleCreate}
      />

      {/* Edit Form */}
      {isEditFormOpen && (
        <ProjectEditForm
          project={editedProject}
          open={isEditFormOpen}
          handleClose={handleCloseForm}
          handleSave={onSaveProject}
        />
      )}

      {/* Confirmation Delete */}
      <ConfirmDeleteDialog
        title={t('deleteProject')}
        content={t('deleteProjectConfirm')}
        open={openConfirmDeleteDialog}
        onCancel={onCancelDelete}
        onConfirm={onConfirmDelete}
      />
    </div>
  );
};

export default ProjectDashboard;