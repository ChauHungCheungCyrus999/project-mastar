import React from 'react';
import { useTheme } from '@mui/material/styles';
import { Link } from 'react-router-dom';
import { Paper, Box, ListItemButton, Typography, Avatar } from '@mui/material';
import axios from 'axios';

import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import NotificationsIcon from '@mui/icons-material/Notifications';

import { getDaysAgo } from '../utils/DateUtils.js';

import { useTranslation } from 'react-i18next';

const NotificationList = ({ notifications, setNotifications }) => {
  const theme = useTheme();

  const { t, i18n } = useTranslation();

  const handleNotificationClick = (notificationId) => {
    axios.patch(`${process.env.REACT_APP_SERVER_HOST}/api/notifications/${notificationId}/read`)
      .then(response => {
        setNotifications(prevNotifications =>
          prevNotifications.map(notification =>
            notification._id === notificationId ? { ...notification, read: true } : notification
          )
        );
      })
      .catch(error => {
        console.error('Error updating notification read status:', error);
      });
  };

  return (
    <Paper variant="outlined" sx={{ height: '65.9vh', overflowY: 'auto', overflowX: 'hidden' }}>
      {notifications?.length > 0 ? (
        notifications.map((notification) => (
          <Box sx={{
            borderBottom: '1px solid #ccc',
            backgroundColor: notification.read ? theme.palette.action.selected : '',
          }}>
            <ListItemButton
              dense
              key={notification._id}
              to={notification.link}
              style={{ 
                textDecoration: 'none',
                color: 'inherit'
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (!notification.read) {
                  handleNotificationClick(notification._id);
                }
              }}
            >
              <Box sx={{ width: '100%', display: 'flex', alignItems: 'center' }}>
                {notification.type?.toLowerCase().includes('create') ? (
                  <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                    <AssignmentOutlinedIcon fontSize="small" />
                  </Avatar>
                ) : notification.type?.toLowerCase().includes('update') ? (
                  <Avatar sx={{ bgcolor: 'success.light' }}>
                    <AssignmentOutlinedIcon fontSize="small" />
                  </Avatar>
                ) : notification.type?.toLowerCase().includes('delete') ? (
                  <Avatar sx={{ bgcolor: 'error.light' }}>
                    <AssignmentOutlinedIcon fontSize="small" />
                  </Avatar>
                ) : (
                  <Avatar>
                    <FolderOutlinedIcon fontSize="small" />
                  </Avatar>
                )}

                <Box
                  sx={{
                    mx: 4,
                    flex: '1 1',
                    display: 'flex',
                    overflow: 'hidden',
                    flexDirection: 'column',
                    py: 1
                  }}
                >
                  <Typography sx={{ fontWeight: 600 }}>
                    {
                      i18n.language === 'en-us' ? notification.title?.enUS
                      : i18n.language === 'zh-hk' ? notification.title?.zhHK
                      : i18n.language === 'zh-cn' ? notification.title?.zhCN
                      : ""
                    }
                  </Typography>
                  <Typography variant='body2'>
                    {
                      i18n.language === 'en-us' ? notification.description?.enUS
                      : i18n.language === 'zh-hk' ? notification.description?.zhHK
                      : i18n.language === 'zh-cn' ? notification.description?.zhCN
                      : ""
                    }
                  </Typography>
                </Box>
                <Typography variant='caption' sx={{ color: 'text.disabled' }}>
                  {getDaysAgo(notification.createdAt, t, i18n)}
                </Typography>
              </Box>
            </ListItemButton>
          </Box>
        ))
      ) : (
        <Box
          sx={{
            p: 2,
            textAlign: 'center',
            color: 'gray',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
          }}
        >
          <NotificationsIcon />
          <Typography sx={{ m: 1 }}>{t('noNotifications')}</Typography>
        </Box>
      )}
    </Paper>
  );
};

export default NotificationList;