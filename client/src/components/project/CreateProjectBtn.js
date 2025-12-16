import React, { useState } from 'react';
import axios from 'axios';
import { Button, IconButton, Tooltip, Fab } from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

import ProjectCreateForm from './ProjectCreateForm';

import { useTranslation } from 'react-i18next';

const CreateProjectBtn = ({ setProjects, setFilteredProjects, mode }) => {
  const { t } = useTranslation();

  const [isCreateFormOpen, setCreateFormOpen] = useState(false);
  
  // Create
  const handleAddProject = async (newProject) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_SERVER_HOST}/api/project`, newProject);
      setProjects((prevProjects) => [...prevProjects, response.data]);
      setFilteredProjects((prevProjects) => [...prevProjects, response.data]);
    } catch (error) {
      console.error('Error adding project:', error);
    }
  };

  const handleOpenCreateForm = () => {
    setCreateFormOpen(true);
  };

  const handleCloseCreateForm = (event, reason) => {
    if (reason && reason === "backdropClick")
      return;
    setCreateFormOpen(false);
  };

  return (
    <div>
      {mode!=="fab"? (
        <IconButton onClick={handleOpenCreateForm} color="text.secondary" sx={{ ml: 'auto' }}>
          <Tooltip title={t('createProject')}>
            <AddCircleOutlineIcon />
          </Tooltip>
        </IconButton>
      ) : (
        <Tooltip title={t('createProject')}>
          <Fab color="primary" onClick={handleOpenCreateForm} sx={{ position: 'fixed', bottom: '1rem', right: '1rem' }}>
            <AddIcon />
          </Fab>
        </Tooltip>
      )}
      
      <ProjectCreateForm
        open={isCreateFormOpen}
        handleClose={handleCloseCreateForm}
        handleAddProject={handleAddProject}
      />
    </div>
  );
};

export default CreateProjectBtn;