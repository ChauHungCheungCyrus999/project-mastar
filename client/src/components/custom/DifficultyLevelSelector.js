import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useTranslation } from 'react-i18next';
import DifficultyLevelChip from '../DifficultyLevelChip';

const DifficultyLevelSelector = ({ value, onChange, disabled=false }) => {
  const { t } = useTranslation();

  return (
    <FormControl fullWidth margin="dense" size="small">
      <InputLabel>{t('difficultyLevel')}</InputLabel>
      <Select
        name="difficultyLevel"
        value={value}
        label={t('difficultyLevel')}
        onChange={onChange}
        disabled={disabled}
      >
        <MenuItem value="Very Difficult" dense>
          <DifficultyLevelChip mode="text" difficultyLevel="Very Difficult" />
        </MenuItem>
        <MenuItem value="Difficult" dense>
          <DifficultyLevelChip mode="text" difficultyLevel="Difficult" />
        </MenuItem>
        <MenuItem value="Moderate" dense>
          <DifficultyLevelChip mode="text" difficultyLevel="Moderate" />
        </MenuItem>
        <MenuItem value="Easy" dense>
          <DifficultyLevelChip mode="text" difficultyLevel="Easy" />
        </MenuItem>
      </Select>
    </FormControl>
  );
};

export default DifficultyLevelSelector;
