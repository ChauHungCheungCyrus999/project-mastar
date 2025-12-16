import React from 'react';
import { Select, MenuItem, Divider } from '@mui/material';
import { useTranslation } from 'react-i18next';

const DateRangeSelector = ({
  selectedRange,
  onRangeChange,
  displayNextWeek=true,
  displayNextMonth=true,
  displayNextYear=true,
  displayThisMonth=true,
  displayLastMonth=true,
  displayThisYear=true,
  displayLastYear=true
}) => {
  const { t } = useTranslation();

  return (
    <Select
      value={selectedRange}
      onChange={onRangeChange}
      displayEmpty
      size="small"
      style={{ minWidth: 150 }}
    >
      <MenuItem dense value="">
        {t('selectRange')}
      </MenuItem>
      <Divider />
      <MenuItem dense value="lastWeek">
        {t('lastWeek')}
      </MenuItem>
      <MenuItem dense value="thisWeek">
        {t('thisWeek')}
      </MenuItem>
      {displayNextWeek && (
        <MenuItem dense value="nextWeek">
          {t('nextWeek')}
        </MenuItem>
      )}
      <Divider />
      {displayLastMonth && (
        <MenuItem dense value="lastMonth">
          {t('lastMonth')}
        </MenuItem>
      )}
      {displayThisMonth && (
        <MenuItem dense value="thisMonth">
          {t('thisMonth')}
        </MenuItem>
      )}
      {displayNextMonth && (
        <MenuItem dense value="nextMonth">
          {t('nextMonth')}
        </MenuItem>
      )}
      <Divider />
      {displayLastYear && (
        <MenuItem dense value="lastYear">
          {t('lastYear')}
        </MenuItem>
      )}
      {displayThisYear && (
        <MenuItem dense value="thisYear">
          {t('thisYear')}
        </MenuItem>
      )}
      {displayNextYear && (
        <MenuItem dense value="nextYear">
          {t('nextYear')}
        </MenuItem>
      )}
    </Select>
  );
};

export default DateRangeSelector;
