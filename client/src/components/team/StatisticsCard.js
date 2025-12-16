import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

import { useTranslation } from 'react-i18next';

const StatisticsCard = ({ label, value, onClick }) => {
  const { t } = useTranslation();

  const colorStatuses = [
    { label: t('totalTasks'), backgroundColor: '#193f70', color: 'black' },
    { label: t('unassignedTasks'), backgroundColor: '', color: 'black' },
    { label: t('toDoTasks'), backgroundColor: ' #89CFF0', color: 'black' },
    { label: t('inProgressTasks'), backgroundColor: '#FFE5A0', color: 'black' },
    { label: t('underReviewTasks'), backgroundColor: '#E6CFF2', color: 'black' },
    { label: t('completedTasks'), backgroundColor: '#D4EDBC', color: 'black' },
    { label: t('overdueTasks'), backgroundColor: '#FF8A8A', color: 'black' },
    //{ label: t('onHoldTasks'), backgroundColor: '#FF8A8A', color: 'black' },
    //{ label: t('cancelledTasks'), backgroundColor: '', color: 'black' }
  ];

  const colorStatus = colorStatuses.find(status => status.label === label);

  return (
    <Card
      variant="outlined"
      style={{
        height: '100%',
        borderLeft: `20px solid ${colorStatus.backgroundColor}`,
        cursor: 'pointer'
      }}
      sx={{
        ':hover': {
          boxShadow: '5', // theme.shadows[20]
        }
      }}
      onClick={onClick}
    >
      <CardContent>
        <Typography variant="h7" component="div" align="center">
          {label}
        </Typography>
        <Typography variant="h4" component="div" align="center">
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default StatisticsCard;