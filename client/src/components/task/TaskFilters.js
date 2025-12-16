import React, { useState, useEffect } from 'react';
import { FormControl, Select, InputLabel, Grid, Checkbox, FormControlLabel, Menu, MenuItem, Button, Typography, IconButton, Tooltip, useMediaQuery, SwipeableDrawer, Stack } from '@mui/material';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import ClearIcon from '@mui/icons-material/Clear';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';

import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";

import { useTranslation } from 'react-i18next';

import SimpleColorPicker from '../SimpleColorPicker';
import StatusChip from '../StatusChip';
import PriorityChip from '../PriorityChip';
import DifficultyLevelChip from '../DifficultyLevelChip';
import DisplayMyTasksOnly from '../task/DisplayMyTasksOnly';
import DisplayOverdueTasksOnly from '../task/DisplayOverdueTasksOnly';
import TeamMemberSelector from '../custom/TeamMemberSelector';
import MilestoneSelector from '../custom/MilestoneSelector';
import TagSelector from '../custom/TagSelector';
import DateRangeSelector from '../custom/DateRangeSelector';
import CSwipeableDrawer from '../custom/CSwipeableDrawer';

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

const TaskFilters = ({
  project,
  selectedColor, handleColor, setSelectedColor,
  displayMyTasksOnly, setDisplayMyTasksOnly,
  displayOverdueTasksOnly, setDisplayOverdueTasksOnly,
  statusValue, setStatusValue,
  priorityValue, setPriorityValue,
  difficultyLevelValue, setDifficultyLevelValue,
  periodFilter, setPeriodFilter,
  personInCharge, setPersonInCharge,
  milestone, setMilestone,
  tags, setTags
}) => {
  const { t } = useTranslation();
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const isMobile = useMediaQuery('(max-width:600px)');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [estimatedDateRange, setEstimatedDateRange] = useState("");
  const [actualDateRange, setActualDateRange] = useState("");

  const defaultColor = "";
  const defaultStatusValue = {
    "To Do": true,
    "In Progress": true,
    "Under Review": true,
    "Done": true,
    "On Hold": true,
    "Cancelled": true,
    "": true
  };
  const defaultPriorityValue = {
    "Very High": true,
    "High": true,
    "Medium": true,
    "Low": true,
    "Very Low": true,
    "": true
  };
  const defaultDifficultyLevelValue = {
    "Very Difficult": true,
    "Difficult": true,
    "Moderate": true,
    "Easy": true,
    "": true
  };

  const defaultPeriodFilter = {
    startDate: null,
    endDate: null,
    actualStartDate: null,
    actualEndDate: null,
  };
  const defaultDisplayMyTasksOnly = false;
  const defaultDisplayOverdueTasksOnly = false;
  const defaultPersonInCharge = [];
  const defaultMilestone = "";
  const defaultTags = [];

  const handleMenuOpen = (event) => {
    if (isMobile) {
      setDrawerOpen(true);
    } else {
      setMenuAnchorEl(event.currentTarget);
    }
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  const handleStatusValueChange = (status, isChecked) => {
    setStatusValue((prevStatusValue) => {
      const updatedStatusValue = { ...prevStatusValue };
      updatedStatusValue[status] = isChecked;
      localStorage.setItem('statusValue', JSON.stringify(updatedStatusValue));
      return updatedStatusValue;
    });
  };

  const handlePriorityValueChange = (priority, isChecked) => {
    setPriorityValue((prevPriorityValue) => {
      const updatedPriorityValue = { ...prevPriorityValue };
      updatedPriorityValue[priority] = isChecked;
      localStorage.setItem('priorityValue', JSON.stringify(updatedPriorityValue));
      return updatedPriorityValue;
    });
  };

  const handleDifficultyLevelValueChange = (difficultyLevel, isChecked) => {
    setDifficultyLevelValue((prevDifficultyLevelValue) => {
      const updatedDifficultyLevelValue = { ...prevDifficultyLevelValue };
      updatedDifficultyLevelValue[difficultyLevel] = isChecked;
      localStorage.setItem('difficultyLevelValue', JSON.stringify(updatedDifficultyLevelValue));
      return updatedDifficultyLevelValue;
    });
  };

  const handlePersonInChargeChange = (selectedPersons) => {
    setPersonInCharge(selectedPersons);
    localStorage.setItem('selectedTeamMembers', JSON.stringify(selectedPersons));
  };

  const handleMilestoneChange = (selectedMilestone) => {
    setMilestone(selectedMilestone);
    localStorage.setItem('selectedMilestone', selectedMilestone._id);
  };

  const handleTagsChange = (selectedTags) => {
    setTags(selectedTags);
    localStorage.setItem('selectedTags', JSON.stringify(selectedTags));
  };

  const handleStartDateChange = (startDate) => {
    setPeriodFilter((prevPeriodFilter) => {
      const updatedFilter = { ...prevPeriodFilter, startDate };
      if (updatedFilter.endDate && dayjs(updatedFilter.endDate).isBefore(startDate)) {
        updatedFilter.endDate = startDate;
      }
      localStorage.setItem('periodFilter', JSON.stringify(updatedFilter));
      return updatedFilter;
    });
  };

  const handleEndDateChange = (endDate) => {
    setPeriodFilter((prevPeriodFilter) => {
      const updatedFilter = { ...prevPeriodFilter, endDate };
      if (updatedFilter.startDate && dayjs(endDate).isBefore(updatedFilter.startDate)) {
        updatedFilter.endDate = updatedFilter.startDate;
      }
      localStorage.setItem('periodFilter', JSON.stringify(updatedFilter));
      return updatedFilter;
    });
  };

  const handleActualStartDateChange = (actualStartDate) => {
    setPeriodFilter((prevPeriodFilter) => {
      const updatedFilter = { ...prevPeriodFilter, actualStartDate };
      if (updatedFilter.actualEndDate && dayjs(updatedFilter.actualEndDate).isBefore(actualStartDate)) {
        updatedFilter.actualEndDate = actualStartDate;
      }
      localStorage.setItem('periodFilter', JSON.stringify(updatedFilter));
      return updatedFilter;
    });
  };

  const handleActualEndDateChange = (actualEndDate) => {
    setPeriodFilter((prevPeriodFilter) => {
      const updatedFilter = { ...prevPeriodFilter, actualEndDate };
      if (updatedFilter.actualStartDate && dayjs(actualEndDate).isBefore(updatedFilter.actualStartDate)) {
        updatedFilter.actualEndDate = updatedFilter.actualStartDate;
      }
      localStorage.setItem('periodFilter', JSON.stringify(updatedFilter));
      return updatedFilter;
    });
  };

  const handleClearDates = () => {
    const updatedFilter = { ...periodFilter, startDate: null, endDate: null };
    setPeriodFilter(updatedFilter);
    localStorage.setItem('periodFilter', JSON.stringify(updatedFilter));
  };

  const handleClearActualDates = () => {
    const updatedFilter = { ...periodFilter, actualStartDate: null, actualEndDate: null };
    setPeriodFilter(updatedFilter);
    localStorage.setItem('periodFilter', JSON.stringify(updatedFilter));
  };

  const updateDateRange = (rangeType, dateType) => {
    const today = dayjs();
    let startDate, endDate;
    switch (rangeType) {
      case "thisWeek":
        startDate = today.startOf('week');
        endDate = today.endOf('week');
        break;
      case "lastWeek":
        startDate = today.subtract(1, 'week').startOf('week');
        endDate = today.subtract(1, 'week').endOf('week');
        break;
      case "thisMonth":
        startDate = today.startOf('month');
        endDate = today.endOf('month');
        break;
      case "lastMonth":
        startDate = today.subtract(1, 'month').startOf('month');
        endDate = today.subtract(1, 'month').endOf('month');
        break;
      case "thisYear":
        startDate = today.startOf('year');
        endDate = today.endOf('year');
        break;
      case "lastYear":
        startDate = today.subtract(1, 'year').startOf('year');
        endDate = today.subtract(1, 'year').endOf('year');
        break;
      default:
        startDate = null;
        endDate = null;
    }

    if (dateType === "estimated") {
      setEstimatedDateRange(rangeType);
      setPeriodFilter((prevFilter) => ({
        ...prevFilter,
        startDate: startDate ? startDate.toDate() : null,
        endDate: endDate ? endDate.toDate() : null,
      }));
    } else if (dateType === "actual") {
      setActualDateRange(rangeType);
      setPeriodFilter((prevFilter) => ({
        ...prevFilter,
        actualStartDate: startDate ? startDate.toDate() : null,
        actualEndDate: endDate ? endDate.toDate() : null,
      }));
    }
  };

  const handleResetToDefault = () => {
    setSelectedColor(defaultColor);
    handleColor(defaultColor);
    
    setStatusValue(defaultStatusValue);
    setPriorityValue(defaultPriorityValue);
    setDifficultyLevelValue(defaultDifficultyLevelValue);
    setPeriodFilter(defaultPeriodFilter);
    setDisplayMyTasksOnly(defaultDisplayMyTasksOnly);
    setDisplayOverdueTasksOnly(defaultDisplayOverdueTasksOnly);
    setPersonInCharge(defaultPersonInCharge);
    setMilestone(defaultMilestone);
    setTags(defaultTags);
  };

  useEffect(() => {
    const storedSelectedColor = localStorage.getItem('colorFilter');
    if (storedSelectedColor) {
      setSelectedColor(storedSelectedColor);
    }

    const storedStatusValue = localStorage.getItem('statusValue');
    if (storedStatusValue) {
      setStatusValue(JSON.parse(storedStatusValue));
    }

    const storedPriorityValue = localStorage.getItem('priorityValue');
    if (storedPriorityValue) {
      setPriorityValue(JSON.parse(storedPriorityValue));
    }

    const storedDifficultyLevelValue = localStorage.getItem('difficultyLevelValue');
    if (storedDifficultyLevelValue) {
      setDifficultyLevelValue(JSON.parse(storedDifficultyLevelValue));
    }

    const storedPeriodFilter = localStorage.getItem('periodFilter');
    if (storedPeriodFilter) {
      setPeriodFilter(JSON.parse(storedPeriodFilter));
    }

    const storedDisplayOverdueTasksOnly = localStorage.getItem('displayOverdueTasksOnly');
    if (storedDisplayOverdueTasksOnly) {
      setDisplayOverdueTasksOnly(JSON.parse(storedDisplayOverdueTasksOnly));
    }

    const storedPersonInCharge = localStorage.getItem('selectedTeamMembers');
    if (storedPersonInCharge) {
      setPersonInCharge(JSON.parse(storedPersonInCharge));
    }

    const storedMilestone = localStorage.getItem('selectedMilestone');
    if (storedMilestone) {
      setMilestone(storedMilestone);
    }

    const storedTags = localStorage.getItem('selectedTags');
    if (storedTags) {
      setTags(JSON.parse(storedTags));
    }
  }, []);

  // Reset to localStorage value after refreshing page
  useEffect(() => {
    localStorage.setItem('displayOverdueTasksOnly', JSON.stringify(displayOverdueTasksOnly));
    localStorage.setItem('selectedTeamMembers', JSON.stringify(personInCharge));
    localStorage.setItem('selectedMilestone', milestone ? JSON.stringify(milestone) : "");
    localStorage.setItem('selectedTags', JSON.stringify(tags));
  }, [displayOverdueTasksOnly, personInCharge, milestone, tags]);

  const FilterContent = (
    <Grid container direction="column" spacing={2}>
      {/*<Grid item sx={{ mx:2 }}>
        <Typography variant="subtitle2">{t('filters')}</Typography>
      </Grid>*/}

      <Grid item sx={{ mx:2 }}>
        <Typography variant="button">{t('color')}</Typography>
        <SimpleColorPicker color={selectedColor} handleColor={handleColor} />
      </Grid>

      <Grid item sx={{ mx:2 }}>
        <Typography variant="button">{t('personInCharge')}</Typography>
        <TeamMemberSelector
          label={t('personInCharge')}
          personInCharge={personInCharge || []}
          setPersonInCharge={setPersonInCharge}
          onChange={handlePersonInChargeChange}
        />
      </Grid>

      <Stack direction="row" spacing={2} sx={{ mx:2, ml:4, mt:2 }}>
        <Grid item xs={4}>
          <Typography variant="button">{t('milestone')}</Typography>
          <MilestoneSelector
            projectId={project._id}
            milestone={milestone || ""}
            setMilestone={setMilestone}
            onChange={handleMilestoneChange}
          />
        </Grid>

        <Grid item xs={8}>
          <Typography variant="button">{t('tags')}</Typography>
          <TagSelector
            tags={tags || []}
            setTags={setTags}
            onChange={handleTagsChange}
          />
        </Grid>
      </Stack>

      <Grid item>
        <Grid container direction="row" spacing={2}>
          <Grid item>
            <Typography variant="button" sx={{ mx:2 }}>{t('status')}</Typography>
            {Object.entries(statusValue).map(([status, isChecked]) => (
              <MenuItem dense key={status}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isChecked}
                      onChange={(e) => handleStatusValueChange(status, e.target.checked)}
                      size="small"
                      sx={{ pt: 0, pb: 0 }}
                    />
                  }
                  label={<StatusChip status={status===""? "none" : status}/>}
                />
              </MenuItem>
            ))}
          </Grid>

          <Grid item>
            <Typography variant="button" sx={{ mx:2 }}>{t('priority')}</Typography>
            {Object.entries(priorityValue).map(([priority, isChecked]) => (
              <MenuItem dense key={priority}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isChecked}
                      onChange={(e) => handlePriorityValueChange(priority, e.target.checked)}
                      size="small"
                      sx={{ pt: 0, pb: 0 }}
                    />
                  }
                  label={<PriorityChip priority={priority===""? "none" : priority} mode="select" />}
                />
              </MenuItem>
            ))}
          </Grid>

          <Grid item>
            <Typography variant="button" sx={{ mx:2 }}>{t('difficultyLevel')}</Typography>
            {Object.entries(difficultyLevelValue).map(([difficultyLevel, isChecked]) => (
              <MenuItem dense key={difficultyLevel}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isChecked}
                      onChange={(e) => handleDifficultyLevelValueChange(difficultyLevel, e.target.checked)}
                      size="small"
                      sx={{ pt: 0, pb: 0 }}
                    />
                  }
                  label={<DifficultyLevelChip mode="text" difficultyLevel={difficultyLevel===""? "none" : difficultyLevel}/>}
                />
              </MenuItem>
            ))}
          </Grid>
        </Grid>
      </Grid>

      <Grid item>
        <Typography variant="button" sx={{ mx:2 }}>{t('period')}</Typography>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Grid container direction="row" spacing={1} sx={{ mx:1, mb:1 }}>
            <Grid item>
              <DatePicker
                label={`${t('estimatedDate')} - ${t('from')}`}
                name="startDate"
                format="YYYY-MM-DD"
                value={periodFilter?.startDate ? dayjs(periodFilter?.startDate) : null}
                onChange={handleStartDateChange}
                sx={{ maxWidth: '220px' }}
                slotProps={{
                  textField: { fullWidth: true, size: 'small' },
                  actionBar: { actions: ["clear", "today"] }
                }}
                margin="dense"
              />
            </Grid>
            <Grid item>
              <DatePicker
                label={`${t('estimatedDate')} - ${t('to')}`}
                name="endDate"
                format="YYYY-MM-DD"
                value={periodFilter?.endDate ? dayjs(periodFilter?.endDate) : null}
                onChange={handleEndDateChange}
                sx={{ maxWidth: '220px' }}
                slotProps={{
                  textField: { fullWidth: true, size: 'small' },
                  actionBar: { actions: ["clear", "today"] }
                }}
                margin="dense"
              />
            </Grid>
            <Grid item>
              <DateRangeSelector
                selectedRange={estimatedDateRange}
                onRangeChange={(e) => updateDateRange(e.target.value, "estimated")}
              />
              {/*<FormControl fullWidth size="small">
                <InputLabel>{t('estimatedDateRange')}</InputLabel>
                <Select
                  label={t('estimatedDateRange')}
                  sx={{ width: '220px' }}
                  value={estimatedDateRange}
                  onChange={(e) => updateDateRange(e.target.value, "estimated")}
                >
                  <MenuItem dense value="">{t('selectRange')}</MenuItem>
                  <MenuItem dense value="thisWeek">{t('thisWeek')}</MenuItem>
                  <MenuItem dense value="lastWeek">{t('lastWeek')}</MenuItem>
                  <MenuItem dense value="thisMonth">{t('thisMonth')}</MenuItem>
                  <MenuItem dense value="lastMonth">{t('lastMonth')}</MenuItem>
                  <MenuItem dense value="thisYear">{t('thisYear')}</MenuItem>
                  <MenuItem dense value="lastYear">{t('lastYear')}</MenuItem>
                </Select>
              </FormControl>*/}
            </Grid>
            <Grid item>
              <Tooltip title={t('clear')}>
                <IconButton onClick={handleClearDates} size="small">
                  <ClearIcon />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
        </LocalizationProvider>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Grid container direction="row" spacing={1} sx={{ mx:1 }}>
            <Grid item>
              <DatePicker
                label={`${t('actualDate')} - ${t('from')}`}
                name="actualStartDate"
                format="YYYY-MM-DD"
                value={periodFilter?.actualStartDate ? dayjs(periodFilter?.actualStartDate) : null}
                onChange={handleActualStartDateChange}
                sx={{ maxWidth: '220px' }}
                slotProps={{
                  textField: { fullWidth: true, size: 'small' },
                  actionBar: { actions: ["clear", "today"] }
                }}
                margin="dense"
              />
            </Grid>
            <Grid item>
              <DatePicker
                label={`${t('actualDate')} - ${t('to')}`}
                name="actualEndDate"
                format="YYYY-MM-DD"
                value={periodFilter?.actualEndDate ? dayjs(periodFilter?.actualEndDate) : null}
                onChange={handleActualEndDateChange}
                sx={{ maxWidth: '220px' }}
                slotProps={{
                  textField: { fullWidth: true, size: 'small' },
                  actionBar: { actions: ["clear", "today"] }
                }}
                margin="dense"
              />
            </Grid>
            <Grid item>
              <DateRangeSelector
                selectedRange={actualDateRange}
                onRangeChange={(e) => updateDateRange(e.target.value, "actual")}
              />
              {/*<FormControl fullWidth size="small">
                <InputLabel>{t('actualDateRange')}</InputLabel>
                <Select
                  label={t('actualDateRange')}
                  sx={{ width: '220px' }}
                  value={actualDateRange}
                  onChange={(e) => updateDateRange(e.target.value, "actual")}
                >
                  <MenuItem dense value="">{t('selectRange')}</MenuItem>
                  <MenuItem dense value="thisWeek">{t('thisWeek')}</MenuItem>
                  <MenuItem dense value="lastWeek">{t('lastWeek')}</MenuItem>
                  <MenuItem dense value="thisMonth">{t('thisMonth')}</MenuItem>
                  <MenuItem dense value="lastMonth">{t('lastMonth')}</MenuItem>
                  <MenuItem dense value="thisYear">{t('thisYear')}</MenuItem>
                  <MenuItem dense value="lastYear">{t('lastYear')}</MenuItem>
                </Select>
              </FormControl>*/}
            </Grid>
            <Grid item>
              <Tooltip title={t('clear')}>
                <IconButton onClick={handleClearActualDates} size="small">
                  <ClearIcon />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
        </LocalizationProvider>
      </Grid>
      
      <Grid item>
        <Typography variant="button" sx={{ mx:2 }}>{t('others')}</Typography>
        <Grid item sx={{ mx:3 }}>
          <DisplayMyTasksOnly displayMyTasksOnly={displayMyTasksOnly} setDisplayMyTasksOnly={setDisplayMyTasksOnly} />
        </Grid>
        <Grid item sx={{ mx:3 }}>
          <DisplayOverdueTasksOnly displayOverdueTasksOnly={displayOverdueTasksOnly} setDisplayOverdueTasksOnly={setDisplayOverdueTasksOnly} />
        </Grid>
      </Grid>

      <Grid item sx={{ mx:2 }}>
        <Button onClick={handleResetToDefault} variant="outlined" color="primary">
          {t('resetToDefault')}
        </Button>
      </Grid>
    </Grid>
  );

  return (
    <>
      <Button
        startIcon={<FilterAltIcon />}
        onClick={handleMenuOpen}
        sx={{ mr: 0.5 }}
      >
        {t('filters')}
      </Button>

      {isMobile ? (
        <CSwipeableDrawer
          open={drawerOpen}
          onOpen={() => {}}
          onClose={handleDrawerClose}
          height="90%"
        >
          <Typography variant="subtitle2" align="center" sx={{ my: '0.5rem', mt: '1rem' }}>{t('filters')}</Typography>
          {FilterContent}
        </CSwipeableDrawer>
      ) : (
        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          size="small"
        >
          {FilterContent}
        </Menu>
      )}
    </>
  );
};

export default TaskFilters;