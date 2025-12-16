import React, { useState } from 'react';
import {
  Box, Typography, Paper, Card, CardContent, List, ListItem, ListItemText,
  Divider, Chip, Fab, Accordion, AccordionSummary, AccordionDetails, Badge,
  useMediaQuery, useTheme, ListItemIcon
} from '@mui/material';
import {
  KeyboardArrowUp, Settings, Assignment, ExpandMore, MenuBook, Star, Lightbulb,
  CheckCircle, RadioButtonUnchecked, ArrowRight, Info
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const UserManual = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [activeSection, setActiveSection] = useState('getting-started');

  const sections = [
    { id: 'getting-started', title: t('gettingStarted'), icon: '🚀', color: '#1976d2' },
    { id: 'navigation', title: t('navigationAndInterface'), icon: '🧭', color: '#388e3c' },
    { id: 'projects', title: t('projectManagement'), icon: '📁', color: '#f57c00' },
    { id: 'tasks', title: t('taskManagement'), icon: '✅', color: '#7b1fa2' },
    { id: 'team', title: t('teamCollaboration'), icon: '👥', color: '#689f38' },
    { id: 'reports', title: t('reportsAndAnalytics'), icon: '📊', color: '#d32f2f' },
    { id: 'settings', title: t('settingsAndPreferences'), icon: '⚙️', color: '#455a64' },
  ];

  const handleSectionClick = (sectionId) => {
    setActiveSection(sectionId);
  };

  const renderSectionContent = (sectionId) => {
    switch (sectionId) {
      case 'getting-started':
        return (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
              🚀 {t('gettingStarted')}
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
              {t('userManualWelcome')}
            </Typography>

            <Accordion defaultExpanded sx={{
              background: 'rgba(255, 255, 255, 0.7)',
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              mb: 2,
              '&:before': { display: 'none' }
            }}>
              <AccordionSummary expandIcon={<ExpandMore />} sx={{
                background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.1), rgba(66, 165, 245, 0.05))',
                borderRadius: 2
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Settings sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {t('systemRequirements')}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 3 }}>
                <List sx={{ py: 0 }}>
                  <ListItem sx={{
                    py: 2,
                    px: 2,
                    mb: 1,
                    borderRadius: 2,
                    backgroundColor: 'rgba(255, 193, 7, 0.1)',
                    border: '1px solid rgba(255, 193, 7, 0.2)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 193, 7, 0.15)',
                    }
                  }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <CheckCircle sx={{ color: '#ffc107', fontSize: 20 }} />
                    </ListItemIcon>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {t('userManualSystemReq1')}
                    </Typography>
                  </ListItem>
                  <ListItem sx={{
                    py: 2,
                    px: 2,
                    mb: 1,
                    borderRadius: 2,
                    backgroundColor: 'rgba(255, 193, 7, 0.1)',
                    border: '1px solid rgba(255, 193, 7, 0.2)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 193, 7, 0.15)',
                    }
                  }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <CheckCircle sx={{ color: '#ffc107', fontSize: 20 }} />
                    </ListItemIcon>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {t('userManualSystemReq2')}
                    </Typography>
                  </ListItem>
                  <ListItem sx={{
                    py: 2,
                    px: 2,
                    mb: 1,
                    borderRadius: 2,
                    backgroundColor: 'rgba(255, 193, 7, 0.1)',
                    border: '1px solid rgba(255, 193, 7, 0.2)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 193, 7, 0.15)',
                    }
                  }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <CheckCircle sx={{ color: '#ffc107', fontSize: 20 }} />
                    </ListItemIcon>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {t('userManualSystemReq3')}
                    </Typography>
                  </ListItem>
                </List>
              </AccordionDetails>
            </Accordion>

            <Accordion defaultExpanded sx={{
              background: 'rgba(255, 255, 255, 0.7)',
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              mb: 2,
              '&:before': { display: 'none' }
            }}>
              <AccordionSummary expandIcon={<ExpandMore />} sx={{
                background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(129, 199, 132, 0.05))',
                borderRadius: 2
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Assignment sx={{ mr: 2, color: '#4caf50' }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                    {t('firstTimeSetup')}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 3 }}>
                <Box component="ol" sx={{ pl: 2 }}>
                  <Typography component="li" variant="body2" sx={{ mb: 1, whiteSpace: 'pre-line' }}>
                    {t('userManualSetupStep1')}
                  </Typography>
                  <Typography component="li" variant="body2" sx={{ mb: 1, whiteSpace: 'pre-line' }}>
                    {t('userManualSetupStep2')}
                  </Typography>
                  <Typography component="li" variant="body2" sx={{ mb: 1, whiteSpace: 'pre-line' }}>
                    {t('userManualSetupStep3')}
                  </Typography>
                  <Typography component="li" variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                    {t('userManualSetupStep4')}
                  </Typography>
                </Box>
              </AccordionDetails>
            </Accordion>
          </Box>
        );

      case 'navigation':
        return (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
              🧭 {t('navigationAndInterface')}
            </Typography>

            <Accordion defaultExpanded sx={{
              background: 'rgba(255, 255, 255, 0.7)',
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              mb: 2,
              '&:before': { display: 'none' }
            }}>
              <AccordionSummary expandIcon={<ExpandMore />} sx={{
                background: 'linear-gradient(135deg, rgba(56, 142, 60, 0.1), rgba(129, 199, 132, 0.05))',
                borderRadius: 2
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <MenuBook sx={{ mr: 2, color: '#388e3c' }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#388e3c' }}>
                    {t('userManualTopAppBar')}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 3 }}>
                <List sx={{ py: 0 }}>
                  <ListItem sx={{
                    py: 2,
                    px: 2,
                    mb: 1,
                    borderRadius: 2,
                    backgroundColor: 'rgba(56, 142, 60, 0.1)',
                    border: '1px solid rgba(56, 142, 60, 0.2)',
                    '&:hover': {
                      backgroundColor: 'rgba(56, 142, 60, 0.15)',
                    }
                  }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Info sx={{ color: '#388e3c', fontSize: 20 }} />
                    </ListItemIcon>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        {t('userManualLogo')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                        {t('userManualLogoDesc')}
                      </Typography>
                    </Box>
                  </ListItem>
                  <ListItem sx={{
                    py: 2,
                    px: 2,
                    mb: 1,
                    borderRadius: 2,
                    backgroundColor: 'rgba(56, 142, 60, 0.1)',
                    border: '1px solid rgba(56, 142, 60, 0.2)',
                    '&:hover': {
                      backgroundColor: 'rgba(56, 142, 60, 0.15)',
                    }
                  }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <MenuBook sx={{ color: '#388e3c', fontSize: 20 }} />
                    </ListItemIcon>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        {t('userManualMainMenu')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                        {t('userManualMainMenuDesc')}
                      </Typography>
                    </Box>
                  </ListItem>
                  <ListItem sx={{
                    py: 2,
                    px: 2,
                    mb: 1,
                    borderRadius: 2,
                    backgroundColor: 'rgba(56, 142, 60, 0.1)',
                    border: '1px solid rgba(56, 142, 60, 0.2)',
                    '&:hover': {
                      backgroundColor: 'rgba(56, 142, 60, 0.15)',
                    }
                  }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Star sx={{ color: '#388e3c', fontSize: 20 }} />
                    </ListItemIcon>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        {t('userManualSearchBar')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                        {t('userManualSearchBarDesc')}
                      </Typography>
                    </Box>
                  </ListItem>
                  <ListItem sx={{
                    py: 2,
                    px: 2,
                    mb: 1,
                    borderRadius: 2,
                    backgroundColor: 'rgba(56, 142, 60, 0.1)',
                    border: '1px solid rgba(56, 142, 60, 0.2)',
                    '&:hover': {
                      backgroundColor: 'rgba(56, 142, 60, 0.15)',
                    }
                  }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Lightbulb sx={{ color: '#388e3c', fontSize: 20 }} />
                    </ListItemIcon>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        {t('userManualThemeToggle')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                        {t('userManualThemeToggleDesc')}
                      </Typography>
                    </Box>
                  </ListItem>
                  <ListItem sx={{
                    py: 2,
                    px: 2,
                    mb: 1,
                    borderRadius: 2,
                    backgroundColor: 'rgba(56, 142, 60, 0.1)',
                    border: '1px solid rgba(56, 142, 60, 0.2)',
                    '&:hover': {
                      backgroundColor: 'rgba(56, 142, 60, 0.15)',
                    }
                  }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Assignment sx={{ color: '#388e3c', fontSize: 20 }} />
                    </ListItemIcon>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        {t('userManualLanguageSelector')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                        {t('userManualLanguageSelectorDesc')}
                      </Typography>
                    </Box>
                  </ListItem>
                  <ListItem sx={{
                    py: 2,
                    px: 2,
                    mb: 1,
                    borderRadius: 2,
                    backgroundColor: 'rgba(56, 142, 60, 0.1)',
                    border: '1px solid rgba(56, 142, 60, 0.2)',
                    '&:hover': {
                      backgroundColor: 'rgba(56, 142, 60, 0.15)',
                    }
                  }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Star sx={{ color: '#388e3c', fontSize: 20 }} />
                    </ListItemIcon>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        {t('userManualNotificationsBell')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                        {t('userManualNotificationsBellDesc')}
                      </Typography>
                    </Box>
                  </ListItem>
                </List>
              </AccordionDetails>
            </Accordion>

            <Accordion defaultExpanded sx={{
              background: 'rgba(255, 255, 255, 0.7)',
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              mb: 2,
              '&:before': { display: 'none' }
            }}>
              <AccordionSummary expandIcon={<ExpandMore />} sx={{
                background: 'linear-gradient(135deg, rgba(211, 47, 47, 0.1), rgba(244, 67, 54, 0.05))',
                borderRadius: 2
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Star sx={{ mr: 2, color: '#d32f2f' }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#d32f2f' }}>
                    {t('userManualNotifications')}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 3 }}>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                  {t('userManualNotificationsDesc')}
                </Typography>
              </AccordionDetails>
            </Accordion>
          </Box>
        );

      case 'projects':
        return (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
              📁 {t('projectManagement')}
            </Typography>

            <Accordion defaultExpanded sx={{
              background: 'rgba(255, 255, 255, 0.7)',
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              mb: 2,
              '&:before': { display: 'none' }
            }}>
              <AccordionSummary expandIcon={<ExpandMore />} sx={{
                background: 'linear-gradient(135deg, rgba(245, 124, 0, 0.1), rgba(255, 183, 77, 0.05))',
                borderRadius: 2
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Assignment sx={{ mr: 2, color: '#f57c00' }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#f57c00' }}>
                    {t('userManualCreatingProject')}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 3 }}>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line', mb: 2 }}>
                  {t('userManualCreatingProjectSteps')}
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion defaultExpanded sx={{
              background: 'rgba(255, 255, 255, 0.7)',
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              mb: 2,
              '&:before': { display: 'none' }
            }}>
              <AccordionSummary expandIcon={<ExpandMore />} sx={{
                background: 'linear-gradient(135deg, rgba(104, 159, 56, 0.1), rgba(174, 213, 129, 0.05))',
                borderRadius: 2
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <MenuBook sx={{ mr: 2, color: '#689f38' }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#689f38' }}>
                    {t('userManualTeamRoles')}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 3 }}>
                <List sx={{ py: 0 }}>
                  <ListItem sx={{
                    py: 2,
                    px: 2,
                    mb: 1,
                    borderRadius: 2,
                    backgroundColor: 'rgba(104, 159, 56, 0.1)',
                    border: '1px solid rgba(104, 159, 56, 0.2)',
                    '&:hover': {
                      backgroundColor: 'rgba(104, 159, 56, 0.15)',
                    }
                  }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Star sx={{ color: '#689f38', fontSize: 20 }} />
                    </ListItemIcon>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        {t('userManualRoleManager')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                        {t('userManualRoleManagerDesc')}
                      </Typography>
                    </Box>
                  </ListItem>
                  <ListItem sx={{
                    py: 2,
                    px: 2,
                    mb: 1,
                    borderRadius: 2,
                    backgroundColor: 'rgba(104, 159, 56, 0.1)',
                    border: '1px solid rgba(104, 159, 56, 0.2)',
                    '&:hover': {
                      backgroundColor: 'rgba(104, 159, 56, 0.15)',
                    }
                  }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Assignment sx={{ color: '#689f38', fontSize: 20 }} />
                    </ListItemIcon>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        {t('userManualRoleMember')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                        {t('userManualRoleMemberDesc')}
                      </Typography>
                    </Box>
                  </ListItem>
                  <ListItem sx={{
                    py: 2,
                    px: 2,
                    mb: 1,
                    borderRadius: 2,
                    backgroundColor: 'rgba(104, 159, 56, 0.1)',
                    border: '1px solid rgba(104, 159, 56, 0.2)',
                    '&:hover': {
                      backgroundColor: 'rgba(104, 159, 56, 0.15)',
                    }
                  }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <MenuBook sx={{ color: '#689f38', fontSize: 20 }} />
                    </ListItemIcon>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        {t('userManualRoleStakeholder')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                        {t('userManualRoleStakeholderDesc')}
                      </Typography>
                    </Box>
                  </ListItem>
                </List>
              </AccordionDetails>
            </Accordion>
          </Box>
        );

      case 'tasks':
        return (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
              ✅ {t('taskManagement')}
            </Typography>

            <Accordion defaultExpanded sx={{
              background: 'rgba(255, 255, 255, 0.7)',
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              mb: 2,
              '&:before': { display: 'none' }
            }}>
              <AccordionSummary expandIcon={<ExpandMore />} sx={{
                background: 'linear-gradient(135deg, rgba(123, 31, 162, 0.1), rgba(186, 104, 200, 0.05))',
                borderRadius: 2
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Assignment sx={{ mr: 2, color: '#7b1fa2' }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#7b1fa2' }}>
                    {t('userManualCreatingTasks')}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 3 }}>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line', mb: 2 }}>
                  {t('userManualCreatingTasksSteps')}
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion defaultExpanded sx={{
              background: 'rgba(255, 255, 255, 0.7)',
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              mb: 2,
              '&:before': { display: 'none' }
            }}>
              <AccordionSummary expandIcon={<ExpandMore />} sx={{
                background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.1), rgba(66, 165, 245, 0.05))',
                borderRadius: 2
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Lightbulb sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {t('userManualTaskStatusWorkflow')}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  <Chip label={t('toDo')} color="primary" variant="outlined" />
                  <Chip label={t('inProgress')} color="warning" variant="outlined" />
                  <Chip label={t('underReview')} color="info" variant="outlined" />
                  <Chip label={t('done')} color="success" variant="outlined" />
                  <Chip label={t('onHold')} color="secondary" variant="outlined" />
                  <Chip label={t('cancelled')} color="error" variant="outlined" />
                </Box>
              </AccordionDetails>
            </Accordion>

            <Accordion defaultExpanded sx={{
              background: 'rgba(255, 255, 255, 0.7)',
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              mb: 2,
              '&:before': { display: 'none' }
            }}>
              <AccordionSummary expandIcon={<ExpandMore />} sx={{
                background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(129, 199, 132, 0.05))',
                borderRadius: 2
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <MenuBook sx={{ mr: 2, color: '#4caf50' }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                    {t('userManualMovingTasks')}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 3 }}>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                  {t('userManualMovingTasksSteps')}
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion defaultExpanded sx={{
              background: 'rgba(255, 255, 255, 0.7)',
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              mb: 2,
              '&:before': { display: 'none' }
            }}>
              <AccordionSummary expandIcon={<ExpandMore />} sx={{
                background: 'linear-gradient(135deg, rgba(117, 117, 117, 0.1), rgba(158, 158, 158, 0.05))',
                borderRadius: 2
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Star sx={{ mr: 2, color: '#757575' }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#757575' }}>
                    {t('userManualContextMenu')}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 3 }}>
                <List sx={{ py: 0 }}>
                  <ListItem sx={{
                    py: 2,
                    px: 2,
                    mb: 1,
                    borderRadius: 2,
                    backgroundColor: 'rgba(117, 117, 117, 0.1)',
                    border: '1px solid rgba(117, 117, 117, 0.2)',
                    '&:hover': {
                      backgroundColor: 'rgba(117, 117, 117, 0.15)',
                    }
                  }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Assignment sx={{ color: '#757575', fontSize: 20 }} />
                    </ListItemIcon>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        {t('edit')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                        {t('userManualContextEdit')}
                      </Typography>
                    </Box>
                  </ListItem>
                  <ListItem sx={{
                    py: 2,
                    px: 2,
                    mb: 1,
                    borderRadius: 2,
                    backgroundColor: 'rgba(117, 117, 117, 0.1)',
                    border: '1px solid rgba(117, 117, 117, 0.2)',
                    '&:hover': {
                      backgroundColor: 'rgba(117, 117, 117, 0.15)',
                    }
                  }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <MenuBook sx={{ color: '#757575', fontSize: 20 }} />
                    </ListItemIcon>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        {t('duplicate')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                        {t('userManualContextDuplicate')}
                      </Typography>
                    </Box>
                  </ListItem>
                  <ListItem sx={{
                    py: 2,
                    px: 2,
                    mb: 1,
                    borderRadius: 2,
                    backgroundColor: 'rgba(117, 117, 117, 0.1)',
                    border: '1px solid rgba(117, 117, 117, 0.2)',
                    '&:hover': {
                      backgroundColor: 'rgba(117, 117, 117, 0.15)',
                    }
                  }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <ArrowRight sx={{ color: '#757575', fontSize: 20 }} />
                    </ListItemIcon>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        {t('moveToDifferentProject')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                        {t('userManualContextMove')}
                      </Typography>
                    </Box>
                  </ListItem>
                  <ListItem sx={{
                    py: 2,
                    px: 2,
                    mb: 1,
                    borderRadius: 2,
                    backgroundColor: 'rgba(117, 117, 117, 0.1)',
                    border: '1px solid rgba(117, 117, 117, 0.2)',
                    '&:hover': {
                      backgroundColor: 'rgba(117, 117, 117, 0.15)',
                    }
                  }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Star sx={{ color: '#757575', fontSize: 20 }} />
                    </ListItemIcon>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        {t('share')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                        {t('userManualContextShare')}
                      </Typography>
                    </Box>
                  </ListItem>
                  <ListItem sx={{
                    py: 2,
                    px: 2,
                    mb: 1,
                    borderRadius: 2,
                    backgroundColor: 'rgba(117, 117, 117, 0.1)',
                    border: '1px solid rgba(117, 117, 117, 0.2)',
                    '&:hover': {
                      backgroundColor: 'rgba(117, 117, 117, 0.15)',
                    }
                  }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <CheckCircle sx={{ color: '#757575', fontSize: 20 }} />
                    </ListItemIcon>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        {t('markAsCompleted')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                        {t('userManualContextComplete')}
                      </Typography>
                    </Box>
                  </ListItem>
                  <ListItem sx={{
                    py: 2,
                    px: 2,
                    mb: 1,
                    borderRadius: 2,
                    backgroundColor: 'rgba(117, 117, 117, 0.1)',
                    border: '1px solid rgba(117, 117, 117, 0.2)',
                    '&:hover': {
                      backgroundColor: 'rgba(117, 117, 117, 0.15)',
                    }
                  }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Info sx={{ color: '#757575', fontSize: 20 }} />
                    </ListItemIcon>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        {t('delete')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                        {t('userManualContextDelete')}
                      </Typography>
                    </Box>
                  </ListItem>
                </List>
              </AccordionDetails>
            </Accordion>
          </Box>
        );

      case 'team':
        return (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
              👥 {t('teamCollaboration')}
            </Typography>

            <Accordion defaultExpanded sx={{
              background: 'rgba(255, 255, 255, 0.7)',
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              mb: 2,
              '&:before': { display: 'none' }
            }}>
              <AccordionSummary expandIcon={<ExpandMore />} sx={{
                background: 'linear-gradient(135deg, rgba(211, 47, 47, 0.1), rgba(244, 67, 54, 0.05))',
                borderRadius: 2
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Star sx={{ mr: 2, color: '#d32f2f' }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#d32f2f' }}>
                    {t('userManualRealtimeNotifications')}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 3 }}>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                  {t('userManualRealtimeNotificationsDesc')}
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion defaultExpanded sx={{
              background: 'rgba(255, 255, 255, 0.7)',
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              mb: 2,
              '&:before': { display: 'none' }
            }}>
              <AccordionSummary expandIcon={<ExpandMore />} sx={{
                background: 'linear-gradient(135deg, rgba(245, 124, 0, 0.1), rgba(255, 183, 77, 0.05))',
                borderRadius: 2
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Assignment sx={{ mr: 2, color: '#f57c00' }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#f57c00' }}>
                    {t('userManualFileAttachments')}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 3 }}>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                  {t('userManualFileAttachmentsDesc')}
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion defaultExpanded sx={{
              background: 'rgba(255, 255, 255, 0.7)',
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              mb: 2,
              '&:before': { display: 'none' }
            }}>
              <AccordionSummary expandIcon={<ExpandMore />} sx={{
                background: 'linear-gradient(135deg, rgba(104, 159, 56, 0.1), rgba(174, 213, 129, 0.05))',
                borderRadius: 2
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <MenuBook sx={{ mr: 2, color: '#689f38' }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#689f38' }}>
                    {t('userManualCommenting')}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 3 }}>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                  {t('userManualCommentingDesc')}
                </Typography>
              </AccordionDetails>
            </Accordion>
          </Box>
        );

      case 'reports':
        return (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
              📊 {t('reportsAndAnalytics')}
            </Typography>

            <Accordion defaultExpanded sx={{
              background: 'rgba(255, 255, 255, 0.7)',
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              mb: 2,
              '&:before': { display: 'none' }
            }}>
              <AccordionSummary expandIcon={<ExpandMore />} sx={{
                background: 'linear-gradient(135deg, rgba(211, 47, 47, 0.1), rgba(244, 67, 54, 0.05))',
                borderRadius: 2
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Star sx={{ mr: 2, color: '#d32f2f' }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#d32f2f' }}>
                    {t('userManualDashboardAnalytics')}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 3 }}>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                  {t('userManualDashboardAnalyticsDesc')}
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion defaultExpanded sx={{
              background: 'rgba(255, 255, 255, 0.7)',
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              mb: 2,
              '&:before': { display: 'none' }
            }}>
              <AccordionSummary expandIcon={<ExpandMore />} sx={{
                background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(129, 199, 132, 0.05))',
                borderRadius: 2
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <MenuBook sx={{ mr: 2, color: '#4caf50' }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                    {t('userManualExportingReports')}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 3 }}>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                  {t('userManualExportingReportsDesc')}
                </Typography>
              </AccordionDetails>
            </Accordion>
          </Box>
        );

      case 'settings':
        return (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
              ⚙️ {t('settingsAndPreferences')}
            </Typography>

            <Accordion defaultExpanded sx={{
              background: 'rgba(255, 255, 255, 0.7)',
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              mb: 2,
              '&:before': { display: 'none' }
            }}>
              <AccordionSummary expandIcon={<ExpandMore />} sx={{
                background: 'linear-gradient(135deg, rgba(117, 117, 117, 0.1), rgba(158, 158, 158, 0.05))',
                borderRadius: 2
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Star sx={{ mr: 2, color: '#757575' }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#757575' }}>
                    {t('userManualAccountSettings')}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 3 }}>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                  {t('userManualAccountSettingsDesc')}
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion defaultExpanded sx={{
              background: 'rgba(255, 255, 255, 0.7)',
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              mb: 2,
              '&:before': { display: 'none' }
            }}>
              <AccordionSummary expandIcon={<ExpandMore />} sx={{
                background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.1), rgba(100, 181, 246, 0.05))',
                borderRadius: 2
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Lightbulb sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {t('userManualDashboardCustomization')}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 3 }}>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                  {t('userManualDashboardCustomizationDesc')}
                </Typography>
              </AccordionDetails>
            </Accordion>
          </Box>
        );

      default:
        return null;
    }
  };

  const Sidebar = () => (
    <Paper
      elevation={3}
      sx={{
        width: 300,
        height: '100%',
        overflowY: 'auto',
        backgroundColor: 'background.paper',
        borderRadius: 2,
        //background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.2)'
      }}
    >
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <MenuBook sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            {t('userManual')}
          </Typography>
        </Box>

        <Box>
          {sections.map((section, index) => (
            <Card
              key={section.id}
              sx={{
                mb: 2,
                cursor: 'pointer',
                backgroundColor: activeSection === section.id ? 'rgba(25, 118, 210, 0.1)' : 'rgba(255,255,255,0.8)',
                border: activeSection === section.id ? `2px solid ${section.color}` : '1px solid rgba(0,0,0,0.1)',
                borderRadius: 2,
                transition: 'all 0.3s ease-in-out',
                transform: activeSection === section.id ? 'translateX(5px)' : 'translateX(0)',
                boxShadow: activeSection === section.id ? `0 4px 12px ${section.color}30` : '0 2px 8px rgba(0,0,0,0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  transform: 'translateY(-2px)',
                  boxShadow: `0 6px 16px ${section.color}40`,
                }
              }}
              onClick={() => handleSectionClick(section.id)}
            >
              <CardContent sx={{ py: 2, px: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      sx={{
                        mr: 2,
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        backgroundColor: section.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '1rem'
                      }}
                    >
                      {section.icon}
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: activeSection === section.id ? 'bold' : '500',
                        color: activeSection === section.id ? section.color : 'text.primary'
                      }}
                    >
                      {section.title}
                    </Typography>
                  </Box>
                  {activeSection === section.id && (
                    <Star sx={{ color: section.color, fontSize: 18 }} />
                  )}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>
    </Paper>
  );

  const MobileTopSidebar = () => (
    <Paper
      elevation={2}
      sx={{
        width: '100%',
        backgroundColor: 'background.paper',
        mb: 2
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          {t('userManual')}
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {sections.map((section) => (
            <Card
              key={section.id}
              sx={{
                cursor: 'pointer',
                backgroundColor: activeSection === section.id ? 'action.selected' : 'background.paper',
                border: activeSection === section.id ? `2px solid ${section.color}` : '1px solid transparent',
                borderRadius: 2,
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  backgroundColor: 'action.hover',
                  transform: 'translateY(-1px)',
                  boxShadow: `0 2px 8px ${section.color}40`,
                }
              }}
              onClick={() => handleSectionClick(section.id)}
            >
              <CardContent sx={{ py: 2, px: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box
                    sx={{
                      mr: 2,
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      backgroundColor: section.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '0.875rem'
                    }}
                  >
                    {section.icon}
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: activeSection === section.id ? 'bold' : '500',
                      color: activeSection === section.id ? section.color : 'text.primary',
                      fontSize: '0.875rem'
                    }}
                  >
                    {section.title}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>
    </Paper>
  );

  if (isMobile) {
    return (
      <Box sx={{ height: 'calc(100vh - 100px)' }}>
        {/* Mobile Top Sidebar */}
        <MobileTopSidebar />

        {/* Main Content */}
        <Box sx={{ overflowY: 'auto', p: 3, height: 'calc(100% - 80px)' }}>
          {/* Content Header */}
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Typography variant="h5" sx={{
              background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 'bold',
              mb: 1
            }}>
              {sections.find(s => s.id === activeSection)?.title}
            </Typography>
          </Box>

          {/* Content */}
          <Box sx={{
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: 2,
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            p: 3
          }}>
            {renderSectionContent(activeSection)}
          </Box>

          {/* Scroll to Top Button */}
          <Box sx={{ position: 'fixed', bottom: 24, right: 24 }}>
            <Fab
              size="small"
              color="primary"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              sx={{
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease-in-out'
              }}
            >
              <KeyboardArrowUp />
            </Fab>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{
      display: 'flex',
      height: 'calc(100vh - 100px)',
      //background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    }}>
      {/* Desktop Sidebar */}
      <Box sx={{ width: 300, flexShrink: 0 }}>
        <Sidebar />
      </Box>

      {/* Desktop Main Content */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 2, background: 'transparent' }}>
        {/* Content Header */}
        {/*<Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" sx={{
            background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold',
            mb: 1
          }}>
            {sections.find(s => s.id === activeSection)?.title}
          </Typography>
        </Box>*/}

        {/* Enhanced Content */}
        <Box sx={{
          maxWidth: 900,
          mx: 'auto',
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          p: 3
        }}>
          {renderSectionContent(activeSection)}
        </Box>

        {/* Enhanced Scroll to Top Button */}
        <Box sx={{ position: 'fixed', bottom: 32, right: 32 }}>
          <Fab
            size="medium"
            color="primary"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            sx={{
              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
              '&:hover': {
                boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)',
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.3s ease-in-out'
            }}
          >
            <KeyboardArrowUp />
          </Fab>
        </Box>
      </Box>
    </Box>
  );
};

export default UserManual;
