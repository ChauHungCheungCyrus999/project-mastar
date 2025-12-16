import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Tooltip, IconButton, Avatar, Typography,
  Menu, MenuItem,
  Divider,
  Grid, Box,
  List, ListItem, ListItemIcon, ListItemAvatar, ListItemText,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';

import { useTranslation } from 'react-i18next';

import AccountAvatar from './AccountAvatar';

import UserContext from '../UserContext';

const AccountBtn = ({ setAuthenticated }) => {
  const userContext = useContext(UserContext);
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const { t } = useTranslation();

  const [anchorel, setAnchorel] = useState(null);

  const handleClick = (event) => {
    setAnchorel(event.currentTarget);
  };

  const handleAccountSettings = () => {
    navigate('/account-settings');
    handleClose();
  }

  // Logout
  const handleLogout = async () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setAuthenticated(false);
      setUser(null);
      userContext.setUser(null);
      navigate("/");
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleOpenAuditLog = async () => {
    navigate('/audit-log');
    handleClose();
  };

  const handleOpenAccessControl = async () => {
    navigate('/access-control');
    handleClose();
  };

  const handleOpenUserManagement = async () => {
    navigate('/user-management');
    handleClose();
  };

  // Open user profile
  const handleOpenUserProfile = () => {
    navigate(`/user-profile/${user._id}`);
    handleClose();
  };
  
  const handleClose = () => {
    setAnchorel(null);
  };
  
  return (
    <div>
      <Tooltip title={t('account')}>
        <IconButton onClick={handleClick}>
          <AccountAvatar users={user} size="small" displayPopper={false} />
        </IconButton>
      </Tooltip>

      <Menu
        id="account-menu"
        anchorEl={anchorel}
        open={Boolean(anchorel)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <MenuItem onClick={handleOpenUserProfile}>
          <Grid container spacing={2} style={{ display: 'flex', alignItems: 'center' }}>
            <Grid item xs={12} sm={6} style={{ display: 'flex', alignItems: 'center' }}>
              <AccountAvatar users={user} displayPopper={false} />
              <Box sx={{ ml:'1rem' }}>
                <Typography variant="body1" gutterBottom>
                  {user ? `${user.firstName} ${user.lastName}` : ''}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  {(user && user.jobTitle) && user.jobTitle}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </MenuItem>

        <Divider />
        
        {/*<MenuItem>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>*/}
        
        {user && (
          <MenuItem onClick={handleAccountSettings} dense>
            <ListItemIcon>
              <SettingsOutlinedIcon fontSize="small" />
            </ListItemIcon>
            {t('accountSettings')}
          </MenuItem>
        )}

        {user && user.email === process.env.REACT_APP_ADMIN_EMAIL && (
          <div>
            <MenuItem onClick={handleOpenAuditLog} dense>
              <ListItemIcon>
                <AssignmentOutlinedIcon fontSize="small" />
              </ListItemIcon>
              {t('auditLog')}
            </MenuItem>
            <MenuItem onClick={handleOpenAccessControl} dense>
              <ListItemIcon>
                <LockOutlinedIcon fontSize="small" />
              </ListItemIcon>
              {t('accessControl')}
            </MenuItem>
            <MenuItem onClick={handleOpenUserManagement} dense>
              <ListItemIcon>
                <PeopleAltOutlinedIcon fontSize="small" />
              </ListItemIcon>
              {t('userManagement')}
            </MenuItem>
          </div>
        )}

        <MenuItem onClick={handleLogout} dense>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          {t('logout')}
        </MenuItem>
      </Menu>
    </div>
  );
};

export default AccountBtn;