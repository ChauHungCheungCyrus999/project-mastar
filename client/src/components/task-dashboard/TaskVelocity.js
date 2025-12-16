import React from 'react';
import { Typography } from '@mui/material';
import SpeedIcon from '@mui/icons-material/Speed';

import DashboardCard from '../custom/DashboardCard';

import { useTranslation } from 'react-i18next';

const TaskVelocity = ({ project, tasks }) => {
  const { t } = useTranslation();

  const calculateTaskVelocity = () => {
    const completedTasks = tasks.filter(task => task.status === 'Done' && task.actualStartDate && task.actualEndDate);
    const totalCompletedTasks = completedTasks.length;
    
    // Assuming each task is assigned a duration or estimated effort
    const totalTaskDuration = completedTasks.reduce((total, task) => {
      const durationInMilliseconds = new Date(task.actualEndDate) - new Date(task.actualStartDate);
      const durationInDays = durationInMilliseconds / (1000 * 60 * 60 * 24);
      return total + durationInDays;
    }, 0);

    // Calculate the average task completion time
    const averageTaskDuration = totalTaskDuration / totalCompletedTasks;

    // Assuming the time unit is in days
    return averageTaskDuration || 0;
  };

  const taskVelocity = calculateTaskVelocity();

  return (
    <DashboardCard
      dashboardId="Task Dashboard"
      cardId="Task Velocity"
      title={t('taskVelocity')}
      description={t('taskVelocityDesc')}
      height={250}
      icon={SpeedIcon}
      color={project.color}
      subheader=""
    >
      <Typography variant="h4" component="div">
        {taskVelocity.toFixed(2)} {t('daysPerTask')}
      </Typography>
    </DashboardCard>
  );
};

export default TaskVelocity;