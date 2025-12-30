import React, { useContext, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Container, Paper, Grid, Typography, Tab, Tabs, Box, ListItemText } from '@mui/material';

import Breadcrumb from '../components/Breadcrumb';

import { initProjects } from "../components/init/InitProjects";
import { initTasks } from "../components/init/InitTasks";

import ContactInfo from '../components/team/ContactInfo';
import StatisticsCard from '../components/team/StatisticsCard';
import ListTableSwitcher from '../components/task/ListTableSwitcher';
import AccountAvatar from '../components/AccountAvatar';

import UserContext from '../UserContext';
import { useNavigate } from "react-router-dom";

import { useTranslation } from 'react-i18next';

import { initUsers } from "../components/init/InitUsers";

// switch theme
import CssBaseline from '@mui/material/CssBaseline';

const Team = () => {
  const { user, setUser } = useContext(UserContext);
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
  useEffect(() => {
    fetchUserByProject();
  }, []);

  const { t } = useTranslation();

  const { projectId } = useParams();
  const [project, setProject] = useState([]/*initProjects()[0]*/); // useState([])
  const [tasks, setTasks] = useState([]/*initTasks()*/);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedTeamMember, setSelectedTeamMember] = useState({});
  
  // Statistics
  const [selectedStatus, setSelectedStatus] = useState(t('all'));
  const [selectedTeamMemberTasks, setSelectedTeamMemberTasks] = useState(tasks.filter(task => task.personInCharge.includes(selectedTeamMember._id)));
  const toDoTasks = selectedTeamMemberTasks.filter(task => task.status == 'To Do');
  const inProgressTasks = selectedTeamMemberTasks.filter(task => task.status == 'In Progress');
  const underReviewTasks = selectedTeamMemberTasks.filter(task => task.status == 'Under Review');
  const completedTasks = selectedTeamMemberTasks.filter(task => task.status == 'Done');
  const overdueTasks = selectedTeamMemberTasks.filter(task => task.endDate && task.endDate < new Date()+1 && task.status !== 'Done' && task.status !== 'Cancelled');
  const [statisticTasks, setStatisticTasks] = useState(selectedTeamMemberTasks);

  const navigate = useNavigate();
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Update page title
  useEffect(() => {
    document.title = t('appName') + ' - ' + t('team'); // Set the new page title
    return () => {
      document.title = t('appName') + ' - ' + t('team'); // Reset the page title when the component unmounts
    };
  }, []);

  // Read
  useEffect(() => {
    fetchProject();
    fetchTasks();
  }, []);

  const fetchProject = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/project/${projectId}`);
      if (response.status === 200) {
        //console.log("project = " + JSON.stringify(response.data));
        setProject(response.data);
        if (response.data.teamMembers.length > 0) {
          setSelectedTeamMember(response.data.teamMembers[0]);
          setSelectedTab(0);
        }
      } else {
        console.error('Error fetching project:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching project:', error);
    }
  };
  
  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/tasks/project/${projectId}`);
      if (response.status === 200) {
        //console.log("tasks = " + JSON.stringify(response.data));
        setTasks(response.data);
      } else {
        console.error('Error fetching tasks:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  // Tab
  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    const selectedMember = project.teamMembers[newValue];
    setSelectedTeamMember(selectedMember);
  };
  
  useEffect(() => {
    if (selectedTeamMember) {
      const filteredTasks = tasks.filter(task => {
        return task.personInCharge.some(person => person._id === selectedTeamMember._id);
      });
      setStatisticTasks(filteredTasks);
      setSelectedTeamMemberTasks(filteredTasks);
    }
  }, [selectedTeamMember, tasks]);


  return (
    <div>
      <CssBaseline />
      
      {user.email === process.env.REACT_APP_ADMIN_EMAIL || user?.role ? (
        project ? (
          <>
            <Breadcrumb projectTitle={project.title} page={t('team')} />
        
            {project.teamMembers && project.teamMembers.length > 0 ? (
              <Grid container>
                <Grid item xs={2}>
                  <Tabs
                    orientation="vertical"
                    variant="scrollable"
                    value={selectedTab}
                    onChange={handleTabChange}
                    aria-label={t('teamMembers')}
                    sx={{ borderRight: 1, borderColor: 'divider', pl: 2, overflowWrap: 'anywhere', height: '100%' }}
                  >
                    {project.teamMembers.map((teamMember, index) => (
                      /*<Tab key={index} label={teamMember} />*/
                      <Tab
                        key={index}
                        label={
                          <ListItemText
                            primary={`${teamMember?.firstName || ''} ${teamMember?.lastName || ''}`}
                            secondary={<span style={{ fontSize: "smaller" }}>{teamMember?.role}</span>}
                          />
                        }
                        icon={<AccountAvatar users={teamMember} displayPopper={false}/>}
                        iconPosition="start"
                        style={{ alignItems: "self", justifyContent: "flex-start" }}
                      />
                    ))}
                  </Tabs>
                </Grid>

                <Grid item xs={10}>
                  {user.email === process.env.REACT_APP_ADMIN_EMAIL || user?.permissions?.some(permission => permission === "readContactInfo") ? (
                    <Box p={2}>
                      <Typography component="h1" variant='subtitle2'>{t('contactInfo')}</Typography>
                      <ContactInfo selectedTeamMember={selectedTeamMember} />
                    </Box>
                  ) : null}
                  
                  {user.email === process.env.REACT_APP_ADMIN_EMAIL || user?.permissions?.some(permission => permission === "readStatistics") ? (
                    <>
                      <Box p={2}>
                        <Typography component="h1" variant='body1'>{t('statistics')}</Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6} md={4} lg={2}>
                            <StatisticsCard
                              label={t('totalTasks')}
                              value={selectedTeamMemberTasks.length}
                              onClick={() => {
                                setStatisticTasks(selectedTeamMemberTasks);
                                setSelectedStatus(t('totalTasks'));
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={4} lg={2}>
                            <StatisticsCard
                              label={t('toDoTasks')}
                              value={toDoTasks.length}
                              onClick={() => {
                                setStatisticTasks(toDoTasks);
                                setSelectedStatus(t('toDoTasks'));
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={4} lg={2}>
                            <StatisticsCard
                              label={t('inProgressTasks')}
                              value={inProgressTasks.length}
                              onClick={() => {
                                setStatisticTasks(inProgressTasks);
                                setSelectedStatus(t('inProgressTasks'));
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={4} lg={2}>
                            <StatisticsCard
                              label={t('underReviewTasks')}
                              value={underReviewTasks.length}
                              onClick={() => {
                                setStatisticTasks(underReviewTasks);
                                setSelectedStatus(t('underReviewTasks'));
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={4} lg={2}>
                            <StatisticsCard
                              label={t('completedTasks')}
                              value={completedTasks.length}
                              onClick={() => {
                                setStatisticTasks(completedTasks);
                                setSelectedStatus(t('completedTasks'));
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={4} lg={2}>
                            <StatisticsCard
                              label={t('overdueTasks')}
                              value={overdueTasks.length}
                              onClick={() => {
                                setStatisticTasks(overdueTasks);
                                setSelectedStatus(t('overdueTasks'));
                              }}
                            />
                          </Grid>
                        </Grid>
                      </Box>

                      <Box p={2}>
                        <Typography component="h1" variant='body1'>{selectedStatus}</Typography>
                        {/*<Typography variant="body1">{selectedTeamMember}{t('apostropheS')}{t('task')}</Typography>*/}
                        <ListTableSwitcher
                          project={project}
                          //tasks={tasks}
                          tasks={statisticTasks}
                          setTasks={setTasks}
                          displayCheckbox={false}
                          displayToolbar={true}
                          //columnsToShow={columnsToShow}
                          displayTab={true}
                          displayProjectSelector={false}
                          displayMilestoneSelector={true}
                        />
                      </Box>
                    </>
                  ) : null}
                </Grid>
              </Grid>
            ) : (
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
                    {t('noTeamMemberInProject')}
                  </Typography>
                </Grid>
              </Grid>
            )}
          </>
        ) : null
      ) : (
        <Typography variant="body2" component="div" color="error" sx={{ m: '1rem' }}>
          {t('noAuthorization')}
        </Typography>
      )}
    </div>
  );
};

export default Team;