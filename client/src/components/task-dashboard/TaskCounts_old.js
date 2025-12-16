// MUI Chart
import React, { useState } from 'react';
import { PieChart } from '@mui/x-charts/PieChart';
import PieChartOutlineOutlinedIcon from '@mui/icons-material/PieChartOutlineOutlined';

import DashboardCard from '../custom/DashboardCard';

import { useTranslation } from 'react-i18next';

import { capitalizeWordsExceptFirst } from '../../utils/StringUtils.js';

import CDialog from '../custom/CDialog';

import ListTableSwitcher from '../task/ListTableSwitcher';

const TaskCounts = ({ project, tasks, setTasks, criteria }) => {
  const { t, i18n } = useTranslation();
  const criteriaStr = criteria
    .split(/(?=[A-Z])/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .concat(' ');

  const [selectedValue, setSelectedValue] = useState(null);

  const [isOpenDialog, setIsOpenDialog] = useState(false);

  const counts = tasks.reduce((counts, task) => {
    const value = task[criteria] || 'Unassigned';
    counts[value] = (counts[value] || 0) + 1;
    return counts;
  }, {});

  // Color
  const colorStatuses = [
    { status: t('unassigned'), backgroundColor: '', color: 'black' },
    { status: t('toDo'), backgroundColor: '#89CFF0', color: 'black' },
    { status: t('inProgress'), backgroundColor: '#FFE5A0', color: 'black' },
    { status: t('underReview'), backgroundColor: '#E6CFF2', color: 'black' },
    { status: t('done'), backgroundColor: '#D4EDBC', color: 'black' },
    { status: t('onHold'), backgroundColor: '#FFBD9C', color: 'black' },
    { status: t('cancelled'), backgroundColor: '#C9C9C9', color: 'black' }
  ];

  const colorPriorities = [
    { priority: t('veryHigh'), backgroundColor: '#FF8A8A', color: 'black' },
    { priority: t('high'), backgroundColor: '#FFCFC9', color: 'black' },
    { priority: t('medium'), backgroundColor: '#FFE5A0', color: 'black' },
    { priority: t('low'), backgroundColor: '#D4EDBC', color: 'black' },
    { priority: t('veryLow'), backgroundColor: '#E6CFF2', color: 'black' },
  ];

  // difficulty level color indicator
  const colorDifficultyLevel = [
    { difficultyLevel: t('veryDifficult'), backgroundColor: '#FF8A8A', color: 'black' },
    { difficultyLevel: t('difficult'), backgroundColor: '#FFCFC9', color: 'black' },
    { difficultyLevel: t('moderate'), backgroundColor: '#FFE5A0', color: 'black' },
    { difficultyLevel: t('easy'), backgroundColor: '#D4EDBC', color: 'black' }
  ];

  const pieChartData = Object.keys(counts).map((value, index) => {
    let color = '';
  
    if (criteria === 'status') {
      const status = t(capitalizeWordsExceptFirst(value));
      const statusColor = colorStatuses.find((item) => item.status === status);
      if (statusColor) {
        color = statusColor.backgroundColor;
      }
    } else if (criteria === 'priority') {
      const priority = t(capitalizeWordsExceptFirst(value));
      const priorityColor = colorPriorities.find((item) => item.priority === priority);
      if (priorityColor) {
        color = priorityColor.backgroundColor;
      }
    } else if (criteria === 'difficultyLevel') {
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
      color: color || '#888888', // Default color if no specific color is found
    };
  });

  const handleSliceClick = (event, itemIdentifier, item) => {
    //console.log('item.id = ' + item.id);
    //console.log('itemIdentifier = ' + JSON.stringify(itemIdentifier));
    //console.log('pieChartData[item.id].value = ' + pieChartData[item.id].value);
    
    setSelectedValue(pieChartData[item.id].label);
    setIsOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setIsOpenDialog(false);
  };

  const filteredTasks = selectedValue ? tasks.filter((task) => {
    if (selectedValue === t('unassigned')) {
      return task[criteria] === "";
    }
    //console.log("task[criteria] = " + t(capitalizeWordsExceptFirst(task[criteria])));
    return t(capitalizeWordsExceptFirst(task[criteria])) === selectedValue;
  }) : tasks;
  //console.log("selectedValue = ", selectedValue);
  
  return (
    <>
      <DashboardCard
        dashboardId="Task Dashboard"
        cardId={`${criteria}Distribution`}
        title={
          i18n.language === 'en-us'
            ? criteriaStr + t('distribution')
            : t(criteria) + t('distribution')
        }
        description={
          `${i18n.language === 'en-us'
            ? t('numOfTasksInCriteria', { criteria: criteriaStr.toLowerCase() })
            : t('numOfTasksInCriteria', { criteria: t(criteria) })}`
        }
        icon={PieChartOutlineOutlinedIcon}
        color={project.color}
        subheader={t('totalTasks') + t('colon') + tasks.length}
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
                fontSize: 13
              },
            },
          }}
          //width={300}
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
        {selectedValue &&
          <ListTableSwitcher
            project={project}
            tasks={filteredTasks}
            setTasks={setTasks}
            displayCheckbox={false}
            displayTab={true}
            displayProjectSelector={false}
            displayMilestoneSelector={true}
          />
        }
      </CDialog>
    </>
  );
};

