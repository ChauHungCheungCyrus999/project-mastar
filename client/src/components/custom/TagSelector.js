import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FormControl, InputLabel, Select, MenuItem, OutlinedInput, Box, Chip } from '@mui/material';
import axios from 'axios';

import hexToRGB from '../../utils/ColorUtils.js';

const TagSelector = ({ tags = [], setTags, disabled=false }) => {
  const { t, i18n } = useTranslation();
  const projectId = window.location.href.split("/")[4];
  const [options, setOptions] = useState([]);
  const [selectedValues, setSelectedValues] = useState([]);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/tags/project/${projectId}/active`);
        setOptions(response.data);
      } catch (error) {
        console.error('Error fetching tags:', error);
      }
    };

    fetchTags();
  }, [projectId]);

  useEffect(() => {
    if (options.length > 0) {
      const initialSelectedValues = Array.isArray(tags) && tags.length > 0
        ? typeof tags[0] === 'string'
          ? tags.filter(tagId => options.some(option => option._id === tagId))
          : tags.map(tag => tag._id)
        : [];
      setSelectedValues(initialSelectedValues);
    }
  }, [tags, options]);

  const handleSelectChange = (event) => {
    const selected = event.target.value;
    setSelectedValues(selected);

    const selectedTags = selected.map(id => options.find(option => option._id === id));
    setTags(selectedTags);
  };

  const getDisplayValue = (option) => {
    if (!option) return '';
    switch (i18n.language) {
      case 'zh-hk':
        return option.name.zhHK;
      case 'zh-cn':
        return option.name.zhCN;
      default:
        return option.name.enUS;
    }
  };

  return (
    <FormControl fullWidth margin="dense" size="small">
      <InputLabel id="tags-label">{t('tags')}</InputLabel>
      <Select
        label={t('tags')}
        multiple
        fullWidth
        size="small"
        name="tags"
        value={selectedValues}
        onChange={handleSelectChange}
        input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
        renderValue={(selected) => (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {selected.map((value) => {
              const selectedOption = options.find((option) => option._id === value);
              const displayValue = getDisplayValue(selectedOption);
              return (
                <Chip
                  key={value}
                  label={displayValue}
                  size="small"
                  sx={{
                    fontSize: '0.8rem',
                    backgroundColor: `rgba(${hexToRGB(selectedOption?.color)})`
                  }}
                />
              );
            })}
          </Box>
        )}
        disabled={disabled}
      >
        {options.map((option) => (
          <MenuItem key={option._id} value={option._id} dense>
            <Chip
              key={option._id}
              label={getDisplayValue(option)}
              size="small"
              sx={{
                fontSize: '0.8rem',
                backgroundColor: `rgba(${hexToRGB(option?.color)})`,
              }}
            />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default TagSelector;