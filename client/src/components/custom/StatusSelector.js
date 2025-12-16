import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useTranslation } from 'react-i18next';
import StatusChip from '../StatusChip';

const StatusSelector = ({ value, onChange, error, disabled=false }) => {
  const { t } = useTranslation();

  return (
    <FormControl fullWidth margin="dense" size="small" required>
      <InputLabel>{t('status')}</InputLabel>
      <Select
        name="status"
        value={value}
        label={t('status')}
        onChange={onChange}
        error={error}
        disabled={disabled}
      >
        <MenuItem value="To Do" dense>
          <StatusChip status="To Do" />
        </MenuItem>
        <MenuItem value="In Progress" dense>
          <StatusChip status="In Progress" />
        </MenuItem>
        <MenuItem value="Under Review" dense>
          <StatusChip status="Under Review" />
        </MenuItem>
        <MenuItem value="Done" dense>
          <StatusChip status="Done" />
        </MenuItem>
        <MenuItem value="On Hold" dense>
          <StatusChip status="On Hold" />
        </MenuItem>
        <MenuItem value="Cancelled" dense>
          <StatusChip status="Cancelled" />
        </MenuItem>
      </Select>
    </FormControl>
  );
};

export default StatusSelector;
