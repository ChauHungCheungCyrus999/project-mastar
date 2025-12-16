import React, { useState, useEffect } from 'react';
import { PieChart } from '@mui/x-charts/PieChart';
import { PieChartOutlineOutlined, Summarize } from '@mui/icons-material';
import * as XLSX from 'xlsx';

import axios from 'axios';
import DashboardCard from '../custom/DashboardCard';
import { useTranslation } from 'react-i18next';
import { capitalizeWordsExceptFirst, camelCaseToTitleCase } from '../../utils/StringUtils.js';
import CDialog from '../custom/CDialog';
import ListTableSwitcher from '../task/ListTableSwitcher';

const TaskCounts = ({ dashboardId, cardId, project, criteria, displayProjectSelector, displayMilestoneSelector }) => {
  const { t, i18n } = useTranslation();
  const criteriaStr = criteria
    .split(/(?=[A-Z])/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .concat(' ');

  const projectId = project?._id;
  const [tasks, setTasks] = useState([]);
  const [pieChartData, setPieChartData] = useState([]);
  const [selectedValue, setSelectedValue] = useState(null);
  const [isOpenDialog, setIsOpenDialog] = useState(false);

  useEffect(() => {
    // Fetch task counts via API when the component loads or projectId changes
    const fetchTaskCounts = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/task-counts`, {
          params: { projectId }, // Pass projectId as a query parameter
          headers: {
            Authorization: `Bearer ${token}`, // Add the token to the Authorization header
          }
        });

        if (response.data && response.data.tasks) {
          const fetchedTasks = response.data.tasks;

          setTasks(fetchedTasks);

          // Generate pie chart data from fetched tasks
          const counts = fetchedTasks.reduce((counts, task) => {
            const value = task[criteria] || 'Unassigned';
            counts[value] = (counts[value] || 0) + 1;
            return counts;
          }, {});

          const chartData = Object.keys(counts).map((value, index) => {
            let color = '#888888'; // Default color

            if (criteria === 'status') {
              // Define colors for statuses
              const colorStatuses = [
                { status: t('unassigned'), backgroundColor: '#888888' },
                { status: t('toDo'), backgroundColor: '#89CFF0' },
                { status: t('inProgress'), backgroundColor: '#FFE5A0' },
                { status: t('underReview'), backgroundColor: '#E6CFF2' },
                { status: t('done'), backgroundColor: '#D4EDBC' },
                { status: t('onHold'), backgroundColor: '#FFBD9C' },
                { status: t('cancelled'), backgroundColor: '#C9C9C9' },
              ];
              const status = t(capitalizeWordsExceptFirst(value));
              const statusColor = colorStatuses.find((item) => item.status === status);
              if (statusColor) {
                color = statusColor.backgroundColor;
              }
            } else if (criteria === 'priority') {
              // Define colors for priorities
              const colorPriorities = [
                { priority: t('veryHigh'), backgroundColor: '#FF8A8A' },
                { priority: t('high'), backgroundColor: '#FFCFC9' },
                { priority: t('medium'), backgroundColor: '#FFE5A0' },
                { priority: t('low'), backgroundColor: '#D4EDBC' },
                { priority: t('veryLow'), backgroundColor: '#E6CFF2' },
              ];
              const priority = t(capitalizeWordsExceptFirst(value));
              const priorityColor = colorPriorities.find((item) => item.priority === priority);
              if (priorityColor) {
                color = priorityColor.backgroundColor;
              }
            } else if (criteria === 'difficultyLevel') {
              // Define colors for difficulty levels
              const colorDifficultyLevel = [
                { difficultyLevel: t('veryDifficult'), backgroundColor: '#FF8A8A' },
                { difficultyLevel: t('difficult'), backgroundColor: '#FFCFC9' },
                { difficultyLevel: t('moderate'), backgroundColor: '#FFE5A0' },
                { difficultyLevel: t('easy'), backgroundColor: '#D4EDBC' },
              ];
              const difficultyLevel = t(capitalizeWordsExceptFirst(value));
              const difficultyLevelColor = colorDifficultyLevel.find(
                (item) => item.difficultyLevel === difficultyLevel
              );
              if (difficultyLevelColor) {
                color = difficultyLevelColor.backgroundColor;
              }
            }

            return {
              id: index,
              value: counts[value],
              label: t(capitalizeWordsExceptFirst(value)),
              color,
            };
          });

          setPieChartData(chartData);
        }
      } catch (error) {
        console.error('Error fetching task counts:', error);
      }
    };

    fetchTaskCounts();
  }, [projectId, criteria, t]);

  // Export data to Excel
  const handleExportReport = () => {
    const data = pieChartData.map((item) => ({
      Criteria: item.label,
      Count: item.value,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `${camelCaseToTitleCase(criteria)} Distribution`);

    XLSX.writeFile(workbook, `${camelCaseToTitleCase(criteria)} Distribution.xlsx`);
  };

  const handleSliceClick = (event, itemIdentifier, item) => {
    setSelectedValue(pieChartData[item.id].label);
    setIsOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setIsOpenDialog(false);
  };

  const filteredTasks = selectedValue
    ? tasks.filter((task) => {
        if (selectedValue === t('unassigned')) {
          return task[criteria] === '';
        }
        return t(capitalizeWordsExceptFirst(task[criteria])) === selectedValue;
      })
    : tasks;

  return (
    <>
      <DashboardCard
        dashboardId={dashboardId}
        cardId={cardId}
        title={
          i18n.language === 'en-us'
            ? criteriaStr + t('distribution')
            : t(criteria) + ' '+ t('distribution')
        }
        description={`${
          i18n.language === 'en-us'
            ? t('numOfTasksInCriteria', { criteria: criteriaStr.toLowerCase() })
            : t('numOfTasksInCriteria', { criteria: t(criteria) })
        }`}
        color={project? project.color : '#193f70'}
        icon={PieChartOutlineOutlined}
        subheader={t('totalTasks') + t('colon') + tasks.length}
        menuItems={[
          {
            label: t('exportReport'),
            icon: <Summarize />,
            onClick: handleExportReport, // Attach the export report handler
          },
        ]}
      >
        <PieChart
          margin={{ bottom: 50, left: 50, right: 50 }}
          series={[
            {
              data: pieChartData,
              innerRadius: 50,
              paddingAngle: 2,
              cornerRadius: 5,
              highlightScope: { faded: 'global', highlighted: 'item' },
            },
          ]}
          slotProps={{
            legend: {
              direction: 'row',
              position: { vertical: 'bottom', horizontal: 'middle' },
              padding: 0,
              itemMarkWidth: 10,
              itemMarkHeight: 10,
              markGap: 5,
              itemGap: 10,
              labelStyle: {
                fontSize: 13,
              },
            },
          }}
          height={200}
          onClick={handleSliceClick}
        />
      </DashboardCard>

      <CDialog
        mode="read"
        open={isOpenDialog}
        onClose={handleCloseDialog}
        title={`${selectedValue} (${filteredTasks.length})`}
      >
        {selectedValue && (
          <ListTableSwitcher
            project={project}
            tasks={filteredTasks}
            displayCheckbox={false}
            displayTab={true}
            displayProjectSelector={displayProjectSelector}
            displayMilestoneSelector={displayMilestoneSelector}
          />
        )}
      </CDialog>
    </>
  );
};

export default TaskCounts;