import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  MenuItem,
  Select,
  InputLabel,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  Button,
} from '@mui/material';
import { Home, DashboardCustomize } from '@mui/icons-material';

import { useTranslation } from 'react-i18next';

import MainContent from '../components/MainContent';

import CAlert from '../components/custom/CAlert';

const DashboarConfig = () => {
  const theme = useTheme();
  
  const { t } = useTranslation();

  const [selectedDashboard, setSelectedDashboard] = useState('Project Dashboard');
  const [dashboardData, setDashboardData] = useState({});
  const [dashboardPinState, setDashboardPinState] = useState({});
  
  const breadcrumbItems = [
    { label: 'home', href: '/', icon: <Home sx={{ mr: 0.5 }} fontSize="inherit" /> },
    { label: 'dashboardConfig', icon: <DashboardCustomize sx={{ mr: 0.5 }} fontSize="inherit" /> },
  ];

  // Alert
  const alertRef = useRef();

  // Predefined dashboards and cards
  const dashboards = {
    "Project Dashboard": {
      //"Projects": 'true',
      "Announcement": 'true',
      "User Upcoming Tasks": 'true',
      "Status Distribution": 'true',
      "Priority Distribution": 'true',
      "Difficulty Level Distribution": 'true',
      "Project Task Overview": 'true',
    },
    "Task Dashboard": {
      "Project Information": 'true',
      "Announcement": 'true',
      "Project Duration": 'true',
      "Task Completion Rate": 'false',
      "Task Velocity": 'false',
      "Status Distribution": 'true',
      "Priority Distribution": 'true',
      "Difficulty Level Distribution": 'true',
      "Milestone Overview": 'true',
      "Milestone Status Distribution": 'true',
      "Burn-down Chart": 'true',
      "Task Completion Trend": 'true',
      "Tag Distribution": 'true',
      "Team Performance": 'true',
      "Upcoming Tasks": 'true',
      "Overdue Tasks": 'true',
    },
  };  

  // Load dashboard configuration from localStorage or use defaults
  useEffect(() => {
    let storedState = {};
  
    try {
      const storedData = localStorage.getItem('dashboardPinState');
      storedState = storedData ? JSON.parse(storedData) : {};
    } catch (error) {
      console.error('Error parsing dashboardPinState:', error);
    }
  
    setDashboardPinState(storedState);
  
    const initialDashboardData = storedState[selectedDashboard] || dashboards[selectedDashboard];
    setDashboardData(initialDashboardData);
  }, [selectedDashboard]);
  

  // Handle dashboard selection change
  const handleDashboardChange = (event) => {
    setSelectedDashboard(event.target.value);
  };

  // Handle pin/unpin toggle
  const handlePinToggle = (cardId, value) => {
    const updatedDashboardData = {
      ...dashboardData,
      [cardId]: value ? 'true' : 'false',
    };
    setDashboardData(updatedDashboardData);

    // Update the pin state in memory
    setDashboardPinState((prevState) => ({
      ...prevState,
      [selectedDashboard]: updatedDashboardData,
    }));
  };

  // Save changes to localStorage
  const handleSaveChanges = () => {
    const updatedState = {
      ...dashboardPinState,
      [selectedDashboard]: dashboardData,
    };
    localStorage.setItem('dashboardPinState', JSON.stringify(updatedState));
    if (alertRef.current) {
      alertRef.current.displayAlert('success', t('dashboardConfigUpdateSuccess'));
    }
  };

  return (
    <MainContent pageTitle={t('dashboardConfig')} breadcrumbItems={breadcrumbItems}>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <InputLabel htmlFor="dashboard-select">{t('selectDashboard')}</InputLabel>
          <Select
            id="dashboard-select"
            size="small"
            displayEmpty
            value={selectedDashboard}
            onChange={handleDashboardChange}
            style={{ minWidth: '300px', marginLeft: '1rem' }}
          >
            {Object.keys(dashboards).map((dashboardKey) => (
              <MenuItem key={dashboardKey} value={dashboardKey}>
                {dashboardKey}
              </MenuItem>
            ))}
          </Select>
          <div style={{ flex: 1 }} />
          {selectedDashboard && (
            <Button variant="contained" color="primary" onClick={handleSaveChanges}>
              {t('save')}
            </Button>
          )}
        </div>

        {selectedDashboard && (
          <TableContainer style={{ height: '69.5vh', marginTop: '1rem' }}>
            <Table
              size="small"
              stickyHeader
              sx={{
                "& .MuiTableRow-root:hover": {
                  backgroundColor: theme.palette.action.hover
                }
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell style={{ fontWeight: 'bold' }}>{t('block')}</TableCell>
                  <TableCell style={{ fontWeight: 'bold' }}>{t('pinned')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(dashboardData).map(([cardId, isPinned]) => (
                  <TableRow key={cardId}>
                    <TableCell component="th" scope="row">
                      {cardId}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={isPinned === 'true'}
                        onChange={(event) => handlePinToggle(cardId, event.target.checked)}
                        size="small"
                        color="primary"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <CAlert ref={alertRef} />
    </MainContent>
  );
};

export default DashboarConfig;