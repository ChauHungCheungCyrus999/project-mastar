import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Grid, Typography, Button } from '@mui/material';
import { Home, Assignment } from '@mui/icons-material';

import MainContent from '../components/MainContent';
import TaskEditForm from '../components/task/TaskEditForm';
import ErrorPage from './ErrorPage';

import { initProjects } from "../components/init/InitProjects";
import { initTasks } from "../components/init/InitTasks";

import { useTranslation } from 'react-i18next';

import CssBaseline from '@mui/material/CssBaseline';

const TaskPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const breadcrumbItems = [
    { label: 'home', href: '/', icon: <Home sx={{ mr: 0.5 }} fontSize="inherit" /> },
    { label: 'task', icon: <Assignment sx={{ mr: 0.5 }} fontSize="inherit" /> },
  ];

  const { projectId } = useParams();
  const taskId = window.location.href.split("/")[6];
  
  const [project, setProject] = useState(/*initProjects()[0]*/);
  const [task, setTask] = useState(/*initTasks()[taskId]*/);

  // Read
  useEffect(() => {
    fetchProject();
    fetchTask();
  }, []);

  const fetchProject = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/project/${projectId}`);
      setProject(response.data);
    } catch (error) {
      console.error('Error fetching project:', error);
    }
  };

  const fetchTask = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/task/${taskId}`);
      setTask(response.data);
    } catch (error) {
      console.error('Error fetching task:', error);
    }
  };

  // Update
  const handleSaveTask = async (updatedTask) => {
    try {
      //console.log("updatedTask = " + JSON.stringify(updatedTask));
      const response = await axios.put(`${process.env.REACT_APP_SERVER_HOST}/api/task/${updatedTask._id}`, updatedTask);
      setTask(response.data);
      //handleCloseEditForm();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleCloseEditForm = (event, reason) => {
    if (reason && reason === "backdropClick")
      return;
    navigate(`/project/${projectId}/progress`);
  };

  return (
    <div>
      <CssBaseline />
      
      {project && (
        <MainContent pageTitle={project.title} breadcrumbItems={breadcrumbItems}>
          {task ? (
            <TaskEditForm
              taskId={task._id}
              //setTasks={setTasks}
              mode="share"
              open="true"
              handleClose={handleCloseEditForm}
              handleSave={handleSaveTask}
              //setTaskToDelete={setTaskToDelete}
              //setOpenConfirmDeleteDialog={setOpenConfirmDeleteDialog}
            />
          ) : (
            <ErrorPage title={t('taskNotFound')} body={t('taskNotFoundDesc')} />
          )}
        </MainContent>
      )}
    </div>
  );
};

export default TaskPage;