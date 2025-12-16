import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { StackedBarChartOutlined, Summarize } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

import CDialog from '../custom/CDialog';
import ListTableSwitcher from '../task/ListTableSwitcher';
import DashboardCard from '../custom/DashboardCard';

const MilestoneStatusDistribution = ({ project, setTasks }) => {
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [clickedBarData, setClickedBarData] = useState([]);

  useEffect(() => {
    const fetchMilestoneData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/milestone/project/${project._id}`);

        const processedData = response.data.map(milestone => ({
          _id: milestone._id,
          milestoneTitle: milestone.milestoneTitle,
          toDo: milestone.toDo.length,
          inProgress: milestone.inProgress.length,
          underReview: milestone.underReview.length,
          done: milestone.done.length,
          onHold: milestone.onHold.length,
          cancelled: milestone.cancelled.length,
          tasks: milestone // Ensure tasks array is directly from API response
        }));

        setData(processedData);
      } catch (error) {
        console.error('Error fetching milestone data:', error);
      }
    };

    fetchMilestoneData();
  }, [project._id]);

  const colorStatuses = [
    { status: 'toDo', backgroundColor: '#89CFF0' },
    { status: 'inProgress', backgroundColor: '#FFE5A0' },
    { status: 'underReview', backgroundColor: '#E6CFF2' },
    { status: 'done', backgroundColor: '#D4EDBC' },
    { status: 'onHold', backgroundColor: '#FFBD9C' },
    { status: 'cancelled', backgroundColor: '#C9C9C9' },
  ];

  const handleBarClick = async (milestone) => {
    setIsDialogOpen(true);
    //console.log('milestone = ' + JSON.stringify(milestone));
    try {
      const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/tasks/milestone/${milestone._id}/project/${project._id}`);
      console.log('response.data = ' + JSON.stringify(response.data));
      setClickedBarData(response.data);
    } catch (error) {
      console.error('Error fetching tasks by milestone:', error);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleExportReport = () => {
    const formattedData = data.map(milestone => {
      const totalTasks = milestone.toDo + milestone.inProgress + milestone.underReview + milestone.done + milestone.onHold + milestone.cancelled;
      const completionPercentage = totalTasks ? ((milestone.done / totalTasks) * 100).toFixed(2) : '0';
      
      return {
        [t('milestone')]: milestone.milestoneTitle,
        [t('toDo')]: milestone.toDo,
        [t('inProgress')]: milestone.inProgress,
        [t('underReview')]: milestone.underReview,
        [t('done')]: milestone.done,
        [t('onHold')]: milestone.onHold,
        [t('cancelled')]: milestone.cancelled,
        [t('totalTasks')]: totalTasks,
        [t('taskCompletionRate')]: `${completionPercentage}%`
      };
    });

    const totalTasksRow = {
      [t('milestone')]: t('total'),
      [t('toDo')]: formattedData.reduce((sum, row) => sum + row[t('toDo')], 0),
      [t('inProgress')]: formattedData.reduce((sum, row) => sum + row[t('inProgress')], 0),
      [t('underReview')]: formattedData.reduce((sum, row) => sum + row[t('underReview')], 0),
      [t('done')]: formattedData.reduce((sum, row) => sum + row[t('done')], 0),
      [t('onHold')]: formattedData.reduce((sum, row) => sum + row[t('onHold')], 0),
      [t('cancelled')]: formattedData.reduce((sum, row) => sum + row[t('cancelled')], 0),
      [t('totalTasks')]: formattedData.reduce((sum, row) => sum + row[t('totalTasks')], 0),
      [t('taskCompletionRate')]: `${(formattedData.reduce((sum, row) => sum + parseFloat(row[t('taskCompletionRate')]), 0) / formattedData.length).toFixed(2)}%`
    };

    const worksheet = XLSX.utils.json_to_sheet([...formattedData, totalTasksRow]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `${t('milestoneStatusDistribution')}`);
    XLSX.writeFile(workbook, `${t('milestoneStatusDistribution')}.xlsx`);
  };

  return (
    <>
      <DashboardCard
        dashboardId="Task Dashboard"
        cardId="Milestone Status Distribution"
        title={t('milestoneStatusDistribution')}
        description={t('milestoneStatusDistributionDesc')}
        height={600}
        icon={StackedBarChartOutlined}
        color={project.color}
        subheader=""
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
        <ResponsiveContainer width="100%" height={500}>
          <BarChart layout="vertical" data={data}>
            <XAxis type="number" />
            <YAxis dataKey="milestoneTitle" type="category" width={150} interval={0} />
            <Tooltip />
            <Legend wrapperStyle={{ whiteSpace: "break-spaces" }} />
            {colorStatuses.map(status => (
              <Bar
                key={status.status}
                name={t(status.status)}
                dataKey={status.status}
                stackId="status"
                fill={status.backgroundColor}
                onClick={(data) => handleBarClick(data)}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </DashboardCard>

      <CDialog
        mode="read"
        open={isDialogOpen}
        onClose={handleCloseDialog}
        title={t('tasksInMilestone', { milestoneTitle: clickedBarData[0]?.milestone?.title })}
      >
        {clickedBarData && (
          <ListTableSwitcher
            project={project}
            tasks={clickedBarData}
            setTasks={setTasks}
            height="70vh"
            displayCheckbox={false}
            columnsToShow={['taskName', 'status', 'personInCharge', 'startDate', 'endDate']}
            displayTab={true}
            displayProjectSelector={false}
            displayMilestoneSelector={false}
          />
        )}
      </CDialog>
    </>
  );
};

export default MilestoneStatusDistribution;

