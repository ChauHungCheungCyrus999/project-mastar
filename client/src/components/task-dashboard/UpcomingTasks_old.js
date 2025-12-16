import React from 'react';
import { Typography } from '@mui/material';
import UpcomingIcon from '@mui/icons-material/Upcoming';

import DashboardCard from '../custom/DashboardCard';

import { useTranslation } from 'react-i18next';

import ListTableSwitcher from '../task/ListTableSwitcher';

const UpcomingTasks = ({ project, tasks, setTasks }) => {
  const { t } = useTranslation();

  const now = new Date();

  // Filter tasks that are upcoming
  const upcomingTasks = tasks.filter(task => task.endDate && new Date(task.endDate) > now && task.status !== 'Done' && task.status !== 'Cancelled');
  
  const columnsToShow = ['taskName', 'status', 'personInCharge', 'startDate', 'endDate'];
  
  return (
    <DashboardCard
      dashboardId="Task Dashboard"
      cardId="Upcoming Tasks"
      title={t('upcomingTasks')}
      description={t('upcomingTasksDesc')}
      height={600}
      icon={UpcomingIcon}
      color={project.color}
      subheader={t('totalTasks') + t('colon') + upcomingTasks.length}
    >
      {upcomingTasks.length === 0 ? (
        <Typography variant="body1">{t('noUpcomingTasks')}</Typography>
      ) : (
        <ListTableSwitcher
          project={project}
          tasks={upcomingTasks}
          setTasks={setTasks}
          displayCheckbox={false}
          columnsToShow={columnsToShow}
          displayTab={false}
          displayProjectSelector={false}
          displayMilestoneSelector={true}
        />
      )}
    </DashboardCard>
  );
};

export default UpcomingTasks;