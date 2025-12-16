import { useContext, useState, useEffect, Fragment } from 'react';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';
import { Link } from 'react-router-dom';
import io from 'socket.io-client';

// ** MUI Imports
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import MuiMenu from '@mui/material/Menu';
import MuiAvatar from '@mui/material/Avatar';
import MuiMenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Badge from '@mui/material/Badge';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';

// ** Custom Components
import CSwipeableDrawer from './custom/CSwipeableDrawer';

// ** Icons Imports
import DraftsIcon from '@mui/icons-material/Drafts';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import MarkAsUnreadIcon from '@mui/icons-material/MarkAsUnread';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import MoreVertIcon from '@mui/icons-material/MoreVert';

import { getDaysAgo } from '../utils/DateUtils.js';

// ** Third Party Components
import { useTranslation } from 'react-i18next';

import UserContext from '../UserContext';

// ** Styled Menu component
const Menu = styled(MuiMenu)(({ theme }) => ({
  '& .MuiMenu-paper': {
    width: 'fit-content',
    maxWidth: '700px',
    overflow: 'hidden',
    marginTop: '8px',
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
  },
  '& .MuiMenu-list': {
    padding: 0,
  },
}));

// ** Styled MenuItem component
const MenuItem = styled(MuiMenuItem)(({ theme }) => ({
  paddingTop: '8px',
  paddingBottom: '8px',
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const styles = {
  maxHeight: 349,
  '& .MuiMenuItem-root:last-of-type': {
    border: 0,
  },
};

// ** Styled Avatar component
const Avatar = styled(MuiAvatar)({
  width: '2.375rem',
  height: '2.375rem',
  fontSize: '1.125rem',
});

// ** Styled component for the title in MenuItems
const MenuItemTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  flex: '1 1 100%',
  overflow: 'hidden',
  fontSize: '0.875rem',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  marginBottom: '6px',
}));

// ** Styled component for the subtitle in MenuItems
const MenuItemSubtitle = styled(Typography)({
  flex: '1 1 100%',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
});

