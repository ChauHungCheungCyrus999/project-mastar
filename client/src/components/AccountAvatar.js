import React, { useState } from 'react';
import { Avatar, AvatarGroup, Popper, Paper, Typography, Box, Button, Divider } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import MailIcon from '@mui/icons-material/Mail';
import PhoneIcon from '@mui/icons-material/Phone';
import WorkIcon from '@mui/icons-material/Work';

import { useTranslation } from 'react-i18next';

function stringToColor(string) {
  let hash = 0;
  let i;

  if (!string)
    return "#333";

  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = '#';

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }

  return color;
}

function stringAvatar(name, email, size) {
  let initials = '';

  if (name) {
    const nameParts = name.split(' ');
    if (nameParts.length > 1) {
      initials = `${nameParts[0][0]}${nameParts[1][0]}`;
    } else if (nameParts.length === 1) {
      initials = nameParts[0][0];
    }
  } else if (email) {
    // If no name, use email prefix
    initials = email[0].toUpperCase();
  }

  let avatarSize = {};

  if (size === 'small') {
    avatarSize = {
      width: 30,
      height: 30,
      fontSize: '1rem',
      color: 'white'
    };
  } else if (size === 'large') {
    avatarSize = {
      width: 56,
      height: 56,
      fontSize: '1.5rem',
      color: 'white'
    };
  }

  return {
    sx: {
      color: 'white',
      /*border: 1,
      borderColor: 'white',*/
      bgcolor: stringToColor(name || email || 'unknown'),
      ...avatarSize,
    },
    children: initials || <PersonIcon fontSize="small" />,
  };
}

