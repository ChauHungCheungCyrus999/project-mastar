/*import React from 'react';
import { Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { capitalizeWordsExceptFirst } from '../utils/StringUtils.js';

// if mode = 'select', not display the word 'priority' inside the chip
const PriorityChip = ({ priority, mode }) => {
  const { t, i18n } = useTranslation();

  const colorPriorities = [
    { priority: t('veryHigh'), backgroundColor: '#FF8A8A' },
    { priority: t('high'), backgroundColor: '#FFCFC9' },
    { priority: t('medium'), backgroundColor: '#FFE5A0' },
    { priority: t('low'), backgroundColor: '#D4EDBC' },
    { priority: t('veryLow'), backgroundColor: '#E6CFF2' },
  ];

  const getPriorityStyle = (priority) => {
    const selectedPriority = colorPriorities.find((colorPriority) => colorPriority.priority === t(capitalizeWordsExceptFirst(priority)));
    if (selectedPriority) {
      return {
        backgroundColor: selectedPriority.backgroundColor,
        color: selectedPriority.color
      };
    }
    return {};
  };

  return (
    <Chip
      label={t(capitalizeWordsExceptFirst(priority)) + (mode==='select'? '' : ((i18n.language == 'zh-hk' || i18n.language == 'zh-cn') ? "" : " ") + t('priority'))}
      size="small"
      sx={{ mr: 0.5, ...getPriorityStyle(priority) }}
    />
  );
};

export default PriorityChip;*/

import React from 'react';
import { Tooltip, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { capitalizeWordsExceptFirst } from '../utils/StringUtils.js';

import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';

const PriorityChip = ({ priority, mode }) => {
  const { t, i18n } = useTranslation();

  const priorities = [
    { 
      priority: t('veryHigh'), 
      icon: <KeyboardDoubleArrowUpIcon sx={{ fontSize: 19 }} />, 
      color: '#FF3D00' 
    },
    { 
      priority: t('high'), 
      icon: <KeyboardArrowUpIcon sx={{ fontSize: 19 }} />, 
      color: '#FF6D00' 
    },
    { 
      priority: t('medium'), 
      icon: <HorizontalRuleIcon sx={{ fontSize: 19 }} />, 
      color: '#FFD600' 
    },
    { 
      priority: t('low'), 
      icon: <KeyboardArrowDownIcon sx={{ fontSize: 19 }} />, 
      color: '#64DD17' 
    },
    { 
      priority: t('veryLow'), 
      icon: <KeyboardDoubleArrowDownIcon sx={{ fontSize: 19 }} />, 
      color: '#00B8D4' 
    },
    { 
      priority: t('none'), 
      icon: '', 
      color: '#B0BEC5' 
    }
  ];

  const getPriorityAttributes = (priority) => {
    return priorities.find(
      (item) => item.priority === t(capitalizeWordsExceptFirst(priority))
    ) || {};
  };

  const { icon, color } = getPriorityAttributes(priority);

  return (
    <div style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <Tooltip title={t(capitalizeWordsExceptFirst(priority)) + (mode === 'select' ? '' : ((i18n.language === 'zh-hk' || i18n.language === 'zh-cn') ? "" : " ") + t('priority'))}>
        <Typography variant="body2" style={{ color, display: 'inline-flex', alignItems: 'center' }}>
          {icon}
          {mode === "select" && (
            <span style={{ marginLeft: '0.5rem' }}>
              {t(capitalizeWordsExceptFirst(priority))}
              {i18n.language === 'zh-hk' || i18n.language === 'zh-cn' ? '' : ' '}
            </span>
          )}
        </Typography>
      </Tooltip>
    </div>
  );
};

export default PriorityChip;