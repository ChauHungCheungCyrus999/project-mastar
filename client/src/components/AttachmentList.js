import React, { useState, useRef } from 'react';
import axios from 'axios';
import Dropzone from 'react-dropzone';
import { InputLabel, List, ListItem, Typography, Link, Button } from '@mui/material';

import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import TableViewOutlinedIcon from '@mui/icons-material/TableViewOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import FolderZipOutlinedIcon from '@mui/icons-material/FolderZipOutlined';
import AttachFileIcon from '@mui/icons-material/AttachFile';

import ConfirmDeleteDialog from './custom/ConfirmDeleteDialog';
import CAlert from './custom/CAlert';

import { useTranslation } from 'react-i18next';

const AttachmentList = ({
  mode,
  files = [],
  setFiles,
  setAttachments,
  editedObject,
  setEditedObject,
  handleSave,
  folder
}) => {
  const { t } = useTranslation();

  // Alert
  const alertRef = useRef();

  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [fileToDeleteIndex, setFileToDeleteIndex] = useState(null);

  // Drag-and-drop attachments
  const handleDrop = async (acceptedFiles) => {
    const formData = new FormData();
    formData.append('folder', folder);

    acceptedFiles.forEach((file) => {
      formData.append('files', file, encodeURIComponent(file.name));
    });

    try {
      const response = await axios.post(`${process.env.REACT_APP_SERVER_HOST}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const uploadedFiles = response.data.files;
      const newAttachments = uploadedFiles?.map((file) => ({
        ...file
      }));

      // First, fetch the latest data from the server to get current attachments
      let currentAttachments = [];
      
      if (editedObject?._id) {
        try {
          // Determine the API endpoint based on the folder type
          let apiEndpoint = '';
          if (folder === 'tasks') {
            apiEndpoint = `${process.env.REACT_APP_SERVER_HOST}/api/task/${editedObject._id}`;
          } else if (folder === 'events') {
            apiEndpoint = `${process.env.REACT_APP_SERVER_HOST}/api/event/${editedObject._id}`;
          } else if (folder === 'announcements') {
            apiEndpoint = `${process.env.REACT_APP_SERVER_HOST}/api/announcement/${editedObject._id}`;
          }
          
          if (apiEndpoint) {
            const latestDataResponse = await axios.get(apiEndpoint);
            currentAttachments = latestDataResponse.data?.attachments || [];
          }
        } catch (fetchError) {
          console.warn('Could not fetch latest data, using local state:', fetchError);
          currentAttachments = editedObject?.attachments || [];
        }
      } else {
        currentAttachments = editedObject?.attachments || [];
      }

      // Merge new attachments with the current ones from server
      const mergedAttachments = [...currentAttachments, ...newAttachments];

      // Update local states
      setAttachments(mergedAttachments);
      setFiles && setFiles(mergedAttachments);

      const updatedObject = {
        ...editedObject,
        attachments: mergedAttachments,
      };

      setEditedObject(updatedObject);
      
      // Save with merged attachments
      await handleSave(updatedObject);

      alertRef.current.displayAlert('success', t('uploadSuccess'));
    } catch (error) {
      console.error('File upload error:', error);
      alertRef.current.displayAlert('error', t('uploadFail'));
    }
  };

  // Delete attachment
  const handleDelete = async (event, index) => {
    event.preventDefault();
    event.stopPropagation();
    setFileToDeleteIndex(index);
    setOpenConfirmDialog(true);
  };

  const confirmDeleteAttachment = async () => {
    const fileToDelete = files[fileToDeleteIndex];
    
    try {
      // Delete file from server if it has a path
      if (fileToDelete.path) {
        await axios.delete(`${process.env.REACT_APP_SERVER_HOST}/api/delete-file`, {
          data: { path: fileToDelete.path }
        });
      }

      // Fetch the latest data from the server
      let currentAttachments = [];
      
      if (editedObject?._id) {
        try {
          let apiEndpoint = '';
          if (folder === 'tasks') {
            apiEndpoint = `${process.env.REACT_APP_SERVER_HOST}/api/task/${editedObject._id}`;
          } else if (folder === 'events') {
            apiEndpoint = `${process.env.REACT_APP_SERVER_HOST}/api/event/${editedObject._id}`;
          } else if (folder === 'announcements') {
            apiEndpoint = `${process.env.REACT_APP_SERVER_HOST}/api/announcement/${editedObject._id}`;
          }
          
          if (apiEndpoint) {
            const latestDataResponse = await axios.get(apiEndpoint);
            currentAttachments = latestDataResponse.data?.attachments || [];
          }
        } catch (fetchError) {
          console.warn('Could not fetch latest data, using local state:', fetchError);
          currentAttachments = files || [];
        }
      } else {
        currentAttachments = files || [];
      }

      // Remove the deleted file from current attachments
      const updatedFiles = currentAttachments.filter((att) => 
        att.path !== fileToDelete.path && att.name !== fileToDelete.name
      );

      const updatedObject = {
        ...editedObject,
        attachments: updatedFiles,
      };

      setAttachments(updatedFiles);
      setFiles && setFiles(updatedFiles);
      setEditedObject(updatedObject);
      
      await handleSave(updatedObject);
  
      alertRef.current.displayAlert('success', t('deleteSuccess'));
    } catch (error) {
      console.error('File deletion error:', error);
      alertRef.current.displayAlert('error', t('deleteFail'));
    } finally {
      setOpenConfirmDialog(false);
      setFileToDeleteIndex(null);
    }
  };

  const cancelDeleteAttachment = () => {
    setOpenConfirmDialog(false);
    setFileToDeleteIndex(null);
  };

  const handleDownload = (attachment) => {
    const link = document.createElement('a');
    link.href = `${process.env.REACT_APP_SERVER_HOST}${decodeURIComponent(attachment.path)}`;
    link.download = decodeURIComponent(attachment?.name);
    link.target = "_blank";
    link.click();
  };

  const getFileIcon = (fileName) => {
    const extension = fileName?.split('.').pop().toLowerCase();

    const iconMapping = {
      pdf: <PictureAsPdfIcon />,

      doc: <DescriptionIcon />,
      docx: <DescriptionIcon />,

      xls: <TableViewOutlinedIcon />,
      xlsx: <TableViewOutlinedIcon />,

      jpg: <ImageOutlinedIcon />,
      jpeg: <ImageOutlinedIcon />,
      png: <ImageOutlinedIcon />,
      gif: <ImageOutlinedIcon />,

      zip: <FolderZipOutlinedIcon />,
      rar: <FolderZipOutlinedIcon />,
    };

    return iconMapping[extension] || <AttachFileIcon />;
  };

  return (
    <>
      {(mode === "upload" || (mode === "read" && files.length > 0)) && (
        <InputLabel id="attachments-label">{t('attachments')}</InputLabel>
      )}

      {files.length > 0 && (
        <List
          //labelId="attachments-label"
          dense={true}
          style={
            mode === "upload"
              ? {
                borderColor: 'lightgray',
                borderWidth: '1.5px 1.5px 0 1px',
                borderStyle: 'solid',
                textAlign: 'center',
                cursor: 'pointer',
                padding: '1rem',
                borderRadius: '0.3rem 0.3rem 0 0',
              }
              : {
                display: 'block',
                width: '100%'
              }
          }
        >
          {files?.map((file, index) => (
            <ListItem key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '0' }}>
              <Link href="#" onClick={() => handleDownload(file)}>
                {getFileIcon(file?.name)} {decodeURIComponent(file?.name)}
              </Link>
              {mode === "upload" && (
                <Button variant="outlined" color="error" sx={{ p: 0, m: '0.1rem' }} onClick={(event) => handleDelete(event, index)}>
                  {t('delete')}
                </Button>
              )}
            </ListItem>
          ))}
        </List>
      )}

      {mode === "upload" && (
        <Dropzone onDrop={handleDrop}>
          {({ getRootProps, getInputProps }) => (
            <div
              {...getRootProps()}
              style={{
                borderColor: 'lightgray',
                borderWidth: 2,
                borderStyle: 'dashed',
                textAlign: 'center',
                cursor: 'pointer',
                padding: '1rem',
                borderRadius: '0 0 0.3rem 0.3rem',
              }}
            >
              <input {...getInputProps()} />

              <Typography variant="h7" color="text.secondary">
                {t('dragAndDropAttachments')}
              </Typography>
            </div>
          )}
        </Dropzone>
      )}

      <ConfirmDeleteDialog
        title={t('deleteAttachment')}
        content={t('confirmDeleteAttachment')}
        open={openConfirmDialog}
        onConfirm={confirmDeleteAttachment}
        onCancel={cancelDeleteAttachment}
      />

      <CAlert ref={alertRef} />
    </>
  );
};

export default AttachmentList;
