import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Box, Select, Menu, MenuItem, IconButton, Typography, Button, Tooltip, Chip, TextField, Divider, ListItemIcon, ListItemText,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
} from '@mui/material';
import { 
	DataGrid, useGridApiRef, zhTW, zhCN,
	GridToolbarContainer, GridToolbar, GridToolbarColumnsButton, GridToolbarFilterButton, GridToolbarDensitySelector,
	GridToolbarExportContainer, GridCsvExportMenuItem, GridPrintExportMenuItem, 
  GridToolbarQuickFilter,
  gridFilteredSortedRowIdsSelector, gridVisibleColumnFieldsSelector,
	useGridApiContext
} from '@mui/x-data-grid';
import * as XLSX from 'xlsx/xlsx.mjs'
import GridExcelExportMenuItem from "./GridExcelExportMenuItem";
import GridJsonExportMenuItem from "./GridJsonExportMenuItem";

import EditIcon from '@mui/icons-material/Edit';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import CloseIcon from '@mui/icons-material/Close';
import PreviewOutlinedIcon from '@mui/icons-material/PreviewOutlined';
import DriveFileMoveIcon from '@mui/icons-material/DriveFileMove';

import { useTranslation } from 'react-i18next';

import TaskEditForm from './TaskEditForm';
import ConfirmDeleteDialog from '../custom/ConfirmDeleteDialog';
import StatusChip from '../StatusChip';
import PriorityChip from '../PriorityChip';
import DifficultyLevelChip from '../DifficultyLevelChip';
import MilestoneFlag from '../MilestoneFlag';
import TagChip from '../TagChip';
import AccountAvatar from '../AccountAvatar.js';
import MoveTaskDialog from './MoveTaskDialog';

import CAlert from '../custom/CAlert';

import {
  handleCloseEditForm,
  handleEdit, handleSaveTask, handleDuplicate,
  handleDelete, confirmDelete, cancelDelete,
} from '../../utils/TaskUtils.js';
import { formatDate } from '../../utils/DateUtils.js';
import { capitalizeWordsExceptFirst } from '../../utils/StringUtils.js';

// Define the options for status, priority, and difficulty level
/*const statusOptions = ['To Do', 'In Progress', 'Under Review', 'Done', 'On Hold', 'Cancelled'];
const priorityOptions = ['Very High', 'High', 'Medium', 'Low', 'Very Low'];
const difficultyLevelOptions = ['Easy', 'Moderate', 'Difficult', 'Very Difficult'];*/

