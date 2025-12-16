import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Switch,
  FormControlLabel,
  Grid,
  Divider,
  Tooltip,
  Button,
} from '@mui/material';
import { SketchPicker } from 'react-color';
import SettingsIcon from '@mui/icons-material/Settings';
import PaletteIcon from '@mui/icons-material/Palette';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import { useTranslation } from 'react-i18next';

import LanguageSwitcher from './LanguageSwitcher';

const defaultColors = [
  //'#193f70',
  '#5777c2',
  '#7e57c2',
  '#26a69a',
  '#ef5350',
  '#ffa726',
  '#42a5f5'
];

const ThemeCustomizer = ({ mode, setMode, theme, setTheme, children }) => {
  const { t } = useTranslation();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [colorPickerVisible, setColorPickerVisible] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#004aff');
  const [size, setSize] = useState('medium'); // Default size

  useEffect(() => {
    const storedColor = localStorage.getItem('primaryColor') || '#004aff';
    const storedSize = localStorage.getItem('componentSize') || 'medium';

    setSelectedColor(storedColor);
    setSize(storedSize);

    // Update the theme when the component mounts
    updateTheme(mode, storedColor, storedSize);
  }, []);

  const handleColorChange = (color) => {
    setSelectedColor(color.hex);
    localStorage.setItem('primaryColor', color.hex);
    updateTheme(mode, color.hex, size);
  };

  const handleSizeChange = (newSize) => {
    setSize(newSize);
    localStorage.setItem('componentSize', newSize);
    updateTheme(mode, selectedColor, newSize);
  };

  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('theme', newMode);

    // Update the theme and font size when toggling the theme
    updateTheme(newMode, selectedColor, size);
  };

  const updateTheme = (mode, primaryColor, componentSize) => {
    const sizeMapping = {
      small: {
        fontSize: 14,
        buttonPadding: '4px 8px',
        inputPadding: '4px',
        borderRadius: 4,
      },
      medium: {
        fontSize: 16,
        buttonPadding: '6px 12px',
        inputPadding: '6px',
        borderRadius: 6,
      },
      large: {
        fontSize: 18,
        buttonPadding: '8px 16px',
        inputPadding: '8px',
        borderRadius: 8,
      },
    };

    const selectedSize = sizeMapping[componentSize];

    const newTheme = createTheme({
      palette: {
        mode,
        primary: { main: primaryColor },
        background: {
          default: mode === 'dark' ? '#121212' : '#F5F5FF',
          paper: mode === 'dark' ? '#1e1e1e' : '#ffffff',
        },
        text: {
          primary: mode === 'dark' ? '#ffffff' : '#000000',
          secondary: mode === 'dark' ? '#aaaaaa' : '#666666',
        },
      },
      typography: {
        fontSize: selectedSize?.fontSize,
        h1: { fontSize: selectedSize?.fontSize * 4 },
        h2: { fontSize: selectedSize?.fontSize * 3 },
        h3: { fontSize: selectedSize?.fontSize * 2.5 },
        h4: { fontSize: selectedSize?.fontSize * 2 },
        h5: { fontSize: selectedSize?.fontSize * 1.8 },
        h6: { fontSize: selectedSize?.fontSize * 1.6 },
        subtitle1: { fontSize: selectedSize?.fontSize * 1.5 },
        subtitle2: { fontSize: selectedSize?.fontSize * 1.3 },
        body1: { fontSize: selectedSize?.fontSize },
        body2: { fontSize: selectedSize?.fontSize * 0.9 },
        overline: { fontSize: selectedSize?.fontSize * 1.1 },
        button: { fontSize: selectedSize?.fontSize },
        caption: { fontSize: selectedSize?.fontSize * 0.875 },
        label: { fontSize: selectedSize?.fontSize },
        input: { fontSize: selectedSize?.fontSize },
      },
      shape: {
        borderRadius: selectedSize?.borderRadius,
      },
    });

    setTheme(newTheme);
  };

  return (
    <ThemeProvider theme={theme}>
      <Tooltip placement="left" title={t('themeCustomizer')}>
        <IconButton
          size="small"
          onClick={() => setDrawerOpen(true)}
          sx={{
            position: 'fixed',
            top: '20%',
            right: 0,
            transform: 'translateX(30%) translateY(-50%)',
            backgroundColor: 'primary.main',
            color: '#fff',
            borderRadius: '20px',
            paddingLeft: 1,
            paddingRight: 3,
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
            zIndex: 10,
            boxShadow: 3,
          }}
        >
          <SettingsIcon />
        </IconButton>
      </Tooltip>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box
          sx={{
            width: 300,
            padding: 2,
            color: theme.palette.primary.contrastText,
            backgroundColor:
              mode === 'light'
                ? theme.palette.primary.dark
                : theme.palette.primary.dark,
            height: '100rem',
          }}
        >
          <Typography variant="subtitle2">
            {t('themeCustomizer')}
          </Typography>

          <Typography variant="body2" sx={{ mb: 2 }}>
            {t('themeCustomizerDesc')}
          </Typography>

          <Divider color={theme.palette.primary.contrastText} />

          {/* Language Switcher */}
          <Box mb={3}>
            <Typography variant="body1" sx={{ mt: 2 }}>
              {t('language')}
            </Typography>
            <LanguageSwitcher mode="drop-down" />
          </Box>

          {/* Theme Mode Toggle */}
          <Box mt={2} mb={3}>
            <Typography variant="body1">{t('mode')}</Typography>
            <Tooltip
              title={
                mode === 'dark'
                  ? t('switchToLightMode')
                  : t('switchToDarkMode')
              }
            >
              <FormControlLabel
                control={<Switch checked={mode === 'dark'} onChange={toggleTheme} />}
                label={mode === 'dark' ? t('darkMode') : t('lightMode')}
              />
            </Tooltip>
          </Box>

          {/* Primary Color Picker */}
          <Box mb={3}>
            <Typography variant="body1">{t('primaryColor')}</Typography>
            <Grid container spacing={1} sx={{ mt: 0.5 }}>
              {defaultColors.map((color) => (
                <Grid item key={color}>
                  <Button
                    variant="contained"
                    onClick={() => handleColorChange({ hex: color })}
                    sx={{
                      backgroundColor: color,
                      minWidth: 35,
                      height: 35,
                      borderRadius: '50%',
                      border: selectedColor === color ? '2px solid black' : 'none',
                    }}
                  />
                </Grid>
              ))}
              <Grid item>
                <Tooltip title={t('palette')}>
                  <Button
                    variant="contained"
                    onClick={() => setColorPickerVisible(!colorPickerVisible)}
                    sx={{
                      minWidth: 35,
                      height: 35,
                      borderRadius: '50%',
                      padding: 0,
                    }}
                  >
                    <PaletteIcon />
                  </Button>
                </Tooltip>
              </Grid>
            </Grid>

            {colorPickerVisible && (
              <Box sx={{ mt: 0.5 }}>
                <SketchPicker
                  color={selectedColor}
                  onChangeComplete={handleColorChange}
                />
              </Box>
            )}
          </Box>

          {/* Size Selector */}
          <Box mb={3}>
            <Typography variant="body1" sx={{ mt: 2 }}>
              {t('componentSize')}
            </Typography>
            <Grid container spacing={1} sx={{ mt: 1 }}>
              <Grid item>
                <Tooltip title={t('small')}>
                  <IconButton
                    size="small"
                    onClick={() => handleSizeChange('small')}
                    sx={{
                      backgroundColor: size === 'small' ? 'primary.main' : 'grey.300',
                      color: size === 'small' ? 'white' : 'black',
                    }}
                  >
                    <TextFieldsIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Grid>
              <Grid item>
                <Tooltip title={t('medium')}>
                  <IconButton
                    onClick={() => handleSizeChange('medium')}
                    sx={{
                      backgroundColor: size === 'medium' ? 'primary.main' : 'grey.300',
                      color: size === 'medium' ? 'white' : 'black',
                    }}
                  >
                    <TextFieldsIcon fontSize="medium" />
                  </IconButton>
                </Tooltip>
              </Grid>
              <Grid item>
                <Tooltip title={t('large')}>
                  <IconButton
                    onClick={() => handleSizeChange('large')}
                    sx={{
                      backgroundColor: size === 'large' ? 'primary.main' : 'grey.300',
                      color: size === 'large' ? 'white' : 'black',
                    }}
                  >
                    <TextFieldsIcon fontSize="large" />
                  </IconButton>
                </Tooltip>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Drawer>

      {children}
    </ThemeProvider>
  );
};

export default ThemeCustomizer;