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
  const handleDrop = (acceptedFiles) => {
    const formData = new FormData();
    formData.append('folder', folder); // Specify the folder where files should be uploaded dynamically

    acceptedFiles.forEach((file) => {
      formData.append('files', file, encodeURIComponent(file.name));
    });

    axios.post(`${process.env.REACT_APP_SERVER_HOST}/api/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
      .then((response) => {
        const uploadedFiles = response.data.files;
        let updatedObject = {
          ...editedObject,
          attachments: [...(editedObject.attachments || [])],
        };
        let newAttachments = [];
        uploadedFiles.forEach((file) => {
          // Save the object with the new attachments
          newAttachments = uploadedFiles?.map((file) => ({
            ...file
          }));
        });

        // Set object.attachments when upload attachment
        setAttachments((prevFiles) => (prevFiles ? [...prevFiles, ...newAttachments] : newAttachments));
                
        updatedObject = {
          ...editedObject,
          attachments: [...(editedObject?.attachments || []), ...newAttachments],
        };

        console.log("updatedObject = " + JSON.stringify(updatedObject));
        setEditedObject(updatedObject);
        handleSave(updatedObject);
        alertRef.current.displayAlert('success', t('uploadSuccess'));
      })
      .catch((error) => {
        console.error('File upload error:', error);
        alertRef.current.displayAlert('error', t('uploadFail'));
      });
  };

  const handleDelete = (event, index) => {
    event.stopPropagation(); // Prevent unintended event bubbling
    setOpenConfirmDialog(true);
    setFileToDeleteIndex(index);
  };
  
  const confirmDelete = async () => {
    // Get the file to delete using the saved index
    const fileToDelete = files[fileToDeleteIndex];
  
    try {
      // Make an API request to delete the file
      await axios.delete(`${process.env.REACT_APP_SERVER_HOST}/api/delete-file`, {
        data: { path: fileToDelete.path }, // Ensure the correct path is sent
      });
  
      // Update the files state to remove the deleted file
      const updatedFiles = files.filter((_, i) => i !== fileToDeleteIndex);
      setFiles(updatedFiles); // Update the `files` state
  
      // Update the `editedObject` to reflect the changes
      const updatedObject = {
        ...editedObject,
        attachments: updatedFiles,
      };
      setAttachments(updatedFiles); // Update attachments state
      setEditedObject(updatedObject);
      handleSave(updatedObject); // Save the updated object
  
      // Show success alert
      alertRef.current.displayAlert('success', t('deleteSuccess'));
    } catch (error) {
      console.error('File deletion error:', error);
      alertRef.current.displayAlert('error', t('deleteFail'));
    } finally {
      // Close the confirmation dialog
      setOpenConfirmDialog(false);
      setFileToDeleteIndex(null);
    }
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
        onCancel={() => setOpenConfirmDialog(false)}
        onConfirm={confirmDelete}
      />

      <CAlert ref={alertRef} />
    </>
  );
};

export default AttachmentList;
