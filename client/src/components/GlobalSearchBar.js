import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  CssBaseline, useMediaQuery,
  Stack, Box, Tooltip, InputBase, Typography, IconButton,
  List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Collapse, Dialog, DialogTitle, DialogContent,
  Tabs, Tab, CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

import axios from 'axios';

import StatusChip from './StatusChip';
import AccountAvatar from './AccountAvatar';

import { useTranslation } from 'react-i18next';

import CSwipeableDrawer from './custom/CSwipeableDrawer';

function GlobalSearchBar({ userId }) {
  const theme = useTheme();

  const { t } = useTranslation();
  const navigate = useNavigate();

  const isMobile = useMediaQuery('(max-width:600px)');

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchResults, setSearchResults] = useState({ projectResults: [], userResults: [] });
  const [keywords, setKeywords] = useState('');
  const [debouncedKeywords, setDebouncedKeywords] = useState('');
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [expandedProjects, setExpandedProjects] = useState({});

  const handleDropdownClose = () => {
    setDrawerOpen(false);
    setSearchResults({ projectResults: [], userResults: [] });
    setKeywords('');
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSearchClick();
    }
  };

  // Debounced search function
  const debouncedSearch = useCallback(async (searchTerm) => {
    if (searchTerm.trim() === "") {
      setSearchPerformed(false);
      setSearchResults({ projectResults: [], userResults: [] });
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      console.log('Global search request:', { searchTerm, userId });
      const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/search/${encodeURIComponent(searchTerm)}`, {
        params: {
          userId: userId
        }
      });
      console.log('Global search response:', response.data);
      setSearchResults({
        projectResults: response.data.projectResults || [],
        userResults: response.data.userResults || []
      });
      setSearchPerformed(true);
    } catch (error) {
      console.error('Error searching:', error);
      console.error('Error response:', error.response?.data);
      setSearchResults({ projectResults: [], userResults: [] });
      setSearchPerformed(true);
    } finally {
      setIsSearching(false);
    }
  }, [userId]);

  // Debounce effect
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedKeywords(keywords);
    }, 300); // 300ms debounce

    return () => {
      clearTimeout(handler);
    };
  }, [keywords]);

  // Trigger search when debounced keywords change
  useEffect(() => {
    if (debouncedKeywords.trim() !== '') {
      debouncedSearch(debouncedKeywords);
    } else {
      setSearchResults({ projectResults: [], userResults: [] });
      setSearchPerformed(false);
    }
  }, [debouncedKeywords, debouncedSearch]);

  const handleSearchClick = () => {
    if (keywords.trim() === '') {
      setSearchResults({ projectResults: [], userResults: [] });
      setSearchPerformed(false);
    } else {
      setDrawerOpen(true);
      // If already searching with current keywords, just open drawer
      if (debouncedKeywords === keywords && isSearching) {
        return;
      }
      // Otherwise trigger immediate search
      debouncedSearch(keywords);
    }
  };

  const handleProjectClick = (projectId) => {
    navigate(`/project/${projectId}/dashboard`);
    handleDropdownClose();
  };

  const handleTaskClick = (projectId, taskId) => {
    navigate(`/project/${projectId}/task/${taskId}`);
    handleDropdownClose();
  };

  const handleUserClick = (userId) => {
    window.location.href = `/user-profile/${userId}`;
  };

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const handleExpandClick = (projectId) => {
    setExpandedProjects((prev) => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
  };

  const renderSearchResults = () => (
    <Box sx={{ overflowY: 'auto', maxHeight: isMobile ? '100%' : '70vh' }}>
      {isSearching && (
        <Box display="flex" justifyContent="center" alignItems="center" sx={{ py: 4 }}>
          <CircularProgress size={24} />
          <Typography variant="body2" sx={{ ml: 2 }}>
            {t('searching')}...
          </Typography>
        </Box>
      )}

      {searchPerformed && !isSearching && (
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          aria-label="search results tabs"
          sx={{
            backgroundColor: theme.palette.background.default,
            position: 'sticky',
            top: 0,
            zIndex: 1,
            borderBottom: '1px solid #ddd'
          }}
        >
          <Tab label={`${t('project')} (${searchResults?.projectResults?.length || 0})`} />
          <Tab label={`${t('user')} (${searchResults?.userResults?.length || 0})`} />
        </Tabs>
      )}

      <Box role="tabpanel" hidden={tabIndex !== 0}>
        {isSearching ? (
          <Box display="flex" justifyContent="center" alignItems="center" sx={{ py: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : searchResults?.projectResults?.length > 0 ? (
          <List disablePadding>
            {searchResults?.projectResults?.map((project) => (
              <React.Fragment key={project.projectId}>
                <ListItemButton onClick={() => handleExpandClick(project.projectId)}>
                  <ListItemIcon>
                    <FolderOutlinedIcon />
                  </ListItemIcon>
                  <ListItemText primary={`${project.title} (${project?.tasks?.length || 0})`} />
                  {expandedProjects[project.projectId] ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
                <Collapse in={expandedProjects[project.projectId]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {project?.tasks?.map((task) => (
                      <ListItemButton
                        key={task.taskId}
                        onClick={() => handleTaskClick(project.projectId, task.taskId)}
                        sx={{
                          paddingLeft: isMobile ? '' : '75px', // Indent tasks
                          py: 0
                        }}
                      >
                        <ListItemText
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            width: '100%',
                          }}
                          primary={task.taskName}
                          secondary={<StatusChip status={task.status} />}
                          primaryTypographyProps={{ variant: isMobile ? 'body2' : 'body1', style: { marginRight: 'auto' } }}
                        />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              </React.Fragment>
            ))}
          </List>
        ) : (
          searchPerformed && !isSearching && (
            <Typography variant="body1" sx={{ m: 2 }}>
              {keywords.trim() === '' ? t('enterSearchTerm') : t('noProjectTaskFound')}
            </Typography>
          )
        )}
      </Box>

      <Box role="tabpanel" hidden={tabIndex !== 1}>
        {isSearching ? (
          <Box display="flex" justifyContent="center" alignItems="center" sx={{ py: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : searchResults?.userResults?.length > 0 ? (
          <List sx={{ p: 0 }}>
            {searchResults?.userResults?.map((user) => (
              <ListItemButton
                key={user._id}
                onClick={() => handleUserClick(user._id)}
              >
                <ListItemIcon>
                  <AccountAvatar users={user} displayPopper={false} />
                </ListItemIcon>
                <ListItemText primary={`${user.firstName} ${user.lastName}`} secondary={user.email} />
              </ListItemButton>
            ))}
          </List>
        ) : (
          searchPerformed && !isSearching && (
            <Typography variant="body1" sx={{ m: 2 }}>
              {keywords.trim() === '' ? t('enterSearchTerm') : t('noUserFound')}
            </Typography>
          )
        )}
      </Box>
    </Box>
  );

  return (
    <Box display="flex" alignItems="center">
      <CssBaseline />

      <Tooltip title={t('search')}>
        <IconButton
          color={theme === 'light' ? 'inherit' : 'black'}
          onClick={() => setDrawerOpen(true)}
          aria-label={t('search')}
        >
          <SearchIcon />
        </IconButton>
      </Tooltip>

      {isMobile ? (
        <CSwipeableDrawer
          open={drawerOpen}
          onOpen={() => {}}
          onClose={handleDropdownClose}
          height="90%"
        >
          <Box sx={{ position: 'sticky', top: 0, zIndex: 1, borderBottom: '1px solid #ddd', borderRadius: '20px 20px 0 0', px: 1, pl: 2, py: 1 }}>
            <Box display="flex" alignItems="center">
              <InputBase
                autoFocus={true}
                fullWidth
                placeholder={t('search')}
                inputProps={{ 'aria-label': t('search') }}
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <Tooltip title={t('search')}>
                <IconButton aria-label={t('search')} onClick={handleSearchClick}>
                  <SearchIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          {renderSearchResults()}
        </CSwipeableDrawer>
      ) : (
        <Dialog open={drawerOpen} onClose={handleDropdownClose} minWidth="md" maxWidth="xd">
          <DialogContent sx={{ p:'0.5rem 1rem' }}>
            <Box display="flex" alignItems="center">
              <InputBase
                autoFocus={true}
                fullWidth
                placeholder={t('search')}
                inputProps={{ 'aria-label': t('search') }}
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <Tooltip title={t('search')}>
                <IconButton aria-label={t('search')} onClick={handleSearchClick}>
                  <SearchIcon />
                </IconButton>
              </Tooltip>
            </Box>
            {renderSearchResults()}
          </DialogContent>
        </Dialog>
      )}
    </Box>
  );
}

export default GlobalSearchBar;
