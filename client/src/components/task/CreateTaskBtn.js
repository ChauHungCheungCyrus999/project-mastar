import React, { useState } from 'react';
import axios from 'axios';
import { Tooltip, Fab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

import TaskCreateForm from './TaskCreateForm';
import { useTranslation } from 'react-i18next';

const CreateTaskBtn = ({ setTasks }) => {
  const { t } = useTranslation();
  
  const [isCreateFormOpen, setCreateFormOpen] = useState(false);
  const projectId = window.location.href.split("/")[4];

  // Create
  const handleAddTask = async (newTask) => {
    try {
      console.log('Creating task with data:', JSON.stringify(newTask, null, 2));
      const response = await axios.post(`${process.env.REACT_APP_SERVER_HOST}/api/task`, newTask);
      console.log('Task created successfully:', response.data);
      setTasks((prevTasks) => [...prevTasks, response.data]);
    } catch (error) {
      console.error('Error adding task:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);

      // Show error message to user
      const errorMessage = error.response?.data?.error || error.message || 'Failed to create task';
      alert(`Failed to create task: ${errorMessage}`);

      // Re-throw the error so the form doesn't close
      throw error;
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
      <Tooltip title={t('createTask')}>
        <Fab color="primary" onClick={handleOpenCreateForm} sx={{ position: 'fixed', bottom: { xs:'4rem', sm:'1rem', md:'1rem', lg:'1rem', xl:'1rem' }, right: '1rem' }}>
          <AddIcon />
        </Fab>
      </Tooltip>

      <TaskCreateForm
        projectId={projectId}
        open={isCreateFormOpen}
        handleClose={handleCloseCreateForm}
        handleAddTask={handleAddTask}
      />
    </div>
  );
};

export default CreateTaskBtn;
