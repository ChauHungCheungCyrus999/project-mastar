import React, { useContext, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useMediaQuery, Grid, Box, Tooltip, Button } from '@mui/material';
import { Home, Folder, Dashboard, DashboardCustomize } from '@mui/icons-material';

import ProjectInformation from '../components/task-dashboard/ProjectInformation';
import AnnouncementList from '../components/project-dashboard/AnnouncementList';
import ProjectCalendar from '../components/task-dashboard/ProjectCalendar';
import ProjectDuration from '../components/task-dashboard/ProjectDuration';
import TaskCompletionRate from '../components/task-dashboard/TaskCompletionRate';
import MilestoneOverview from '../components/task-dashboard/MilestoneOverview';
import MilestoneStatusDistribution from '../components/task-dashboard/MilestoneStatusDistribution';
import TaskVelocity from '../components/task-dashboard/TaskVelocity';
import TaskCounts from '../components/task-dashboard/TaskCounts';
import TeamPerformance from '../components/task-dashboard/TeamPerformance';
import TagDistribution from '../components/task-dashboard/TagDistribution';
//import Next7DaysTasks from '../components/task-dashboard/Next7DaysTasks';
import UpcomingTasks from '../components/task-dashboard/UpcomingTasks';
import OverdueTasks from '../components/task-dashboard/OverdueTasks';
import TaskCompletionTrend from '../components/task-dashboard/TaskCompletionTrend';
import BurnDownChart from '../components/task-dashboard/BurnDownChart';

import MainContent from '../components/MainContent';
import CreateTaskBtn from '../components/task/CreateTaskBtn';

import { initProjects } from "../components/init/InitProjects";
import { initTasks } from "../components/init/InitTasks";

import { useTranslation } from 'react-i18next';

import UserContext from '../UserContext';

