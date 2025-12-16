import React from 'react';
import { Tooltip, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { capitalizeWordsExceptFirst } from '../utils/StringUtils.js';
import SignalCellular0BarIcon from '@mui/icons-material/SignalCellular0Bar';
import SignalCellular2BarIcon from '@mui/icons-material/SignalCellular2Bar';
import SignalCellular3BarIcon from '@mui/icons-material/SignalCellular3Bar';
import SignalCellular4BarIcon from '@mui/icons-material/SignalCellular4Bar';
import SignalCellularConnectedNoInternet4BarIcon from '@mui/icons-material/SignalCellularConnectedNoInternet4Bar';

const DifficultyLevelChip = ({ mode = 'text', difficultyLevel }) => {
  const { t, i18n } = useTranslation();

  const difficultyLevels = [
    { 
      level: t('veryDifficult'), 
      icon: <SignalCellularConnectedNoInternet4BarIcon sx={{ fontSize: 19 }} />, 
      color: '#FF8A80' 
    },
    { 
      level: t('difficult'), 
      icon: <SignalCellular4BarIcon sx={{ fontSize: 19 }} />, 
      color: '#FFAB40' 
    },
    { 
      level: t('moderate'), 
      icon: <SignalCellular3BarIcon sx={{ fontSize: 19 }} />, 
      color: '#FFD740' 
    },
    { 
      level: t('easy'), 
      icon: <SignalCellular2BarIcon sx={{ fontSize: 19 }} />, 
      color: '#69F0AE' 
    },
    { 
      level: t('none'), 
      icon: <SignalCellular0BarIcon sx={{ fontSize: 19 }} />, 
      color: '#B0BEC5' 
    }
  ];

  const getDifficultyAttributes = (level) => {
    return difficultyLevels.find(
      (item) => item.level === t(capitalizeWordsExceptFirst(level))
    ) || {};
  };

  const { icon, color } = getDifficultyAttributes(difficultyLevel);

  return (
    <div style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <Tooltip title={t(capitalizeWordsExceptFirst(difficultyLevel))}>
        <Typography variant="body2" style={{ color, display: 'inline-flex', alignItems: 'center' }}>
          {icon}
          {mode === "text" && (
            <span style={{ marginLeft: '0.5rem' }}>
              {t(capitalizeWordsExceptFirst(difficultyLevel))}
              {i18n.language === 'zh-hk' || i18n.language === 'zh-cn' ? '' : ' '}
            </span>
          )}
        </Typography>
      </Tooltip>
    </div>
  );
};

export default DifficultyLevelChip;