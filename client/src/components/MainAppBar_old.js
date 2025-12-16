import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  useMediaQuery,
  Paper, AppBar, Toolbar, Drawer, Button, Divider,
  Typography, IconButton, Tooltip,
  List, ListItemButton, ListItemIcon, ListItemText,
  Menu, MenuItem, Stack, BottomNavigation, BottomNavigationAction
} from '@mui/material';

import MenuIcon from '@mui/icons-material/Menu';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { LocalOffer, Edit, Delete, Dashboard, Timeline, AssignmentOutlined, Group, StayPrimaryPortraitTwoTone } from '@mui/icons-material';

import GlobalSearchBar from './GlobalSearchBar';
import CreateProjectBtn from './project/CreateProjectBtn';
import ProjectEditForm from './project/ProjectEditForm';
import ConfirmDeleteDialog from './custom/ConfirmDeleteDialog';

import Logo from './Logo';
import HelpBtn from './HelpBtn';
import ThemeSwitcher from './ThemeSwitcher';
import LanguageSwitcher from './LanguageSwitcher';
import NotificationDropdown from './NotificationDropdown';

import ProjectSearchBar from './project/ProjectSearchBar';

import hexToRGB from './../utils/ColorUtils.js';

import { initProjects } from "./init/InitProjects";
import AccountBtn from './AccountBtn';
import { useTranslation } from 'react-i18next';

import UserContext from '../UserContext';

