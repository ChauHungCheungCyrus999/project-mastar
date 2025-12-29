import React, { useContext, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
  useMediaQuery, Stack, Grid, Typography, InputAdornment, Box, TextField, Tooltip, ButtonGroup, Button, Paper, Tabs, Tab
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useNavigate } from "react-router-dom";
import { Home, Folder, Group, Search, RecentActors, TableChart, Groups, ViewTimelineOutlined } from '@mui/icons-material';

import MainContent from '../components/MainContent';
import ContactInfo from '../components/team/ContactInfo';
import ListTableSwitcher from '../components/task/ListTableSwitcher';
import CDialog from '../components/custom/CDialog';
import TeamMemberCard from '../components/team/TeamMemberCard';
import TeamTaskTable from '../components/team/TeamTaskTable';
import TeamSchedule from '../components/team/TeamSchedule';

import UserContext from '../UserContext';

const Team = () => {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const theme = useTheme();
  
  const isTablet = useMediaQuery('(max-width:900px)');

  const { t } = useTranslation();

  const { projectId } = useParams();
  const [project, setProject] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedTeamMember, setSelectedTeamMember] = useState({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTeamMemberTasks, setSelectedTeamMemberTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState('card');
  const [tabIndex, setTabIndex] = useState(0);

  const breadcrumbItems = [
    { label: 'home', href: '/', icon: <Home sx={{ mr: 0.5 }} fontSize="inherit" /> },
    { label: project?.title, href: `/project/${projectId}/dashboard`, icon: <Folder sx={{ mr: 0.5 }} fontSize="inherit" /> },
    { label: 'team', icon: <Group sx={{ mr: 0.5 }} fontSize="inherit" /> },
  ];

  useEffect(() => {
    const fetchUserByProject = async () => {
      if (user?.email !== process.env.REACT_APP_ADMIN_EMAIL) {
        try {
          const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/project/${projectId}/teamMember/${user._id}`);
          setUser(response.data);
        } catch (error) {
          console.error('Error fetching user by project:', error);
        }
      }
    };

    if (user) {
      fetchUserByProject();
    } else {
      navigate('/login');
    }
  }, [user, navigate, projectId, setUser]);

  useEffect(() => {
    fetchProject();
    fetchTasks();
  }, []);

  const fetchProject = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/project/${projectId}`);
      if (response.status === 200) {
        setProject(response.data);
        if (response.data.teamMembers.length > 0) {
          setSelectedTeamMember(response.data.teamMembers[0]);
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
        setTasks(response.data);
      } else {
        console.error('Error fetching tasks:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  useEffect(() => {
    if (selectedTeamMember) {
      const filteredTasks = tasks.filter(task => task.personInCharge.some(person => person._id === selectedTeamMember._id));
      setSelectedTeamMemberTasks(filteredTasks);
    }
  }, [selectedTeamMember, tasks]);

  const handleTeamMemberClick = (teamMember) => {
    setSelectedTeamMember(teamMember);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleViewChange = (newView) => {
    setView(newView);
  };

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const getTaskCount = (teamMember, status) => {
    return tasks.filter(task => task.personInCharge.some(person => person._id === teamMember._id)).filter(task => task.status === status).length;
  };

  const filteredTeamMembers = project.teamMembers?.filter(member =>
    `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainContent pageTitle={t('team')} breadcrumbItems={breadcrumbItems}>
      <Tabs value={tabIndex} onChange={handleTabChange} aria-label="team tabs" sx={{ mb: 1 }}>
        <Tab label={`${t('members')} (${filteredTeamMembers?.length})`} icon={<Groups/>} />
        <Tab label={t('teamSchedule')} icon={<ViewTimelineOutlined />} />
      </Tabs>

      {tabIndex === 0 && (
        <Paper variant="outlined" sx={{ p:2 }}>
          <Stack direction="row" justifyContent="space-between">
            <ButtonGroup size="small" aria-label="view switcher">
              <Tooltip title={t('cardView')}>
                <Button
                  onClick={() => handleViewChange('card')}
                  sx={{
                    backgroundColor: view === 'card' ? theme.palette.primary.main : 'inherit',
                    color: view === 'card' ? 'white' : theme.palette.primary.main
                  }}
                >
                  <RecentActors />
                </Button>
              </Tooltip>
              <Tooltip title={t('tableView')}>
                <Button
                  onClick={() => handleViewChange('table')}
                  sx={{
                    backgroundColor: view === 'table' ? theme.palette.primary.main : 'inherit',
                    color: view === 'table' ? 'white' : theme.palette.primary.main
                  }}
                >
                  <TableChart />
                </Button>
              </Tooltip>
            </ButtonGroup>

            <TextField
              size="small"
              label={t('search')}
              variant="outlined"
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end" size="small">
                    <Search fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Stack>

          <Box sx={{ mt: 2 }} className="print-container">
            {view === 'card' ? (
              project.teamMembers && project.teamMembers.length > 0 ? (
                <Grid container spacing={2}>
                  {filteredTeamMembers.map((teamMember) => (
                    <Grid item xs={6} sm={4} md={3} lg={2} key={teamMember._id}>
                      <TeamMemberCard
                        teamMember={teamMember}
                        tasks={tasks}
                        handleTeamMemberClick={handleTeamMemberClick}
                        getTaskCount={getTaskCount}
                      />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Grid container justifyContent="center">
                  <Grid item>
                    <Typography style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                      {t('noTeamMemberInProject')}
                    </Typography>
                  </Grid>
                </Grid>
              )
            ) : (
              <TeamTaskTable
                filteredTeamMembers={filteredTeamMembers}
                tasks={tasks}
                t={t}
                handleTeamMemberClick={handleTeamMemberClick}
                getTaskCount={getTaskCount}
              />
            )}
          </Box>
        </Paper>
      )}

      {tabIndex === 1 && (
        <Paper variant="outlined">
          <TeamSchedule projectId={projectId} />
        </Paper>
      )}

      <CDialog
        mode="read"
        open={isDialogOpen}
        onClose={handleCloseDialog}
        title={t('teamMemberDetails')}
      >
        {user.email === process.env.REACT_APP_ADMIN_EMAIL || user?.permissions?.some(permission => permission === "readContactInfo") ? (
          <Box>
            <ContactInfo selectedTeamMember={selectedTeamMember} />
          </Box>
        ) : null}

        {user.email === process.env.REACT_APP_ADMIN_EMAIL || user?.permissions?.some(permission => permission === "readStatistics") ? (
          <Box mt={2}>
            <ListTableSwitcher
              project={project}
              tasks={selectedTeamMemberTasks}
              setTasks={setTasks}
              displayCheckbox={false}
              displayToolbar={true}
              displayTab={true}
              displayProjectSelector={false}
              displayMilestoneSelector={true}
            />
          </Box>
        ) : null}
      </CDialog>
    </MainContent>
  );
};

export default Team;