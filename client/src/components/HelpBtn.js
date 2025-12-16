import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import { useNavigate } from 'react-router-dom';

import { useTranslation } from 'react-i18next';

const HelpBtn = ({ theme }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleFaqClick = () => {
    navigate('/help');
    navigate(0);
  };

  return (
    <Tooltip title={t('help')}>
      <IconButton onClick={handleFaqClick} color={theme=='light'? "inherit":"black"}>
        <HelpOutlineOutlinedIcon />
      </IconButton>
    </Tooltip>
  );
};

export default HelpBtn;