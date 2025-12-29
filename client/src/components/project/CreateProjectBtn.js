import React, { useState } from 'react';
import axios from 'axios';
import { Button, IconButton, Tooltip, Fab } from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

import ProjectCreateForm from './ProjectCreateForm';

import { useTranslation } from 'react-i18next';

const CreateProjectBtn = ({ setProjects, setFilteredProjects, mode, isCreateFormOpen, setCreateFormOpen }) => {
  const { t } = useTranslation();

  // Use internal state if not controlled from parent
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = isCreateFormOpen !== undefined ? isCreateFormOpen : internalIsOpen;
  const setIsOpen = setCreateFormOpen || setInternalIsOpen;
  
  // Create
  const handleAddProject = async (newProject) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_SERVER_HOST}/api/project`, newProject);
      setProjects((prevProjects) => [...prevProjects, response.data]);
      if (setFilteredProjects) {
        setFilteredProjects((prevProjects) => [...prevProjects, response.data]);
      }
    } catch (error) {
      console.error('Error adding project:', error);
    }
  };

  const handleOpenCreateForm = () => {
    setIsOpen(true);
  };

  const handleCloseCreateForm = (event, reason) => {
    if (reason && reason === "backdropClick")
      return;
    setIsOpen(false);
  };

  return (
    <div>
      {mode!=="fab"? (
        <IconButton
          onClick={handleOpenCreateForm}
          // Use sx color instead of invalid palette key for MUI color prop
          sx={{ ml: 'auto', color: 'text.secondary' }}
        >
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
        open={isOpen}
        handleClose={handleCloseCreateForm}
        handleAddProject={handleAddProject}
      />
    </div>
  );
};

export default CreateProjectBtn;