const TaskDashboard = () => {
  const { user, setUser } = useContext(UserContext);
  
  const isTablet = useMediaQuery('(max-width:900px)');

  const { t } = useTranslation();

  const navigate = useNavigate();

  const { projectId } = useParams();
  const [project, setProject] = useState(/*initProjects()[0]*/);
  const [milestones, setMilestones] = useState([]);
  const [tasks, setTasks] = useState([]/*initTasks()*/);
  
  const breadcrumbItems = [
    { label: 'home', href: '/', icon: <Home sx={{ mr: 0.5 }} fontSize="inherit" /> },
    { label: project?.title, icon: <Folder sx={{ mr: 0.5 }} fontSize="inherit" /> },
    { label: 'dashboard', icon: <Dashboard sx={{ mr: 0.5 }} fontSize="inherit" /> },
  ];

  const fetchUserByProject = async () => {
    if (user?.email !== process.env.REACT_APP_ADMIN_EMAIL) {
      try {
        const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/project/${projectId}/teamMember/${user._id}`);
        //console.log("user = " + JSON.stringify(response.data));
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user by project:', error);
      }
    }
  };

  // Read
  useEffect(() => {
    fetchProject();
    fetchMilestones();
    fetchTasks();
    fetchUserByProject();
    //setUser(project.teamMembers.find(person => person._id === user._id));
  }, []);

  const fetchProject = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/project/${projectId}`);
      //setProject(response.data);
      const projectData = response.data;
      //const userRole = projectData.teamMembers.find(member => member._id === user._id)?.role;
      setProject(projectData);
    } catch (error) {
      console.error('Error fetching project:', error);
    }
  };

  const fetchMilestones = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/milestones/project/${projectId}/active`);
      setMilestones(response.data);
    } catch (error) {
      console.error('Error fetching milestones:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/tasks/project/${projectId}`);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  return (
    <MainContent
      pageTitle={t('dashboard')}
      breadcrumbItems={breadcrumbItems}
      actions={
        <Tooltip title={t('dashboardConfigDesc')}>
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<DashboardCustomize />}
            onClick={() => navigate('/dashboard-config')}
            sx={{ mb: 1}}
          >
            {t('dashboardConfig')}
          </Button>
        </Tooltip>
      }
    >
      {project && (
        <>
          <Box>
            <Grid container spacing={2}>
              <Grid item xs={12} md={12} lg={6}>
                <ProjectInformation project={project} />
              </Grid>
              <Grid item xs={12} md={12} lg={6}>
                <AnnouncementList
                  dashboardId="Task Dashboard"
                  cardId="Announcement"
                />
              </Grid>
            </Grid>
          </Box>

          {tasks && tasks.length > 0 ? (
            <Box>
              {/*{user.email === process.env.REACT_APP_ADMIN_EMAIL || user?.role?.permissions?.some(permission => permission.name === "readProjectCalendar") ? (
                <Box maxWidth="100%" sx={{ mt: 2, mb: 2 }}>
                  <ProjectCalendar project={project} tasks={tasks} />
                </Box>
              ) : null}*/}

              <Box maxWidth="100%" sx={{ mt: 2, mb: 2 }}>
                <Grid container spacing={2}>
                  {user.email === process.env.REACT_APP_ADMIN_EMAIL || user?.role?.permissions?.some(permission => permission.name === "readProjectDuration") ? (
                    <Grid item xs={12} md={4} lg={3}>
                      <ProjectDuration project={project} tasks={tasks} />
                    </Grid>
                  ) : null}
                  {user.email === process.env.REACT_APP_ADMIN_EMAIL || user?.role?.permissions?.some(permission => permission.name === "readTaskCompletionRate") ? (
                    <Grid item xs={12} md={4} lg={3}>
                      <TaskCompletionRate project={project} tasks={tasks} setTasks={setTasks} />
                    </Grid>
                  ) : null}
                  {user.email === process.env.REACT_APP_ADMIN_EMAIL || user?.role?.permissions?.some(permission => permission.name === "readTaskVelocity") ? (
                    <Grid item xs={12} md={4} lg={3}>
                      <TaskVelocity project={project} tasks={tasks} />
                    </Grid>
                  ) : null}
                </Grid>
              </Box>

              {user.email === process.env.REACT_APP_ADMIN_EMAIL || user?.role?.permissions?.some(permission => permission.name === "readDistribution") ? (
                <Box maxWidth="100%" sx={{ mt: 2, mb: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4} lg={3}>
                      <TaskCounts
                        dashboardId="Task Dashboard"
                        cardId="Status Distribution"
                        project={project}
                        criteria="status"
                        displayProjectSelector={false}
                        displayMilestoneSelector={true}
                      />
                    </Grid>
                    <Grid item xs={12} md={4} lg={3}>
                      <TaskCounts
                        dashboardId="Task Dashboard"
                        cardId="Priority Distribution"
                        project={project}
                        criteria="priority"
                        displayProjectSelector={false}
                        displayMilestoneSelector={true}
                      />
                    </Grid>
                    <Grid item xs={12} md={4} lg={3}>
                      <TaskCounts
                        dashboardId="Task Dashboard"
                        cardId="Difficulty Level Distribution"
                        project={project}
                        criteria="difficultyLevel"
                        displayProjectSelector={false}
                        displayMilestoneSelector={true}
                      />
                    </Grid>
                  </Grid>
                </Box>
              ) : null}

              {milestones.length > 0 && (
                <Box maxWidth="100%" sx={{ mt: 2, mb: 2 }}>
                  <Grid container spacing={2}>
                    {(user.email === process.env.REACT_APP_ADMIN_EMAIL || 
                      user?.role?.permissions?.some(permission => permission.name === "readMilestoneOverview")) && (
                      <Grid item xs={12} md={6} lg={6}>
                        <MilestoneOverview project={project} tasks={tasks} />
                      </Grid>
                    )}
                    {(user.email === process.env.REACT_APP_ADMIN_EMAIL || 
                      user?.role?.permissions?.some(permission => permission.name === "readMilestoneStatusDistribution")) && (
                      <Grid item xs={12} md={6} lg={6}>
                        <MilestoneStatusDistribution project={project} setTasks={setTasks} />
                      </Grid>
                    )}
                  </Grid>
                </Box>
              )}

              <Box maxWidth="100%" sx={{ mt: 2, mb: 2 }}>
                <Grid container spacing={2}>
                  {user.email === process.env.REACT_APP_ADMIN_EMAIL || user?.role?.permissions?.some(permission => permission.name === "readBurnDownChart") ? (
                    <Grid item xs={12} md={12} lg={6}>
                      <BurnDownChart project={project} tasks={tasks} setTasks={setTasks} />
                    </Grid>
                  ) : null}
                  {user.email === process.env.REACT_APP_ADMIN_EMAIL || user?.role?.permissions?.some(permission => permission.name === "readTaskCompletionTrend") ? (
                    <Grid item xs={12} md={12} lg={6}>
                      <TaskCompletionTrend project={project} />
                    </Grid>
                  ) : null}
                </Grid>
              </Box>
              
              <Box maxWidth="100%" sx={{ mt: 2, mb: 2 }}>
                <Grid container spacing={2}>
                  {user.email === process.env.REACT_APP_ADMIN_EMAIL || user?.role?.permissions?.some(permission => permission.name === "readTagDistribution") ? (
                    <Grid item xs={12} md={6} lg={6}>
                      <TagDistribution project={project} />
                    </Grid>
                  ) : null}
                  {user.email === process.env.REACT_APP_ADMIN_EMAIL || user?.role?.permissions?.some(permission => permission.name === "readTeamPerformance") ? (
                    <Grid item xs={12} md={6} lg={6}>
                      <TeamPerformance project={project} tasks={tasks} setTasks={setTasks} />
                    </Grid>
                  ) : null}
                </Grid>
              </Box>

              <Box maxWidth="100%" sx={{ mt: 2, mb: 2 }}>
                <Grid container spacing={2}>
                  {/*{user.email === process.env.REACT_APP_ADMIN_EMAIL || user?.role?.permissions?.some(permission => permission.name === "readNext7DaysTasks") ? (
                    <Grid item xs={12} md={6} lg={6}>
                      <Next7DaysTasks project={project} tasks={tasks} setTasks={setTasks} />
                    </Grid>
                  ) : null}*/}

                  {user.email === process.env.REACT_APP_ADMIN_EMAIL || user?.role?.permissions?.some(permission => permission.name === "readUpcomingTasks") ? (
                    <Grid item xs={12} md={6} lg={6}>
                      <UpcomingTasks project={project} tasks={tasks} setTasks={setTasks} />
                    </Grid>
                  ) : null}

                  {user.email === process.env.REACT_APP_ADMIN_EMAIL || user?.role?.permissions?.some(permission => permission.name === "readOverdueTasks") ? (
                    <Grid item xs={12} md={6} lg={6}>
                      <OverdueTasks project={project} tasks={tasks} setTasks={setTasks} />
                    </Grid>
                  ) : null}
                </Grid>
              </Box>
            </Box>
          ) : (
            <>
              {/*{tasks && tasks.length === 0 && (
                <Grid container justifyContent="center">
                  <Grid item>
                    <Typography
                      style={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      {t('noTaskInProject')}
                    </Typography>
                  </Grid>
                </Grid>
              )}*/}

              {user.email === process.env.REACT_APP_ADMIN_EMAIL || user?.role?.permissions?.some(permission => permission.name === "createTask") ? (
                <CreateTaskBtn setTasks={setTasks} />
              ) : null}
            </>
          )}
        </>
      )}
    </MainContent>
  );
};
  
export default TaskDashboard;