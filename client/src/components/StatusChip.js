import React from 'react';
import { Tooltip, Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { capitalizeWordsExceptFirst } from '../utils/StringUtils.js';
import { Done, RotateLeftOutlined, RateReviewOutlined, AccessAlarmOutlined, AssignmentOutlined, PauseOutlined, CloseOutlined } from '@mui/icons-material';

const StatusChip = ({ status }) => {
  const { t } = useTranslation();

  const colorStatuses = [
    { status: t('unassigned'), backgroundColor: '', color: 'black' },
    { status: t('toDo'), backgroundColor: '#89CFF0', color: 'black', icon: <AssignmentOutlined /> },
    { status: t('inProgress'), backgroundColor: '#FFE5A0', color: 'black', icon: <RotateLeftOutlined /> },
    { status: t('underReview'), backgroundColor: '#E6CFF2', color: 'black', icon: <RateReviewOutlined /> },
    { status: t('done'), backgroundColor: '#D4EDBC', color: 'black', icon: <Done /> },
    { status: t('onHold'), backgroundColor: '#FFBD9C', color: 'black', icon: <PauseOutlined /> },
    { status: t('cancelled'), backgroundColor: '#C9C9C9', color: 'black', icon: <CloseOutlined /> },
    { status: t('none'), backgroundColor: 'transparent', color: '' }
  ];

  const getStatusStyle = (status) => {
    const selectedStatus = colorStatuses.find((colorStatus) => colorStatus.status === t(capitalizeWordsExceptFirst(status)));
    if (selectedStatus) {
      return {
        backgroundColor: selectedStatus.backgroundColor,
        color: selectedStatus.color,
        icon: selectedStatus.icon
      };
    }
    return {};
  };

  const selectedStatusStyle = getStatusStyle(status);

  return (
    <Tooltip title={t(capitalizeWordsExceptFirst(status))}>
      <Chip
        label={t(capitalizeWordsExceptFirst(status))}
        size="small"
        icon={selectedStatusStyle.icon}
        sx={{ mr: 0.5, backgroundColor: selectedStatusStyle.backgroundColor, color: selectedStatusStyle.color }}
      />
    </Tooltip>
  );
};

export default StatusChip;