const AccountAvatar = ({ users, size, displayPopper=true }) => {
  const { t } = useTranslation();
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [hoveredUser, setHoveredUser] = useState(null);
  const [popperOpen, setPopperOpen] = useState(false);
  let hidePopperTimeout;

  const handlePopoverOpen = (event, user) => {
    if (hidePopperTimeout) {
      clearTimeout(hidePopperTimeout);
    }
    setAnchorEl(event.currentTarget);
    setHoveredUser(user);
    setPopperOpen(true);
  };

  const handlePopoverClose = () => {
    hidePopperTimeout = setTimeout(() => {
      setPopperOpen(false);
      setAnchorEl(null);
      setHoveredUser(null);
    }, 100); // Delay to allow mouse movement between avatar and popper
  };

  const handleEmailClick = (event, email) => {
    event.stopPropagation();
    event.preventDefault();
    window.location.href = `mailto:${email}`;
  };

  const handleProfileClick = (event) => {
    event.stopPropagation();
    event.preventDefault();
    if (hoveredUser && hoveredUser._id) {
      window.location.href = `/user-profile/${hoveredUser._id}`;
    }
  };

  if (Array.isArray(users) && users.length === 0) return null;

  if (Array.isArray(users) && users.length > 1) {
    const avatars = users.map((user, index) => (
      <Avatar
        key={index}
        {...stringAvatar(user?.firstName || user?.lastName || '', user?.email || '', size)}
        onMouseEnter={(event) => handlePopoverOpen(event, user)}
        onMouseLeave={handlePopoverClose}
      />
    ));
    return (
      <>
        <AvatarGroup max={5}>{avatars}</AvatarGroup>

        {displayPopper && (
          <Popper
            open={popperOpen}
            anchorEl={anchorEl}
            placement="bottom-start"
            disablePortal={false}
            style={{ zIndex: 10000 }}
            onMouseEnter={() => clearTimeout(hidePopperTimeout)}
            onMouseLeave={handlePopoverClose}
          >
            <Paper sx={{ padding: 1.5, borderRadius: 2, boxShadow: 3, maxWidth: 300 }}>
              {hoveredUser && (
                <Box display="flex" alignItems="center" p={1}>
                  <Avatar {...stringAvatar(hoveredUser.firstName || hoveredUser.lastName || '', hoveredUser.email || '', 'large')} />
                  <Box ml={2}>
                    <Typography variant="body1">{`${hoveredUser.firstName} ${hoveredUser.lastName}`}</Typography>
                    <Typography variant="body2" color='#777'>{hoveredUser.jobTitle}</Typography>
                  </Box>
                </Box>
              )}
              <Divider />
              {hoveredUser && (
                <Box mt={2}>
                  {hoveredUser.department !== "" && (
                    <Box display="flex" alignItems="center" mb={1} color='#777'>
                      <WorkIcon fontSize="small" />
                      <Typography variant="body2" ml={1}>{`${hoveredUser.department} - ${hoveredUser.organization}`}</Typography>
                    </Box>
                  )}
                  {hoveredUser.email !== "" && (
                    <Box display="flex" alignItems="center" mb={1} color='#777'>
                      <MailIcon fontSize="small" />
                      <Typography
                        variant="body2"
                        ml={1}
                        style={{
                          color: '#007bff',
                          textDecoration: 'underline',
                          cursor: 'pointer'
                        }}
                      >
                        <a onClick={(event) => handleEmailClick(event, hoveredUser.email)}>
                          {hoveredUser.email}
                        </a>
                      </Typography>
                    </Box>
                  )}
                  {hoveredUser.phone !== "" && (
                    <Box display="flex" alignItems="center" color='#777'>
                      <PhoneIcon fontSize="small" />
                      <Typography variant="body2" ml={1}>{hoveredUser.phone}</Typography>
                    </Box>
                  )}
                  <Box mt={2}>
                    <Button variant="outlined" size="small" color="primary" onClick={handleProfileClick}>
                      {t('profile')}
                    </Button>
                  </Box>
                </Box>
              )}
            </Paper>
          </Popper>
        )}
      </>
    );
  } else {
    const user = Array.isArray(users) ? users[0] : users;
    return (
      <>
        <Avatar
          {...stringAvatar(user?.firstName || user?.lastName || '', user?.email || '', size)}
          onMouseEnter={(event) => handlePopoverOpen(event, user)}
          onMouseLeave={handlePopoverClose}
        >
          {/*<PersonIcon size="small" />*/}
        </Avatar>
        {displayPopper && (
          <Popper
            open={popperOpen}
            anchorEl={anchorEl}
            placement="bottom-start"
            disablePortal={false}
            style={{ zIndex: 10000 }}
            onMouseEnter={() => clearTimeout(hidePopperTimeout)}
            onMouseLeave={handlePopoverClose}
          >
            <Paper sx={{ padding: 1.5, borderRadius: 2, boxShadow: 3, maxWidth: 300 }}>
              {hoveredUser && (
                <Box display="flex" alignItems="center" p={1}>
                  <Avatar {...stringAvatar(hoveredUser.firstName || hoveredUser.lastName || '', hoveredUser.email || '', 'large')} />
                  <Box ml={2}>
                    <Typography variant="body1">{`${hoveredUser.firstName} ${hoveredUser.lastName}`}</Typography>
                    <Typography variant="body2" color='#777'>{hoveredUser.jobTitle}</Typography>
                  </Box>
                </Box>
              )}
              <Divider />
              {hoveredUser && (
                <Box mt={2}>
                  {hoveredUser.department !== "" && (
                    <Box display="flex" alignItems="center" mb={1} color='#777'>
                      <WorkIcon fontSize="small" />
                      <Typography variant="body2" ml={1}>{`${hoveredUser.department} - ${hoveredUser.organization}`}</Typography>
                    </Box>
                  )}
                  {hoveredUser.email !== "" && (
                    <Box display="flex" alignItems="center" mb={1} color='#777'>
                      <MailIcon fontSize="small" />
                      <Typography
                        variant="body2"
                        ml={1}
                        style={{
                          color: '#007bff',
                          textDecoration: 'underline',
                          cursor: 'pointer'
                        }}
                      >
                        <a onClick={(event) => handleEmailClick(event, hoveredUser.email)}>
                          {hoveredUser.email}
                        </a>
                      </Typography>
                    </Box>
                  )}
                  {hoveredUser.phone !== "" && (
                    <Box display="flex" alignItems="center" color='#777'>
                      <PhoneIcon fontSize="small" />
                      <Typography variant="body2" ml={1}>{hoveredUser.phone}</Typography>
                    </Box>
                  )}
                  <Box mt={2}>
                    <Button variant="outlined" size="small" color="primary" onClick={handleProfileClick}>
                      {t('profile')}
                    </Button>
                  </Box>
                </Box>
              )}
            </Paper>
          </Popper>
        )}
      </>
    );
  }
};

export default AccountAvatar;