import React, { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  useMediaQuery,
  Box,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, IconButton, Tooltip, Typography,
  Menu, MenuItem,
  ListItemIcon, ListItemText,
} from '@mui/material';
import { Folder, Settings, Campaign, Edit, Delete, FileDownload } from '@mui/icons-material'; // Import FileDownload for Export icon
import * as XLSX from 'xlsx'; // Import XLSX for Excel export

import BorderLinearProgress from '../custom/BorderLinearProgress';
import AccountAvatar from '../AccountAvatar';
import DashboardCard from '../custom/DashboardCard';
import ProjectFolder from '../ProjectFolder';

import { useTranslation } from 'react-i18next';
import ProjectEditForm from '../project/ProjectEditForm';
import ConfirmDeleteDialog from '../custom/ConfirmDeleteDialog';

const ProjectList = ({
  projects,
  handleCreateProject,
  navigate,
  onProjectSettings,
  onAnnouncement,
  onEdit,
  onDeleteClick,
  onSaveProject,
  onCancelDelete,
  onConfirmDelete,
  user,
}) => {
  const theme = useTheme();

  const { t } = useTranslation();
  const isMobile = useMediaQuery('(max-width:600px)');

  // Context Menu State
  const [contextMenu, setContextMenu] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  // Edit Form State
  const [isEditFormOpen, setEditFormOpen] = useState(false);
  const [editedProject, setEditedProject] = useState(null);

  // Delete Dialog State
  const [openConfirmDeleteDialog, setOpenConfirmDeleteDialog] = useState(false);

  // Check if any project allows actions for the current user (admin or project manager)
  const hasAuthorizedActions = projects.some((project) => {
    const userRole = project.teamMembers?.find(
      (member) => member._id === user._id
    )?.role;
    return (
      user.email === process.env.REACT_APP_ADMIN_EMAIL ||
      userRole === "Project Manager"
    );
  });

  // Function to handle Excel export
  const handleExportReport = () => {
    // Prepare data for Excel
    const data = projects.map((project) => {
      const completionPercentage =
        project.totalTasks === 0
          ? 0
          : ((project.completedTasks / project.totalTasks) * 100).toFixed(2); // Keep 2 decimal places
  
      return {
        [t('project')]: project.title,
        [t('teamMembers')]: project.teamMembers
          .map((member) => member.firstName + ' ' + member.lastName)
          .join(', '),
        [t('completedTasks')]: project.completedTasks,
        [t('totalTasks')]: project.totalTasks,
        [t('taskCompletionRate')]: `${completionPercentage}%`,
      };
    });
  
    // Calculate totals and average completion rate
    const totalTasksCompleted = projects.reduce(
      (sum, project) => sum + project.completedTasks,
      0
    );
    const totalTasks = projects.reduce(
      (sum, project) => sum + project.totalTasks,
      0
    );
    const averageCompletionRate =
      projects.length > 0
        ? (
            projects.reduce((sum, project) => {
              const rate =
                project.totalTasks === 0
                  ? 0
                  : (project.completedTasks / project.totalTasks) * 100;
              return sum + rate;
            }, 0) / projects.length
          ).toFixed(2)
        : 0;
  
    // Append summary row to the data
    data.push({
      [t('project')]: t('total'), // Label for the summary row
      [t('teamMembers')]: '', // Leave empty
      [t('completedTasks')]: totalTasksCompleted,
      [t('totalTasks')]: totalTasks,
      [t('taskCompletionRate')]: `${averageCompletionRate}%`,
    });
  
    // Convert data to worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);
  
    // Create a workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Project Report');
  
    // Export the workbook as an Excel file
    XLSX.writeFile(workbook, `${t('project')}.xlsx`);
  };

  // Open the context menu (only for admins or project managers)
  const handleRowRightClick = (event, project) => {
    event.preventDefault();

    const userRole = project.teamMembers?.find(
      (member) => member._id === user._id
    )?.role;

    // Check if the user is an admin or project manager
    if (
      user.email === process.env.REACT_APP_ADMIN_EMAIL ||
      userRole === "Project Manager"
    ) {
      setSelectedProjectId(project._id);
      setContextMenu(
        contextMenu === null
          ? {
              mouseX: event.clientX + 2,
              mouseY: event.clientY - 6,
            }
          : null
      );
    }
  };

  // Close the context menu
  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleEditClick = (project) => {
    setEditedProject(project);
    setEditFormOpen(true);
  };

  const handleCloseEditForm = () => {
    setEditedProject(null);
    setEditFormOpen(false);
  };

  const handleDeleteClick = (projectId) => {
    setSelectedProjectId(projectId);
    setOpenConfirmDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setSelectedProjectId(null);
    setOpenConfirmDeleteDialog(false);
  };

  return (
    <>
      {projects.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Button variant="contained" onClick={handleCreateProject}>
            {t('createFirstProject')}
          </Button>
        </Box>
      ) : (
        <DashboardCard
          dashboardId="Project Dashboard"
          cardId="Projects"
          displayMenu={true} // Enable menu for export functionality
          title={t('projectList')}
          subheader={t('numOfProjects') + t('colon') + projects.length}
          description={t('projectListDesc')}
          height={400}
          icon={Folder}
          color="#193f70"
          hasPinMenu={false}
          menuItems={[
            {
              label: t('exportReport'), // Add "Export Report" option
              icon: <FileDownload fontSize="small" />,
              onClick: handleExportReport, // Attach export handler
            },
          ]}
        >
          <TableContainer
            sx={{
              maxHeight: 300, // Set a specific height for the table container
              overflowY: 'auto', // Enable vertical scrolling
            }}
          >
            <Table
              size="small"
              stickyHeader
              sx={{
                "& .MuiTableRow-root:hover": {
                  backgroundColor: theme.palette.action.hover,
                },
              }}
            >
              <TableHead style={{ whiteSpace: "nowrap" }}>
                <TableRow>
                  <TableCell style={{ fontWeight: 'bold' }}>{t('project')}</TableCell>
                  {!isMobile && (
                    <>
                      <TableCell style={{ fontWeight: 'bold' }}>{t('teamMembers')}</TableCell>
                      <TableCell style={{ fontWeight: 'bold' }}>{t('taskCompletionRate')}</TableCell>
                    </>
                  )}
                  {hasAuthorizedActions && (
                    <TableCell style={{ fontWeight: 'bold' }}>{t('action')}</TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {projects.map((project, index) => {
                  const userRole = project.teamMembers?.find(
                    (member) => member._id === user._id
                  )?.role;
                  if (
                    user.email === process.env.REACT_APP_ADMIN_EMAIL ||
                    userRole
                  ) {
                    const completionRate =
                      project.totalTasks === 0
                        ? 0
                        : (
                            (project.completedTasks / project.totalTasks) *
                            100
                          ).toFixed(0);

                    return (
                      <TableRow
                        key={index}
                        onClick={() =>
                          navigate(`/project/${project._id}/progress`)
                        }
                        onContextMenu={(e) =>
                          handleRowRightClick(e, project)
                        }
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell>
                          <ProjectFolder project={project} />
                        </TableCell>
                        {!isMobile && (
                          <>
                            <TableCell align="left">
                              <Box display="flex" justifyContent="flex-start">
                                <AccountAvatar users={project.teamMembers} size="small" displayPopper={true} />
                              </Box>
                            </TableCell>
                            <TableCell>
                              {!isNaN(completionRate) ? (
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                  <BorderLinearProgress
                                    variant="determinate"
                                    value={completionRate}
                                  />
                                  <Typography variant="body2">{`${project.completedTasks}/${project.totalTasks} (${completionRate}%)`}</Typography>
                                </div>
                              ) : (
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                  <BorderLinearProgress variant="determinate" value={0} />
                                  <Typography variant="body2">{`0/0 (0%)`}</Typography>
                                </div>
                              )}
                            </TableCell>
                          </>
                        )}
                      
                        {hasAuthorizedActions && (
                          <TableCell style={{ whiteSpace: "nowrap" }} onClick={(e) => e.stopPropagation()}>
                            {(user.email === process.env.REACT_APP_ADMIN_EMAIL || project.teamMembers?.find((member) => member._id === user._id)?.role === "Project Manager") && (
                              <>
                                <Tooltip title={t('projectSettings')}>
                                  <IconButton size="small" onClick={() => onProjectSettings(project._id)}>
                                    <Settings />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title={t('announcement')}>
                                  <IconButton size="small" onClick={() => onAnnouncement(project._id)}>
                                    <Campaign />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title={t('editProject')}>
                                  <IconButton size="small" onClick={() => handleEditClick(project)}>
                                    <Edit />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title={t('deleteProject')}>
                                  <IconButton size="small" onClick={() => handleDeleteClick(project._id)}>
                                    <Delete />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  }
                  return null;
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </DashboardCard>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <Menu
          open={contextMenu !== null}
          onClose={handleCloseContextMenu}
          anchorReference="anchorPosition"
          anchorPosition={
            contextMenu !== null
              ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
              : undefined
          }
        >
          <MenuItem
            dense
            onClick={() => {
              onProjectSettings(selectedProjectId);
              handleCloseContextMenu();
            }}
          >
            <ListItemIcon>
              <Settings fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={t('projectSettings')} />
          </MenuItem>
          <MenuItem
            dense
            onClick={() => {
              onAnnouncement(selectedProjectId);
              handleCloseContextMenu();
            }}
          >
            <ListItemIcon>
              <Campaign fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={t('announcement')} />
          </MenuItem>
          <MenuItem
            dense
            onClick={() => {
              const selectedProject = projects.find((project) => project._id === selectedProjectId);
              if (selectedProject) {
                setEditedProject(selectedProject); // Set the selected project for editing
                setEditFormOpen(true); // Open the edit form
              }
              handleCloseContextMenu(); // Close the context menu
            }}
          >
            <ListItemIcon>
              <Edit fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={t('editProject')} />
          </MenuItem>
          <MenuItem
            dense
            onClick={() => {
              handleDeleteClick(selectedProjectId);
              handleCloseContextMenu();
            }}
          >
            <ListItemIcon>
              <Delete fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={t('deleteProject')} />
          </MenuItem>
        </Menu>
      )}

      {/* Edit Form */}
      {isEditFormOpen && (
        <ProjectEditForm
          project={editedProject}
          open={isEditFormOpen}
          handleClose={handleCloseEditForm}
          handleSave={onSaveProject}
        />
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDeleteDialog
        title={t('deleteProject')}
        content={t('deleteProjectConfirm')}
        open={openConfirmDeleteDialog}
        onCancel={handleCloseDeleteDialog}
        onConfirm={() => {
          onConfirmDelete(selectedProjectId);
          handleCloseDeleteDialog();
        }}
      />
    </>
  );
};

export default ProjectList;