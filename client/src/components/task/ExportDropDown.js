import React, { useState } from 'react';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

import * as XLSX from 'xlsx/xlsx.mjs'

import { useTranslation } from 'react-i18next';

const ExportDropDown = ({ project, tasks }) => {
  const { t, i18n } = useTranslation();

  const [anchorel, setAnchorel] = useState(null);
  
  const handleMenuOpen = (event) => {
    setAnchorel(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorel(null);
  };
  

  // Export CSV
  function convertJsonToCsv(jsonData) {
    // Check if the JSON data is empty
    if (!jsonData || jsonData.length === 0) {
      return '';
    }
  
    // Extract column names from the first object
    const columns = Object.keys(jsonData[0]);
  
    // Escape special characters in a string for CSV
    const escapeCsvValue = (value) => {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      const escapedValue = stringValue.replace(/"/g, '""');
      return `"${escapedValue}"`;
    };
    
    // Convert the JSON data to CSV content
    let csvContent = '\ufeff';
  
    // Add column headers
    csvContent += columns.map(escapeCsvValue).join(',') + '\n';
  
    // Add rows
    jsonData.forEach((row) => {
      const values = columns.map((column) => {
        // Check if the value is HTML content
        let cellValue;

        if (column === 'milestone') {
          // Export milestone title
          return escapeCsvValue(row.milestone?.title || '');
        }

        if (column === 'tag') {
          switch (i18n.language) {
            case 'en-US':
              // Export milestone title
              return escapeCsvValue(row.tag?.name.enUS || '');
            case 'zh-HK':
              // Export milestone title
              return escapeCsvValue(row.tag?.name.zhHK || '');
            case 'zh-CN':
              // Export milestone title
              return escapeCsvValue(row.tag?.name.zhCN || '');
            default:
              // Handle other locales or default case
              return escapeCsvValue('');
          }
        }

        if (column === 'attachments') {
          if (Array.isArray(row[column])) {
            cellValue = row[column].map((attachment) => decodeURIComponent(attachment.name)).join(', ');
          } else {
            cellValue = '';
          }
        } else {
          cellValue = typeof row[column] === 'string' || column === '_id' ? row[column] : '';
        }

        return escapeCsvValue(cellValue);
      });
      csvContent += values.join(',') + '\n';
    });
  
    return csvContent;
  }

  const getTagDisplayValue = (tag) => {
    if (!tag) return '';
    switch (i18n.language) {
      case 'zh-hk':
        return tag.name?.zhHK;
      case 'zh-cn':
        return tag.name?.zhCN;
      default:
        return tag.name?.enUS;
    }
  };

  // Export Excel
  function convertJsonToExcel(jsonData) {
    // Filter out the fields "_id" and "__v" from each object in the JSON data
    const filteredData = jsonData.map(obj => {
      const { _id, __v, milestone, tags, personInCharge, startDate, endDate, actualStartDate, actualEndDate, createdBy, createdDate, updatedBy, updatedDate, attachments, ...rest } = obj;
      const tagNames = tags ? tags.map(tag => getTagDisplayValue(tag)).join(t('comma')) : '';
      const personInChargeNames = personInCharge ? personInCharge.map(person => person.firstName + " " + person.lastName).join(t('comma')) : '';
      const filenames = attachments ? attachments.map(att => decodeURIComponent(att.name)).join(', ') : '';

      return {
        ...rest,
        milestone: milestone?.title,
        startDate: startDate ? new Date(startDate).toLocaleDateString() : '',
        endDate: endDate ? new Date(endDate).toLocaleDateString() : '',
        actualStartDate: actualStartDate ? new Date(actualStartDate).toLocaleDateString() : '',
        actualEndDate: actualEndDate ? new Date(actualEndDate).toLocaleDateString() : '',
        project: project ? project.title : '',
        createdBy: createdBy ? createdBy.firstName + ' ' + createdBy.lastName : '',
        createdDate: createdDate ? formatDate(createdDate) : '',
        updatedBy: updatedBy ? updatedBy.firstName + ' ' + updatedBy.lastName : '',
        updatedDate: updatedDate ? formatDate(updatedDate) : '',
        tags: tagNames,
        personInCharge: personInChargeNames,
        attachments: filenames
      };
    });
  
    // Create a new workbook
    const workbook = XLSX.utils.book_new();
  
    // Convert the filtered data to a worksheet
    const worksheet = XLSX.utils.json_to_sheet(filteredData, { header: Object.keys(filteredData[0]) });
  
    // Translate the header labels
    const headerRange = XLSX.utils.decode_range(worksheet['!ref']);
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const headerCell = XLSX.utils.encode_cell({ r: 0, c: col });
      worksheet[headerCell].v = t(worksheet[headerCell].v);
    }
  
    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tasks');
  
    // Convert the workbook to an Excel file
    const excelFile = XLSX.write(workbook, { type: 'binary', bookType: 'xlsx' });
  
    // Convert the binary Excel file to a Blob
    const excelData = new Blob([s2ab(excelFile)], { type: 'application/octet-stream' });
  
    return excelData;
  }
  
  function formatDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
  
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  // Utility function to convert a string to an ArrayBuffer
  function s2ab(s) {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++)
      view[i] = s.charCodeAt(i) & 0xff;
    return buf;
  }


  // Download link
  const handleExport = (exportType) => {
    let exportedData;
    let exportFileName;

    switch (exportType) {
      case 'Excel':
        exportedData = convertJsonToExcel(tasks);
        exportFileName = `${project.title}_Tasks.xlsx`;
        break;
      case 'CSV':
        exportedData = convertJsonToCsv(tasks);
        exportFileName = `${project.title}_Tasks.csv`;
        break;
      case 'JSON':
        exportedData = JSON.stringify(tasks, null, 2, (key, value) => {
          if (typeof key === "string") { // Check if the key is a string
            return `"${key}"`; // Add double quotes around the key
          }
          return value;
        });
        exportFileName = `${project.title}_Tasks.json`;
        break;
      default:
        return;
    }

    let downloadLink = document.createElement('a');
    switch (exportType) {
      case 'Excel':        
        downloadLink.href = URL.createObjectURL(exportedData);
        downloadLink.download = exportFileName;
        downloadLink.click();
        handleMenuClose();
        break;
      default:
        const blob = new Blob([exportedData], { type: 'text/plain' });
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = exportFileName;
        downloadLink.click();
        handleMenuClose();
    }
  };

  return (
    <>
      <Button color="primary" startIcon={<FileDownloadIcon />} onClick={handleMenuOpen} sx={{ mr: 0.5 }}>
        {t('export') + " (" + tasks.length + ")"}
      </Button>
      <Menu
        anchorEl={anchorel}
        open={Boolean(anchorel)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <MenuItem onClick={() => { handleExport("Excel") }} dense>{t('exportExcel')}</MenuItem>
        <MenuItem onClick={() => { handleExport("CSV") }} dense>{t('exportCsv')}</MenuItem>
        <MenuItem onClick={() => { handleExport("JSON") }} dense>{t('exportJson')}</MenuItem>
      </Menu>
    </>
  );
};

export default ExportDropDown;