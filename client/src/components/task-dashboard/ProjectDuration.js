import React from 'react';
import { Grid, Typography } from '@mui/material';
import { formatDate } from '../../utils/DateUtils.js';
import ScheduleIcon from '@mui/icons-material/Schedule';

import DashboardCard from '../custom/DashboardCard';

import { useTranslation } from 'react-i18next';

const ProjectDuration = ({ project, tasks }) => {
  const { t } = useTranslation();

  // Calculate estimated duration
  let estimatedEarliestStartDate = null;
  let estimatedLatestEndDate = null;

  // Calculate actual duration
  let actualEarliestStartDate = null;
  let actualLatestEndDate = null;

  tasks.forEach((task) => {
    if (task) {
      // Estimated dates
      if (task.startDate && task.endDate) {
        const taskStartDate = new Date(task.startDate);
        const taskEndDate = new Date(task.endDate);

        if (estimatedEarliestStartDate === null || taskStartDate < estimatedEarliestStartDate) {
          estimatedEarliestStartDate = taskStartDate;
        }

        if (estimatedLatestEndDate === null || taskEndDate > estimatedLatestEndDate) {
          estimatedLatestEndDate = taskEndDate;
        }
      }

      // Actual dates
      if (task.actualStartDate && task.actualEndDate) {
        const actualTaskStartDate = new Date(task.actualStartDate);
        const actualTaskEndDate = new Date(task.actualEndDate);

        if (actualEarliestStartDate === null || actualTaskStartDate < actualEarliestStartDate) {
          actualEarliestStartDate = actualTaskStartDate;
        }

        if (actualLatestEndDate === null || actualTaskEndDate > actualLatestEndDate) {
          actualLatestEndDate = actualTaskEndDate;
        }
      }
    }
  });

  const calculateDuration = (startDate, endDate) => {
    if (startDate !== null && endDate !== null) {
      const durationInMilliseconds = endDate - startDate;
      return durationInMilliseconds;
    }
    return 0;
  };

  const estimatedTotalDuration = calculateDuration(estimatedEarliestStartDate, estimatedLatestEndDate);
  const actualTotalDuration = calculateDuration(actualEarliestStartDate, actualLatestEndDate);

  const formatDuration = (duration) => {
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    const millisecondsPerMonth = millisecondsPerDay * 30.44;
    const millisecondsPerYear = millisecondsPerDay * 365.25;

    const years = Math.floor(duration / millisecondsPerYear);
    duration %= millisecondsPerYear;

    const months = Math.floor(duration / millisecondsPerMonth);
    duration %= millisecondsPerMonth;

    const days = Math.floor(duration / millisecondsPerDay);

    return `${years}Y ${months}M ${days}D`;
  };

  return (
    <DashboardCard
      dashboardId="Task Dashboard"
      cardId="Project Duration"
      title={t('projectDuration')}
      description={t('projectDurationDesc')}
      height={250}
      icon={ScheduleIcon}
      color={project.color}
    >
      <Grid container spacing={1}>
        <Grid item xs={12} md={5.5}>
          <Typography variant="subtitle2">
            {t('estimated')}{t('colon')}
          </Typography>
          <Typography variant="h4">
            {formatDuration(estimatedTotalDuration)}
          </Typography>
          <Typography variant="body2">
            {formatDate(estimatedEarliestStartDate)} ~ {formatDate(estimatedLatestEndDate)}
          </Typography>
        </Grid>

        <Grid item xs={12} md={5.5}>
          <Typography variant="subtitle2">
            {t('actual')}{t('colon')}
          </Typography>
          <Typography variant="h4">
            {formatDuration(actualTotalDuration)}
          </Typography>
          <Typography variant="body2">
            {formatDate(actualEarliestStartDate)} ~ {formatDate(actualLatestEndDate)}
          </Typography>
        </Grid>
      </Grid>
    </DashboardCard>
  );
};

export default ProjectDuration;