import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  useMediaQuery,
  Card, CardActionArea, CardHeader, CardContent,
  Avatar, IconButton, Tooltip,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';

import CContextMenu from '../custom/CContextMenu';
import CAlert from '../custom/CAlert';

import UserContext from '../../UserContext';

import { useTranslation } from 'react-i18next';

import { capitalizeWordsExceptFirst } from '../../utils/StringUtils.js';
import hexToRGB from '../../utils/ColorUtils.js';

//import ConfirmDeleteDialog from '../custom/ConfirmDeleteDialog';

const CCard = ({ mode, item, handleRead, handleMarkAsCompleted, handleTagManagement, handleEdit, handleMove, handleDuplicate, handleDelete, role, title, subheader, icon: Icon, showOptions = true, children }) => {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const isTablet = useMediaQuery('(max-width:900px)');

  // Alert
  const alertRef = useRef();

  const fetchUserByProject = async () => {
    if (projectId && user?.email !== process.env.REACT_APP_ADMIN_EMAIL) {
      try {
        const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/project/${projectId}/teamMember/${user._id}`);
        //console.log("user = " + JSON.stringify(response.data));
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user by project:', error);
      }
    }
  };

  useEffect(() => {
    fetchUserByProject();
  }, []);


  const { t } = useTranslation();

  const projectId = window.location.href.split("/")[4];
  const [anchorel, setAnchorel] = useState(null);
  //const [openConfirmDeleteDialog, setOpenConfirmDeleteDialog] = useState(false);

  const [contextMenu, setContextMenu] = useState(null);

  const handleOpenMenu = (event) => {
    event.stopPropagation();
    event.preventDefault();
    setAnchorel(event.currentTarget);
  };

  const handleCloseMenu = (event) => {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    setAnchorel(null);
    setContextMenu(null);
  };

  // Context Menu
  const handleContextMenu = (event) => {
    event.stopPropagation();
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX + 2,
            mouseY: event.clientY - 6,
          }
        : // repeated contextmenu when it is already open closes it with Chrome 84 on Ubuntu
          // Other native context menus might behave different.
          // With this behavior we prevent contextmenu from the backdrop to re-locale existing context menus.
          null,
    );
  };

  // Mark as Completed
  const onMarkAsCompleted = (event) => {
    event.stopPropagation();
    event.preventDefault();
    handleMarkAsCompleted(item._id, "Done");
    handleCloseMenu(event);
  }

  // Share
  const onShare = (event) => {
    event.stopPropagation();
    const link = `${process.env.REACT_APP_CLIENT_HOST}/project/${projectId}/task/${item._id}`;
  
    // Copy the link to clipboard
    navigator.clipboard.writeText(link);
    alertRef.current.displayAlert('success', t('copySuccess'));
    handleCloseMenu(event);
  }

  // Tag Management
  const onTagManagement = (event) => {
    event.stopPropagation();
    event.preventDefault();
    handleTagManagement();
    handleCloseMenu();
  }

  // Edit
  const onEdit = (event) => {
    event.stopPropagation();
    event.preventDefault();
    handleEdit(item._id);
    handleCloseMenu();
  };

  // Move
  const onMove = (event) => {
    event.stopPropagation();
    event.preventDefault();
    if (handleMove) {
      handleMove(item._id);
    } else {
      handleEdit(item._id);
    }
    handleCloseMenu();
  };

  // Duplicate
  const onDuplicate = (event) => {
    event.stopPropagation();
    event.preventDefault();
    handleDuplicate(item);
    handleCloseMenu();
  };

  // Delete
  const onDelete = (event) => {
    event.stopPropagation();
    event.preventDefault();
    handleCloseMenu();
    handleDelete(item._id);
  };

  return (
    <Card
      elevation={3}
      //variant="outlined"
      onContextMenu={showOptions ? handleContextMenu : null}
      sx={{
        //maxWidth: '500px',
        maxHeight: '100%',
        mb: '0.5rem',
        cursor: showOptions ? 'context-menu' : 'default',
        ':hover': {
          boxShadow: showOptions ? '5' : 'none', // theme.shadows[20]
        },
      }}
    >
      <CardActionArea disableRipple onClick={handleRead} sx={{ height: '100%', p: '0.7rem' }}>
        <CardHeader
          avatar={Icon && (
            <Tooltip title={t(capitalizeWordsExceptFirst(item.status))} placement='top'>
              <Avatar variant="rounded" sx={{
                bgcolor: `rgba(${hexToRGB(item.color)})`,
                width: isTablet? 30 : 30,
                height: isTablet? 30 : 30,
                fontSize: isTablet? '1rem':'1rem',
              }}>
                <Icon />
              </Avatar>
            </Tooltip>
          )}
          action={
            showOptions && (
              <>
                <Tooltip title={t('options')}>
                  <IconButton
                    aria-label={t('options')}
                    aria-controls="options-menu"
                    aria-haspopup="true"
                    size="small"
                    onClick={handleOpenMenu}
                    //onMouseClick={(e) => { e.stopPropagation() }}
                    onMouseDown={(e) => { e.stopPropagation() }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Tooltip>

                <CContextMenu
                  anchorEl={anchorel}
                  contextMenu={contextMenu}
                  handleCloseMenu={handleCloseMenu}
                  onMarkAsCompleted={onMarkAsCompleted}
                  onShare={onShare}
                  onTagManagement={onTagManagement}
                  onEdit={onEdit}
                  onMove={onMove}
                  onDuplicate={onDuplicate}
                  onDelete={onDelete}
                  mode={mode}
                  role={role}
                  projectId={projectId}
                />
              </>
            )
          }
          title={title}
          titleTypographyProps={{ variant: 'body1', noWrap: true, fontWeight: 'bold' }}
          subheader={subheader}
          subheaderTypographyProps={{ variant: 'body2', noWrap: true }}
          sx={{
            p: 0,
            "& .MuiCardHeader-content": {
              overflow: "hidden",
            }
          }}
        />

        <CardContent sx={{ p: 0 }}>
          {children}
        </CardContent>
      </CardActionArea>

      <CAlert ref={alertRef} />
    </Card>
  );
};

export default CCard;