function TaskTable({ project="", tasks=[], setTasks, displayCheckbox=true, displayToolbar, columnsToShow, height="500px", onTaskMoved }) {
  const { t, i18n } = useTranslation();
  let locale = null;
  if (i18n.language === 'zh-cn') {
    locale = zhCN.components.MuiDataGrid.defaultProps.localeText;
  } else if (i18n.language === 'zh-hk') {
    locale = zhTW.components.MuiDataGrid.defaultProps.localeText;
  }

  // Alert
  const alertRef = useRef();

  const csvOptions = { delimiter: ',', fileName: `${project.title}_Tasks`, utf8WithBom: true, disableToolbarButton: true };
  const printOptions = { hideFooter: true, hideToolbar: true, disableToolbarButton: true };
  function CustomExportButton(props) {
    return (
      <GridToolbarExportContainer {...props}>
        <GridExcelExportMenuItem columns={columns} />
        <GridCsvExportMenuItem options={csvOptions} />
        <GridJsonExportMenuItem fileName={`${project.title}_Tasks.json`} />
        <GridPrintExportMenuItem options={printOptions} />
      </GridToolbarExportContainer>
    );
  }

  // DataGrid toolbar
  function CustomToolbar(props) {
    const [anchorEl, setAnchorEl] = useState(null);
  
    const handleMenuOpen = (event) => {
      setAnchorEl(event.currentTarget); // Set the button as the anchor
    };
  
    const handleMenuClose = () => {
      setAnchorEl(null); // Clear the anchor when the menu is closed
    };
  
    return (
      <GridToolbarContainer sx={{ direction: "row", justifyContent: "space-between" }}>
        <GridToolbarContainer>
          <Box>
            <Button
              id="custom-view-button"
              type="button"
              size="small"
              aria-controls={Boolean(anchorEl) ? "custom-view-menu" : undefined}
              aria-expanded={Boolean(anchorEl) ? "true" : undefined}
              aria-haspopup="true"
              startIcon={<PreviewOutlinedIcon />}
              onClick={handleMenuOpen}
            >
              {t("views")}
            </Button>
            <Menu
              id="custom-view-menu"
              aria-labelledby="custom-view-button"
              anchorEl={anchorEl} // Anchor the menu to the button
              open={Boolean(anchorEl)} // Open the menu if anchorEl is set
              onClose={handleMenuClose} // Close the menu when an action occurs
              autoFocusItem={Boolean(anchorEl)}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left", // Align horizontally with the button
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "left", // Ensure proper alignment
              }}
            >
              <MenuItem dense onClick={handleSaveViewDialogOpen}>
                <ListItemIcon>
                  <SaveOutlinedIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>{t("saveCurrentView")}</ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem dense onClick={loadDefaultColumns}>{t("default")}</MenuItem>
              {views.map((view, index) => (
                <MenuItem
                  key={index}
                  dense
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span onClick={() => loadCustomView(view)}>{view}</span>
                  <IconButton size="small" onClick={() => handleDeleteView(view)}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </MenuItem>
              ))}
            </Menu>
          </Box>
  
          <GridToolbarColumnsButton />
          <GridToolbarFilterButton />
          <GridToolbarDensitySelector />
          <CustomExportButton />
        </GridToolbarContainer>
  
        <GridToolbarQuickFilter sx={{ mr: "0.5rem" }} />
      </GridToolbarContainer>
    );
  }

  // Update
  const [mode, setMode] = useState("update");
  const [editedTask, setEditedTask] = useState(null);
  const [isEditFormOpen, setEditFormOpen] = useState(false);

  // Delete
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [openConfirmDeleteDialog, setOpenConfirmDeleteDialog] = useState(false);

  // Move
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [taskToMove, setTaskToMove] = useState(null);

  // Close Task Edit Form
  const handleCloseForm = (event, reason) => {
    /*if (reason && reason === "backdropClick")
      return;*/
    handleCloseEditForm(setEditedTask, setEditFormOpen);
  };

  // Update/Duplicate Task
  const onEdit = (taskId, mode) => {
    handleEdit(taskId, mode, tasks, setMode, setEditedTask, setEditFormOpen);
  };
  
  const onSaveTask = (updatedTask) => {
    handleSaveTask(updatedTask, tasks, setTasks);
  };
  
  const onDuplicate = (duplicatedTask) => {
    handleDuplicate(duplicatedTask, setTasks, setEditFormOpen);
  };

  // Delete Task
  const onDeleteClick = (taskId) => {
    handleDelete(taskId, setOpenConfirmDeleteDialog, setTaskToDelete);
  };

  const onConfirmDelete = () => {
    confirmDelete(taskToDelete, setTasks, setOpenConfirmDeleteDialog)
      .then(() => {
        alertRef.current.displayAlert('success', t('deleteSuccess'));
      })
      .catch((error) => {
        console.error('Error deleting task:', error.message);
        alertRef.current.displayAlert('error', t('deleteFail'));
      });
  };

  const onCancelDelete = () => {
    cancelDelete(setOpenConfirmDeleteDialog);
  };

  // Move Task
  const onMoveClick = (taskId) => {
    const task = tasks.find(t => t._id === taskId);
    if (task) {
      setTaskToMove(task);
      setMoveDialogOpen(true);
    }
  };
  
  // Edit Cell
  /*const handleEditCellChange = (params) => {
    const { id, field, value } = params;

    const updatedTasks = tasks.map((task) => {
      if (task._id === id) {
        return { ...task, [field]: value };
      }
      return task;
    });

    setTasks((prevTasks) => {
      const updatedTask = updatedTasks.find((task) => task._id === id);

      axios.put(`${process.env.REACT_APP_SERVER_HOST}/api/task/${id}`, updatedTask)
        .then((response) => {
          console.log('Task updated successfully:', response.data);
        })
        .catch((error) => {
          console.error('Error updating task:', error);
        });

      return updatedTasks;
    });
  };*/

  const statusOrder = [t('toDo'), t('inProgress'), t('underReview'), t('onHold'), t('done'), t('cancelled')];
  const priorityOrder = [t('veryLow'), t('low'), t('medium'), t('high'), t('veryHigh')];
  const difficultyLevelOrder = [t('easy'), t('moderate'), t('difficult'), t('veryDifficult')];

  const columns = [
    //{ field: 'id', headerName: 'ID', width: 250, editable: false },
    { field: 'taskName', headerName: t('taskName'), width: 300/*, editable: true*/ },
    { field: 'milestone', headerName: t('milestone'), width: 200/*, editable: true*/,
      renderCell: (params) => {
        return params.value? <MilestoneFlag milestone={params.value} /> : null;
      }
    },
    { field: 'category', headerName: t('category'), width: 200/*, editable: true*/ },
    { field: 'tags', headerName: t('tags'), width: 200/*, editable: true*/,
      renderCell: (params) => {
        return params.value? <TagChip tags={params.value} /> : null;
      }
    },
    { field: 'personInCharge', headerName: t('personInCharge'), width: 180, /*, editable: true*/
      renderCell: (params) => {
        return params.value? <AccountAvatar users={params.value} size="small" displayPopper={true} /> : null;
      },
    },
    {
      field: 'status', headerName: t('status'), width: 140,
      renderCell: (params) => {
        return params.value? <StatusChip status={params.value} /> : null;
      },
      sortComparator: (v1, v2) => {
        return statusOrder.indexOf(v1) - statusOrder.indexOf(v2);
      },
      /*editable: true,
      renderCell: (params) => (
        <Select
          value={params.value || ''}
          onChange={(e) => handleEditCellChange({ ...params, value: e.target.value })}
        >
          {statusOptions.map((option) => (
            <MenuItem key={option} value={option} dense>
              {option}
            </MenuItem>
          ))}
        </Select>
      ),*/
    },
    {
      field: 'priority', headerName: t('priority'), width: 90,
      renderCell: (params) => {
        return params.value? <PriorityChip priority={params.value} /> : null;
      },
      sortComparator: (v1, v2) => {
        return priorityOrder.indexOf(v1) - priorityOrder.indexOf(v2);
      },
      /*editable: true,
      renderCell: (params) => (
        <Select
          value={params.value || ''}
          onChange={(e) => handleEditCellChange({ ...params, value: e.target.value })}
        >
          {priorityOptions.map((option) => (
            <MenuItem key={option} value={option} dense>
              {option}
            </MenuItem>
          ))}
        </Select>
      ),*/
    },
    {
      field: 'difficultyLevel', headerName: t('difficultyLevel'), width: 120,
      renderCell: (params) => {
        return params.value? <DifficultyLevelChip mode="icon" difficultyLevel={params.value} /> : null;
      },
      sortComparator: (v1, v2) => {
        return difficultyLevelOrder.indexOf(v1) - difficultyLevelOrder.indexOf(v2);
      },
	    /*editable: true,
      renderCell: (params) => (
        <Select
          value={params.value || ''}
          onChange={(e) => handleEditCellChange({ ...params, value: e.target.value })}
        >
          {difficultyLevelOptions.map((option) => (
            <MenuItem key={option} value={option} dense>
              {option}
            </MenuItem>
          ))}
        </Select>
      ),*/
    },
    {
      field: 'color', headerName: t('color'), width: 100, editable: false,
      renderCell: (params) => {
        return params.value? <Chip label=" " size="small" sx={{ borderRadius: '30%', backgroundColor: params.value }} /> : null;
      },
    },
    { field: 'attachments', headerName: t('attachments'), width: 300, editable: false },
    { field: 'subtasks', headerName: t('subtasks'), width: 80, editable: false },
    { field: 'comments', headerName: t('comments'), width: 90, editable: false },
    { field: 'startDate', headerName: t('estimatedStartDate'), width: 150, editable: false },
    { field: 'endDate', headerName: t('estimatedEndDate'), width: 150, editable: false },
    { field: 'actualStartDate', headerName: t('actualStartDate'), width: 120, editable: false },
    { field: 'actualEndDate', headerName: t('actualEndDate'), width: 120, editable: false },
    { field: 'createdBy', headerName: t('createdBy'), width: 100, editable: false,
      renderCell: (params) => {
        return params.value? <AccountAvatar users={params.value} size="small" displayPopper={true} /> : null;
      }
     },
    { field: 'createdDate', headerName: t('createdDate'), width: 100, editable: false },
    { field: 'updatedBy', headerName: t('updatedBy'), width: 100, editable: false,
      renderCell: (params) => {
        return params.value? <AccountAvatar users={params.value} size="small" displayPopper={true} /> : null;
      }
     },
    { field: 'updatedDate', headerName: t('updatedDate'), width: 100, editable: false },
    {
			field: 'actions',
      type: 'actions',
			headerName: t('action'),
			width: 200,
			disableColumnMenu: true,
			disableColumnFilter: true,
			disableColumnSelector: true,
			disableExport: true,
			sortable: false,
			renderCell: (params) => (
				<>
          <Tooltip title={t('edit')}>
            <IconButton onClick={() => {
              console.log('Task to edit: ' + params.row.id);
              onEdit(params.row.id, "update");
            }}>
              <EditIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title={t('duplicate')}>
            <IconButton onClick={() => {
              console.log('Task to duplicate: ' + params.row.id);
              onEdit(params.row.id, "duplicate");
            }}>
              <ContentCopyIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title={t('moveToDifferentProject')}>
            <IconButton onClick={() => {
              console.log('Task to move: ' + params.row.id);
              onMoveClick(params.row.id);
            }}>
              <DriveFileMoveIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title={t('delete')}>
            <IconButton onClick={() => {
              console.log('Task to delete: ' + params.row.id);
              onDeleteClick(params.row.id);
            }}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
				</>
			)
		}
  ];

  const rows = tasks.map((task, index) => ({
    id: task._id,
    taskName: task.taskName,
    milestone: task.milestone,
    category: task.category,
    tags: task.tags,
    personInCharge: task.personInCharge
      /*? task.personInCharge.map((person) => {
        return `${person?.firstName} ${person?.lastName}` || '';
      }).join(t('comma'))
      : ''*/,
    status: t(capitalizeWordsExceptFirst(task.status)),
    priority: t(capitalizeWordsExceptFirst(task.priority)),
    difficultyLevel: t(capitalizeWordsExceptFirst(task.difficultyLevel)),
    color: task.color,
    attachments: task.attachments && task.attachments?.length > 0
      ? task.attachments.map(attachment => attachment.name).join(", ")
      : [],
    subtasks: task.subtasks?.length,
    comments: task.comments?.length,
    startDate: task.startDate!=null? formatDate(task.startDate) : "",
    endDate: task.endDate!=null? formatDate(task.endDate) : "",
    actualStartDate: task.actualStartDate!=null? formatDate(task.actualStartDate) : "",
    actualEndDate: task.actualEndDate!=null? formatDate(task.actualEndDate) : "",
    createdBy: task.createdBy,
    createdDate: formatDate(task.createdDate),
    updatedBy: task.updatedBy,
    updatedDate: formatDate(task.updatedDate),
  }));


  // Save DataGrid Toolbar state
  const apiRef = useGridApiRef();
  useEffect(() => {
    try {
      const stateJSON = localStorage.getItem("dataGridTableState");
      if (stateJSON)
        apiRef.current.restoreState(JSON.parse(stateJSON));
    } catch (e) {
      console.log(e);
    }
  }, []);


  /* Custom Views */
  const [anchorEl, setAnchorEl] = useState(null);
  const [views, setViews] = useState([]);
  
  // Save View
  const [openSaveViewDialog, setOpenSaveViewDialog] = useState(false);
  const [newViewName, setNewViewName] = useState('');

  const handleSaveViewDialogOpen = () => {
    setOpenSaveViewDialog(true);
    setAnchorEl(null);
  };

  const handleSaveViewDialogClose = () => {
    setOpenSaveViewDialog(false);
    setNewViewName('');
  };

  const handleSaveView = () => {
    if (newViewName) {
      saveCustomView(newViewName);
      handleSaveViewDialogClose();
    }
  };

  // Delete View
  const [viewToDelete, setViewToDelete] = useState(null);
  const [openDeleteViewDialog, setOpenDeleteViewDialog] = useState(false);

  const handleDeleteView = (viewName) => {
    setViewToDelete(viewName);
    setOpenDeleteViewDialog(true);
    setAnchorEl(null);
  };

  const confirmDeleteView = () => {
    const updatedViews = views.filter(view => view !== viewToDelete);
    setViews(updatedViews);
    localStorage.setItem("dataGridViews", JSON.stringify(updatedViews));
    localStorage.removeItem(`dataGridView_${viewToDelete}`);
    setOpenDeleteViewDialog(false);
  };

  const cancelDeleteView = () => {
    setOpenDeleteViewDialog(false);
  };

  const loadDefaultColumns = () => {
    const defaultState = {
      columns: {
        columnVisibilityModel: {
          taskName: true,
          milestone: true,
          category: true,
          tags: true,
          personInCharge: true,
          status: true,
          priority: true,
          difficultyLevel: true,
          color: false,
          attachments: false,
          subtasks: false,
          comments: false,
          startDate: true,
          endDate: true,
          actualStartDate: true,
          actualEndDate: true,
          createdDate: false,
          updatedDate: false,
          actions: true,
        }
      }
    };
    apiRef.current.restoreState(defaultState);
    localStorage.setItem("dataGridTableState", JSON.stringify(defaultState));
  };

  const loadCustomView = (viewName) => {
    try {
      const viewJSON = localStorage.getItem(`dataGridView_${viewName}`);
      if (viewJSON) {
        apiRef.current.restoreState(JSON.parse(viewJSON));
      }
    } catch (e) {
      console.log(e);
    }
  };

  const saveCustomView = (viewName) => {
    const state = apiRef.current.exportState();
    localStorage.setItem(`dataGridView_${viewName}`, JSON.stringify(state));
    const updatedViews = [...views, viewName];
    setViews(updatedViews);
    localStorage.setItem("dataGridViews", JSON.stringify(updatedViews));
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    try {
      const stateJSON = localStorage.getItem("dataGridTableState");
      if (stateJSON)
        apiRef.current.restoreState(JSON.parse(stateJSON));
      const savedViews = JSON.parse(localStorage.getItem("dataGridViews")) || [];
      setViews(savedViews);
    } catch (e) {
      console.log(e);
    }
  }, []);

  const [sortModel, setSortModel] = React.useState([
    {
      field: 'status',
      sort: 'asc',
    },
    {
      field: 'priority',
      sort: 'desc',
    },
    {
      field: 'difficultyLevel',
      sort: 'asc',
    },
  ]);
  
  return (
    <div style={{ width:'100%', height:height, maxHight:'100vh' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={10}
        checkboxSelection={displayCheckbox}
        disableSelectionOnClick
        density="compact"
        editMode="cell"
        sortModel={sortModel}
        onSortModelChange={(newSortModel) => setSortModel(newSortModel)}
        autoHeight={false}
        //onEditCellChangeCommitted={handleEditCellChange}
        initialState={{
          columns: {
            columnVisibilityModel: {
              // Hide columns
              //id: columnsToShow? columnsToShow.includes("taskName") : false,
              taskName: columnsToShow? columnsToShow.includes("taskName") : true,
              milestone: columnsToShow? columnsToShow.includes("milestone") : true,
              category: columnsToShow? columnsToShow.includes("category") : true,
              tags: columnsToShow? columnsToShow.includes("tags") : true,
              personInCharge: columnsToShow? columnsToShow.includes("personInCharge") : true,
              status: columnsToShow? columnsToShow.includes("status") : true,
              priority: columnsToShow? columnsToShow.includes("priority") : true,
              difficultyLevel: columnsToShow? columnsToShow.includes("difficultyLevel") : true,
              color: columnsToShow? columnsToShow.includes("color") : false,
              attachments: columnsToShow? columnsToShow.includes("attachments") : false,
              startDate: columnsToShow? columnsToShow.includes("startDate") : true,
              endDate: columnsToShow? columnsToShow.includes("endDate") : true,
              actualStartDate: columnsToShow? columnsToShow.includes("actualStartDate") : true,
              actualEndDate: columnsToShow? columnsToShow.includes("actualEndDate") : true,
              createdDate: columnsToShow? columnsToShow.includes("createdDate") : false,
              updatedDate: columnsToShow? columnsToShow.includes("updatedDate") : false,
              actions: columnsToShow? columnsToShow.includes("actions") : true,
            },
          },
        }}
        slots={{ toolbar: displayToolbar==false? null : CustomToolbar }}
        slotProps={{
          /*toolbar: {
            showQuickFilter: true,
            quickFilterProps: {
              variant: "outlined",
              size: "small"
            }
          },*/
          loadingOverlay: {
            variant: 'skeleton',
            noRowsVariant: 'skeleton',
          },
        }}
        apiRef={apiRef}
        onColumnVisibilityModelChange={() => {
          const state = apiRef.current.exportState();
          localStorage.setItem("dataGridTableState", JSON.stringify(state));
        }}
        onColumnWidthChange={() => {
          const state = apiRef.current.exportState();
          localStorage.setItem("dataGridTableState", JSON.stringify(state));
        }}
        localeText={locale}
      />

      {/* Edit Form */}
      {isEditFormOpen && (
        <TaskEditForm
          taskId={editedTask._id}
          mode={mode}
          open={isEditFormOpen}
          handleClose={handleCloseForm}
          handleSave={onSaveTask}
          handleDuplicate={onDuplicate}
          setTaskToDelete={setTaskToDelete}
          setOpenConfirmDeleteDialog={setOpenConfirmDeleteDialog}
          onTaskMoved={onTaskMoved}
        />
      )}

      {/* Confirmation Delete */}
      <ConfirmDeleteDialog
        title={t('deleteTask')}
        content={t('deleteTaskConfirm')}
        open={openConfirmDeleteDialog}
        onCancel={onCancelDelete}
        onConfirm={onConfirmDelete}
      />

      {/* Save View Dialog */}
      <Dialog
        open={openSaveViewDialog}
        onClose={handleSaveViewDialogClose}
      >
        <DialogTitle>
          <Typography variant="subtitle2">{t('saveCurrentView')}</Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('enterViewName')}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label={t('viewName')}
            type="text"
            size="small"
            fullWidth
            variant="standard"
            value={newViewName}
            onChange={(e) => setNewViewName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={handleSaveViewDialogClose} color="primary">
            {t('cancel')}
          </Button>
          <Button variant="contained" onClick={handleSaveView} color="primary">
            {t('save')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete View Dialog */}
      <Dialog
        open={openDeleteViewDialog}
        onClose={cancelDeleteView}
      >
        <DialogTitle>
          <Typography variant="subtitle2">{`${t('deleteView')} - ${viewToDelete}`}</Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('deleteViewConfirm', { view: viewToDelete })}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={cancelDeleteView} color="primary">
            {t('cancel')}
          </Button>
          <Button variant="contained" onClick={confirmDeleteView} color="error" autoFocus>
            {t('delete')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Move Task Dialog */}
      {taskToMove && (
        <MoveTaskDialog
          open={moveDialogOpen}
          onClose={() => setMoveDialogOpen(false)}
          taskId={taskToMove._id}
          currentProjectId={taskToMove.project._id}
          onTaskMoved={(taskId) => {
            setTasks(prevTasks => prevTasks.filter(t => t._id !== taskId));
            if (onTaskMoved) {
              onTaskMoved(taskId);
            }
          }}
        />
      )}

      <CAlert ref={alertRef} />
    </div>
  );
}

export default TaskTable;
