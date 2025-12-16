import React, { useState, useEffect, useCallback } from 'react';
import { TextField, InputAdornment, Typography, useMediaQuery } from '@mui/material';
import { Search } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const TaskSearchBar = ({ searchTerm, handleSearch }) => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery('(max-width:600px)');
  const [debouncedValue, setDebouncedValue] = useState(searchTerm);

  // Debounce search to avoid excessive API calls
  const debouncedSearch = useCallback(() => {
    handleSearch({ target: { value: debouncedValue } });
  }, [debouncedValue, handleSearch]);

  useEffect(() => {
    // Set a reasonable debounce delay (300ms) to avoid excessive searches
    const handler = setTimeout(() => {
      debouncedSearch();
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [debouncedValue, debouncedSearch]);

  const handleChange = (event) => {
    setDebouncedValue(event.target.value);
  };

  return (
    <TextField
      label={t('search')}
      variant="outlined"
      fullWidth={isMobile}
      size="small"
      value={debouncedValue}
      onChange={handleChange}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end" size="small">
            <Search fontSize="small" />
          </InputAdornment>
        ),
      }}
    />
  );
};

export default TaskSearchBar;
