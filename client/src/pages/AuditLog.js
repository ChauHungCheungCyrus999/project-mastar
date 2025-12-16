import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Typography, Paper } from '@mui/material';
import CDataGrid from '../components/custom/CDataGrid';
import { Home, AssignmentOutlined } from '@mui/icons-material';

import { useTranslation } from 'react-i18next';

import MainContent from '../components/MainContent';
import TaskTimeline from '../components/project/TaskTimeline';

import { initAuditLogs } from "../components/init/InitAuditLogs";

function AuditLog() {
  const { t } = useTranslation();

  const breadcrumbItems = [
    { label: 'home', href: '/', icon: <Home sx={{ mr: 0.5 }} fontSize="inherit" /> },
    { label: 'auditLog', icon: <AssignmentOutlined sx={{ mr: 0.5 }} fontSize="inherit" /> },
  ];

  const [logEntries, setLogEntries] = useState([]/*initAuditLogs()*/);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_SERVER_HOST}/api/audit-logs`)
      .then((response) => {
        const dataWithIds = response.data.map((entry, index) => ({
          ...entry,
          id: index,
        }));
        setLogEntries(dataWithIds);
      })
      .catch((error) => {
        console.error('Error fetching audit log:', error);
      });
  }, []);

  const renderActionCell = (params) => {
    const action = params.value.toLowerCase();
    switch (action) {
      case 'create':
        return t('create');
      case 'read':
        return t('read');
      case 'update':
        return t('update');
      case 'delete':
        return t('delete');
      case 'unknown':
        return t('unknown');
      default:
        return params.value;
    }
  };

  return (
    <MainContent pageTitle="auditLog" breadcrumbItems={breadcrumbItems}>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <CDataGrid
          rows={logEntries}
          columns={[
            { field: 'action', headerName: t('action'), width: 150, renderCell: renderActionCell },
            { field: 'timestamp', headerName: t('timestamp'), width: 200 },
            { field: 'userId', headerName: t('userId'), width: 150 },
            { field: 'ipAddress', headerName: t('ipAddress'), width: 200 },
            { field: 'requestUrl', headerName: t('requestUrl'), width: 300 },
            { field: 'requestData', headerName: t('requestData'), width: 300, renderCell: (params) => JSON.stringify(params.value) },
            { field: 'responseStatus', headerName: t('responseStatus'), width: 200 },
            { field: 'responseData', headerName: t('responseData'), width: 300, renderCell: (params) => JSON.stringify(params.value) },
          ]}
        />
      </Paper>

      <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
        {t('timeline')}
      </Typography>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <TaskTimeline auditLogs={logEntries} />
      </Paper>
    </MainContent>
  );
}

export default AuditLog;