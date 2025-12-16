import React, { useContext, useEffect, useState } from 'react';
import { Typography, Skeleton } from '@mui/material';
import AlarmIcon from '@mui/icons-material/Alarm';
import DashboardCard from '../custom/DashboardCard';
import ListTableSwitcher from '../task/ListTableSwitcher';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

import UserContext from '../../UserContext';

const UserOverdueTasks = () => {
  const { user } = useContext(UserContext);
  const { t } = useTranslation();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserOverdueTasks = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/tasks/overdue/user/${user._id}`);
        setTasks(response.data);
      } catch (error) {
        console.error('Failed to fetch user overdue tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserOverdueTasks();
  }, [user._id]);

  const columnsToShow = ['taskName', 'status', 'personInCharge', 'project', 'startDate', 'endDate'];

  return (
    <DashboardCard
      dashboardId="Project Dashboard"
      cardId="Overdue Tasks"
      title={t('overdueTasks')}
      description={t('overdueTasksDesc')}
      height={600}
      icon={AlarmIcon}
      subheader={`${t('totalTasks')}${t('colon')}${tasks.length}`}
      color="#d32f2f"
    >
      {loading ? (
        <Skeleton variant="rectangular" width="100%" height={350} />
      ) : tasks.length === 0 ? (
        <Typography variant="body1">{t('noOverdueTasks')}</Typography>
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

export default UserOverdueTasks;
