import React, { useState, useEffect } from 'react';
import {
  useTheme,
  useMediaQuery,
  Card,
  CardHeader,
  CardContent,
  Avatar,
  Tooltip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { PushPin, PushPinOutlined, Pageview } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import hexToRGB from '../../utils/ColorUtils.js';
import CDialog from './CDialog';

const DashboardCard = ({
  dashboardId,
  cardId,
  displayMenu = true,
  title,
  description,
  height,
  icon: Icon,
  color,
  subheader,
  handleClick,
  hasPinMenu = true,
  menuItems = [], // Accepts an array of menu items
  children,
}) => {
  const { t } = useTranslation();

  const isTablet = useMediaQuery('(max-width:900px)');
  const theme = useTheme();

  const [anchorEl, setAnchorEl] = useState(null);
  const [isPinned, setIsPinned] = useState(true); // Default to pinned (visible)
  const [dialogOpen, setDialogOpen] = useState(false); // State to control CDialog visibility

  // Load pin state from localStorage on component mount
  useEffect(() => {
    let storedState;
    try {
      storedState = JSON.parse(localStorage.getItem('dashboardPinState')) || {};
    } catch (error) {
      console.error('Error parsing dashboardPinState:', error);
      storedState = {};
    }
    const dashboardPins = storedState[dashboardId] || {};

    // Determine pin state:
    // - Default to `true` if the card is not mentioned in localStorage
    // - Use the stored state if it exists
    if (dashboardPins[cardId] === 'false') {
      setIsPinned(false); // Explicitly unpinned
    } else {
      setIsPinned(true); // Explicitly pinned or not mentioned
    }
  }, [dashboardId, cardId]);

  // Handle menu open/close
  const handleMenuOpen = (event) => {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (event) => {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    setAnchorEl(null);
  };

  // Toggle pin state and save to localStorage
  const handlePinToggle = () => {
    let storedState;
    try {
      storedState = JSON.parse(localStorage.getItem('dashboardPinState')) || {};
    } catch (error) {
      console.error('Error parsing dashboardPinState:', error);
      storedState = {};
    }
    const dashboardPins = storedState[dashboardId] || {};

    if (isPinned) {
      // Unpin the card
      dashboardPins[cardId] = 'false';
    } else {
      // Pin the card
      dashboardPins[cardId] = 'true';
    }

    // Update localStorage and component state
    storedState[dashboardId] = dashboardPins;
    localStorage.setItem('dashboardPinState', JSON.stringify(storedState));
    setIsPinned(!isPinned);
    handleMenuClose();
  };

  // Open the dialog to view card content
  const handleViewContent = () => {
    setDialogOpen(true); // Open the dialog
    handleMenuClose(); // Close the menu
  };

  // Close the dialog
  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  // Do not render the card if it is unpinned
  if (!isPinned) {
    return null;
  }

  return (
    <>
      <Card
        variant="outlined"
        onClick={handleClick}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: height,
          cursor: handleClick ? 'pointer' : '',
          ':hover': {
            boxShadow: '10', // theme.shadows[20]
          },
          overflow: 'auto'
        }}
      >
        <CardHeader
          avatar={
            <Tooltip placement="top" title={description}>
              <Avatar
                variant="rounded"
                sx={{
                  bgcolor: theme.palette.primary.main,
                }}
              >
                <Icon />
              </Avatar>
            </Tooltip>
          }
          action={
            displayMenu && (
              <React.Fragment>
                <Tooltip title={t('options')}>
                  <IconButton
                    size="small"
                    aria-label="settings"
                    onClick={handleMenuOpen}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Tooltip>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                >
                  <MenuItem dense onClick={handleViewContent}>
                    <ListItemIcon>
                      <Pageview />
                    </ListItemIcon>
                    <ListItemText primary={t('comprehensiveView')} />
                  </MenuItem>
                  {hasPinMenu && (
                    <MenuItem dense onClick={handlePinToggle}>
                      <ListItemIcon>
                        {isPinned ? <PushPin /> : <PushPinOutlined />}
                      </ListItemIcon>
                      <ListItemText primary={isPinned ? t('unpin') : t('pin')} />
                    </MenuItem>
                  )}
                  {menuItems.map((item, index) => (
                    <MenuItem dense key={index} onClick={item.onClick}>
                      <ListItemIcon>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.label} />
                    </MenuItem>
                  ))}
                </Menu>
              </React.Fragment>
            )
          }
          title={title}
          titleTypographyProps={{ variant: 'subtitle2' }}
          subheader={subheader}
          subheaderTypographyProps={{ noWrap: true }}
          sx={{ pb: 0 }}
        />
        <CardContent sx={{ maxHeight: height }}>
          {children}
        </CardContent>
      </Card>
      
      <CDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        title={title}
      >
        {children}
      </CDialog>
    </>
  );
};

export default DashboardCard;