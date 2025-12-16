import React, { useState, useEffect } from 'react';
import {
  Button,
  ButtonGroup,
  Tooltip,
  Stack,
  Box,
} from '@mui/material';
import { List, TableChart } from '@mui/icons-material';
import TaskList from './TaskList';
import TaskTable from './TaskTable';
import ProjectSelector from '../custom/ProjectSelector';
import MilestoneSelector from '../custom/MilestoneSelector';
import DateRangeSelector from '../custom/DateRangeSelector';
import { useTranslation } from 'react-i18next';
import { useMediaQuery } from '@mui/material';

const ListTableSwitcher = ({
  project,
  tasks,
  setTasks,
  displayCheckbox = false,
  displayToolbar = true,
  columnsToShow = ['taskName', 'status', 'personInCharge', 'startDate', 'endDate'],
  height,
  displayTab,
  displayAllOption = true,
  displayProjectSelector = true,
  displayMilestoneSelector = true,
}) => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery('(max-width:600px)');

  const storedView = localStorage.getItem('selectedView');
  const [view, setView] = useState(storedView || 'list');

  const [selectedRange, setSelectedRange] = useState('');
  const [filteredTasks, setFilteredTasks] = useState(tasks);
  const [selectedProjectId, setSelectedProjectId] = useState(project?._id || '');
  const [selectedMilestone, setSelectedMilestone] = useState('');

  // Extract unique projects
  const projects = tasks
    ?.filter((task) => task.project && task.project._id)
    ?.reduce((uniqueProjects, task) => {
      const exists = uniqueProjects?.find((project) => project._id === task.project._id);
      if (!exists) uniqueProjects.push(task.project);
      return uniqueProjects;
    }, []);

  // Filter tasks by project and milestone
  const projectFilteredTasks = selectedProjectId
    ? filteredTasks?.filter((task) => task.project?._id === selectedProjectId)
    : filteredTasks;

  const milestoneFilteredTasks = selectedMilestone
    ? projectFilteredTasks?.filter((task) => task.milestone?._id === selectedMilestone._id)
    : projectFilteredTasks;

  useEffect(() => {
    localStorage.setItem('selectedView', view);
  }, [view]);

  const handleViewChange = (newView) => {
    setView(newView);
  };

  const handleRangeChange = (event) => {
    setSelectedRange(event.target.value);
  };

  useEffect(() => {
    const now = new Date();
    let filtered = tasks;

    switch (selectedRange) {
      case 'lastWeek':
        const endOfLastWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        const startOfLastWeek = new Date(endOfLastWeek);
        startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);
        filtered = tasks?.filter(
          (task) => new Date(task.endDate) >= startOfLastWeek && new Date(task.endDate) < endOfLastWeek
        );
        break;
      case 'thisWeek':
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        filtered = tasks?.filter((task) => new Date(task.endDate) >= startOfWeek);
        break;
      case 'nextWeek':
        const startOfNextWeek = new Date(now.setDate(now.getDate() + (7 - now.getDay())));
        const endOfNextWeek = new Date(startOfNextWeek);
        endOfNextWeek.setDate(endOfNextWeek.getDate() + 7);
        filtered = tasks?.filter(
          (task) => new Date(task.endDate) >= startOfNextWeek && new Date(task.endDate) < endOfNextWeek
        );
        break;
      case 'lastMonth':
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        filtered = tasks?.filter(
          (task) => new Date(task.endDate) >= startOfLastMonth && new Date(task.endDate) <= endOfLastMonth
        );
        break;
      case 'thisMonth':
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        filtered = tasks?.filter((task) => new Date(task.endDate) >= startOfMonth);
        break;
      case 'nextMonth':
        const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const endOfNextMonth = new Date(startOfNextMonth.getFullYear(), startOfNextMonth.getMonth() + 1, 0);
        filtered = tasks?.filter(
          (task) => new Date(task.endDate) >= startOfNextMonth && new Date(task.endDate) <= endOfNextMonth
        );
        break;
      case 'lastYear':
        const startOfLastYear = new Date(now.getFullYear() - 1, 0, 1);
        const endOfLastYear = new Date(now.getFullYear(), 0, 0);
        filtered = tasks?.filter(
          (task) => new Date(task.endDate) >= startOfLastYear && new Date(task.endDate) <= endOfLastYear
        );
        break;
      case 'thisYear':
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        filtered = tasks?.filter((task) => new Date(task.endDate) >= startOfYear);
        break;
      case 'nextYear':
        const startOfNextYear = new Date(now.getFullYear() + 1, 0, 1);
        const endOfNextYear = new Date(startOfNextYear.getFullYear() + 1, 0, 0);
        filtered = tasks?.filter(
          (task) => new Date(task.endDate) >= startOfNextYear && new Date(task.endDate) <= endOfNextYear
        );
        break;
      default:
        filtered = tasks;
    }

    setFilteredTasks(filtered);
  }, [selectedRange, tasks]);

  return (
    <Box>
      {/* Toolbar for Project Selector, Milestone Selector, and Date Range */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ m: '0.5rem 0' }}>
        <Stack direction="row" spacing={2} alignItems="center">
          {displayProjectSelector && (
            <ProjectSelector
              projectId={selectedProjectId}
              onChange={(projectId) => {
                setSelectedProjectId(projectId);
                setSelectedMilestone(''); // Reset milestone when project changes
              }}
              displayAllOption={displayAllOption}
            />
          )}
          {displayMilestoneSelector && (
            <MilestoneSelector
              projectId={selectedProjectId}
              milestone={selectedMilestone}
              setMilestone={setSelectedMilestone}
              disabled={displayProjectSelector ? !selectedProjectId : false}
            />
          )}

          <DateRangeSelector
            selectedRange={selectedRange}
            onRangeChange={handleRangeChange}
          />
        </Stack>

        {/* View Buttons */}
        {!isMobile && (
          <ButtonGroup size="small">
            <Tooltip title={t('listView')}>
              <Button
                size="small"
                variant={view === 'list' ? 'contained' : 'outlined'}
                onClick={() => handleViewChange('list')}
              >
                <List size="small" />
              </Button>
            </Tooltip>
            <Tooltip title={t('tableView')}>
              <Button
                size="small"
                variant={view === 'table' ? 'contained' : 'outlined'}
                onClick={() => handleViewChange('table')}
              >
                <TableChart size="small" />
              </Button>
            </Tooltip>
          </ButtonGroup>
        )}
      </Stack>

      {/* Render Task List or Table */}
      {view === 'list' || isMobile ? (
        <TaskList
          tasks={milestoneFilteredTasks}
          setTasks={setTasks}
          height={height}
          hasDisplayStatus={true}
          showTaskDetails={{
            category: true,
            description: true,
            estimatedDate: true,
            actualDate: true,
            personInCharge: true,
            tags: true,
            status: true,
            priority: true,
            difficultyLevel: true,
            hasAttachments: true,
            action: true,
          }}
          displayTab={displayTab}
        />
      ) : (
        <TaskTable
          project={projects?.find((p) => p._id === selectedProjectId)}
          tasks={milestoneFilteredTasks}
          setTasks={setTasks}
          displayCheckbox={displayCheckbox}
          displayToolbar={displayToolbar}
          columnsToShow={columnsToShow}
          height={`calc(${height} + 40px)`}
        />
      )}
    </Box>
  );
};

export default ListTableSwitcher;