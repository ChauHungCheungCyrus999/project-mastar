import React, { useState, useEffect } from 'react';
import { Stack, Checkbox, FormControlLabel, Menu, Button, Radio, RadioGroup, FormControl, FormLabel, Typography, useMediaQuery, SwipeableDrawer } from '@mui/material';
import SortIcon from '@mui/icons-material/Sort';

import CSwipeableDrawer from '../custom/CSwipeableDrawer';

import { useTranslation } from 'react-i18next';

const SortBy = ({ sortBy, setSortBy, sortOrder, setSortOrder }) => {
  const { t } = useTranslation();
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const isMobile = useMediaQuery('(max-width:600px)');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const storedSortBy = localStorage.getItem('sortBy') || 'updatedDate';
  const storedSortOrder = localStorage.getItem('sortOrder') || 'desc';

  const checkboxItems = [
    { label: t('none'), value: 'none' },
    { label: t('taskName'), value: 'taskName' },
    { label: t('milestone'), value: 'milestone' },
    { label: t('category'), value: 'category' },
    { label: t('estimatedStartDate'), value: 'startDate' },
    { label: t('estimatedEndDate'), value: 'endDate' },
    { label: t('actualStartDate'), value: 'actualStartDate' },
    { label: t('actualEndDate'), value: 'actualEndDate' },
    { label: t('createdDate'), value: 'createdDate' },
    { label: t('updatedDate'), value: 'updatedDate' },
    { label: t('priority'), value: 'priority' },
    { label: t('difficultyLevel'), value: 'difficultyLevel' },
  ];

  useEffect(() => {
    if (storedSortBy) {
      setSortBy(storedSortBy);
    }
    if (storedSortOrder) {
      setSortOrder(storedSortOrder);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('sortBy', sortBy);
    localStorage.setItem('sortOrder', sortOrder);
  }, [sortBy, sortOrder]);

  const handleMenuOpen = (event) => {
    if (isMobile) {
      setDrawerOpen(true);
    } else {
      setMenuAnchorEl(event.currentTarget);
    }
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  const handleSortByChange = (value) => {
    if (value === sortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortOrder('asc');
    }
    setSortBy(value);
    localStorage.setItem('sortBy', value);
    localStorage.setItem('sortOrder', sortOrder);
  };

  const handleSortOrderChange = (event) => {
    event.stopPropagation();
    setSortOrder(event.target.value);
  };

  const MenuContent = (
    <>
      <Stack spacing={1} sx={{ px: 2 }}>
        <FormLabel component="legend">
          <Typography variant="button">{t('sortingCriteria')}</Typography>
        </FormLabel>
        {checkboxItems.map((item, index) => (
          <FormControlLabel
            key={index}
            control={
              <Checkbox
                checked={sortBy === item.value}
                size="small"
                sx={{ pt: 0, pb: 0 }}
                onClick={() => handleSortByChange(item.value)}
              />
            }
            label={item.label}
            componentsProps={{ typography: { variant: 'body2' } }}
          />
        ))}
      </Stack>

      <Stack spacing={2} sx={{ mt: 3, px: 2 }}>
        <FormControl component="fieldset">
          <FormLabel component="legend">
            <Typography variant="button">{t('sortOrder')}</Typography>
          </FormLabel>
          <RadioGroup
            row
            aria-label="sortOrder"
            name="sortOrder"
            value={sortOrder}
            onChange={handleSortOrderChange}
          >
            <FormControlLabel
              value="asc"
              control={<Radio size="small" />}
              label={t('asc')}
              componentsProps={{ typography: { variant: 'body2' } }}
            />
            <FormControlLabel
              value="desc"
              control={<Radio size="small" />}
              label={t('desc')}
              componentsProps={{ typography: { variant: 'body2' } }}
            />
          </RadioGroup>
        </FormControl>
      </Stack>
    </>
  );

  return (
    <>
      <Button
        startIcon={<SortIcon />}
        onClick={handleMenuOpen}
        sx={{ mr: 0.5 }}
      >
        {t('sort')}
      </Button>

      {isMobile ? (
        <CSwipeableDrawer
          open={drawerOpen}
          onOpen={() => {}}
          onClose={handleDrawerClose}
        >
          <Typography variant="subtitle2" align="center" sx={{ my: '0.5rem', mt: '1rem' }}>{t('sort')}</Typography>
          {MenuContent}
        </CSwipeableDrawer>
      ) : (
        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          size="small"
        >
          {MenuContent}
        </Menu>
      )}
    </>
  );
};

export default SortBy;