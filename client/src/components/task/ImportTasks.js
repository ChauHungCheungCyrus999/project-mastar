import React, { useContext, useState, useRef } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  Box,
  IconButton,
  Tooltip
} from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';
import CloseIcon from '@mui/icons-material/Close';
import * as XLSX from 'xlsx';
import axios from 'axios';

import { useTranslation } from 'react-i18next';

import CAlert from '../custom/CAlert';

import UserContext from '../../UserContext';

const ImportTasks = ({ projectId }) => {
  const { user, setUser } = useContext(UserContext);

  const { t } = useTranslation();

  // Alert
  const alertRef = useRef();

  const [open, setOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFile(null);
    setValidationErrors([]);
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setValidationErrors([]);
  };

  const handleDownloadTemplate = () => {
    const template = [
      ['Task Name', 'Description', 'Category', 'Person In Charge', 'Status', 'Priority', 'Difficulty Level', 'Color', 'Start Date', 'End Date', 'Actual Start Date', 'Actual End Date'],
      ['', '', '', '', 'To Do', '', '', '', '', ''],
    ];

    const ws = XLSX.utils.aoa_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Task Template');
    XLSX.writeFile(wb, 'task_template.xlsx');
  };

  const validateTasks = (tasks) => {
    const errors = [];
    tasks.forEach((task, index) => {
      const row = index + 2; // +2 to account for header row and 0-based index
      if (!task.taskName) {
        errors.push(`Row ${row}, Column Task Name: ${t('taskNameRequired')}`);
      }
      if (!task.status) {
        errors.push(`Row ${row}, Column Status: ${t('statusRequired')}`);
      }
      if (!task.project) {
        errors.push(`Row ${row}, Column Project ID: ${t('projectIdRequired')}`);
      }
      // Add more validation checks as needed
    });
    return errors;
  };

  const handleImport = async () => {
    if (!file) {
      setValidationErrors([t('selectFile')]);
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: true });

      const tasks = jsonData.slice(1).map((row) => ({
        taskName: row[0],
        description: row[1],
        category: row[2],
        personInCharge: row[3] ? row[3].split(',').map((id) => id.trim()) : [],
        status: row[4],
        priority: row[5],
        difficultyLevel: row[6],
        color: row[7],
        startDate: row[8] ? new Date(row[8]) : null,
        endDate: row[9] ? new Date(row[9]) : null,
        actualStartDate: row[8] ? new Date(row[8]) : null,
        actualEndDate: row[9] ? new Date(row[9]) : null,
        project: projectId,
        createdDate: new Date(),
        createdBy: user._id,
        updatedDate: new Date(),
        updatedBy: user._id,
      }));

      const errors = validateTasks(tasks);
      if (errors.length > 0) {
        setValidationErrors(errors);
        alertRef.current.displayAlert('error', t('importFail'));
        return;
      }

      try {
        await axios.post(`${process.env.REACT_APP_SERVER_HOST}/api/tasks/import`, { tasks, user });
        alertRef.current.displayAlert('success', t('importSuccess'));
        handleClose();
      } catch (err) {
        setValidationErrors([t('importFail')]);
        alertRef.current.displayAlert('error', t('importFail'));
      }
    };

    reader.readAsArrayBuffer(file);
    
  };

  return (
    <>
      <Button startIcon={<UploadIcon />} onClick={handleClickOpen}>
        {t('import')}
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          <Typography variant="subtitle2">{t('importTasks')}</Typography>
          
          <Tooltip title={t('close')} placement="top">
            <IconButton
              aria-label={t('close')}
              onClick={handleClose}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            {t('importTaskDescription')}
          </Typography>
          <Box mt={2}>
            <Button variant="outlined" onClick={handleDownloadTemplate}>
              {t('downloadTemplate')}
            </Button>
          </Box>
          <Box mt={2}>
            <TextField
              type="file"
              fullWidth
              onChange={handleFileChange}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
          {validationErrors.length > 0 && (
            <Box mt={2}>
              {validationErrors.map((error, index) => (
                <Typography key={index} color="error">
                  {error}
                </Typography>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={handleClose} color="primary">
            {t('cancel')}
          </Button>
          <Button variant="contained" onClick={handleImport} color="primary">
            {t('import')}
          </Button>
        </DialogActions>
      </Dialog>

      <CAlert ref={alertRef} />
    </>
  );
};

export default ImportTasks;