import React from 'react';
import { FormControlLabel, Switch, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

const DisplayMyTasksOnly = ({ displayMyTasksOnly, setDisplayMyTasksOnly }) => {
  const { t } = useTranslation();

  const handleDisplayMyTasksOnly = () => {
    const updatedValue = !displayMyTasksOnly;
    setDisplayMyTasksOnly(updatedValue);
    localStorage.setItem('displayMyTasksOnly', JSON.stringify(updatedValue));
  };

  return (
    <FormControlLabel
      control={
        <Switch
          size="small"
          checked={displayMyTasksOnly}
          onChange={handleDisplayMyTasksOnly}
          color="primary"
        />
      }
      label={<Typography variant="button">{t('displayMyTasksOnly')}</Typography>}
    />
  );
};

export default DisplayMyTasksOnly;