import React, { useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Paper, Container, Grid, Typography, Switch, FormControlLabel, Tabs, Tab, Box } from '@mui/material';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';

import { useTranslation } from 'react-i18next';

import DashboardCard from '../custom/DashboardCard';
import CDialog from '../custom/CDialog';

import ListTableSwitcher from '../task/ListTableSwitcher';

import { capitalizeWordsExceptFirst } from '../../utils/StringUtils.js';

const TeamPerformance = ({ project, tasks, setTasks }) => {
  const { t } = useTranslation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [clickedBarData, setClickedBarData] = useState(null);
  const [showDetailView, setShowDetailView] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);

  const columnsToShow = ['taskName', 'status', 'personInCharge', 'startDate', 'endDate'];

  const colorStatuses = [
    //{ status: t('unassigned'), backgroundColor: '', color: 'black' },
    { status: t('toDo'), backgroundColor: '#89CFF0', color: 'black' },
    { status: t('inProgress'), backgroundColor: '#FFE5A0', color: 'black' },
    { status: t('underReview'), backgroundColor: '#E6CFF2', color: 'black' },
    { status: t('done'), backgroundColor: '#D4EDBC', color: 'black' },
    { status: t('onHold'), backgroundColor: '#FFBD9C', color: 'black' },
    { status: t('cancelled'), backgroundColor: '#C9C9C9', color: 'black' },
    { status: t('none'), backgroundColor: 'transparent', color: '' }
  ];

  const taskCountByMember = project.teamMembers.map(member => {
    const memberTasks = tasks.filter(task => task.personInCharge.some(person => person._id === member._id));
    const completedTasks = memberTasks.filter(task => task.status === 'Done').length;
    const currentDate = new Date();
    const overdueTasks = memberTasks.filter(task => task.endDate && new Date(task.endDate) < currentDate && task.status !== 'Done' && task.status !== 'Cancelled').length;
    const incompletedTasks = memberTasks.filter(task => task.status !== 'Done' && task.status !== 'Cancelled' && (!task.endDate || new Date(task.endDate) >= currentDate)).length;

    return {
      personInCharge: `${member.firstName} ${member.lastName}`,
      personInChargeId: member._id,
      completed: completedTasks,
      incompleted: incompletedTasks,
      overdue: overdueTasks,
      tasks: memberTasks
    };
  });

  const handleBarClick = (data) => {
    setIsDialogOpen(true);
    setClickedBarData(data);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  return (
    <>
      <DashboardCard
        dashboardId="Task Dashboard"
        cardId="Team Performance"
        title={t('teamPerformance')}
        description={t('teamPerformanceDesc')}
        height={550}
        icon={BarChartOutlinedIcon}
        color={project.color}
        subheader={`${t('numOfTeamMembers')}${t('colon')}${project.teamMembers.length}`}
      >
        <Grid container justifyContent="flex-end">
          <FormControlLabel
            control={
              <Switch
                checked={showDetailView}
                onChange={() => setShowDetailView(!showDetailView)}
                color="primary"
              />
            }
            label={t('detailedView')}
          />
        </Grid>

        <Container sx={{ margin: "0 auto" }}>
          <ResponsiveContainer height={400}>
            {taskCountByMember.length === 0 ? (
              <Typography variant="body1">
                {t('noDataAvailable')}
              </Typography>
            ) : (
              <BarChart data={taskCountByMember} layout="vertical">
                <XAxis type="number" />
                <YAxis
                  dataKey="personInCharge"
                  type="category"
                  width={150}
                  interval={0}
                />
                <Tooltip />
                <Legend wrapperStyle={{ whiteSpace: "break-spaces" }} />
                {showDetailView ? (
                  colorStatuses.map(status => (
                    <Bar
                      key={status.status}
                      name={t(status.status)}
                      dataKey={(entry) => entry.tasks.filter(task => t(capitalizeWordsExceptFirst(task.status)) === status.status).length}
                      stackId="status"
                      fill={status.backgroundColor}
                      onClick={handleBarClick}
                    />
                  ))
                ) : (
                  <>
                    <Bar
                      name={t('completedTasks')}
                      dataKey="completed"
                      stackId="status"
                      fill="#82ca9d"
                      onClick={handleBarClick}
                    />
                    <Bar
                      name={t('incompletedTasks')}
                      dataKey="incompleted"
                      stackId="status"
                      fill="#8884d8"
                      onClick={handleBarClick}
                    />
                    <Bar
                      name={t('overdueTasks')}
                      dataKey="overdue"
                      stackId="status"
                      fill="#FF6347"
                      onClick={handleBarClick}
                    />
                  </>
                )}
              </BarChart>
            )}
          </ResponsiveContainer>
        </Container>
      </DashboardCard>

      <CDialog
        mode="read"
        open={isDialogOpen}
        onClose={handleCloseDialog}
        title={showDetailView ? t('tasksInDifferentStatus') : t('completedAndIncompletedTasks')}
      >
        {clickedBarData && (
          showDetailView ? (
            <ListTableSwitcher
              project={project}
              tasks={clickedBarData.tasks}
              setTasks={setTasks}
              displayCheckbox={false}
              columnsToShow={columnsToShow}
              displayTab={true}
              displayProjectSelector={false}
              displayMilestoneSelector={true}
            />
          ) : (
            <Box>
              <Paper variant="none" elevation={0} style={{ position: 'sticky', top: 0, zIndex: 1000 }}>
                <Tabs value={tabIndex} onChange={handleTabChange} aria-label={showDetailView ? t('tasksInDifferentStatus') : t('completedAndIncompletedTasks')}>
                  <Tab label={`${t('completed')} (${clickedBarData.completed})`} />
                  <Tab label={`${t('incompleted')} (${clickedBarData.incompleted})`} />
                  <Tab label={`${t('overdue')} (${clickedBarData.overdue})`} />
                </Tabs>
              </Paper>

              {tabIndex === 0 && (
                <ListTableSwitcher
                  project={project}
                  tasks={clickedBarData.tasks.filter(task => task.status === 'Done')}
                  setTasks={setTasks}
                  displayCheckbox={false}
                  columnsToShow={columnsToShow}
                  displayTab={false}
                  displayProjectSelector={false}
                  displayMilestoneSelector={true}
                />
              )}
              {tabIndex === 1 && (
                <ListTableSwitcher
                  project={project}
                  tasks={clickedBarData.tasks.filter(task => task.status !== 'Done' && task.status !== 'Cancelled' && (!task.endDate || new Date(task.endDate) >= new Date()))}
                  setTasks={setTasks}
                  displayCheckbox={false}
                  columnsToShow={columnsToShow}
                  displayTab={true}
                  displayProjectSelector={false}
                  displayMilestoneSelector={true}
                />
              )}
              {tabIndex === 2 && (
                <ListTableSwitcher
                  project={project}
                  tasks={clickedBarData.tasks.filter(task => task.endDate && new Date(task.endDate) < new Date() && task.status !== 'Done' && task.status !== 'Cancelled')}
                  setTasks={setTasks}
                  displayCheckbox={false}
                  columnsToShow={columnsToShow}
                  displayTab={true}
                  displayProjectSelector={false}
                  displayMilestoneSelector={true}
                />
              )}
            </Box>
          )
        )}
      </CDialog>
    </>
  );
};

export default TeamPerformance;