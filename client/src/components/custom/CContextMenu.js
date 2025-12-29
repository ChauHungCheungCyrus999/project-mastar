import React, { useContext } from 'react';
import { Menu, MenuItem, ListItemIcon } from '@mui/material';
import { Share, LocalOffer, Edit, FileCopy, Delete, Check, DriveFileMove } from '@mui/icons-material';

import UserContext from '../../UserContext';

import { useTranslation } from 'react-i18next';

const CContextMenu = ({
  anchorEl,
  contextMenu,
  handleCloseMenu,
  onMarkAsCompleted,
  onShare,
  onTagManagement,
  onEdit,
  onMove,
  onDuplicate,
  onDelete,
  mode,
  role,
  projectId
}) => {
  const { user, setUser } = useContext(UserContext);

  const { t } = useTranslation();
  
  return (
    <>
      <Menu
        id="options-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl) || contextMenu !== null}
        anchorReference={Boolean(anchorEl) ? 'anchorOrigin' : 'anchorPosition'}
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
        anchorOrigin={
          Boolean(anchorEl)
            ? {
                vertical: 'bottom',
                horizontal: 'left',
              }
            : undefined
        }
        transformOrigin={
          Boolean(anchorEl)
            ? {
                vertical: 'top',
                horizontal: 'left',
              }
            : undefined
        }
        onClose={handleCloseMenu}
      >
        {mode === "task" && (
          <MenuItem onClick={onMarkAsCompleted} dense>
            <ListItemIcon>
              <Check />
            </ListItemIcon>
            {t('markAsCompleted')}
          </MenuItem>
        )}

        {mode === "task" && projectId && (
          <MenuItem onClick={onShare} dense>
            <ListItemIcon>
              <Share />
            </ListItemIcon>
            {t('share')}
          </MenuItem>
        )}

        {mode === "task" && onDuplicate && (
          <MenuItem onClick={onDuplicate} dense>
            <ListItemIcon>
              <FileCopy />
            </ListItemIcon>
            {t('duplicate')}
          </MenuItem>
        )}

        {mode === "task" && onMove && (user.email === process.env.REACT_APP_ADMIN_EMAIL || user?.permissions?.some(permission => permission === "editTask")) ? (
          <MenuItem onClick={onMove} dense>
            <ListItemIcon>
              <DriveFileMove />
            </ListItemIcon>
            {t('moveToDifferentProject')}
          </MenuItem>
        ) : null}

        {mode === "project" && onTagManagement && (user.email === process.env.REACT_APP_ADMIN_EMAIL || role === "Project Manager") ? (
          <MenuItem onClick={onTagManagement} dense>
            <ListItemIcon>
              <LocalOffer />
            </ListItemIcon>
            {t('tagManagement')}
          </MenuItem>
        ) : null}

        {mode === "project" && onEdit && (user.email === process.env.REACT_APP_ADMIN_EMAIL || role === "Project Manager") ? (
          <MenuItem onClick={onEdit} dense>
            <ListItemIcon>
              <Edit />
            </ListItemIcon>
            {t('editProject')}
          </MenuItem>
        ) : null}

        {mode === "project" && onDelete && (user.email === process.env.REACT_APP_ADMIN_EMAIL || role === "Project Manager") ? (
          <MenuItem onClick={onDelete} dense>
            <ListItemIcon>
              <Delete />
            </ListItemIcon>
            {t('deleteProject')}
          </MenuItem>
        ) : null}

        {mode === "task" && onDelete && (user.email === process.env.REACT_APP_ADMIN_EMAIL || user?.permissions?.some(permission => permission === "deleteTask")) ? (
          <MenuItem onClick={onDelete} dense>
            <ListItemIcon>
              <Delete />
            </ListItemIcon>
            {t('deleteTask')}
          </MenuItem>
        ) : null}
      </Menu>
    </>
  );
}

export default CContextMenu;
