import React from 'react';
import { Typography } from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

import DashboardCard from '../custom/DashboardCard';
import ListTableSwitcher from '../task/ListTableSwitcher';

import { useTranslation } from 'react-i18next';

const Next7DaysTasks = ({ project, tasks, setTasks }) => {
  const { t } = useTranslation();

  const now = new Date();
  const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // Get the date for 7 days from now

  // Filter tasks that are within the next 7 days
  const next7DaysTasks = tasks.filter(
    task => 
      ((task.startDate && new Date(task.startDate) <= next7Days) || (task.actualStartDate && new Date(task.actualStartDate) <= next7Days)) &&
      task.endDate && new Date(task.endDate) >= now &&
      task.status !== 'Done' && task.status !== 'Cancelled'
  );

  return (
    <DashboardCard
      dashboardId="Task Dashboard"
      cardId="Next 7 Days Tasks"
      title={t('next7DaysTasks')}
      description={t('next7DaysTasksDesc')}
      height={600}
      icon={CalendarTodayIcon}
      color={project?.color}
      subheader={t('totalTasks') + t('colon') + next7DaysTasks.length}
    >
      {next7DaysTasks.length === 0 ? (
        <Typography variant="body1">{t('noNext7DaysTasks')}</Typography>
      ) : (
        <ListTableSwitcher
          tasks={next7DaysTasks}
          setTasks={setTasks}
          displayTab={false}
          displayProjectSelector={false}
        />
      )}
    </DashboardCard>
  );
};

export default Next7DaysTasks;