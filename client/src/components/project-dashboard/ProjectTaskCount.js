import React, { useContext, useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Divider,
} from '@mui/material';
import { FormatListNumbered, Summarize } from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import * as XLSX from 'xlsx';

import DashboardCard from '../custom/DashboardCard';
import CDialog from '../custom/CDialog';
import ListTableSwitcher from '../task/ListTableSwitcher';
import ProjectFolder from '../ProjectFolder';

import { useTranslation } from 'react-i18next';

import UserContext from '../../UserContext';

const StatusWithDot = ({ color, label }) => (
  <Box display="flex" alignItems="center">
    <Box
      sx={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        backgroundColor: color,
        marginRight: 1,
      }}
    />
    <Typography variant="body2" color="#777">{label}</Typography>
  </Box>
);

const ProjectTaskCount = () => {
  const theme = useTheme();

  const { user } = useContext(UserContext);

  const { t } = useTranslation();

  const [tasks, setTasks] = useState([]);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [isOpenDialog, setIsOpenDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [displayTab, setDisplayTab] = useState(false);

  useEffect(() => {
    const fetchTaskCounts = async () => {
      try {
        let response;
        if (user.email === process.env.REACT_APP_ADMIN_EMAIL) {
          response = await axios.post(`${process.env.REACT_APP_SERVER_HOST}/api/projects/taskCount/admin`);
        } else {
          response = await axios.post(`${process.env.REACT_APP_SERVER_HOST}/api/projects/taskCount`, { userId: user._id });
        }
        setTasks(response.data);
      } catch (error) {
        console.error('Error fetching task counts:', error);
      }
    };

    fetchTaskCounts();
  }, [user]);

  const handleChartClick = async (projectId, projectTitle) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/tasks/project/${projectId}`);
      setSelectedTasks(response.data);
      setDialogTitle(`${projectTitle} - ${t('totalTasks')}`);
      setIsOpenDialog(true);
      setDisplayTab(true);
    } catch (error) {
      console.error('Error fetching all tasks for the project:', error);
    }
  };

  const handleCellClick = async (projectId, projectTitle, status) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/tasks/project/${projectId}/status/${status}`);
      setSelectedTasks(response.data);
      setDialogTitle(`${projectTitle} - ${t(status)}`);
      setIsOpenDialog(true);
      setDisplayTab(false);
    } catch (error) {
      console.error('Error fetching tasks by status:', error);
    }
  };

  const handleCloseDialog = () => {
    setIsOpenDialog(false);
  };

  const calculateTotalTasks = (key) => {
    return tasks.reduce((total, project) => total + project.statusCounts[key], 0);
  };

  const handleExportReport = () => {
    const exportData = tasks.map((project) => ({
      Project: project.title,
      ToDo: project.statusCounts.toDo,
      InProgress: project.statusCounts.inProgress,
      UnderReview: project.statusCounts.underReview,
      Done: project.statusCounts.done,
      OnHold: project.statusCounts.onHold,
      Cancelled: project.statusCounts.cancelled,
      TotalTasks: project.statusCounts.all,
    }));

    const totalRow = {
      Project: t('total'),
      ToDo: calculateTotalTasks('toDo'),
      InProgress: calculateTotalTasks('inProgress'),
      UnderReview: calculateTotalTasks('underReview'),
      Done: calculateTotalTasks('done'),
      OnHold: calculateTotalTasks('onHold'),
      Cancelled: calculateTotalTasks('cancelled'),
      TotalTasks: calculateTotalTasks('all'),
    };

    exportData.push(totalRow);

    const chartData = [
      [t('projectTaskCount')],
      [t('project'), t('toDo'), t('inProgress'), t('underReview'), t('done'), t('onHold'), t('cancelled'), t('total')],
      ...exportData.map((row) => Object.values(row)),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(chartData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `${t('projectTaskCount')}`);
    XLSX.writeFile(workbook, `${t('projectTaskCount')}.xlsx`);
  };

  return (
    <DashboardCard
      dashboardId="Project Dashboard"
      cardId="Project Task Overview"
      title={t('projectTaskCount')}
      description={t('projectTaskCountDesc')}
      icon={FormatListNumbered}
      color="#193f70"
      subheader={t('taskOverview')}
      displayMenu={true} // Enable the menu in the DashboardCard
      menuItems={[
        {
          label: t('exportReport'),
          icon: <Summarize />,
          onClick: handleExportReport,
        },
      ]}
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={tasks}
          onClick={(data) => {
            const payload = data?.activePayload?.[0]?.payload;
            if (payload) {
              handleChartClick(payload._id, payload.title);
            } else {
              console.log('Payload is undefined');
            }
          }}
        >
          <XAxis dataKey="title" />
          <YAxis />
          <ChartTooltip />
          <Legend wrapperStyle={{ whiteSpace: 'break-spaces' }} />
          <Bar dataKey="statusCounts.toDo" stackId="status" fill="#89CFF0" name={t('toDo')} />
          <Bar dataKey="statusCounts.inProgress" stackId="status" fill="#FFE5A0" name={t('inProgress')} />
          <Bar dataKey="statusCounts.underReview" stackId="status" fill="#E6CFF2" name={t('underReview')} />
          <Bar dataKey="statusCounts.done" stackId="status" fill="#D4EDBC" name={t('done')} />
          <Bar dataKey="statusCounts.onHold" stackId="status" fill="#FFBD9C" name={t('onHold')} />
          <Bar dataKey="statusCounts.cancelled" stackId="status" fill="#A9A9A9" name={t('cancelled')} />
        </BarChart>
      </ResponsiveContainer>

      <Divider sx={{ mt: 2 }} />

      <TableContainer>
        <Table
          size="small"
          stickyHeader
          sx={{
            '& .MuiTableRow-root:hover': {
              backgroundColor: theme.palette.action.hover,
            },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell>{t('project')}</TableCell>
              <TableCell>
                <StatusWithDot color="#89CFF0" label={t('toDo')} />
              </TableCell>
              <TableCell>
                <StatusWithDot color="#FFE5A0" label={t('inProgress')} />
              </TableCell>
              <TableCell>
                <StatusWithDot color="#E6CFF2" label={t('underReview')} />
              </TableCell>
              <TableCell>
                <StatusWithDot color="#D4EDBC" label={t('done')} />
              </TableCell>
              <TableCell>
                <StatusWithDot color="#FFBD9C" label={t('onHold')} />
              </TableCell>
              <TableCell>
                <StatusWithDot color="#A9A9A9" label={t('cancelled')} />
              </TableCell>
              <TableCell sx={{ borderLeft: '2px solid lightGray' }}>
                <StatusWithDot color="#193f70" label={t('totalTasks')} />
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.map((project) => (
              <TableRow key={project._id}>
                <TableCell>
                  <ProjectFolder project={project} />
                </TableCell>
                <TableCell onClick={() => handleCellClick(project._id, project.title, 'toDo')}>
                  {project.statusCounts.toDo}
                </TableCell>
                <TableCell onClick={() => handleCellClick(project._id, project.title, 'inProgress')}>
                  {project.statusCounts.inProgress}
                </TableCell>
                <TableCell onClick={() => handleCellClick(project._id, project.title, 'underReview')}>
                  {project.statusCounts.underReview}
                </TableCell>
                <TableCell onClick={() => handleCellClick(project._id, project.title, 'done')}>
                  {project.statusCounts.done}
                </TableCell>
                <TableCell onClick={() => handleCellClick(project._id, project.title, 'onHold')}>
                  {project.statusCounts.onHold}
                </TableCell>
                <TableCell onClick={() => handleCellClick(project._id, project.title, 'cancelled')}>
                  {project.statusCounts.cancelled}
                </TableCell>
                <TableCell
                  sx={{ borderLeft: '2px solid lightGray' }}
                  onClick={() => handleChartClick(project._id, project.title)}
                >
                  {project.statusCounts.all}
                </TableCell>
              </TableRow>
            ))}
            <TableRow sx={{ borderTop: '2px solid lightGray' }}>
              <TableCell>{t('total')}</TableCell>
              <TableCell>{calculateTotalTasks('toDo')}</TableCell>
              <TableCell>{calculateTotalTasks('inProgress')}</TableCell>
              <TableCell>{calculateTotalTasks('underReview')}</TableCell>
              <TableCell>{calculateTotalTasks('done')}</TableCell>
              <TableCell>{calculateTotalTasks('onHold')}</TableCell>
              <TableCell>{calculateTotalTasks('cancelled')}</TableCell>
              <TableCell sx={{ borderLeft: '2px solid lightGray' }}>{calculateTotalTasks('all')}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <CDialog
        mode="read"
        open={isOpenDialog}
        onClose={handleCloseDialog}
        title={dialogTitle}
      >
        <ListTableSwitcher
          tasks={selectedTasks}
          setTasks={setTasks}
          displayCheckbox={false}
          displayTab={displayTab}
          displayProjectSelector={false}
        />
      </CDialog>
    </DashboardCard>
  );
};

export default ProjectTaskCount;