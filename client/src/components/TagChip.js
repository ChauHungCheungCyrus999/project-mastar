import React from 'react';
import { Box, Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';

import hexToRGB from './../utils/ColorUtils.js';

const TagChip = ({ tags }) => {
  const { i18n } = useTranslation();

  const getDisplayValue = (tag) => {
    if (!tag) return '';
    switch (i18n.language) {
      case 'zh-hk':
        return tag.name?.zhHK;
      case 'zh-cn':
        return tag.name?.zhCN;
      default:
        return tag.name?.enUS;
    }
  };

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
      {tags.map((tag) => {
        const displayValue = getDisplayValue(tag);
        return (
          <Chip
            key={tag._id}
            label={displayValue}
            size="small"
            sx={{
              fontSize: '0.8rem',
              borderRadius: 1,
              backgroundColor: `rgba(${hexToRGB(tag?.color)})`
            }}
          />
        );
      })}
    </Box>
  );
};

export default TagChip;