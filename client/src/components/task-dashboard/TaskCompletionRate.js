import React, { useState } from 'react';
import { Paper, Box, Typography, Tabs, Tab, Alert } from '@mui/material';
import { Checklist, Celebration } from '@mui/icons-material';

import { useTranslation } from 'react-i18next';

import DashboardCard from '../custom/DashboardCard';
import CDialog from '../custom/CDialog';

import ListTableSwitcher from '../task/ListTableSwitcher';
import BorderLinearProgress from '../custom/BorderLinearProgress';

const TaskCompletionRate = ({ project, tasks, setTasks }) => {
  const { t } = useTranslation();

  // Calculate Task Completion Rate
  const totalTasks = tasks.filter(task => task.status !== 'Cancelled').length;
  let completedTasksCount = 0;
  tasks.forEach((task) => {
    if (task.status === 'Done') {
      completedTasksCount++;
    }
  });
  const completionPercentage = totalTasks === 0 ? 0 : (completedTasksCount / totalTasks) * 100;

  // Dialog
  const incompletedTasks = tasks.filter((task) => task.status !== 'Done' && task.status !== 'Cancelled');
  //console.log("incompletedTasks = " + JSON.stringify(incompletedTasks));
  const completedTasks = tasks.filter((task) => task.status === 'Done');
  //console.log("completedTasks = " + JSON.stringify(completedTasks));

  const columnsToShow = ['taskName', 'status', 'personInCharge', 'startDate', 'endDate'];

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  
  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };
  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const getEncouragementMessage = (completionPercentage) => {
    if (completionPercentage <= 25) {
      return t('completionPercentage25');
    } else if (completionPercentage <= 50) {
      return t('completionPercentage50');
    } else if (completionPercentage <= 75) {
      return t('completionPercentage75');
    } else if (completionPercentage < 100) {
      return t('completionPercentage90');
    } else if (completionPercentage === 100) {
      return t('completionPercentage100');
    } else {
      return t('completionPercentageInvalid');
    }
  };

  return (
    <>
      <DashboardCard
        dashboardId="Task Dashboard"
        cardId="Task Completion Rate"
        title={t('taskCompletionRate')}
        description={t('taskCompletionRateDesc')}
        height={250}
        icon={Checklist}
        color={project.color}
        subheader=""
        handleClick={handleOpenDialog}
        cursor="pointer"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          '@media (min-width: 600px)': {
            flexDirection: 'row',
          },
        }}
      >
        <Typography variant="h4" sx={{ mb: '1rem' }}>
          {completionPercentage?.toFixed(2)}%
        </Typography>

        <BorderLinearProgress variant="determinate" value={completionPercentage} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: '1rem' }}>
            {completedTasksCount} / {totalTasks} {t('tasksCompleted')}
          </Typography>
        </Box>

        <Alert icon={<Celebration fontSize="inherit" />} severity="success">
          {getEncouragementMessage(completionPercentage)}
        </Alert>
      </DashboardCard>

      <CDialog
        mode="read"
        open={isDialogOpen}
        onClose={handleCloseDialog}
        title={t('completedAndIncompletedTasks')}
      >
        <Paper variant="none" elevation={0} style={{ position: 'sticky', top: 0, zIndex: 1000 }}>
          <Tabs value={tabIndex} onChange={handleTabChange} aria-label={t('completedAndIncompletedTasks')}>
            <Tab label={`${t('completed')} (${completedTasks.length})`} />
            <Tab label={`${t('incompleted')} (${incompletedTasks.length})`} />
          </Tabs>
        </Paper>

        {tabIndex === 0 && (
          <ListTableSwitcher
            project={project}
            tasks={completedTasks}
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
            tasks={incompletedTasks}
            setTasks={setTasks}
            displayCheckbox="false"
            columnsToShow={columnsToShow}
            displayTab={true}
            displayProjectSelector={false}
            displayMilestoneSelector={true}
          />
        )}
      </CDialog>
    </>
  );
};

export default TaskCompletionRate;