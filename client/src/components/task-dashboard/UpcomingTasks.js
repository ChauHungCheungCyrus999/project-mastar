import React, { useContext, useEffect, useState } from 'react';
import { Typography, Skeleton } from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DashboardCard from '../custom/DashboardCard';
import ListTableSwitcher from '../task/ListTableSwitcher';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

import UserContext from '../../UserContext';

const UpcomingTasks = ({ project, setTasks }) => {
  const { user } = useContext(UserContext);
  const { t } = useTranslation();
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpcomingTasks = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/tasks/upcoming/user/${user._id}`);
        const tasks = response.data;

        // Filter tasks by current project ID
        const filteredTasks = tasks.filter(task => task.project._id === project._id);

        setUpcomingTasks(filteredTasks);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setLoading(false);
      }
    };

    fetchUpcomingTasks();
  }, [user._id, project._id]);

  return (
    <DashboardCard
      dashboardId="Task Dashboard"
      cardId="Upcoming Tasks"
      title={t('upcomingTasks')}
      description={t('upcomingTasksDesc')}
      height={600}
      icon={CalendarTodayIcon}
      color={project?.color}
      subheader={t('totalTasks') + t('colon') + upcomingTasks.length}
    >
      {loading ? (
        <Skeleton variant="rectangular" width="100%" height={350} />
      ) : upcomingTasks.length === 0 ? (
        <Typography variant="body1">{t('noUpcomingTasks')}</Typography>
      ) : (
        <ListTableSwitcher
          project={project}
          tasks={upcomingTasks}
          setTasks={setTasks}
          displayTab={false}
          displayProjectSelector={false}
          displayMilestoneSelector={true}
        />
      )}
    </DashboardCard>
  );
};

export default UpcomingTasks;
