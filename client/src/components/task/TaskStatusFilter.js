import React, { useState, useEffect } from 'react';
import { Stack, Checkbox, FormControlLabel, FormGroup, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { AssignmentOutlined, RotateLeftOutlined, PauseCircleOutline, CheckCircleOutline, CancelOutlined } from '@mui/icons-material';

const TaskStatusFilter = ({ filteredStatus, handleStatusFilter }) => {
  const { t } = useTranslation();
  const [statusFilters, setStatusFilters] = useState(() => {
    return filteredStatus || {
      toDo: true,
      inProgress: true,
      underReview: true,
      done: true,
      onHold: true,
      cancelled: true,
    };
  });

  useEffect(() => {
    setStatusFilters(filteredStatus);
  }, [filteredStatus]);

  useEffect(() => {
    if (statusFilters) {
      localStorage.setItem('filteredStatus', JSON.stringify(statusFilters));
      handleStatusFilterChange();
    }
  }, [statusFilters]);

  const handleChange = (event) => {
    const { name, checked } = event.target;
    setStatusFilters((prevFilters) => ({
      ...prevFilters,
      [name]: checked,
    }));
  };

  const handleStatusFilterChange = () => {
    const selectedFilters = Object.keys(statusFilters).filter((key) => statusFilters[key]);
    handleStatusFilter(selectedFilters);
  };

  const renderCheckboxLabel = (icon, status) => (
    <Typography variant="body1" style={{ display: 'flex', alignItems: 'center' }}>
      {icon}
      {status}
    </Typography>
  );

  return (
    <FormGroup>
      <Stack direction={{ xs:'column', sm:'column', md:'row', lg:'row', xl:'column' }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={statusFilters?.toDo}
              name="toDo"
              size="small"
              onChange={handleChange}
            />
          }
          label={renderCheckboxLabel(<AssignmentOutlined size="small" />, t('toDo'))}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={statusFilters?.inProgress}
              name="inProgress"
              size="small"
              onChange={handleChange}
            />
          }
          label={renderCheckboxLabel(<RotateLeftOutlined size="small" />, t('inProgress'))}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={statusFilters?.underReview}
              name="underReview"
              size="small"
              onChange={handleChange}
            />
          }
          label={renderCheckboxLabel(<RotateLeftOutlined size="small" />, t('underReview'))}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={statusFilters?.done}
              name="done"
              size="small"
              onChange={handleChange}
            />
          }
          label={renderCheckboxLabel(<CheckCircleOutline size="small" />, t('done'))}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={statusFilters?.onHold}
              name="onHold"
              size="small"
              onChange={handleChange}
            />
          }
          label={renderCheckboxLabel(<PauseCircleOutline size="small" />, t('onHold'))}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={statusFilters?.cancelled}
              name="cancelled"
              size="small"
              onChange={handleChange}
            />
          }
          label={renderCheckboxLabel(<CancelOutlined size="small" />, t('cancelled'))}
        />
      </Stack>
    </FormGroup>
  );
};

export default TaskStatusFilter;