import React from 'react';
import { FormControlLabel, Switch, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

const DisplayOverdueTasksOnly = ({ displayOverdueTasksOnly, setDisplayOverdueTasksOnly }) => {
  const { t } = useTranslation();

  const handleDisplayOverdueTasksOnly = () => {
    const updatedValue = !displayOverdueTasksOnly;
    setDisplayOverdueTasksOnly(updatedValue);
    localStorage.setItem('displayOverdueTasksOnly', JSON.stringify(updatedValue));
  };

  return (
    <FormControlLabel
      control={
        <Switch
          size="small"
          checked={displayOverdueTasksOnly}
          onChange={handleDisplayOverdueTasksOnly}
          color="primary"
        />
      }
      label={<Typography variant="button">{t('displayOverdueTasksOnly')}</Typography>}
    />
  );
};

export default DisplayOverdueTasksOnly;