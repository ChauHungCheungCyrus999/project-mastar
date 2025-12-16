import { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { IconButton, Tooltip, Menu, MenuItem, Select, FormControl } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import { useTranslation } from 'react-i18next';

// i18n
import i18n from '../i18n.js';

export default function LanguageSwitcher({ mode = 'icon', color }) {
  const theme = useTheme();
  
  const { t } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  const options = [
    { value: 'en-us', label: 'English' },
    { value: 'zh-hk', label: '繁體中文' },
    { value: 'zh-cn', label: '简体中文' },
  ];

  const [anchorel, setAnchorel] = useState(null);
  const [selectedOption, setSelectedOption] = useState(() => {
    const savedLanguage = localStorage.getItem('language');
    return savedLanguage ? options.find((option) => option.value === savedLanguage) : options[0];
  });

  const handleOpenMenu = (event) => {
    setAnchorel(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorel(null);
  };

  const handleLanguageChange = (option) => {
    setSelectedOption(option);
    changeLanguage(option.value);
    handleCloseMenu();
  };

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      i18n.changeLanguage(savedLanguage);
    }
  }, []);

  if (mode === 'drop-down') {
    return (
      <FormControl fullWidth>
        <Select
          size="small"
          sx={{ color: theme.palette.primary.contrastText }}
          value={selectedOption?.value}
          onChange={(e) => handleLanguageChange(options.find((opt) => opt.value === e.target.value))}
        >
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  }

  return (
    <>
      <Tooltip title={t('switchLanguage')}>
        <IconButton
          aria-label={t('switchLanguage')}
          aria-haspopup="true"
          onClick={handleOpenMenu}
          sx={{ color: color? color : ''}}
        >
          <LanguageIcon />
        </IconButton>
      </Tooltip>

      <Menu anchorEl={anchorel} open={Boolean(anchorel)} onClose={handleCloseMenu}>
        {options.map((option) => (
          <MenuItem
            key={option?.value}
            onClick={() => handleLanguageChange(option)}
            selected={option?.value === selectedOption?.value}
            dense
          >
            {option?.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}