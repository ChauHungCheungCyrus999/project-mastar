import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useTranslation } from 'react-i18next';
import PriorityChip from '../PriorityChip';

const PrioritySelector = ({ value, onChange, disabled=false, hasNoneValue=false }) => {
  const { t } = useTranslation();

  return (
    <FormControl fullWidth margin="dense" size="small">
      <InputLabel>{t('priority')}</InputLabel>
      <Select
        name="priority"
        value={value}
        label={t('priority')}
        onChange={onChange}
        disabled={disabled}
      >
        {hasNoneValue && (
          <MenuItem value="" dense />
        )}
        <MenuItem value="Very High" dense>
          <PriorityChip priority="Very High" mode="select" />
        </MenuItem>
        <MenuItem value="High" dense>
          <PriorityChip priority="High" mode="select" />
        </MenuItem>
        <MenuItem value="Medium" dense>
          <PriorityChip priority="Medium" mode="select" />
        </MenuItem>
        <MenuItem value="Low" dense>
          <PriorityChip priority="Low" mode="select" />
        </MenuItem>
        <MenuItem value="Very Low" dense>
          <PriorityChip priority="Very Low" mode="select" />
        </MenuItem>
      </Select>
    </FormControl>
  );
};

export default PrioritySelector;
