import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { Tabs, Tab, Box, Badge, TextField, InputAdornment } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MarkAsUnreadIcon from '@mui/icons-material/MarkAsUnread';
import MarkunreadIcon from '@mui/icons-material/Markunread';
import DraftsIcon from '@mui/icons-material/Drafts';
import SearchIcon from '@mui/icons-material/Search';

import MainContent from '../components/MainContent';
import NotificationList from '../components/NotificationList';

import UserContext from '../UserContext';

import { useTranslation } from 'react-i18next';

const Notifications = () => {
  const { user, setUser } = useContext(UserContext);
  
  const { t } = useTranslation();

  const breadcrumbItems = [
    { label: 'home', href: '/', icon: <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" /> },
    { label: 'notifications', icon: <NotificationsIcon sx={{ mr: 0.5 }} fontSize="inherit" /> },
  ];

  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState([]);
  const [readNotifications, setReadNotifications] = useState([]);
  const [error, setError] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');

  const [currentTab, setCurrentTab] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/notifications/${user._id}`);
        setNotifications(response.data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setError(error);
      }
    };
  
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  useEffect(() => {
    setUnreadNotifications(notifications.filter(notification => !notification.read));
    setReadNotifications(notifications.filter(notification => notification.read));
  }, [notifications]);

  // Search
const handleSearchChange = (event) => {
  setSearchQuery(event.target.value);
};

const filteredNotifications = searchQuery
  ? notifications.filter(notification =>
      notification.title?.enUS?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.title?.zhHK?.includes(searchQuery.toLowerCase()) ||
      notification.title?.zhCN?.includes(searchQuery.toLowerCase()) ||
      notification.description?.enUS?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.description?.zhHK?.includes(searchQuery.toLowerCase()) ||
      notification.description?.zhCN?.includes(searchQuery.toLowerCase())
    )
  : notifications;

const filteredUnreadNotifications = searchQuery
  ? unreadNotifications.filter(notification =>
      notification.title?.enUS?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.title?.zhHK?.includes(searchQuery.toLowerCase()) ||
      notification.title?.zhCN?.includes(searchQuery.toLowerCase()) ||
      notification.description?.enUS?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.description?.zhHK?.includes(searchQuery.toLowerCase()) ||
      notification.description?.zhCN?.includes(searchQuery.toLowerCase())
    )
  : unreadNotifications;

const filteredReadNotifications = searchQuery
  ? readNotifications.filter(notification =>
      notification.title?.enUS?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.title?.zhHK?.includes(searchQuery.toLowerCase()) ||
      notification.title?.zhCN?.includes(searchQuery.toLowerCase()) ||
      notification.description?.enUS?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.description?.zhHK?.includes(searchQuery.toLowerCase()) ||
      notification.description?.zhCN?.includes(searchQuery.toLowerCase())
    )
  : readNotifications;

  // Tab
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  return (
    <MainContent pageTitle="notifications" breadcrumbItems={breadcrumbItems}>
      <TextField
        variant="outlined"
        size="small"
        fullWidth
        placeholder={t('search')}
        value={searchQuery}
        onChange={handleSearchChange}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />

      <Tabs value={currentTab} onChange={handleTabChange} aria-label={t('notifications')}>
        <Tab label={t("all")} icon={
          <Badge badgeContent={notifications.length} color="primary">
            <MarkAsUnreadIcon />
          </Badge>
        } />
        <Tab label={t("unreadNotifications")} icon={
          <Badge badgeContent={unreadNotifications.length} color="error">
            <MarkunreadIcon />
          </Badge>
          } />
        <Tab label={t("readNotifications")} icon={
          <Badge badgeContent={readNotifications.length} color="success">
            <DraftsIcon />
          </Badge>
        } />
      </Tabs>
      
      <Box sx={{ px:1, py:1 }}>
        {currentTab === 0 && <NotificationList notifications={filteredNotifications} setNotifications={setNotifications} />}
        {currentTab === 1 && <NotificationList notifications={filteredUnreadNotifications} setNotifications={setNotifications} />}
        {currentTab === 2 && <NotificationList notifications={filteredReadNotifications} setNotifications={setNotifications} />}
      </Box>
    </MainContent>
  );
};

export default Notifications;