const NotificationDropdown = () => {
  const { user, setUser } = useContext(UserContext);
  const isMobile = useMediaQuery('(max-width:600px)');

  const theme = useTheme();

  useEffect(() => {
    if (user && user._id) {
      const socket = io(process.env.REACT_APP_SERVER_HOST);

      socket.on('connect', () => {
        console.log('Connected to server');
        socket.emit('setUserId', user._id);
      });

      socket.on('notification', (notification) => {
        //console.log('Received notification:', notification);
        setNotifications((prevNotifications) => {
          const updatedNotifications = [notification, ...prevNotifications];
          checkUnreadNotifications(updatedNotifications);
          return updatedNotifications;
        });
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [user]);

  const { t, i18n } = useTranslation();

  // ** States
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [error, setError] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleDropdownOpen = (event) => {
    setAnchorEl(event.currentTarget);
    if (isMobile) {
      setDrawerOpen(true);
    }
  };

  const handleDropdownClose = (event) => {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    setAnchorEl(null);
    setDrawerOpen(false);
  };

  // Notification Menu
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedNotificationId, setSelectedNotificationId] = useState(null);

  const handleMenuOpen = (event, notificationId) => {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    setMenuAnchorEl(event.currentTarget);
    setSelectedNotificationId(notificationId);
  };

  const handleMenuClose = (event) => {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    setMenuAnchorEl(null);
    setSelectedNotificationId(null);
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/notifications/${user._id}`);
        setNotifications(response.data);
        checkUnreadNotifications(response.data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setError(error);
      }
    };

    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const checkUnreadNotifications = (notifications) => {
    const unreadCount = notifications.filter((notification) => !notification.read).length;
    setUnreadNotificationsCount(unreadCount);
  };

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

  // Unread one notification
  const handleNotificationUnreadClick = (notificationId) => {
    axios.patch(`${process.env.REACT_APP_SERVER_HOST}/api/notifications/${notificationId}/unread`)
      .then(response => {
        // Optionally update the state to reflect the change
        setNotifications(prevNotifications =>
          prevNotifications.map(notification =>
            notification._id === notificationId ? { ...notification, read: false } : notification
          )
        );
      })
      .catch(error => {
        console.error('Error updating notification unread status:', error);
      });
  };

  // Read All Notifications
  const handleReadAllNotifications = () => {
    axios.patch(`${process.env.REACT_APP_SERVER_HOST}/api/notifications/${user._id}/readAll`)
      .then(response => {
        // Update the state to mark all notifications as read
        setNotifications(prevNotifications =>
          prevNotifications.map(notification => ({
            ...notification,
            read: true
          }))
        );
        setUnreadNotificationsCount(0);
      })
      .catch(error => {
        console.error('Error marking all notifications as read:', error);
      });
  };

  const renderNotifications = () => (
    <List sx={{ p:0, minWidth: isMobile ? 'auto':500, minHeight: isMobile ? 'auto':300, maxHeight: isMobile ? 'auto':349, overflowY: 'auto', overflowX: isMobile ? 'scroll' : 'hidden' }}>
      {notifications?.length > 0 ? (
        notifications.map((notification, index) => (
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
                    {notification.type?.toLowerCase().includes('project') ? (
                      <FolderOutlinedIcon fontSize="small" />
                    ) : notification.type?.toLowerCase().includes('milestone') ? (
                      <FlagOutlinedIcon fontSize="small" />
                    ) : (
                      <AssignmentOutlinedIcon fontSize="small" />
                    )}
                  </Avatar>
                ) : notification.type?.toLowerCase().includes('update') ? (
                  <Avatar sx={{ bgcolor: 'success.light' }}>
                    {notification.type?.toLowerCase().includes('project') ? (
                      <FolderOutlinedIcon fontSize="small" />
                    ) : notification.type?.toLowerCase().includes('milestone') ? (
                      <FlagOutlinedIcon fontSize="small" />
                    ) : (
                      <AssignmentOutlinedIcon fontSize="small" />
                    )}
                  </Avatar>
                ) : notification.type?.toLowerCase().includes('delete') ? (
                  <Avatar sx={{ bgcolor: 'error.light' }}>
                    {notification.type?.toLowerCase().includes('project') ? (
                      <FolderOutlinedIcon fontSize="small" />
                    ) : notification.type?.toLowerCase().includes('milestone') ? (
                      <FlagOutlinedIcon fontSize="small" />
                    ) : (
                      <AssignmentOutlinedIcon fontSize="small" />
                    )}
                  </Avatar>
                ) : (
                  <Avatar>
                    <FolderOutlinedIcon fontSize="small" />
                  </Avatar>
                )}

                <Box
                  sx={{
                    mx: 2,
                    flex: '1 1',
                    display: 'flex',
                    overflow: 'hidden',
                    flexDirection: 'column',
                  }}
                >
                  <MenuItemTitle>
                    {
                      i18n.language === 'en-us' ? notification.title?.enUS
                      : i18n.language === 'zh-hk' ? notification.title?.zhHK
                      : i18n.language === 'zh-cn' ? notification.title?.zhCN
                      : ""
                    }
                  </MenuItemTitle>
                  <MenuItemSubtitle variant='body2'>
                    {
                      i18n.language === 'en-us' ? notification.description?.enUS
                      : i18n.language === 'zh-hk' ? notification.description?.zhHK
                      : i18n.language === 'zh-cn' ? notification.description?.zhCN
                      : ""
                    }
                  </MenuItemSubtitle>
                </Box>

                <Typography variant='caption' sx={{ color: 'text.disabled' }}>
                  {getDaysAgo(notification.createdAt, t, i18n)}
                </Typography>

                <Tooltip title={t('options')}>
                  <IconButton
                    id="notification-options-buton"
                    aria-controls={'notification-options-menu'}
                    size="small"
                    color={theme=='light'? "inherit":"black"}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleMenuOpen(e, notification._id);
                    }}
                    onMouseDown={(e) => { e.stopPropagation() }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Tooltip>

                <Menu
                  id="notification-options-menu"
                  anchorEl={menuAnchorEl}
                  open={Boolean(menuAnchorEl) && selectedNotificationId === notification._id}
                  onClose={handleMenuClose}
                >
                  <MenuItem
                    dense
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNotificationUnreadClick(notification._id);
                      handleMenuClose();
                    }}
                  >
                    <ListItemIcon>
                      <Box sx={{ width: 20, height: 20, backgroundColor: 'red', borderRadius: '50%' }} />
                    </ListItemIcon>
                    <ListItemText primary={t('markAsUnread')} />
                  </MenuItem>
                </Menu>
              </Box>
            </ListItemButton>
          </Box>
        ))
      ) : (
        <Box
          sx={{
            textAlign: 'center',
            color: 'gray',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 300,
          }}
        >
          <NotificationsIcon />
          <Typography sx={{ m: 1 }}>{t('noNotifications')}</Typography>
        </Box>
      )}
    </List>
  );

  return (
    <>
      <Tooltip title={t('notifications')}>
        <IconButton
          color={theme=='light'? "inherit":"black"}
          aria-haspopup="true"
          onClick={handleDropdownOpen}
          aria-controls="customized-menu"
        >
          {unreadNotificationsCount ? (
            <Badge color="secondary" /*variant="dot"*/ badgeContent={unreadNotificationsCount} sx={{ "& .MuiBadge-badge": { fontSize: 9, height: 15, minWidth: 15 } }}>
              <NotificationsNoneIcon />
            </Badge>
          ) : (
            <NotificationsNoneIcon />
          )}
        </IconButton>
      </Tooltip>

      {!isMobile ? (
        <Menu
          id="notification-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={(event) => handleDropdownClose(event)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Box
            sx={{
              p: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
              borderBottom: '1px solid #ccc'
            }}
          >
            <Typography sx={{ fontWeight: 600 }}>
              {t('notifications')}
            </Typography>

            <Chip
              size="small"
              label={`${notifications.filter(notification => !notification.read)?.length} ` + t('newNotifications')}
              color='primary'
              sx={{
                height: 20,
                fontSize: '0.75rem',
                fontWeight: 500,
                borderRadius: '10px',
              }}
            />
          </Box>

          {renderNotifications()}

          <Divider />

          <Box sx={{ m:1, display: 'flex', justifyContent: 'space-between' }}>
            <Link to="/notifications" style={{ textDecoration: 'none', color: 'inherit' }}>
              <Button variant='contained' startIcon={<MarkAsUnreadIcon/>}>
                {t('viewAllNotifications')}
              </Button>
            </Link>
            <Button variant='contained' startIcon={<DraftsIcon/>} onClick={handleReadAllNotifications}>
              {t('readAllNotifications')}
            </Button>
          </Box>
        </Menu>
      ) : (
        <CSwipeableDrawer
          open={drawerOpen}
          onOpen={() => {}}
          onClose={handleDropdownClose}
          height="90%"
        >
          <Typography variant="subtitle2" align="center" sx={{ my: '0.5rem', mt: '1rem' }}>
            {t('notifications')}
          </Typography>
          
          <Divider />
          {renderNotifications()}
          
          <Box sx={{ backgroundColor: 'background.paper', width: '100%', position: 'fixed', bottom:0 }}>
            <Divider />
            <Box sx={{ m:1, display: 'flex', justifyContent: 'space-between' }}>
              <Button variant='contained' startIcon={<MarkAsUnreadIcon/>} onClick={()=>{ window.location.href="/notifications" }}>
                {t('viewAll')}
              </Button>
              <Button variant='contained' startIcon={<DraftsIcon/>} onClick={handleReadAllNotifications}>
                {t('readAll')}
              </Button>
            </Box>
          </Box>
        </CSwipeableDrawer>
      )}
    </>
  );
};

export default NotificationDropdown;