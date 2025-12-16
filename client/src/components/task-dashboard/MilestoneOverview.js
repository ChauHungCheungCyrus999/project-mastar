import React, { useEffect, useState } from 'react';
import { Grid, Box, Typography, Paper, Tabs, Tab, Pagination, Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Flag, Summarize } from '@mui/icons-material';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import DashboardCard from '../custom/DashboardCard';
import BorderLinearProgress from '../custom/BorderLinearProgress';
import CDialog from '../custom/CDialog';
import ListTableSwitcher from '../task/ListTableSwitcher';
import MilestoneFlag from '../MilestoneFlag';
import * as XLSX from 'xlsx'; // Import XLSX for exporting Excel files

const MilestoneOverview = ({ project, tasks, setTasks }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [milestones, setMilestones] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [tabIndex, setTabIndex] = useState(0);
  const [page, setPage] = useState(1);
  const [showWithoutMilestoneDialog, setShowWithoutMilestoneDialog] = useState(false);

  useEffect(() => {
    const fetchMilestones = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/milestones/project/${project._id}/active`);
        setMilestones(response.data);
      } catch (error) {
        console.error('Error fetching milestones:', error);
      }
    };
    fetchMilestones();
  }, [project._id]);

  const handleOpenDialog = (milestone) => {
    setSelectedMilestone(milestone);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedMilestone(null);
    setShowWithoutMilestoneDialog(false);
  };

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleExportReport = () => {
    const reportData = milestones.map(milestone => {
      const milestoneTasks = tasks.filter(task => task.milestone?._id === milestone._id);
      const totalTasks = milestoneTasks.length;
      const completedTasksCount = milestoneTasks.filter(task => task.status === 'Done').length;
      const completionPercentage = totalTasks === 0 ? 0 : (completedTasksCount / totalTasks) * 100;
  
      return {
        [t('milestone')]: milestone.title,
        [t('completedTasks')]: completedTasksCount,
        [t('totalTasks')]: totalTasks,
        [t('taskCompletionRate')]: completionPercentage ? `${completionPercentage.toFixed(2)}%` : '0%',
      };
    });
  
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'Done').length;
    const overallCompletionPercentage = totalTasks === 0 ? 0 : ((completedTasks / totalTasks) * 100);
  
    reportData.push({
      [t('milestone')]: t('total'),
      [t('completedTasks')]: completedTasks,
      [t('totalTasks')]: totalTasks,
      [t('taskCompletionRate')]: overallCompletionPercentage ? `${overallCompletionPercentage.toFixed(2)}%` : '0%',
    });
  
    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, t('milestoneOverview'));
    XLSX.writeFile(workbook, `${t('milestoneOverview')}.xlsx`);
  };  

  const milestonesToShow = milestones.slice((page - 1) * 8, page * 8);
  const gridSize = milestones.length < 4 ? 12 : 6;

  // Tasks without a milestone
  const tasksWithoutMilestone = tasks.filter(task => !task.milestone);
  const totalTasksWithoutMilestone = tasksWithoutMilestone.length;
  const completedTasksWithoutMilestone = tasksWithoutMilestone.filter(task => task.status === 'Done').length;
  const completionPercentageWithoutMilestone = totalTasksWithoutMilestone === 0 ? 0 : (completedTasksWithoutMilestone / totalTasksWithoutMilestone) * 100;

  const handleOpenWithoutMilestoneDialog = () => {
    setShowWithoutMilestoneDialog(true);
    setIsDialogOpen(true);
  };

  return (
    <>
      <DashboardCard
        dashboardId="Task Dashboard"
        cardId="Milestone Overview"
        title={t('milestoneOverview')}
        description={t('milestoneOverviewDesc')}
        height={600}
        icon={Flag}
        color={project.color}
        subheader={`${t('numOfMilestones')}${t('colon')}${milestones.length}`}
        menuItems={[
          {
            label: t('exportReport'),
            icon: <Summarize />,
            onClick: handleExportReport,
          },
        ]}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          '@media (min-width: 600px)': {
            flexDirection: 'row',
          },
        }}
      >
        <Grid container spacing={2} my={1}>
          {milestonesToShow.map((milestone, index) => {
            const milestoneTasks = tasks.filter(task => task.milestone?._id === milestone._id);
            const totalTasks = milestoneTasks.filter(task => task.status !== 'Cancelled').length;
            const completedTasksCount = milestoneTasks.filter(task => task.status === 'Done').length;
            const completionPercentage = totalTasks === 0 ? 0 : (completedTasksCount / totalTasks) * 100;
            return (
              <Grid xs={12} md={gridSize} key={milestone._id} onClick={() => handleOpenDialog(milestone)} sx={{ cursor: 'pointer' }}>
                <Box px={3}>
                  <Typography variant="subtitle1" sx={{ color: theme.palette.primary.main }} mb={1}>
                    <MilestoneFlag milestone={milestone} />
                  </Typography>
                  <Grid container sx={{ justifyContent: "space-evenly", alignItems: "center" }}>
                    <Grid item xs={11}>
                      <BorderLinearProgress variant="determinate" value={completionPercentage} sx={{ height: '10px', borderRadius: '5px' }} />
                    </Grid>
                    <Grid item xs={1}>
                      <Typography variant="body2" sx={{ color: 'secondary' }}>{`${completionPercentage?.toFixed(2)}%`}</Typography>
                    </Grid>
                  </Grid>
                  <Typography
                    variant="body2"
                    sx={{ color: 'text.secondary', mb: index === milestones.length - 1 ? 0 : '1rem' }}
                  >
                    {completedTasksCount} / {totalTasks} {t('tasksCompleted')}
                  </Typography>
                </Box>
              </Grid>
            );
          })}

          {/* Display tasks without a milestone */}
          {totalTasksWithoutMilestone > 0 && (
            <Grid xs={12} md={gridSize} sx={{ cursor: 'pointer' }} onClick={handleOpenWithoutMilestoneDialog}>
              <Box px={3}>
                <Chip
                  size="small"
                  label={t('withoutMilestone')}
                  sx={{
                    fontSize: '0.8rem',
                    borderRadius: 1
                  }}
                />
                <Grid container sx={{ justifyContent: "space-evenly", alignItems: "center" }}>
                  <Grid item xs={11}>
                    <BorderLinearProgress variant="determinate" value={completionPercentageWithoutMilestone} sx={{ height: '10px', borderRadius: '5px' }} />
                  </Grid>
                  <Grid item xs={1}>
                    <Typography variant="body2" sx={{ color: 'secondary' }}>{`${completionPercentageWithoutMilestone?.toFixed(2)}%`}</Typography>
                  </Grid>
                </Grid>
                <Typography
                  variant="body2"
                  sx={{ color: 'text.secondary', mb: '1rem' }}
                >
                  {completedTasksWithoutMilestone} / {totalTasksWithoutMilestone} {t('tasksCompleted')}
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>

        {milestones.length > 8 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2 }}>
            <Pagination
              count={Math.ceil(milestones.length / 8)}
              page={page}
              onChange={handlePageChange}
            />
          </Box>
        )}
      </DashboardCard>

      {(selectedMilestone || showWithoutMilestoneDialog) && (
        <CDialog
          mode="read"
          open={isDialogOpen}
          onClose={handleCloseDialog}
          title={t('tasksInMilestone', { milestoneTitle: selectedMilestone?.title })}
        >
          <Paper variant="none" elevation={0} style={{ position: 'sticky', top: 0, zIndex: 1000 }}>
            <Tabs value={tabIndex} onChange={handleTabChange} aria-label={t('completedAndIncompletedTasks')}>
              <Tab label={`${t('completed')} (${(showWithoutMilestoneDialog ? tasksWithoutMilestone : tasks).filter(task => task.status === 'Done').length})`} />
              <Tab label={`${t('incompleted')} (${(showWithoutMilestoneDialog ? tasksWithoutMilestone : tasks).filter(task => task.status !== 'Done').length})`} />
            </Tabs>
          </Paper>

          {tabIndex === 0 && (
            <ListTableSwitcher
              project={project}
              tasks={(showWithoutMilestoneDialog ? tasksWithoutMilestone : tasks).filter(task => task.status === 'Done')}
              setTasks={setTasks}
              displayCheckbox="false"
              columnsToShow={['taskName', 'status', 'personInCharge', 'startDate', 'endDate']}
              displayTab={false}
              displayProjectSelector={false}
            />
          )}
          {tabIndex === 1 && (
            <ListTableSwitcher
              project={project}
              tasks={(showWithoutMilestoneDialog ? tasksWithoutMilestone : tasks).filter(task => task.status !== 'Done')}
              setTasks={setTasks}
              displayCheckbox="false"
              columnsToShow={['taskName', 'status', 'personInCharge', 'startDate', 'endDate']}
              displayTab={true}
              displayProjectSelector={false}
            />
          )}
        </CDialog>
      )}
    </>
  );
};

export default MilestoneOverview;