export default TaskCounts;


// Recharts
/*import React, { useState } from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';
import { PieChartOutlineOutlined as PieChartOutlineOutlinedIcon } from '@mui/icons-material';

import DashboardCard from '../custom/DashboardCard';

import { useTranslation } from 'react-i18next';

import { capitalizeWordsExceptFirst } from '../../utils/StringUtils.js';

import CDialog from '../custom/CDialog';

import TaskTable from '../task/TaskTable';

const TaskCounts = ({ project, tasks, setTasks, criteria }) => {
  const { t, i18n } = useTranslation();
  const criteriaStr = criteria
    .split(/(?=[A-Z])/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .concat(' ');

  const [selectedValue, setSelectedValue] = useState(null);

  const [isOpenDialog, setIsOpenDialog] = useState(false);

  const counts = tasks.reduce((counts, task) => {
    const value = task[criteria] || 'Unassigned';
    counts[value] = (counts[value] || 0) + 1;
    return counts;
  }, {});

  const colorStatuses = [
    { status: t('unassigned'), backgroundColor: '', color: 'black' },
    { status: t('toDo'), backgroundColor: '#89CFF0', color: 'black' },
    { status: t('inProgress'), backgroundColor: '#FFE5A0', color: 'black' },
    { status: t('underReview'), backgroundColor: '#E6CFF2', color: 'black' },
    { status: t('done'), backgroundColor: '#D4EDBC', color: 'black' },
    { status: t('onHold'), backgroundColor: '#FFBD9C', color: 'black' },
    { status: t('cancelled'), backgroundColor: '#C9C9C9', color: 'black' }
  ];

  const colorPriorities = [
    { priority: t('veryHigh'), backgroundColor: '#FF8A8A', color: 'black' },
    { priority: t('high'), backgroundColor: '#FFCFC9', color: 'black' },
    { priority: t('medium'), backgroundColor: '#FFE5A0', color: 'black' },
    { priority: t('low'), backgroundColor: '#D4EDBC', color: 'black' },
    { priority: t('veryLow'), backgroundColor: '#E6CFF2', color: 'black' },
  ];

  // difficulty level color indicator
  const colorDifficultyLevel = [
    { difficultyLevel: t('veryDifficult'), backgroundColor: '#FF8A8A', color: 'black' },
    { difficultyLevel: t('difficult'), backgroundColor: '#FFCFC9', color: 'black' },
    { difficultyLevel: t('moderate'), backgroundColor: '#FFE5A0', color: 'black' },
    { difficultyLevel: t('easy'), backgroundColor: '#D4EDBC', color: 'black' }
  ];

  const pieChartData = Object.keys(counts).map((value, index) => {
    let color = '';
  
    if (criteria === 'status') {
      const status = t(capitalizeWordsExceptFirst(value));
      const statusColor = colorStatuses.find((item) => item.status === status);
      if (statusColor) {
        color = statusColor.backgroundColor;
      }
    } else if (criteria === 'priority') {
      const priority = t(capitalizeWordsExceptFirst(value));
      const priorityColor = colorPriorities.find((item) => item.priority === priority);
      if (priorityColor) {
        color = priorityColor.backgroundColor;
      }
    } else if (criteria === 'difficultyLevel') {
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
      color: color || '#888888', // Default color if no specific color is found
    };
  });

  const handleSliceClick = (data, index) => {
    setSelectedValue(pieChartData[index].label);
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
        dashboardId="Task Dashboard"
        cardId={`${criteria}Distribution`}
        title={
          i18n.language === 'en-us'
            ? criteriaStr + t('distribution')
            : t(criteria) + t('distribution')
        }
        description={`${
          i18n.language === 'en-us'
            ? t('numOfTasksInCriteria', { criteria: criteriaStr.toLowerCase() })
            : t('numOfTasksInCriteria', { criteria: t(criteria) })
        }`}
        icon={PieChartOutlineOutlinedIcon}
        color={project.color}
        subheader={t('totalTasks') + t('colon') + tasks.length}
      >
        <PieChart width={300} height={200}>
          <Pie
            data={pieChartData}
            dataKey="value"
            nameKey="label"
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
            cornerRadius={5}
            onClick={handleSliceClick}
          >
            {pieChartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} style={{outline: 'none'}} />
            ))}
          </Pie>
          <Legend
            verticalAlign="bottom"
            align="center"
            iconSize={10}
            iconType="circle"
            formatter={(value) => t(value)}
            wrapperStyle={{ whiteSpace: "break-spaces" }}
          />
          <Tooltip />
        </PieChart>
      </DashboardCard>

      <CDialog
        mode="read"
        open={isOpenDialog}
        onClose={handleCloseDialog}
        title={`${selectedValue} (${filteredTasks.length})`}
      >
        {selectedValue && <TaskTable project={project} tasks={filteredTasks} setTasks={setTasks} displayCheckbox={false} />}
      </CDialog>
    </>
  );
};

export default TaskCounts;*/