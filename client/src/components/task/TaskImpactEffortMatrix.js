import React, { useState } from 'react';
import { Grid, Paper, Tooltip, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

import TaskList from './TaskList';

const TaskImpactEffortMatrix = ({ project, tasks, setTasks, showTaskDetails }) => {
  const { t } = useTranslation();

  const categorizeTasks = (tasks) => {
    const categories = {
      highImpactLowEffort: {
        tasks: [],
        description: t('highImpactLowEffortDescription'),
        bgColor: '#d9d9f2',
      },
      lowImpactLowEffort: {
        tasks: [],
        description: t('lowImpactLowEffortDescription'),
        bgColor: '#fff3bf',
      },
      lowImpactHighEffort: {
        tasks: [],
        description: t('lowImpactHighEffortDescription'),
        bgColor: '#ffd8da',
      },
      highImpactHighEffort: {
        tasks: [],
        description: t('highImpactHighEffortDescription'),
        bgColor: '#c0f2f3',
      },
    };

    tasks.forEach((task) => {
      const { priority, difficultyLevel } = task;
      if (
        (priority === 'Very High' ||
          priority === 'High' ||
          priority === 'Medium') &&
        (difficultyLevel === 'Moderate' || difficultyLevel === 'Easy')
      ) {
        categories.highImpactLowEffort.tasks.push(task);
      } else if (
        (priority === 'Low' || priority === 'Very Low') &&
        (difficultyLevel === 'Moderate' || difficultyLevel === 'Easy')
      ) {
        categories.lowImpactLowEffort.tasks.push(task);
      } else if (
        (priority === 'Low' || priority === 'Very Low') &&
        (difficultyLevel === 'Very Difficult' ||
          difficultyLevel === 'Difficult')
      ) {
        categories.lowImpactHighEffort.tasks.push(task);
      } else if (
        (priority === 'Very High' ||
          priority === 'High' ||
          priority === 'Medium') &&
        (difficultyLevel === 'Very Difficult' ||
          difficultyLevel === 'Difficult')
      ) {
        categories.highImpactHighEffort.tasks.push(task);
      }
    });

    return categories;
  };

  const renderTaskList = (tasks, title, bgColor, description) => (
    <Paper
      variant="outlined"
      sx={{
        p: '0.5rem',
        ':hover': {
          boxShadow: '10',
        },
      }}
    >
      <Grid container alignItems="center" justifyContent="space-between" sx={{ px: '0.5rem', color: '#36454F', backgroundColor: bgColor }}>
        <Grid item sx={{ flexGrow: 1 }}>
          <Typography variant="subtitle2">
            {t(title)}
          </Typography>
        </Grid>
        <Grid item>
          <Tooltip title={description} placement="top" sx={{ verticalAlign: 'middle' }}>
            <HelpOutlineIcon />
          </Tooltip>
        </Grid>
      </Grid>

      <TaskList
        tasks={tasks}
        height="270px"
        showTaskDetails={showTaskDetails}
        displayTab={false}
      />
    </Paper>
  );

  const categorizedTasks = categorizeTasks(tasks);

  return (
    <Grid container spacing={1} >
      <Grid container item xs={12} spacing={1}>
        <Grid item xs={12} md={6}>
          {renderTaskList(
            categorizedTasks.highImpactLowEffort.tasks,
            t('highImpact') + ' / ' + t('lowEffort'),
            categorizedTasks.highImpactLowEffort.bgColor,
            categorizedTasks.highImpactLowEffort.description
          )}
        </Grid>
        <Grid item xs={12} md={6}>
          {renderTaskList(
            categorizedTasks.highImpactHighEffort.tasks,
            t('highImpact') + ' / ' + t('highEffort'),
            categorizedTasks.highImpactHighEffort.bgColor,
            categorizedTasks.highImpactHighEffort.description
          )}
        </Grid>
      </Grid>
      <Grid container item xs={12} spacing={1}>
        <Grid item xs={12} md={6}>
          {renderTaskList(
            categorizedTasks.lowImpactLowEffort.tasks,
            t('lowImpact') + ' / ' + t('lowEffort'),
            categorizedTasks.lowImpactLowEffort.bgColor,
            categorizedTasks.lowImpactLowEffort.description
          )}
        </Grid>
        <Grid item xs={12} md={6}>
          {renderTaskList(
            categorizedTasks.lowImpactHighEffort.tasks,
            t('lowImpact') + ' / ' + t('highEffort'),
            categorizedTasks.lowImpactHighEffort.bgColor,
            categorizedTasks.lowImpactHighEffort.description
          )}
        </Grid>
      </Grid>
    </Grid>
  );
};

export default TaskImpactEffortMatrix;