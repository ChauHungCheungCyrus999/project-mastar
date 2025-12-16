import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';
import {
  Paper, Box, Stack,
  CardHeader,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Tooltip, Button, ButtonGroup, Typography, TextField, InputAdornment
} from '@mui/material';
import { NavigateBefore, NavigateNext, Search } from '@mui/icons-material';

import AccountAvatar from '../AccountAvatar';
import TaskEditForm from '../task/TaskEditForm';
import TaskPopper from '../task/TaskPopper';

import {
  handleCloseEditForm,
  handleEdit, handleSaveTask, handleDuplicate,
  handleDelete, confirmDelete, cancelDelete,
  handleMarkAsCompleted
} from '../../utils/TaskUtils.js';

import { capitalizeWordsExceptFirst } from '../../utils/StringUtils.js';

import { useTranslation } from 'react-i18next';
import * as DateHolidays from 'date-holidays';

const TaskNameWithDot = ({ color, label }) => (
  <Box display="flex" alignItems="center">
    {color && (
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: color,
          marginRight: 1,
        }}
      />
    )}
    <Typography variant="body2" color="#777">{label}</Typography>
  </Box>
);

const TeamSchedule = ({ projectId }) => {
  const theme = useTheme();

  const { t, i18n } = useTranslation();

  const [project, setProject] = useState({ teamMembers: [] });
  const [tasks, setTasks] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isEditFormOpen, setEditFormOpen] = useState(false);
  const [editedTask, setEditedTask] = useState(null);
  const [mode, setMode] = useState("update");
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [taskSearchQuery, setTaskSearchQuery] = useState('');
  const [dateMode, setDateMode] = useState('estimated');
  const [holidays, setHolidays] = useState([]); // Add holidays state

  // Task Popper
  const [anchorEl, setAnchorEl] = useState(null);
  const [hoveredTask, setHoveredTask] = useState(null);

  useEffect(() => {
    fetchProject();
    fetchTasks();
    fetchHolidays(); // Fetch holidays
  }, [currentDate]);

  const fetchProject = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/project/${projectId}`);
      if (response.status === 200) {
        setProject(response.data);
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

  const fetchHolidays = async () => {
    const hd = new DateHolidays.default();
    hd.init('HK');
    const currentYear = currentDate.getFullYear();
    const yearHolidays = hd.getHolidays(currentYear);
    const holidayDates = yearHolidays.map(holiday => holiday.date.substring(0, 10));
    //console.log('holidayDates = ' + JSON.stringify(holidayDates));
    setHolidays(holidayDates);
  };

  const calculateManDay = (task) => {
    const startDateKey = dateMode === 'actual' ? 'actualStartDate' : 'startDate';
    const endDateKey = dateMode === 'actual' ? 'actualEndDate' : 'endDate';
    
    const startDate = new Date(task[startDateKey]);
    const endDate = new Date(task[endDateKey]);
    let manDays = 0;
  
    while (startDate <= endDate) {
      if (startDate.getDay() !== 0 && startDate.getDay() !== 6 && !isHoliday(startDate)) {
        manDays++;
      }
      startDate.setDate(startDate.getDate() + 1);
    }
  
    return manDays > 0 ? manDays : 1;
  };

  const isHoliday = (date) => {
    const formattedDate = date.toISOString().substring(0, 10);
    //console.log("formattedDate = " + formattedDate);
    //console.log("isHoliday = " + holidays.includes(formattedDate));
    return holidays.includes(formattedDate);
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const getTasksForMember = (teamMemberId) => {
    const startDateKey = dateMode === 'actual' ? 'actualStartDate' : 'startDate';
    const endDateKey = dateMode === 'actual' ? 'actualEndDate' : 'endDate';
  
    return tasks
      .filter(task =>
        task.personInCharge.some(person => person._id === teamMemberId) &&
        task.taskName.toLowerCase().includes(taskSearchQuery) &&
        ((new Date(task[startDateKey]) <= new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)) &&
         (new Date(task[endDateKey]) >= new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)))
      )
      .sort((a, b) => new Date(a[startDateKey]) - new Date(b[startDateKey]));
  };

  const calculateDuration = (task) => {
    const startDateKey = dateMode === 'actual' ? 'actualStartDate' : 'startDate';
    const endDateKey = dateMode === 'actual' ? 'actualEndDate' : 'endDate';

    const startDate = new Date(task[startDateKey]);
    const endDate = new Date(task[endDateKey]);

    if (startDate && endDate) {
      return Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    }
    return 0;
  };

  const handleTaskClick = (task) => {
    setEditedTask(task);
    setEditFormOpen(true);
  };

  const handleCloseForm = () => {
    setEditFormOpen(false);
    setEditedTask(null);
  };

  const onSaveTask = (updatedTask) => {
    handleSaveTask(updatedTask, tasks, setTasks);
  };

  /*const handleSaveTask = (updatedTask) => {
    setTasks(prevTasks => prevTasks.map(task => task._id === updatedTask._id ? updatedTask : task));
    setEditFormOpen(false);
  };*/

  const colorStatuses = [
    { status: t('unassigned'), backgroundColor: '', color: 'black' },
    { status: t('toDo'), backgroundColor: '#89CFF0', color: 'black' },
    { status: t('inProgress'), backgroundColor: '#FFE5A0', color: 'black' },
    { status: t('underReview'), backgroundColor: '#E6CFF2', color: 'black' },
    { status: t('done'), backgroundColor: '#D4EDBC', color: 'black' },
    { status: t('onHold'), backgroundColor: '#FFBD9C', color: 'black' },
    { status: t('cancelled'), backgroundColor: '#C9C9C9', color: 'black' }
  ];

  const getStatusColor = (status) => {
    const foundStatus = colorStatuses.find(
      (item) => item.status === t(capitalizeWordsExceptFirst(status))
    );
    return foundStatus ? foundStatus.backgroundColor : '#dcdcdc';
  };

  // Task Popper
  const handleMouseEnter = (event, task) => {
    setAnchorEl(event.currentTarget);
    setHoveredTask(task);
  };

  const handleMouseLeave = () => {
    setAnchorEl(null);
    setHoveredTask(null);
  };

  const renderTaskRows = (member, days, currentYear, currentMonth) => {
    const memberTasks = getTasksForMember(member._id);

    // Create task cells for each day of the month
    const taskCells = days.map(day => {
      // Find tasks that span this day
      const tasksOnDay = memberTasks.filter(task => {
        const startDateKey = dateMode === 'actual' ? 'actualStartDate' : 'startDate';
        const endDateKey = dateMode === 'actual' ? 'actualEndDate' : 'endDate';

        if (!task[startDateKey] || !task[endDateKey]) return false;

        const taskStartDate = new Date(task[startDateKey]);
        const taskEndDate = new Date(task[endDateKey]);
        const currentDayDate = new Date(currentYear, currentMonth, day);

        return currentDayDate >= taskStartDate && currentDayDate <= taskEndDate;
      });

      if (tasksOnDay.length === 0) {
        return (
          <TableCell key={day} style={{ border: '1px solid #ddd', height: '60px' }} />
        );
      }

      // Display multiple tasks in the same cell if they overlap on the same day
      return (
        <TableCell
          key={day}
          style={{
            border: '1px solid #ddd',
            height: '60px',
            verticalAlign: 'top',
            padding: '2px'
          }}
        >
          <Stack spacing={0.5}>
            {tasksOnDay.map((task, index) => (
              <Box
                key={task._id}
                onClick={() => handleTaskClick(task)}
                onMouseEnter={(event) => handleMouseEnter(event, task)}
                onMouseLeave={handleMouseLeave}
                sx={{
                  backgroundColor: getStatusColor(task.status),
                  color: 'black',
                  padding: '2px 4px',
                  borderRadius: '2px',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  minHeight: '20px',
                  '&:hover': {
                    opacity: 0.8
                  }
                }}
              >
                <TaskNameWithDot color={task.color} label={task.taskName} />
              </Box>
            ))}
          </Stack>
        </TableCell>
      );
    });

    return (
      <TableRow key={member._id}>
        <TableCell
          align="left"
          style={{
            position: 'sticky',
            left: 0,
            zIndex: 2,
            border: '1px solid #ddd',
            whiteSpace: 'nowrap',
            backgroundColor: theme.palette.background.paper,
            minWidth: '200px'
          }}
        >
          <CardHeader
            avatar={
              <AccountAvatar users={member} size="small" />
            }
            title={`${member.firstName} ${member.lastName}`}
            subheader={`(${memberTasks.length} ${t('tasks')})`}
          />
        </TableCell>
        <TableCell style={{ border: '1px solid #ddd', textAlign: 'center', minWidth: '60px' }}>
          {memberTasks.length > 0 ? memberTasks.reduce((total, task) => total + calculateDuration(task), 0) : 0}
        </TableCell>
        <TableCell style={{ border: '1px solid #ddd', textAlign: 'center', minWidth: '60px' }}>
          {memberTasks.length > 0 ? memberTasks.reduce((total, task) => total + calculateManDay(task), 0) : 0}
        </TableCell>
        {taskCells}
      </TableRow>
    );
  };

  const calculateWeekNumber = (date) => {
    const target = new Date(date.valueOf());
    const dayNumber = (date.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNumber + 3);
    const firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) {
      target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
    }
    return 1 + Math.ceil((firstThursday - target) / (7 * 24 * 60 * 60 * 1000));
  };

  const calculateWeekNumbers = (days, currentYear, currentMonth) => {
    const weeks = [];
    let weekStart = 1;
    const totalDays = days.length;

    while (weekStart <= totalDays) {
      const weekNumber = calculateWeekNumber(new Date(currentYear, currentMonth, weekStart));
      let weekEnd = weekStart + 6;
      if (weekEnd > totalDays) weekEnd = totalDays;

      weeks.push({ weekNumber, start: weekStart, end: weekEnd });
      weekStart = weekEnd + 1;
    }

    return weeks;
  };

  const handleMemberSearchChange = (event) => {
    setMemberSearchQuery(event.target.value.toLowerCase());
  };

  const handleTaskSearchChange = (event) => {
    setTaskSearchQuery(event.target.value.toLowerCase());
  };

  const filteredTeamMembers = project.teamMembers.filter(member =>
    `${member.firstName} ${member.lastName}`.toLowerCase().includes(memberSearchQuery)
  );

  const renderTable = () => {
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const weeks = calculateWeekNumbers(days, currentYear, currentMonth);
    const weekdays = [t('sun'), t('mon'), t('tue'), t('wed'), t('thu'), t('fri'), t('sat')];
  
    const today = new Date();
    today.setHours(0, 0, 0, 0);
  
    return (
      <TableContainer component={Paper} sx={{ maxHeight: 800 }}>
        <Table
          size="small"
          stickyHeader
          sx={{
            "& .MuiTableRow-root:hover": {
              backgroundColor: theme.palette.action.hover
            }
          }}
        >
          <TableHead sx={{
            position: "sticky",
            top: 0,
            zIndex: 3,
            "& .MuiTableCell-root": { backgroundColor: "background.paper" },
          }}>
            <TableRow>
              <TableCell
                key='search-team-members'
                rowSpan={3}
                align="left"
                style={{
                  position: 'sticky',
                  left: 0,
                  zIndex: 3,
                  /*verticalAlign: 'bottom',*/
                  border: '1px solid #ddd',
                  width: '200px',
                  backgroundColor: theme.palette.background.paper
                }}>
                <ButtonGroup variant="outlined" size="small" aria-label="outlined primary button group" sx={{ mb: 2 }}>
                  <Tooltip title={t('previousMonth')}>
                    <Button onClick={handlePrevMonth}><NavigateBefore /></Button>
                  </Tooltip>
                  <Tooltip title={t('thisMonth')}>
                    <Button onClick={handleToday}>{t('thisMonth')}</Button>
                  </Tooltip>
                  <Tooltip title={t('nextMonth')}>
                    <Button onClick={handleNextMonth}><NavigateNext /></Button>
                  </Tooltip>
                </ButtonGroup>
                
                <TextField
                  size="small"
                  variant="outlined"
                  //label={t('searchTeamMembers')}
                  placeholder={t('searchTeamMembers')}
                  value={memberSearchQuery}
                  onChange={handleMemberSearchChange}
                  fullWidth
                  InputProps={{
                    style: {fontSize: '0.875rem'},
                    /*endAdornment: (
                      <InputAdornment position="end" size="small">
                        <Search fontSize="small" />
                      </InputAdornment>
                    ),*/
                  }}
                />
              </TableCell>
              <TableCell rowSpan={3} style={{ border: '1px solid #ddd', textAlign: 'center' }}>
                {t('duration')}
              </TableCell>
              <TableCell rowSpan={3} style={{ border: '1px solid #ddd', textAlign: 'center' }}>
                {t('manDay')}
              </TableCell>
              <TableCell key={currentMonth} colSpan={daysInMonth} align="center" style={{ border: '1px solid #ddd' }}>
                {`${currentYear} ${currentDate.toLocaleString(i18n.language, { month: "long" })}`}
              </TableCell>
            </TableRow>
            <TableRow>
              {weeks.map((week, index) => (
                <TableCell
                  key={`week-${index}`}
                  colSpan={week.end - week.start + 1}
                  align="center"
                  style={{ border: '1px solid #ddd' }}
                >
                  {t('week')} {week.weekNumber}
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              {days.map(day => {
                const date = new Date(currentYear, currentMonth, day+1);
                //console.log("date = "  + date);
                //console.log("isHoliday(date) = " + isHoliday(date));
                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                const isToday = date.getTime() === today.getTime();
  
                return (
                  <TableCell
                    key={day}
                    style={{
                      textAlign: 'center',
                      border: '1px solid #ddd',
                      backgroundColor: isToday ? '#ffea99' : isWeekend ? 'lightGray' : isHoliday(date) ? '#ffe6e6' : '',
                      color: isToday ? 'black' : isWeekend ? 'black' : isHoliday(date) ? 'black' : 'inherit',
                    }}
                  >
                    <Typography variant="body2" sx={{ textTransform: 'uppercase' }}>
                      {weekdays[date.getDay()]}
                    </Typography>
                    <Typography variant="caption">{day}</Typography>
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTeamMembers.map(member => renderTaskRows(member, days, currentYear, currentMonth))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Box p={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
        <ButtonGroup size="small" style={{ textAlign: 'center' }}>
          <Tooltip title={t('estimatedSchedule')} placement="top">
            <Button
              variant={dateMode === 'estimated' ? 'contained' : 'outlined'}
              onClick={() => setDateMode('estimated')}
            >
              {t('estimatedSchedule')}
            </Button>
          </Tooltip>
          <Tooltip title={t('actualSchedule')} placement="top">
            <Button
              variant={dateMode === 'actual' ? 'contained' : 'outlined'}
              onClick={() => setDateMode('actual')}
            >
              {t('actualSchedule')}
            </Button>
          </Tooltip>
        </ButtonGroup>

        <TextField
          size="small"
          variant="outlined"
          //label={t('searchTasks')}
          placeholder={t('searchTasks')}
          value={taskSearchQuery}
          onChange={handleTaskSearchChange}
          InputProps={{
            style: {fontSize: '0.875rem'},
            /*endAdornment: (
              <InputAdornment position="end" size="small">
                <Search fontSize="small" />
              </InputAdornment>
            ),*/
          }}
        />
      </Stack>
      
      {renderTable()}

      {isEditFormOpen && (
        <TaskEditForm
          taskId={editedTask._id}
          setTasks={setTasks}
          mode={mode}
          open={isEditFormOpen}
          handleClose={handleCloseForm}
          handleSave={onSaveTask}
        />
      )}

      {hoveredTask && (
        <TaskPopper task={hoveredTask} anchorEl={anchorEl} open={Boolean(anchorEl)} />
      )}
    </Box>
  );
};

export default TeamSchedule;
