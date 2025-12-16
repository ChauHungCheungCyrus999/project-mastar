import React, { useEffect, useState } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import { useTheme, createTheme, ThemeProvider } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

const ThemeSwitcher = ({ mode, setMode, setTheme }) => {
  const { t } = useTranslation();

  // Access the current theme
  const theme = useTheme();

  const [primaryColor, setPrimaryColor] = useState('#004aff');
  const [fontSize, setFontSize] = useState(16); // Default font size

  useEffect(() => {
    // Load the primary color and font size from localStorage
    const savedPrimaryColor = localStorage.getItem('primaryColor');
    const savedFontSize = localStorage.getItem('fontSize') || 16;

    if (savedPrimaryColor) {
      setPrimaryColor(savedPrimaryColor);
    }

    setFontSize(parseInt(savedFontSize, 10));
  }, []);

  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('theme', newMode);
    updateTheme(newMode, fontSize);
  };

  const updateTheme = (mode, fontSize) => {
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
        fontSize: fontSize,
        h1: { fontSize: fontSize * 4 },
        h2: { fontSize: fontSize * 3 },
        h3: { fontSize: fontSize * 2.5 },
        h4: { fontSize: fontSize * 2 },
        h5: { fontSize: fontSize * 1.8 },
        h6: { fontSize: fontSize * 1.6 },
        subtitle1: { fontSize: fontSize * 1.5 },
        subtitle2: { fontSize: fontSize * 1.3 },
        body1: { fontSize: fontSize },
        body2: { fontSize: fontSize * 0.9 },
        overline: { fontSize: fontSize * 1.1 },
        button: { fontSize: fontSize },
        caption: { fontSize: fontSize * 0.875 },
        label: { fontSize: fontSize },
        input: { fontSize: fontSize },
      },
    });

    setTheme(newTheme);
  };

  return (
    <Tooltip
      title={theme.palette.mode === 'dark' ? t('switchToLightMode') : t('switchToDarkMode')}
    >
      <IconButton onClick={toggleTheme}>
        {mode === 'dark' ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeSwitcher;