import React from 'react';
import { Typography } from '@mui/material';
import AlarmIcon from '@mui/icons-material/Alarm';

import DashboardCard from '../custom/DashboardCard';

import { useTranslation } from 'react-i18next';

import ListTableSwitcher from '../task/ListTableSwitcher';

const OverdueTasks = ({ project, tasks, setTasks }) => {
  const { t } = useTranslation();

  const now = new Date();

  // Filter tasks that are overdue
  const overdueTasks = tasks.filter(task => 
    (task.endDate && new Date(task.endDate) < now || task.actualEndDate && new Date(task.actualEndDate) < now) &&
    task.status !== 'Done' && task.status !== 'Cancelled'
  );
  
  const columnsToShow = ['taskName', 'status', 'personInCharge', 'startDate', 'endDate'];
  
  return (
    <DashboardCard
      dashboardId="Task Dashboard"
      ocardId="Overdue Tasks"
      title={t('overdueTasks')}
      description={t('overdueTasksDesc')}
      height={600}
      icon={AlarmIcon}
      color={project.color}
      subheader={t('totalTasks') + t('colon') + overdueTasks.length}
    >
      {overdueTasks.length === 0 ? (
        <Typography variant="body1">{t('noOverdueTasks')}</Typography>
      ) : (
        <ListTableSwitcher
          project={project}
          tasks={overdueTasks}
          setTasks={setTasks}
          displayCheckbox={false}
          columnsToShow={columnsToShow}
          displayTab={false}
          displayProjectSelector={false}
        />
      )}
    </DashboardCard>
  );
};

export default OverdueTasks;