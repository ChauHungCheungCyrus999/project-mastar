import React from 'react';
import { Box, Chip } from '@mui/material';
import { FlagOutlined } from '@mui/icons-material';

import hexToRGB from './../utils/ColorUtils.js';

const MilestoneFlag = ({ milestone, numOfTasks, size="small" }) => {
  const chipColor = `rgba(${hexToRGB(milestone?.color)})`;

  return (
    <Box sx={{ display: 'flex', gap: 0.5 }}>
      <Chip
        icon={<FlagOutlined />}
        label={`${milestone?.title}${numOfTasks ? ` (${numOfTasks})` : ''}`}
        size={size}
        sx={{
          fontSize: size==="large" ? '1rem' : '0.8rem',
          borderRadius: 1,
          backgroundColor: chipColor,
        }}
      />
    </Box>
  );
};

export default MilestoneFlag;