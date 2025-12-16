import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot, TimelineOppositeContent }  from '@mui/lab';
import { Typography, Tooltip } from '@mui/material';

const TaskTimeline = ({ auditLogs }) => {
  const filteredLogs = auditLogs.filter(
    (log) => log.action === 'Create' || log.action === 'Update' || log.action === 'Delete'
  );
  const lastSixLogs = filteredLogs.slice(-6); // Get the last 6 logs

  const [users, setUsers] = useState({});

  useEffect(() => {
    // Fetch user data for all unique userIds in the logs
    const userIds = Array.from(new Set(lastSixLogs.map((log) => log.requestData?.userId)));
    fetchUsers(userIds);
  }, [lastSixLogs]);

  const fetchUsers = async (userIds) => {
    try {
      const response = await axios.get(`/api/user?ids=${userIds.join(',')}`);
      const { data } = response;
      const fetchedUsers = {};

      data.forEach((user) => {
        const fullName = `${user.firstName} ${user.lastName}`;
        fetchedUsers[user._id] = fullName;
      });

      setUsers(fetchedUsers);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const getActionLabel = (action) => {
    switch (action) {
      case 'Create':
        return 'Task Created';
      case 'Update':
        return 'Task Updated';
      case 'Delete':
        return 'Task Deleted';
      default:
        return 'Action';
    }
  };

  const getDotColor = (action) => {
    switch (action) {
      case 'Create':
        return 'info';
      case 'Update':
        return 'success';
      case 'Delete':
        return 'error';
      default:
        return 'grey';
    }
  };

  return (
    <Timeline>
      {lastSixLogs.map((log, index) => (
        <TimelineItem key={index}>
          <TimelineOppositeContent>
            <Typography variant="body2" color="textSecondary">
              {new Date(log.timestamp).toLocaleString()}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {users[log.requestData?.userId] || log.requestData?.userId}
            </Typography>
          </TimelineOppositeContent>

          <TimelineSeparator>
            <Tooltip title={log.action}>
              <TimelineDot color={getDotColor(log.action)} />
            </Tooltip>
            {index !== lastSixLogs.length - 1 && <TimelineConnector />}
          </TimelineSeparator>

          <TimelineContent>
            <Typography variant="body1">{getActionLabel(log.action)}</Typography>
            <Typography variant="body2">{log.requestUrl}</Typography>
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
};

export default TaskTimeline;