import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Paper, Stack, Grid, TextField, MenuItem, Select, Typography, Tabs, Tab, Box, Divider } from '@mui/material';
import axios from 'axios';
import { format, parseISO, compareAsc, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subWeeks, subMonths, subYears, addWeeks, addMonths, addYears, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from 'date-fns';
import TimelineIcon from '@mui/icons-material/Timeline';

import { useTranslation } from 'react-i18next';

import DashboardCard from '../custom/DashboardCard';
import DateRangeSelector from '../custom/DateRangeSelector';
import CDialog from '../custom/CDialog';
import ListTableSwitcher from '../task/ListTableSwitcher';

const TaskCompletionTrend = ({ project }) => {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState([]);
  const [completionData, setCompletionData] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterType, setFilterType] = useState('thisWeek');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEstimatedTasks, setSelectedEstimatedTasks] = useState([]);
  const [selectedActualTasks, setSelectedActualTasks] = useState([]);
  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/tasks/project/${project._id}`);
        setTasks(response.data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTasks();
  }, [project._id]);

  useEffect(() => {
    handleStartDateEndDateChange(); // Apply startDate and endDate and calculate data
  }, [startDate, endDate]);

  useEffect(() => {
    handleDateFilterChange({ target: { value: filterType } }); // Apply filter and calculate data
  }, [filterType]);

  const isValidDate = (date) => {
    return !isNaN(Date.parse(date));
  };

  const calculateCompletionData = (tasks, customStartDate = startDate, customEndDate = endDate) => {
    const filteredTasks = tasks.filter(task => {
      const taskDate = new Date(task.endDate);
      const isAfterStart = customStartDate ? new Date(customStartDate) <= taskDate : true;
      const isBeforeEnd = customEndDate ? taskDate <= new Date(customEndDate) : true;
      return isAfterStart && isBeforeEnd;
    });

    const completedTasksCount = {};

    const dateIntervals = {
      daily: eachDayOfInterval,
      weekly: eachWeekOfInterval,
      monthly: eachMonthOfInterval,
    };

    let intervalFunc;
    switch (filterType) {
      case 'lastWeek':
      case 'thisWeek':
      case 'nextWeek':
        intervalFunc = dateIntervals.daily;
        break;
      case 'lastMonth':
      case 'thisMonth':
      case 'nextMonth':
        intervalFunc = dateIntervals.weekly;
        break;
      case 'lastYear':
      case 'thisYear':
      case 'nextYear':
        intervalFunc = dateIntervals.monthly;
        break;
      default:
        intervalFunc = dateIntervals.daily;
    }

    const intervals = intervalFunc({ start: new Date(customStartDate), end: new Date(customEndDate) });

    intervals.forEach((date, index) => {
      const formattedDate = format(date, 'yyyy-MM-dd');
      let key;
      switch (filterType) {
        case 'lastWeek':
        case 'thisWeek':
        case 'nextWeek':
          key = formattedDate;
          break;
        case 'lastMonth':
        case 'thisMonth':
        case 'nextMonth':
          key = `Week ${index + 1}`;
          break;
        case 'lastYear':
        case 'thisYear':
        case 'nextYear':
          key = format(date, 'MMM');
          break;
        default:
          key = formattedDate;
      }
      completedTasksCount[key] = { completedTasks: 0, actualCompletedTasks: 0, tasks: [] };
    });

    filteredTasks.forEach((task) => {
      if (task.status === 'Done' && isValidDate(task.endDate)) {
        const endDate = new Date(task.endDate);
        if (!isNaN(endDate)) {
          let key;
          switch (filterType) {
            case 'lastWeek':
            case 'thisWeek':
            case 'nextWeek':
              key = format(endDate, 'yyyy-MM-dd');
              break;
            case 'lastWeek':
            case 'thisMonth':
            case 'nextMonth':
              key = `Week ${Math.ceil(endDate.getDate() / 7)}`;
              break;
            case 'lastWeek':
            case 'thisYear':
            case 'nextYear':
              key = format(endDate, 'MMM');
              break;
            default:
              key = format(endDate, 'yyyy-MM-dd');
          }
          if (completedTasksCount[key]) {
            completedTasksCount[key].completedTasks += 1;
            completedTasksCount[key].tasks.push(task);
          }
        }
      }

      if (task.status === 'Done' && isValidDate(task.actualEndDate)) {
        const actualEndDate = new Date(task.actualEndDate);
        if (!isNaN(actualEndDate)) {
          let key;
          switch (filterType) {
            case 'lastWeek':
            case 'thisWeek':
            case 'nextWeek':
              key = format(actualEndDate, 'yyyy-MM-dd');
              break;
            case 'lastMonth':
            case 'thisMonth':
            case 'nextWeek':
              key = `Week ${Math.ceil(actualEndDate.getDate() / 7)}`;
              break;
            case 'lastYear':
            case 'thisYear':
            case 'nextYear':
              key = format(actualEndDate, 'MMM');
              break;
            default:
              key = format(actualEndDate, 'yyyy-MM-dd');
          }
          if (completedTasksCount[key]) {
            completedTasksCount[key].actualCompletedTasks += 1;
          }
        }
      }
    });

    let completionData = Object.keys(completedTasksCount).map(date => {
      let formattedDate;
      try {
        formattedDate = (filterType === 'thisMonth' || filterType === 'lastMonth') ? date : format(parseISO(date), 
          intervalFunc === dateIntervals.daily ? 'MMM dd' : 
          intervalFunc === dateIntervals.weekly ? 'wo' : 'MMM');
      } catch (error) {
        formattedDate = date; // Fallback if date parsing fails
      }

      return {
        date,
        ...completedTasksCount[date],
        formattedDate,
      };
    });

    completionData.sort((a, b) => {
      const dateA = parseISO(a.date);
      const dateB = parseISO(b.date);
      return isNaN(dateA) || isNaN(dateB) ? 0 : compareAsc(dateA, dateB);
    });

    setCompletionData(completionData);
  };

  const handleStartDateEndDateChange = (event) => {
    calculateCompletionData(tasks, startDate, endDate);
  };

  const handleDateFilterChange = (event) => {
    const filter = event.target.value;
    setFilterType(filter);

    let newStartDate = '';
    let newEndDate = '';

    const today = new Date();

    switch (filter) {
      case 'lastWeek':
        newStartDate = format(startOfWeek(subWeeks(today, 1), { weekStartsOn: 1 }), 'yyyy-MM-dd');
        newEndDate = format(endOfWeek(subWeeks(today, 1), { weekStartsOn: 1 }), 'yyyy-MM-dd');
        break;
      case 'thisWeek':
        newStartDate = format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd');
        newEndDate = format(endOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd');
        break;
      case 'nextWeek':
        newStartDate = format(startOfWeek(addWeeks(today, 1), { weekStartsOn: 1 }), 'yyyy-MM-dd');
        newEndDate = format(endOfWeek(addWeeks(today, 1), { weekStartsOn: 1 }), 'yyyy-MM-dd');
        break;
      case 'lastMonth':
        newStartDate = format(startOfMonth(subMonths(today, 1)), 'yyyy-MM-dd');
        newEndDate = format(endOfMonth(subMonths(today, 1)), 'yyyy-MM-dd');
        break;
      case 'thisMonth':
        newStartDate = format(startOfMonth(today), 'yyyy-MM-dd');
        newEndDate = format(endOfMonth(today), 'yyyy-MM-dd');
        break;
      case 'nextMonth':
        newStartDate = format(startOfMonth(addMonths(today, 1)), 'yyyy-MM-dd');
        newEndDate = format(endOfMonth(addMonths(today, 1)), 'yyyy-MM-dd');
        break;
      case 'lastYear':
        newStartDate = format(startOfYear(subYears(today, 1)), 'yyyy-MM-dd');
        newEndDate = format(endOfYear(subYears(today, 1)), 'yyyy-MM-dd');
        break;
      case 'thisYear':
        newStartDate = format(startOfYear(today), 'yyyy-MM-dd');
        newEndDate = format(endOfYear(today), 'yyyy-MM-dd');
        break;
      case 'nextYear':
        newStartDate = format(startOfYear(addYears(today, 1)), 'yyyy-MM-dd');
        newEndDate = format(endOfYear(addYears(today, 1)), 'yyyy-MM-dd');
        break;
      default:
        break;
    }

    setStartDate(newStartDate);
    setEndDate(newEndDate);
    calculateCompletionData(tasks, newStartDate, newEndDate);
  };

  const handleDateChange = (setter) => (event) => {
    setter(event.target.value);
    calculateCompletionData(tasks, startDate, endDate);
  };

  const completedTasksCount = completionData.reduce((count, item) => count + item.completedTasks, 0);

  const handlePointClick = (e) => {
    if (e && e.activePayload && e.activePayload.length > 0) {
      const data = e.activePayload[0].payload;
      const clickedDate = data.date; // Use the exact date string
      const selectedPointData = completionData.find(item => item.date === clickedDate) || { tasks: [], actualCompletedTasks: [] };

      const estimatedTasksOnDate = selectedPointData.tasks || [];
      let actualTasksOnDate = [];

      switch (filterType) {
        case 'lastWeek':
        case 'thisWeek':
        case 'nextWeek':
          actualTasksOnDate = tasks.filter(task => task.status === 'Done' && task.actualEndDate && format(parseISO(task.actualEndDate), 'yyyy-MM-dd') === clickedDate);
          break;
        case 'lastMonth':
        case 'thisMonth':
        case 'nextMonth':
          actualTasksOnDate = tasks.filter(task => task.status === 'Done' && task.actualEndDate && `Week ${Math.ceil(new Date(task.actualEndDate).getDate() / 7)}` === clickedDate);
          break;
        case 'lastYear':
        case 'thisYear':
        case 'nextYear':
          actualTasksOnDate = tasks.filter(task => task.status === 'Done' && task.actualEndDate && format(parseISO(task.actualEndDate), 'MMM') === clickedDate);
          break;
        default:
          actualTasksOnDate = tasks.filter(task => task.status === 'Done' && task.actualEndDate && format(parseISO(task.actualEndDate), 'yyyy-MM-dd') === clickedDate);
      }

      setSelectedEstimatedTasks(estimatedTasksOnDate);
      setSelectedActualTasks(actualTasksOnDate);
      setDialogOpen(true);
    }
  };

  const totalTasks = tasks.filter(task => task.status !== 'Cancelled').length;
  const completedTasks = tasks.filter(task => task.status === 'Done');
  const completionPercentage = totalTasks === 0 ? 0 : (completedTasks.length / totalTasks) * 100;

  const columnsToShow = ['taskName', 'status', 'personInCharge', 'startDate', 'endDate'];

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  return (
    <DashboardCard
      dashboardId="Task Dashboard"
      cardId="Task Completion Trend"
      title={t('taskCompletionTrend')}
      description={t('taskCompletionTrendDesc')}
      height={550}
      icon={TimelineIcon}
      color={project.color}
      subheader={`${t('totalTasks')}${t('colon')}${completedTasksCount}`}
      cursor="pointer"
    >
      <Stack direction="row" justifyContent="space-between" sx={{ marginBottom: 2 }}>
        <Grid item xs={10}>
          <TextField
            label={t('from')}
            type="date"
            value={startDate}
            onChange={handleDateChange(setStartDate)}
            size="small"
            InputLabelProps={{
              shrink: true,
            }}
            sx={{ mr:1 }}
          />
          <TextField
            label={t('to')}
            type="date"
            value={endDate}
            onChange={handleDateChange(setEndDate)}
            size="small"
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>

        <Box style={{ display: 'flex', alignItems: 'end' }}>
          <DateRangeSelector
            selectedRange={filterType}
            onRangeChange={handleDateFilterChange}
            displayNextWeek={false}
            displayNextMonth={false}
            displayNextYear={false}
          />
        </Box>
      </Stack>
      
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={completionData} onClick={handlePointClick}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="formattedDate" />
          <YAxis />
          <Tooltip />
          <Legend wrapperStyle={{ whiteSpace: "break-spaces" }} />
          <Line name={t('estimatedCompletedTasks')} type="monotone" dataKey="completedTasks" stroke="#8884d8" activeDot={{ r: 8 }} />
          <Line name={t('actualCompletedTasks')} type="monotone" dataKey="actualCompletedTasks" stroke="#82ca9d" activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>

      <CDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={t('estimatedAndActualCompletedTasks')}
      >
        <Paper variant="none" elevation={0} style={{ position: 'sticky', top: 0, zIndex: 1000 }}>
          <Tabs value={tabIndex} onChange={handleTabChange} aria-label={t('estimatedAndActualCompletedTasks')}>
            <Tab label={`${t('estimated')} (${selectedEstimatedTasks.length})`} />
            <Tab label={`${t('actual')} (${selectedActualTasks.length})`} />
          </Tabs>
        </Paper>

        <Box>
          {tabIndex === 0 && (
            <ListTableSwitcher
              project={project}
              tasks={selectedEstimatedTasks}
              setTasks={setTasks}
              displayCheckbox="false"
              columnsToShow={columnsToShow}
              displayTab={false}
              displayProjectSelector={false}
              displayMilestoneSelector={true}
            />
          )}
          {tabIndex === 1 && (
            <ListTableSwitcher
              project={project}
              tasks={selectedActualTasks}
              setTasks={setTasks}
              displayCheckbox="false"
              columnsToShow={columnsToShow}
              displayTab={false}
              displayProjectSelector={false}
              displayMilestoneSelector={true}
            />
          )}
        </Box>
      </CDialog>
    </DashboardCard>
  );
};

export default TaskCompletionTrend;