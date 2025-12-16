import React, { useContext, useEffect, useState } from 'react';
import { Typography, Skeleton } from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DashboardCard from '../custom/DashboardCard';
import ListTableSwitcher from '../task/ListTableSwitcher';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

import UserContext from '../../UserContext';

const UserUpcomingTasks = () => {
  const { user } = useContext(UserContext);
  const { t } = useTranslation();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserUpcomingTasks = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/tasks/upcoming/user/${user._id}`);
        setTasks(response.data);
      } catch (error) {
        console.error('Failed to fetch user upcoming tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserUpcomingTasks();
  }, [user._id]);

  const columnsToShow = ['taskName', 'status', 'personInCharge', 'project', 'startDate', 'endDate'];

  return (
    <DashboardCard
      dashboardId="Project Dashboard"
      cardId="Upcoming Tasks"
      title={t('upcomingTasks')}
      description={t('upcomingTasksDesc')}
      height={600}
      icon={CalendarTodayIcon}
      subheader={`${t('totalTasks')}${t('colon')}${tasks.length}`}
      color="#193f70"
    >
      {loading ? (
        <Skeleton variant="rectangular" width="100%" height={350} />
      ) : tasks.length === 0 ? (
        <Typography variant="body1">{t('noUpcomingTasks')}</Typography>
      ) : (
        <ListTableSwitcher
          tasks={tasks}
          setTasks={setTasks}
          displayCheckbox={false}
          columnsToShow={columnsToShow}
          height="350px"
          displayTab={true}
        />
      )}
    </DashboardCard>
  );
};

export default UserUpcomingTasks;
