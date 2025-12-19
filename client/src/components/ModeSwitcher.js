import React from 'react';
import { Stack, Button, ButtonGroup, Tooltip, useMediaQuery, useTheme } from '@mui/material';
import { List, ViewList, TableChart, ViewModule, Window, CalendarMonth, ViewTimeline } from '@mui/icons-material';

import { useTranslation } from 'react-i18next';

const ModeSwitcher = ({ displayMode, handleSwitchMode }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Stack direction="row" justifyContent="space-between">
      <ButtonGroup size="small">

        <Tooltip title={t('taskBoard')} placement="top">
          <Button
            onClick={() => handleSwitchMode('TaskBoard')}
            variant={displayMode === 'TaskBoard' ? 'contained' : 'outlined'}
          >
            <ViewModule />
          </Button>
        </Tooltip>


        <Tooltip title={t('taskList')} placement="top">
          <Button
            onClick={() => handleSwitchMode('TaskList')}
            variant={displayMode === 'TaskList' ? 'contained' : 'outlined'}
          >
            <List />
          </Button>
        </Tooltip>

        {/*<Tooltip title={t('milestoneTaskList')} placement="top">
          <Button
            onClick={() => handleSwitchMode('MilestoneTaskList')}
            variant={displayMode === 'MilestoneTaskList' ? 'contained' : 'outlined'}
          >
            <List />
          </Button>
        </Tooltip>*/}

        {!isMobile && (
          <Tooltip title={t('tabbedTaskList')} placement="top">
            <Button
              onClick={() => handleSwitchMode('TabbedTaskList')}
              variant={displayMode === 'TabbedTaskList' ? 'contained' : 'outlined'}
            >
              <ViewList />
            </Button>
          </Tooltip>
        )}

        {!isMobile && (
          <Tooltip title={t('taskTable')} placement="top">
            <Button
              onClick={() => handleSwitchMode('TaskTable')}
              variant={displayMode === 'TaskTable' ? 'contained' : 'outlined'}
            >
              <TableChart />
            </Button>
          </Tooltip>
        )}

        <Tooltip title={t('impactEffortMatrix')} placement="top">
          <Button
            onClick={() => handleSwitchMode('TaskImpactEffortMatrix')}
            variant={displayMode === 'TaskImpactEffortMatrix' ? 'contained' : 'outlined'}
          >
            <Window />
          </Button>
        </Tooltip>

        <Tooltip title={t('calendar')} placement="top">
          <Button
            onClick={() => handleSwitchMode('TaskCalendar')}
            variant={displayMode === 'TaskCalendar' ? 'contained' : 'outlined'}
          >
            <CalendarMonth />
          </Button>
        </Tooltip>
        
        {!isMobile && (
          <Tooltip title={t('ganttChart')} placement="top">
            <Button
              onClick={() => handleSwitchMode('TaskGanttChart')}
              variant={displayMode === 'TaskGanttChart' ? 'contained' : 'outlined'}
            >
              <ViewTimeline />
            </Button>
          </Tooltip>
        )}
      </ButtonGroup>
    </Stack>
  );
};

export default ModeSwitcher;