function MainAppBar({ theme, toggleTheme, isDarkMode, setAuthenticated }) {
  const { user, setUser } = useContext(UserContext);
  const isTablet = useMediaQuery('(max-width:900px)');

  const [selectedNavigationAction, setSelectedNavigationAction] = useState(-1);
  
  const fetchUserWithProjects = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/user/${user._id}`);
      //console.log("user = " + JSON.stringify(response.data));
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user by project:', error);
    }
  };

  useEffect(() => {
    fetchUserWithProjects();
  }, []);

  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const path = window.location.href.split("/")[3];
  const projectId = window.location.href.split("/")[4];
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [projects, setProjects] = useState([]/*initProjects()*/);
  const [filteredProjects, setFilteredProjects] = useState([]/*initProjects()*/);
 
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteProjectId, setDeleteProjectId] = useState(null);

  const [anchorel, setAnchorel] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [openItem, setOpenItem] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  // Projects
  const fetchProjects = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/projects`);
      const projects = await response.json();
      setProjects(projects);
      setFilteredProjects(projects);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };
  
  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleListItemClick = (event, projectId) => {
    navigate(`/project/${projectId}/dashboard`);
    navigate(0);
  };

  // Menu
  const handleOpenMenu = (event, index) => {
    event.stopPropagation();
    event.preventDefault();
    setAnchorel(event.currentTarget);
    setOpenItem(index);
  };

  const handleCloseMenu = (event, index) => {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    setAnchorel(null);
    setContextMenu(null);
    setOpenItem(null);
  };

  // Context Menu
  const handleContextMenu = (item) => (event) => {
    event.stopPropagation();
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? {
            item,
            mouseX: event.clientX + 2,
            mouseY: event.clientY - 6,
          }
        : null,
    );
    setOpenItem(item);
  };

  // Tag Setup
  const handleTagManagement = (event, projectId) => {
    handleCloseMenu(event, projectId);
    navigate(`/project/${projectId}/project-settings`);
    navigate(0);
  }

  // Edit Project
  const handleEditProject = (event, projectId) => {
    event.stopPropagation();
    console.log('Update Project = ' + projectId);
    
    const projectToEdit = projects.find((project) => project._id === projectId);
    if (projectToEdit) {
      setEditedProject(projectToEdit);
      setEditFormOpen(true);
    }

    handleCloseMenu(event, projectId);
  };

  // Delete Project
  const handleDeleteProject = (event, projectId) => {
    event.stopPropagation();
    console.log('Delete Project = ' + projectId);
    setDeleteProjectId(projectId);
    setOpenDeleteDialog(true);
    handleCloseMenu(event, projectId);
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`${process.env.REACT_APP_SERVER_HOST}/api/project/${deleteProjectId}`);
      setProjects(projects.filter((project) => project._id !== deleteProjectId));
      setFilteredProjects(projects.filter((project) => project._id !== deleteProjectId));
      console.log('Project deleted successfully');
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
    setOpenDeleteDialog(false);
  };
  
  const handleCancelDelete = () => {
    setOpenDeleteDialog(false);
  };
  
  // Update
  const [isEditFormOpen, setEditFormOpen] = useState(false);
  const [editedProject, setEditedProject] = useState(null);
  
  const handleCloseEditForm = () => {
    setEditedProject(null);
    setEditFormOpen(false);
  };

  const handleSaveProject = async (updatedProject) => {
    try {
      const response = await axios.put(`${process.env.REACT_APP_SERVER_HOST}/api/project/${updatedProject._id}`, updatedProject);
      const updatedProjects = projects.map((project) =>
        project._id === updatedProject._id ? response.data : project
      );
      setProjects(updatedProjects);
      setFilteredProjects(updatedProjects);
      //handleCloseEditForm();
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };
  
  // Search Project
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchQueryChange = (event) => {
    setSearchQuery(event.target.value);

    const filtered = projects.filter((project) =>
      project.title.toLowerCase().includes(event.target.value.toLowerCase())
    );
    setFilteredProjects(filtered);
  };

  const handleBottomNavChange = (event, newValue) => {
    setSelectedNavigationAction(newValue);
    const routes = ['/dashboard', '/progress', '/team'];
    if (projectId) {
      navigate(`/project/${projectId}${routes[newValue]}`);
    }
  };

  return (
    <React.Fragment>
      <AppBar
        /* position="static" */
        //elevation={0}
        position="sticky"
        /*style={{ width: '100vw' }}*/
        sx={{
          //backgroundColor: isDarkMode ? '#202020':theme.palette.primary.main,
          background: isDarkMode ? '#202020' : 'linear-gradient(-90deg, #7433AD, #193f70 100%)',
          //backgroundColor: 'background.default',
          //borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        <Toolbar variant="dense" sx={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title={t('expandSidebar')}>
              <IconButton onClick={handleSidebarToggle} style={{ color: 'white', marginRight: '1rem' }}>
                <MenuIcon />
              </IconButton>
            </Tooltip>

            <Logo theme="light" />
            
            {!isTablet && path === 'project' && projectId && (
              <Stack direction="row">
                <Button color="inherit" component={Link} disableRipple to={`/project/${projectId}/dashboard`}>
                  <Dashboard sx={{ mr: 0.5 }} fontSize="inherit" />
                  {t('dashboard')}
                </Button>
                <Button color="inherit" component={Link} disableRipple to={`/project/${projectId}/progress`}>
                  <AssignmentOutlined sx={{ mr: 0.5 }} fontSize="inherit" />
                  {t('progress')}
                </Button>
                <Button color="inherit" component={Link} disableRipple to={`/project/${projectId}/team`}>
                  <Group sx={{ mr: 0.5 }} fontSize="inherit" />
                  {t('team')}
                </Button>
              </Stack>
            )}
          </div>

          <Stack direction="row" sx={{ display: { xs: 'none', sm: 'flex' } }}>
            <GlobalSearchBar userId={user._id} />
            <ThemeSwitcher toggleTheme={toggleTheme} theme="light" />
            <LanguageSwitcher />
            <HelpBtn />
            <NotificationDropdown isDarkMode={isDarkMode} />
            <AccountBtn setAuthenticated={setAuthenticated} />
          </Stack>

          {/* Mobile */}
          <Stack direction="row" sx={{ display: { xs: 'flex', sm: 'none' } }}>
            <GlobalSearchBar userId={user._id} />
            <NotificationDropdown isDarkMode={isDarkMode} />
            <AccountBtn setAuthenticated={setAuthenticated} />
          </Stack>
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={isSidebarOpen} onClose={handleSidebarToggle}>
        <Tooltip title={t('collapseSidebar')} placement="right">
          <IconButton onClick={handleSidebarToggle} style={{ marginLeft: '0.5rem', marginTop: '0.5rem', marginRight: 'auto' }}>
            <ChevronLeftIcon />
          </IconButton>
        </Tooltip>

        {/* Sidebar content for mobile */}
        {isTablet && (
          <>
            <Link href="/" underline="none">
              <img
                src={isTablet ? `/logo-${isDarkMode? 'light':'dark'}.png` : `/logo-${isDarkMode? 'light':'dark'}.png`}
                style={{ maxHeight: '50px', maxWidth: '200px', verticalAlign: 'middle', marginLeft: '1rem' }}
              />
            </Link>

            <Stack direction="row" sx={{ padding: '16px' }}>
              <ThemeSwitcher toggleTheme={toggleTheme} theme="light" />
              <LanguageSwitcher />
              <HelpBtn />
            </Stack>

            <Divider />
          </>
        )}

        <Typography variant="h6" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{t('projects')}</span>
          <CreateProjectBtn setProjects={setProjects} setFilteredProjects={setFilteredProjects} />
        </Typography>

        <ProjectSearchBar searchQuery={searchQuery} handleSearchQueryChange={handleSearchQueryChange} />
        
        <List style={{ width: '300px' }}>
          {filteredProjects.map((project, index) => (
            user.email === process.env.REACT_APP_ADMIN_EMAIL || project.teamMembers?.find(member => member._id === user._id)?.role ? (
              <ListItemButton
                key={project._id}
                onClick={(event) => handleListItemClick(event, project._id)}
                onContextMenu={handleContextMenu(index)}
                disableRipple
                sx={{
                  backgroundImage: `linear-gradient(to right, rgba(${hexToRGB(project.color)}, ${isDarkMode ? 0.2 : 0.2}) 60px, transparent 50px)`,
                  backgroundRepeat: 'no-repeat',
                  cursor: 'context-menu'
                }}
              >
                <ListItemIcon>
                  <FolderOutlinedIcon />
                </ListItemIcon>
                
                <ListItemText primary={project.title} />

                <Tooltip title={t('options')}>
                  <IconButton
                    onClick={(e) => { handleOpenMenu(e, index)}}
                    onMouseDown={(e) => { e.stopPropagation() }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Tooltip>

                <Menu
                  keepMounted
                  anchorEl={anchorel}
                  open={(Boolean(anchorel) && openItem === index) || (contextMenu !== null && openItem === index)}
                  anchorReference={Boolean(anchorel) ? 'anchorOrigin' : 'anchorPosition'}
                  anchorPosition={
                    contextMenu !== null
                      ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                      : undefined
                  }
                  anchorOrigin={
                    Boolean(anchorel)
                      ? {
                          vertical: 'bottom',
                          horizontal: 'left',
                        }
                      : undefined
                  }
                  transformOrigin={
                    Boolean(anchorel)
                      ? {
                          vertical: 'top',
                          horizontal: 'left',
                        }
                      : undefined
                  }
                  onClose={handleCloseMenu}
                >
                  {user.email === process.env.REACT_APP_ADMIN_EMAIL ||
                    (
                      project.teamMembers?.find(member => member._id === user._id)?.role === "Project Manager" /*&& 
                      user.projects?.find(project => project.permissions?.some(permission => permission.name === 'tagManagement'))*/
                    ) ? (
                    <MenuItem dense onClick={(event) => handleTagManagement(event, project._id)}>
                      <ListItemIcon>
                        <LocalOffer />
                      </ListItemIcon>
                      {t('tagManagement')}
                    </MenuItem>
                  ) : null}

                  {user.email === process.env.REACT_APP_ADMIN_EMAIL ||
                    (
                      project.teamMembers?.find(member => member._id === user._id)?.role === "Project Manager" /*&& 
                      user.projects?.find(project => project.permissions?.some(permission => permission.name === 'editProject'))*/
                    ) ? (
                    <MenuItem dense onClick={(event) => handleEditProject(event, project._id)}>
                      <ListItemIcon>
                        <Edit />
                      </ListItemIcon>
                      {t('editProject')}
                    </MenuItem>
                  ) : null}

                  {user.email === process.env.REACT_APP_ADMIN_EMAIL ||
                    (
                      project.teamMembers?.find(member => member._id === user._id)?.role === "Project Manager" /*&& 
                      user.projects?.find(project => project.permissions?.some(permission => permission.name === 'deleteProject'))*/
                    ) ? (
                      <MenuItem dense onClick={(event) => handleDeleteProject(event, project._id)}>
                        <ListItemIcon>
                          <Delete />
                        </ListItemIcon>
                        {t('deleteProject')}
                      </MenuItem>
                    ) : null
                  }
                </Menu>
              </ListItemButton>
           ) : null
          ))}
        </List>
      </Drawer>

      {isEditFormOpen && (
        <ProjectEditForm
          project={editedProject}
          open={isEditFormOpen}
          handleClose={handleCloseEditForm}
          handleSave={handleSaveProject}
        />
      )}

      <ConfirmDeleteDialog
        title={t('deleteProject')}
        content={t('deleteProjectConfirm')}
        open={openDeleteDialog}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />

      {isTablet && path === 'project' && projectId && (
        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 3 }} elevation={3}>
          <BottomNavigation
            value={selectedNavigationAction}
            onChange={handleBottomNavChange}
            showLabels
            sx={{ position: 'fixed', bottom: 0, width: '100%', borderTop: '1px solid lightGray' }}
          >
            <BottomNavigationAction
              label={t('dashboard')}
              icon={<Dashboard />}
              sx={{
                color: theme.palette.primary.main,
                bgcolor: selectedNavigationAction === 0 ? (isDarkMode? '#343434':'#e8f0ff') : 'transparent',
              }}
            />
            <BottomNavigationAction
              label={t('progress')}
              icon={<Timeline />}
              sx={{
                color: theme.palette.primary.main,
                bgcolor: selectedNavigationAction === 1 ? (isDarkMode? '#343434':'#e8f0ff') : 'transparent',
              }}
            />
            <BottomNavigationAction
              label={t('team')}
              icon={<Group />}
              sx={{
                color: theme.palette.primary.main,
                bgcolor: selectedNavigationAction === 2 ? (isDarkMode? '#343434':'#e8f0ff') : 'transparent',
              }}
            />
          </BottomNavigation>
        </Paper>
      )}
    </React.Fragment>
  );
}

export default MainAppBar;