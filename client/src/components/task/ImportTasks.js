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
import * as ExcelJS from 'exceljs';

import { useTranslation } from 'react-i18next';

import CAlert from '../custom/CAlert';

import UserContext from '../../UserContext';

const STATUS_OPTIONS = [
  'To Do',
  'In Progress',
  'Under Review',
  'Done',
  'On Hold',
  'Cancelled',
];

const PRIORITY_OPTIONS = [
  'Very High',
  'High',
  'Medium',
  'Low',
  'Very Low',
];

const DIFFICULTY_OPTIONS = [
  'Very Difficult',
  'Difficult',
  'Moderate',
  'Easy',
];

const ImportTasks = ({ projectId, onImported = () => {} }) => {
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

  const handleDownloadTemplate = async () => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Task Template');
    const lists = wb.addWorksheet('Lists');

    // Fetch project team members for Person In Charge list
    let members = [];
    let milestones = [];
    try {
      const res = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/project/${projectId}`);
      members = Array.isArray(res.data?.teamMembers) ? res.data.teamMembers : [];
    } catch (e) {
      members = [];
    }
    try {
      const msRes = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/milestones/project/${projectId}`);
      milestones = Array.isArray(msRes.data) ? msRes.data : [];
    } catch (e) {
      milestones = [];
    }

    const headers = [
      'Task Name',
      'Description',
      'Category',
      'Milestone',
      'Person In Charge',
      'Status',
      'Priority',
      'Difficulty Level',
      'Color',
      'Start Date',
      'End Date',
      'Actual Start Date',
      'Actual End Date',
    ];

    ws.addRow(headers);
    for (let c = 1; c <= headers.length; c++) {
      ws.getColumn(c).width = 18;
    }

    // Style header
    const headerRow = ws.getRow(1);
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFEDF2FF' },
    };
    headerRow.font = { bold: true };
    headerRow.alignment = { horizontal: 'center' };

    // Populate Lists sheet with options (Arial) and hide it
    lists.getColumn(1).values = [null, ...STATUS_OPTIONS];
    lists.getColumn(2).values = [null, ...PRIORITY_OPTIONS];
    lists.getColumn(3).values = [null, ...DIFFICULTY_OPTIONS];
    // Column D: Person In Charge emails (used for validation)
    const memberEmails = members.map((m) => (m.email ? m.email : `${m.firstName || ''} ${m.lastName || ''}`.trim())).filter(Boolean);
    lists.getColumn(4).values = [null, ...memberEmails];
    // Column E: Person display names
    const memberNames = members.map((m) => `${m.firstName || ''} ${m.lastName || ''}`.trim()).filter(Boolean);
    lists.getColumn(5).values = [null, ...memberNames];
    // Column F: Project color options
    let colorOptions = [];
    try {
      const colorsRes = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/task/project/${projectId}/color`);
      colorOptions = Array.isArray(colorsRes.data) ? colorsRes.data : [];
    } catch (e) {
      colorOptions = [];
    }
    lists.getColumn(6).values = [null, ...colorOptions];
    // Column G: Milestone titles
    const milestoneTitles = milestones.map((m) => m.title).filter(Boolean);
    lists.getColumn(7).values = [null, ...milestoneTitles];

    for (let r = 1; r <= Math.max(STATUS_OPTIONS.length, PRIORITY_OPTIONS.length, DIFFICULTY_OPTIONS.length); r++) {
      ['A', 'B', 'C'].forEach((col) => {
        const cell = lists.getCell(`${col}${r + 1}`);
        cell.font = { name: 'Arial', size: 10 };
      });
    }
    // Style member lists to Arial as well
    for (let r = 1; r <= Math.max(memberEmails.length, memberNames.length); r++) {
      ['D', 'E'].forEach((col) => {
        const cell = lists.getCell(`${col}${r + 1}`);
        cell.font = { name: 'Arial', size: 10 };
      });
    }
    // Style color list to Arial
    for (let r = 1; r <= colorOptions.length; r++) {
      const cell = lists.getCell(`F${r + 1}`);
      cell.font = { name: 'Arial', size: 10 };
    }
    // Style milestone list to Arial
    for (let r = 1; r <= milestoneTitles.length; r++) {
      const cell = lists.getCell(`G${r + 1}`);
      cell.font = { name: 'Arial', size: 10 };
    }
    lists.state = 'veryHidden';

    // Add data validation lists referencing Lists sheet ranges
    // Person In Charge dropdown (E2..E501) referencing Lists column E (names)
    const maxRowMemberNames = memberNames.length + 1; // +1 for header offset
    ws.dataValidations.add('E2:E501', {
      type: 'list',
      allowBlank: true,
      formulae: [`=Lists!$E$2:$E$${maxRowMemberNames}`],
      showErrorMessage: true,
      errorTitle: 'Invalid Person',
      error: 'Please select a person from the list (names).',
    });

    // Milestone dropdown (D2..D501) referencing Lists column G (milestone titles)
    const maxRowMilestones = milestoneTitles.length + 1;
    if (milestoneTitles.length > 0) {
      ws.dataValidations.add('D2:D501', {
        type: 'list',
        allowBlank: true,
        formulae: [`=Lists!$G$2:$G$${maxRowMilestones}`],
        showErrorMessage: true,
        errorTitle: 'Invalid Milestone',
        error: 'Please select a milestone from the list or leave blank.',
      });
    }

    ws.dataValidations.add('F2:F501', {
      type: 'list',
      allowBlank: true,
      formulae: ['=Lists!$A$2:$A$7'],
      showErrorMessage: true,
      errorTitle: 'Invalid Status',
      error: `Please choose one of: ${STATUS_OPTIONS.join(', ')}`,
    });

    ws.dataValidations.add('G2:G501', {
      type: 'list',
      allowBlank: true,
      formulae: ['=Lists!$B$2:$B$6'],
      showErrorMessage: true,
      errorTitle: 'Invalid Priority',
      error: `Please choose one of: ${PRIORITY_OPTIONS.join(', ')}`,
    });

    ws.dataValidations.add('H2:H501', {
      type: 'list',
      allowBlank: true,
      formulae: ['=Lists!$C$2:$C$5'],
      showErrorMessage: true,
      errorTitle: 'Invalid Difficulty Level',
      error: `Please choose one of: ${DIFFICULTY_OPTIONS.join(', ')}`,
    });

    // Color dropdown (H2..H501) referencing Lists column F (colors)
    const maxRowColors = colorOptions.length + 1; // +1 for header offset
    if (colorOptions.length > 0) {
      ws.dataValidations.add('I2:I501', {
        type: 'list',
        allowBlank: true,
        formulae: [`=Lists!$F$2:$F$${maxRowColors}`],
        showErrorMessage: true,
        errorTitle: 'Invalid Color',
        error: 'Please select a color from the list or leave blank.',
      });
    }

    // No date validation on J-M to avoid prompts

    // Set default date values on first data row as plain text (no date format)
    ws.getCell('J2').value = '1/1/2026';
    ws.getCell('K2').value = '1/1/2026';
    ws.getCell('L2').value = '1/1/2026';
    ws.getCell('M2').value = '1/1/2026';

    // Apply Arial font to all cells (A1..L501)
    ws.eachRow({ includeEmpty: true }, (row) => {
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.font = { name: 'Arial', size: 10 };
      });
    });

    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'task_template.xlsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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

    // Normalize Excel date serials or user-entered strings into JS Date
    const toJsDate = (value) => {
      if (value === undefined || value === null || value === '') return null;
      if (typeof value === 'number') {
        const parsed = XLSX.SSF.parse_date_code(value);
        if (!parsed) return null;
        return new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d, parsed.H || 0, parsed.M || 0, parsed.S || 0));
      }
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? null : date;
    };

    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: true });

      // Fetch team members to map Person In Charge values to user IDs
      let members = [];
      let milestones = [];
      try {
        const res = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/project/${projectId}`);
        members = Array.isArray(res.data?.teamMembers) ? res.data.teamMembers : [];
      } catch (e) {
        members = [];
      }
      try {
        const msRes = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/milestones/project/${projectId}`);
        milestones = Array.isArray(msRes.data) ? msRes.data : [];
      } catch (e) {
        milestones = [];
      }
      const emailToId = new Map(members.filter((m) => m.email && m._id).map((m) => [m.email.toLowerCase(), m._id]));
      const nameToId = new Map(members.filter((m) => m._id).map((m) => [`${(m.firstName || '').trim()} ${(m.lastName || '').trim()}`.trim().toLowerCase(), m._id]));
      const milestoneNameToId = new Map(milestones.filter((m) => m._id && m.title).map((m) => [m.title.trim().toLowerCase(), m._id]));

      const tasks = jsonData.slice(1).map((row) => ({
        taskName: row[0],
        description: row[1],
        category: row[2],
        milestone: row[3] && milestoneNameToId.get(String(row[3]).trim().toLowerCase()) ? milestoneNameToId.get(String(row[3]).trim().toLowerCase()) : null,
        personInCharge: row[4]
          ? row[4]
              .split(',')
              .map((v) => v.trim())
              .map((v) => emailToId.get(v.toLowerCase()) || nameToId.get(v.toLowerCase()) || null)
              .filter(Boolean)
          : [],
        status: row[5],
        priority: row[6],
        difficultyLevel: row[7],
        color: row[8],
        startDate: toJsDate(row[9]),
        endDate: toJsDate(row[10]),
        actualStartDate: toJsDate(row[11]),
        actualEndDate: toJsDate(row[12]),
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
        await onImported();
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