import React, { useContext, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import { Grid, Stack, Box, Paper, Typography, Tooltip, IconButton, useMediaQuery } from '@mui/material';
import { Home, Folder, Assignment, DeleteSweepOutlined } from '@mui/icons-material';

import MainContent from '../components/MainContent';
import ModeSwitcher from '../components/ModeSwitcher';
import CreateTaskBtn from '../components/task/CreateTaskBtn';
import TaskSearchBar from '../components/task/TaskSearchBar';
import ExportDropDown from '../components/task/ExportDropDown';
import ImportTasks from '../components/task/ImportTasks';
import TaskBoard from '../components/task/TaskBoard';
//import MilestoneTaskList from '../components/task/MilestoneTaskList';
import TaskListByMilestone from '../components/task/TaskListByMilestone';
import TabbedTaskList from '../components/task/TabbedTaskList';
import TaskTable from '../components/task/TaskTable';
import TaskImpactEffortMatrix from '../components/task/TaskImpactEffortMatrix';
import TaskCalendar from '../components/task/TaskCalendar';
import TaskGanttChart from '../components/task/TaskGanttChart';
import TaskFilters from '../components/task/TaskFilters';
import ShowTaskDetails from '../components/task/ShowTaskDetails';
import SortBy from '../components/task/SortBy';
import CDialog from '../components/custom/CDialog';
import ListTableSwitcher from '../components/task/ListTableSwitcher';

import { capitalizeWordsExceptFirst } from '../utils/StringUtils.js';

import { initProjects } from "../components/init/InitProjects";
import { initTasks } from "../components/init/InitTasks";

import UserContext from '../UserContext';
import { useNavigate } from "react-router-dom";

import { useTranslation } from 'react-i18next';

const TaskProgress = () => {
  const { user, setUser } = useContext(UserContext);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width:600px)');

  const { projectId } = useParams();
  const [project, setProject] = useState(/*initProjects()[0]*/);
  const [tasks, setTasks] = useState([]/*initTasks()*/);
  const [filteredTasks, setFilteredTasks] = useState(tasks);
  
  const [selectedColor, setSelectedColor] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  
  const [displayMyTasksOnly, setDisplayMyTasksOnly] = useState(false);
  const [displayOverdueTasksOnly, setDisplayOverdueTasksOnly] = useState(false);
  
  const storedSelectedMilestone = localStorage.getItem('selectedMilestone');
  const [selectedMilestone, setSelectedMilestone] = useState(storedSelectedMilestone ? storedSelectedMilestone : "");
  
  const storedSelectedTags = localStorage.getItem('selectedTags');
  const [selectedTags, setSelectedTags] = useState(storedSelectedTags ? JSON.parse(storedSelectedTags) : []);
  
  const storedSelectedTeamMembers = localStorage.getItem('selectedTeamMembers');
  const [selectedTeamMembers, setSelectedTeamMembers] = useState(storedSelectedTeamMembers ? JSON.parse(storedSelectedTeamMembers) : []);
  
  const [periodFilter, setPeriodFilter] = useState({ startDate: null, endDate: null, actualStartDate: null, actualEndDate: null});
  
  const storedDisplayMode = localStorage.getItem('displayMode');
  const [displayMode, setDisplayMode] = useState(storedDisplayMode || (isMobile? 'TaskList':'TaskBoard'));
  
  const [showCancelledTasksDialog, setShowCancelledTasksDialog] = useState(false);

  const breadcrumbItems = [
    { label: 'home', href: '/', icon: <Home sx={{ mr: 0.5 }} fontSize="inherit" /> },
    { label: project?.title, href: `/project/${projectId}/dashboard`, icon: <Folder sx={{ mr: 0.5 }} fontSize="inherit" /> },
    { label: 'progress', icon: <Assignment sx={{ mr: 0.5 }} fontSize="inherit" /> },
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
  }, [/*user, navigate, projectId, setUser*/]);

  useEffect(() => {
    document.title = `${t('appName')} - ${t('progress')}`;
    return () => {
      document.title = `${t('appName')} - ${t('progress')}`;
    };
  }, [t]);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/project/${projectId}`);
        setProject(response.data);
      } catch (error) {
        console.error('Error fetching project:', error);
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

    fetchProject();
    fetchTasks();
  }, [projectId]);

  // Socket.IO for real-time updates
  useEffect(() => {
    if (user && user._id) {
      const socket = io(process.env.REACT_APP_SERVER_HOST);

      socket.on('connect', () => {
        console.log('Connected to server for task updates');
        socket.emit('setUserId', user._id);
      });

      socket.on('taskMoved', (data) => {
        console.log('Task moved:', data);
        if (data.oldProjectId === projectId || data.newProjectId === projectId) {
          // Refetch tasks for the current project
          const fetchTasks = async () => {
            try {
              const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/tasks/project/${projectId}`);
              setTasks(response.data);
            } catch (error) {
              console.error('Error refetching tasks after move:', error);
            }
          };
          fetchTasks();
        }
      });

      socket.on('taskCreated', (data) => {
        console.log('Task created:', data);
        if (data.project === projectId) {
          setTasks((prevTasks) => [...prevTasks, data.task]);
        }
      });

      socket.on('taskUpdated', (data) => {
        console.log('Task updated:', data);
        if (data.task.project === projectId) {
          setTasks((prevTasks) =>
            prevTasks.map((task) => (task._id === data.task._id ? data.task : task))
          );
        }
      });

      socket.on('taskDeleted', (data) => {
        console.log('Task deleted:', data);
        setTasks((prevTasks) => prevTasks.filter((task) => task._id !== data.taskId));
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [user, projectId]);

  // Display Status
  const [statusValue, setStatusValue] = useState({
    "To Do": true,
    "In Progress": true,
    "Under Review": true,
    "Done": true,
    "On Hold": true,
    "Cancelled": true,
    "": true
  });

  // Display Priority
  const [priorityValue, setPriorityValue] = useState({
    "Very High": true,
    "High": true,
    "Medium": true,
    "Low": true,
    "Very Low": true,
    "": true
  });

  // Display Difficulty Level
  const [difficultyLevelValue, setDifficultyLevelValue] = useState({
    "Very Difficult": true,
    "Difficult": true,
    "Moderate": true,
    "Easy": true,
    "": true
  });
  
  useEffect(() => {
    const storedDisplayMyTasksOnly = localStorage.getItem('displayMyTasksOnly');
    if (storedDisplayMyTasksOnly) {
      setDisplayMyTasksOnly(JSON.parse(storedDisplayMyTasksOnly));
    }

    const storedDisplayOverdueTasksOnly = localStorage.getItem('displayOverdueTasksOnly');
    if (storedDisplayOverdueTasksOnly) {
      setDisplayOverdueTasksOnly(JSON.parse(storedDisplayOverdueTasksOnly));
    }
  }, []);

  // Optimize filtering with useMemo for better performance
  useEffect(() => {
    // Early return if no tasks
    if (tasks.length === 0) {
      setFilteredTasks([]);
      return;
    }

    // Pre-calculate filter values for better performance
    const hasActiveFilters = Object.values(statusValue).some(value => !value) ||
                           Object.values(priorityValue).some(value => !value) ||
                           Object.values(difficultyLevelValue).some(value => !value) ||
                           selectedColor ||
                           displayMyTasksOnly ||
                           displayOverdueTasksOnly ||
                           selectedMilestone ||
                           selectedTeamMembers.length > 0 ||
                           selectedTags.length > 0 ||
                           searchTerm ||
                           periodFilter.startDate ||
                           periodFilter.endDate ||
                           periodFilter.actualStartDate ||
                           periodFilter.actualEndDate;

    // If no filters are active, return all tasks
    if (!hasActiveFilters) {
      setFilteredTasks(tasks);
      return;
    }

    const filterTasks = () => {
      const filtered = tasks.filter((task) => {
        // Basic status filters (fast)
        if (!statusValue[task.status]) return false;
        if (!priorityValue[task.priority || '']) return false;
        if (!difficultyLevelValue[task.difficultyLevel || '']) return false;

        // Color filter
        if (selectedColor && (!task.color || !task.color.includes(selectedColor))) {
          return false;
        }

        // My tasks filter
        if (displayMyTasksOnly && (!task.personInCharge || !task.personInCharge.some(person => person._id === user._id))) {
          return false;
        }

        // Overdue tasks filter
        if (displayOverdueTasksOnly && (!task.endDate || task.endDate >= new Date() + 1 || task.status === 'Done' || task.status === 'Cancelled')) {
          return false;
        }

        // Milestone filter
        if (selectedMilestone && task.milestone?._id !== selectedMilestone._id) {
          return false;
        }

        // Team members filter
        if (selectedTeamMembers.length > 0) {
          const selectedMemberIds = selectedTeamMembers.map(member => member._id);
          if (!task.personInCharge?.some(person => selectedMemberIds.includes(person._id))) {
            return false;
          }
        }

        // Tags filter
        if (selectedTags.length > 0) {
          const tagIds = selectedTags.map(tag => tag._id);
          if (!task.tags?.some(tag => tagIds.includes(tag._id))) {
            return false;
          }
        }

        // Search filter (most expensive - do this last)
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          const matchesSearch =
            (task.taskName && task.taskName.toLowerCase().includes(searchLower)) ||
            (task.milestone && task.milestone.title?.toLowerCase().includes(searchLower)) ||
            (task.category && task.category.toLowerCase().includes(searchLower)) ||
            (task.description && task.description.toLowerCase().includes(searchLower)) ||
            (task.status && (task.status.toLowerCase().includes(searchLower) || t(capitalizeWordsExceptFirst(task.status)).toLowerCase().includes(searchLower))) ||
            (task.priority && (task.priority.toLowerCase().includes(searchLower) || t(capitalizeWordsExceptFirst(task.priority)).toLowerCase().includes(searchLower))) ||
            (task.difficultyLevel && (task.difficultyLevel.toLowerCase().includes(searchLower) || t(capitalizeWordsExceptFirst(task.difficultyLevel)).toLowerCase().includes(searchLower))) ||
            (task.personInCharge && Array.isArray(task.personInCharge) && task.personInCharge.some(person =>
              person.firstName?.toLowerCase().includes(searchLower) ||
              person.lastName?.toLowerCase().includes(searchLower) ||
              person.email?.toLowerCase().includes(searchLower)
            )) ||
            (task.startDate && task.startDate.toLowerCase().includes(searchLower)) ||
            (task.endDate && task.endDate.toLowerCase().includes(searchLower)) ||
            (task.actualStartDate && task.actualStartDate.toLowerCase().includes(searchLower)) ||
            (task.actualEndDate && task.actualEndDate.toLowerCase().includes(searchLower));

          if (!matchesSearch) return false;
        }

        // Date period filters
        if (periodFilter.startDate && (!task.startDate || new Date(task.startDate) < new Date(periodFilter.startDate))) {
          return false;
        }
        if (periodFilter.endDate && (!task.endDate || new Date(task.endDate) > new Date(periodFilter.endDate))) {
          return false;
        }
        if (periodFilter.actualStartDate && (!task.actualStartDate || new Date(task.actualStartDate) < new Date(periodFilter.actualStartDate))) {
          return false;
        }
        if (periodFilter.actualEndDate && (!task.actualEndDate || new Date(task.actualEndDate) > new Date(periodFilter.actualEndDate))) {
          return false;
        }

        return true;
      });

      setFilteredTasks(filtered);
    };

    filterTasks();
  }, [
    statusValue,
    priorityValue,
    difficultyLevelValue,
    selectedColor,
    displayMyTasksOnly,
    displayOverdueTasksOnly,
    searchTerm,
    tasks,
    user._id,
    t,
    periodFilter,
    selectedTeamMembers,
    selectedMilestone,
    selectedTags
  ]);

  const handleSwitchMode = (mode) => {
    setDisplayMode(mode);
    localStorage.setItem('displayMode', mode);
  };

  const handleColor = (color) => {
    setSelectedColor(color.hex);
    if (color) {
      localStorage.setItem('colorFilter', color.hex);
    }
    else {
      localStorage.setItem('colorFilter', "");
    }
  };

  // View Cancelled Tasks
  const cancelledTasks = tasks.filter(task => task.status === 'Cancelled');
  const columnsToShow = ['taskName', 'status', 'personInCharge', 'startDate', 'endDate'];

  const handleViewCancelledTasks = () => {
    setShowCancelledTasksDialog(true);
  };

  const handleCloseCancelledTasksDialog = () => {
    setShowCancelledTasksDialog(false);
  };

  // Search
  const handleSearch = (event) => {
    const searchTerm = event.target.value.toLowerCase();
    setSearchTerm(searchTerm);
  };

  // Show Task Details
  const storedShowTaskDetails = localStorage.getItem('showTaskDetails');
  const defaultTaskDetails = {
    milestone: true,
    category: true,
    description: true,
    estimatedDate: true,
    actualDate: true,
    personInCharge: true,
    tags: true,
    status: true,
    priority: true,
    difficultyLevel: true,
    hasAttachments: true,
    daysAgo: true,
    action: true,
  };

  // Logic to initialize `showTaskDetails`
  const [showTaskDetails, setShowTaskDetails] = useState(() => {
    if (isMobile) {
      // Mobile-first: prioritize mobile-specific keys
      return {
        icon: true,
        taskName: true,
        description: true,
        personInCharge: true
      };
    } else if (storedShowTaskDetails) {
      try {
        // Parse stored value from localStorage
        return JSON.parse(storedShowTaskDetails);
      } catch (error) {
        console.error('Error parsing stored showTaskDetails:', error);
        // Fallback to default values if parsing fails
        return defaultTaskDetails;
      }
    } else {
      // Non-mobile with no stored value: use default details
      return defaultTaskDetails;
    }
  });

  // Sort By
  const [sortBy, setSortBy] = useState('updatedDate');
  const [sortOrder, setSortOrder] = useState('asc');

  // Handle task moved to another project
  const handleTaskMoved = (taskId) => {
    // Remove the moved task from the current tasks list
    setTasks(prevTasks => prevTasks.filter(task => task._id !== taskId));
    setFilteredTasks(prevFilteredTasks => prevFilteredTasks.filter(task => task._id !== taskId));
  };

  let sortedTasks = [...filteredTasks];

  switch (sortBy) {
    case 'taskName':
      sortedTasks.sort((a, b) => {
        if (sortOrder === 'asc') {
          return a.taskName?.localeCompare(b.taskName);
        } else {
          return b.taskName?.localeCompare(a.taskName);
        }
      });
      break;
    case 'milestone':
      sortedTasks.sort((a, b) => {
        if (sortOrder === 'asc') {
          return a.milestone?.title?.localeCompare(b.milestone?.title);
        } else {
          return b.milestone?.title?.localeCompare(a.milestone?.title);
        }
      });
      break;
    case 'category':
      sortedTasks.sort((a, b) => {
        if (sortOrder === 'asc') {
          return a.category?.localeCompare(b.category);
        } else {
          return b.category?.localeCompare(a.category);
        }
      });
      break;
    case 'startDate':
      sortedTasks.sort((a, b) => {
        if (sortOrder === 'asc') {
          return new Date(a.startDate) - new Date(b.startDate);
        } else {
          return new Date(b.startDate) - new Date(a.startDate);
        }
      });
      break;
    case 'endDate':
      sortedTasks.sort((a, b) => {
        if (sortOrder === 'asc') {
          return new Date(a.endDate) - new Date(b.endDate);
        } else {
          return new Date(b.endDate) - new Date(a.endDate);
        }
      });
      break;
    case 'actualStartDate':
      sortedTasks.sort((a, b) => {
        if (sortOrder === 'asc') {
          return new Date(a.startDate) - new Date(b.startDate);
        } else {
          return new Date(b.startDate) - new Date(a.startDate);
        }
      });
      break;
    case 'actualEndDate':
      sortedTasks.sort((a, b) => {
        if (sortOrder === 'asc') {
          return new Date(a.endDate) - new Date(b.endDate);
        } else {
          return new Date(b.endDate) - new Date(a.endDate);
        }
      });
      break;
    case 'createdDate':
      sortedTasks.sort((a, b) => {
        if (sortOrder === 'asc') {
          return new Date(a.createdDate) - new Date(b.createdDate);
        } else {
          return new Date(b.createdDate) - new Date(a.createdDate);
        }
      });
      break;
    case 'updatedDate':
      sortedTasks.sort((a, b) => {
        if (sortOrder === 'asc') {
          return new Date(a.updatedDate) - new Date(b.updatedDate);
        } else {
          return new Date(b.updatedDate) - new Date(a.updatedDate);
        }
      });
      break;
    case 'priority':
      sortedTasks.sort((a, b) => {
        const priorityOrder = {
          'Very High': 5,
          'High': 4,
          'Medium': 3,
          'Low': 2,
          'Very Low': 1,
          '': 0,
        };
        if (sortOrder === 'asc') {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        } else {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
      });
      break;
    case 'difficultyLevel':
      sortedTasks.sort((a, b) => {
        const difficultyOrder = {
          'Very Difficult': 4,
          'Difficult': 3,
          'Moderate': 2,
          'Easy': 1,
          '': 0,
        };
        if (sortOrder === 'asc') {
          return difficultyOrder[b.difficultyLevel] - difficultyOrder[a.difficultyLevel];
        } else {
          return difficultyOrder[a.difficultyLevel] - difficultyOrder[b.difficultyLevel];
        }
      });
      break;
    default:
      // No sorting
      break;
  }

  return (
    <MainContent pageTitle={t('progress')} breadcrumbItems={breadcrumbItems}>
      {project && (
        <>
          {user.email === process.env.REACT_APP_ADMIN_EMAIL || user?.role?.permissions?.some(permission => permission.name === "createTask") ? (
            <CreateTaskBtn setTasks={setTasks} />
          ) : null}

          <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
            <Paper variant="outlined" sx={{ p:2 }}>
              <Grid container style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Grid item style={{ marginBottom: '0.2rem' }}>
                  <ModeSwitcher displayMode={displayMode} handleSwitchMode={handleSwitchMode} />
                </Grid>

                <Grid item>
                  <Tooltip title={t('viewCancelledTasks')}>
                    <IconButton
                      aria-label={t('viewCancelledTasks')}
                      onClick={handleViewCancelledTasks}
                      sx={{ mr: isMobile? '0':'0.5rem' }}
                    >
                      <DeleteSweepOutlined />
                    </IconButton>
                  </Tooltip>

                  {!isMobile && (
                    <TaskSearchBar searchTerm={searchTerm} handleSearch={handleSearch} />
                  )}
                </Grid>
              </Grid>

              {isMobile && (
                <Box sx={{ my: isMobile? '0.5rem':'0' }}>
                  <TaskSearchBar searchTerm={searchTerm} handleSearch={handleSearch} />
                </Box>
              )}

              <Box style={{ marginBottom:'0.2rem', display: 'flex', justifyContent: 'space-between' }}>
                <Box>
                  <TaskFilters
                    project={project}
                    displayMyTasksOnly={displayMyTasksOnly}
                    setDisplayMyTasksOnly={setDisplayMyTasksOnly}
                    displayOverdueTasksOnly={displayOverdueTasksOnly}
                    setDisplayOverdueTasksOnly={setDisplayOverdueTasksOnly}
                    selectedColor={selectedColor}
                    handleColor={handleColor}
                    setSelectedColor={setSelectedColor}
                    statusValue={statusValue}
                    setStatusValue={setStatusValue}
                    priorityValue={priorityValue}
                    setPriorityValue={setPriorityValue}
                    difficultyLevelValue={difficultyLevelValue}
                    setDifficultyLevelValue={setDifficultyLevelValue}
                    periodFilter={periodFilter}
                    setPeriodFilter={setPeriodFilter}
                    personInCharge={selectedTeamMembers}
                    setPersonInCharge={setSelectedTeamMembers}
                    milestone={selectedMilestone}
                    setMilestone={setSelectedMilestone}
                    tags={selectedTags}
                    setTags={setSelectedTags}
                  />
                  <ShowTaskDetails
                    displayMode={displayMode}
                    showTaskDetails={showTaskDetails}
                    setShowTaskDetails={setShowTaskDetails}
                  />
                  <SortBy
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    sortOrder={sortOrder}
                    setSortOrder={setSortOrder}
                  />
                  
                  {!isMobile && (
                    <>
                      <ExportDropDown
                        project={project}
                        tasks={sortedTasks}
                      />
                      <ImportTasks projectId={project._id} />
                    </>
                  )}
                </Box>
                {/*<Stack direction="row" spacing={2}>
                  <Typography variant="button" style={{ fontWeight: 'bold' }}>
                    {t('count')}
                    {t('colon')}
                    {sortedTasks.length}
                  </Typography>
                </Stack>*/}
              </Box>

              {sortedTasks && sortedTasks.length > 0 ? (
                <Box>
                  {displayMode === 'TaskBoard' && <TaskBoard project={project} tasks={sortedTasks} setTasks={setTasks} showTaskDetails={showTaskDetails} />}
                  {displayMode === 'TaskList' && <TaskListByMilestone project={project} tasks={sortedTasks} setTasks={setTasks} showTaskDetails={showTaskDetails} displayTab={true} />}
                  {/*{displayMode === 'MilestoneTaskList' && <MilestoneTaskList /}*/}
                  {displayMode === 'TabbedTaskList' && <TabbedTaskList project={project} tasks={sortedTasks} setTasks={setTasks} showTaskDetails={showTaskDetails} />}
                  {displayMode === 'TaskTable' && <TaskTable project={project} tasks={sortedTasks} setTasks={setTasks} height="71.3vh" onTaskMoved={handleTaskMoved} />}
                  {displayMode === 'TaskImpactEffortMatrix' && <TaskImpactEffortMatrix project={project} tasks={sortedTasks} setTasks={setTasks} showTaskDetails={showTaskDetails} />}
                  {displayMode === 'TaskCalendar' && <TaskCalendar project={project} tasks={sortedTasks} setTasks={setTasks} showTaskDetails={showTaskDetails} />}
                  {displayMode === 'TaskGanttChart' && <TaskGanttChart project={project} tasks={sortedTasks} setTasks={setTasks} />}
                </Box>
              ) : (
                <Typography variant="body1">
                  {t('noTaskInProject')}
                </Typography>
              )}
            </Paper>
          </Grid>

          <CDialog
            mode="read"
            open={showCancelledTasksDialog}
            onClose={handleCloseCancelledTasksDialog}
            title={t('cancelledTasks')}
          >
            {cancelledTasks.length === 0 ? (
              <Typography variant="body1">{t('noCancelledTasks')}</Typography>
            ) : (
              <ListTableSwitcher
                project={project}
                tasks={cancelledTasks}
                setTasks={setTasks}
                displayCheckbox={false}
                columnsToShow={columnsToShow}
                displayTab={false}
                displayProjectSelector={false}
                displayMilestoneSelector={true}
              />
            )}
          </CDialog>
        </>
      )}
    </MainContent>
  );
};

export default TaskProgress;
