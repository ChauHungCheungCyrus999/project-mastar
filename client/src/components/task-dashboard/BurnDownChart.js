import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { SsidChart } from '@mui/icons-material';
import { Alert, Box, Tabs, Tab } from '@mui/material';
import DashboardCard from '../custom/DashboardCard';
import { useTranslation } from 'react-i18next';
import CDialog from '../custom/CDialog';
import ListTableSwitcher from '../task/ListTableSwitcher';

import { formatDate } from '../../utils/DateUtils.js';

const BurnDownChart = ({ project, tasks, setTasks }) => {
  const { t } = useTranslation();
  const [burndownData, setBurndownData] = useState([]);
  const [scheduleStatus, setScheduleStatus] = useState('');
  const [lastPoint, setLastPoint] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [clickedDate, setClickedDate] = useState(null);
  const [filteredEstimatedTasks, setFilteredEstimatedTasks] = useState([]); // Separate state for estimated tasks
  const [filteredActualTasks, setFilteredActualTasks] = useState([]); // Separate state for actual tasks
  const [tabIndex, setTabIndex] = useState(0); // Tab index for switching between estimated and actual tasks

  const generateDates = (startDate, endDate) => {
    const dates = [];
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  };

  const calculateBurndownData = () => {
    const totalTasks = tasks.length;
    let completedTasks = 0;

    const validTasks = tasks.filter(
      (task) => task.actualStartDate && task.actualEndDate
    );

    if (validTasks.length === 0) return [];

    validTasks.sort(
      (a, b) => new Date(a.actualEndDate) - new Date(b.actualEndDate)
    );

    const startDate = new Date(project.startDate || validTasks[0].actualStartDate);
    const endDate = new Date(project.endDate || validTasks[validTasks.length - 1].actualEndDate);

    const allDates = generateDates(startDate, endDate);

    const burndownData = allDates.map((date) => {
      const dateString = date.toLocaleDateString();
      return {
        date: dateString,
        actualRemaining: totalTasks,
        estimatedRemaining: Math.round(
          totalTasks * (1 - (date - startDate) / (endDate - startDate))
        ),
      };
    });

    validTasks.forEach((task) => {
      const taskEndDate = new Date(task.actualEndDate).toLocaleDateString();
      const taskIndex = burndownData.findIndex((d) => d.date === taskEndDate);
      if (task.status === 'Done' && taskIndex >= 0) {
        completedTasks += 1;
        for (let i = taskIndex; i < burndownData.length; i++) {
          burndownData[i].actualRemaining = totalTasks - completedTasks;
        }
      }
    });

    return burndownData;
  };

  useEffect(() => {
    const burndownData = calculateBurndownData();
    setBurndownData(burndownData);

    if (burndownData.length > 0) {
      const lastPoint = burndownData[burndownData.length - 1];
      setLastPoint(lastPoint);

      const status =
        lastPoint.actualRemaining <= lastPoint.estimatedRemaining
          ? 'Ahead of schedule'
          : 'Behind schedule';
      setScheduleStatus(status);
    }
  }, [tasks, project]);

  const handlePointClick = (point) => {
    setClickedDate(new Date(point.date));

    const tasksAtPointInTime = tasks.filter((task) => {
      const actualStartDate = new Date(task.actualStartDate);
      const actualEndDate = new Date(task.actualEndDate);

      return (
        actualStartDate <= clickedDate &&
        (task.status !== 'Done' || actualEndDate > clickedDate)
      );
    });

    // No need to check for estimatedRemaining or actualRemaining properties in this context
    setFilteredEstimatedTasks(tasksAtPointInTime);
    setFilteredActualTasks(tasksAtPointInTime);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setFilteredEstimatedTasks([]);
    setFilteredActualTasks([]);
  };

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  return (
    <div style={{ position: 'relative' }}>
      <DashboardCard
        dashboardId="Task Dashboard"
        cardId="Burn-down Chart"
        title={t('burnDownChart')}
        description={t('burnDownChartDesc')}
        height={550}
        icon={SsidChart}
        color={project.color}
        subheader=""
      >
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={burndownData}
            margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
            onClick={(e) => {
              if (e && e.activePayload) {
                handlePointClick(e.activePayload[0].payload);
              }
            }}
          >
            <Line
              type="monotone"
              dataKey="actualRemaining"
              stroke="#8884d8"
              name={t('actualRemainingTasks')}
            />
            <Line
              type="monotone"
              dataKey="estimatedRemaining"
              stroke="#82ca9d"
              name={t('estimatedRemainingTasks')}
              strokeDasharray="3 3"
            />
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
          </LineChart>
        </ResponsiveContainer>
        {lastPoint && (
          <Box sx={{ width: '100%', mt: '1rem' }}>
            <Alert
              severity={
                scheduleStatus === 'Ahead of schedule' ? 'success' : 'error'
              }
              sx={{ width: '100%' }}
            >
              {scheduleStatus === 'Ahead of schedule'
                ? t('projectIsAheadOfSchedule', {
                    completion: lastPoint.actualRemaining,
                  })
                : t('projectIsBehindSchedule', {
                    completion: lastPoint.actualRemaining,
                  })}
            </Alert>
          </Box>
        )}
      </DashboardCard>

      <CDialog
        open={dialogOpen}
        onClose={closeDialog}
        title={`${t('remainingTasks')} - ${formatDate(clickedDate)}`}
        mode="view"
      >
        <Tabs value={tabIndex} onChange={handleTabChange}>
          <Tab label={`${t('estimatedRemainingTasks')} (${filteredEstimatedTasks.length})`} />
          <Tab label={`${t('actualRemainingTasks')} (${filteredActualTasks.length})`} />
        </Tabs>

        {tabIndex === 0 && (
          <ListTableSwitcher
            project={project}
            tasks={filteredEstimatedTasks}
            setTasks={setTasks}
            height="400px"
            displayCheckbox="false"
            displayToolbar={false}
            displayProjectSelector={false}
          />
        )}

        {tabIndex === 1 && (
          <ListTableSwitcher
            project={project}
            tasks={filteredActualTasks}
            setTasks={setTasks}
            height="400px"
            displayCheckbox="false"
            displayToolbar={false}
            displayProjectSelector={false}
          />
        )}
      </CDialog>
    </div>
  );
};

export default BurnDownChart;
