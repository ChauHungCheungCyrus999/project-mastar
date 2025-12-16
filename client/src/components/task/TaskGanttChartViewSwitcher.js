import React, { useState, useEffect } from "react";
import { ButtonGroup, Button, Switch, Typography, FormControlLabel, Select, MenuItem, Tooltip } from "@mui/material";
import { ViewMode } from "gantt-task-react";
//import "gantt-task-react/dist/index.css";
import "./task-gantt-chart.css";

import { useTranslation } from 'react-i18next';

export const TaskGanttChartViewSwitcher = ({ dateMode, setDateMode, onViewModeChange, onViewListChange, isChecked }) => {
  const { t } = useTranslation();

  const [selectedView, setSelectedView] = useState(ViewMode.Month);

  useEffect(() => {
    const storedViewMode = localStorage.getItem("selectedView");
    if (storedViewMode) {
      setSelectedView(storedViewMode);
      onViewModeChange(storedViewMode);
    }
  }, []);

  const handleViewModeChange = (event) => {
    const viewMode = event.target.value;
    setSelectedView(viewMode);
    onViewModeChange(viewMode);
    localStorage.setItem("selectedView", viewMode);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <ButtonGroup size="small" style={{ textAlign: 'center', marginRight: '1rem' }}>
        <Tooltip title={t('estimatedSchedule')} placement="top">
          <Button
            variant={dateMode === 'estimated' ? 'contained' : 'outlined'}
            onClick={() => setDateMode('estimated')}
          >
            {t('estimatedSchedule')}
          </Button>
        </Tooltip>
        <Tooltip title={t('actualSchedule')} placement="top">
          <Button
            variant={dateMode === 'actual' ? 'contained' : 'outlined'}
            onClick={() => setDateMode('actual')}
          >
            {t('actualSchedule')}
          </Button>
        </Tooltip>
      </ButtonGroup>
      
      <Select
        value={selectedView}
        onChange={handleViewModeChange}
        size="small"
      >
        {/*<MenuItem value={ViewMode.QuarterDay} dense>{t('quarterDay')}</MenuItem>
        <MenuItem value={ViewMode.HalfDay} dense>{t('halfDay')}</MenuItem>*/}
        <MenuItem value={ViewMode.Day} dense>{t('day')}</MenuItem>
        <MenuItem value={ViewMode.Week} dense>{t('week')}</MenuItem>
        <MenuItem value={ViewMode.Month} dense>{t('month')}</MenuItem>
        <MenuItem value={ViewMode.Year} dense>{t('year')}</MenuItem>
      </Select>

      <Tooltip title={t('showTaskTable')}>
        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={isChecked}
              onChange={() => onViewListChange(!isChecked)}
            />
          }
          label={<Typography variant="button">{t('showTaskTable')}</Typography>}
          sx={{ ml: 'auto' }}
        />
      </Tooltip>
    </div>
  );
};