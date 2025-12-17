// Reference: https://github.com/mui/material-ui/blob/v5.15.14/docs/data/material/getting-started/templates/landing-page/components/AppAppBar.js
// Demo: https://mui.com/material-ui/getting-started/templates/landing-page/

import React, { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Box, Container, 
  Button, Divider, Typography, 
  AppBar, Toolbar, MenuItem, Drawer
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

import Logo from '../Logo';
import ThemeSwitcher from '../ThemeSwitcher';
import LanguageSwitcher from '../LanguageSwitcher';

import { useTranslation } from 'react-i18next';

function Navbar({ displayMenu }) {
  const { t } = useTranslation();

  const theme = useTheme();

  const [open, setOpen] = useState(false);
  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  // Fix: Accurate scroll positioning for navbar anchor links
  // Computes target position using getBoundingClientRect to avoid double smooth-scroll conflicts
  const scrollToSection = (sectionId) => {
    const sectionElement = document.getElementById(sectionId);
    if (!sectionElement) return;

    const appBar = document.querySelector('header.MuiAppBar-root');
    const headerHeight = appBar?.getBoundingClientRect().height || 64;
    const extraGap = 8; // Small breathing space below the AppBar

    const targetY = sectionElement.getBoundingClientRect().top + window.pageYOffset - (headerHeight + extraGap);

    window.scrollTo({ top: targetY, behavior: 'smooth' });
    setOpen(false);
  };

  return (
    <div>
      <AppBar
        position="fixed"
        sx={{
          width: '100%',
          boxShadow: 0,
          bgcolor: 'transparent',
          //mt: 2,
        }}
      >
        <Toolbar
          variant="regular"
          sx={(theme) => ({
            width: '100%',
            //display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            //flexShrink: 0,
            //borderRadius: '999px',
            bgcolor: 'rgba(0,0,0, 0.4)',
            backdropFilter: 'blur(24px)',
            maxHeight: 40,
            /*border: '1px solid',
            borderColor: 'divider',
            boxShadow:
              theme.palette.mode === 'light'
                ? `0 0 1px rgba(85, 166, 246, 0.1), 1px 1.5px 2px -1px rgba(85, 166, 246, 0.15), 4px 4px 12px -2.5px rgba(85, 166, 246, 0.15)`
                : '0 0 1px rgba(2, 31, 59, 0.7), 1px 1.5px 2px -1px rgba(2, 31, 59, 0.65), 4px 4px 12px -2.5px rgba(2, 31, 59, 0.65)',*/
          })}
        >
          <Box
            sx={{
              flexGrow: 1,
              display: 'flex',
              alignItems: 'center',
              ml: '-18px',
              px: 0,
            }}
          >
            {/*<Logo theme={isDarkMode? "light":"dark"} />*/}
            <Logo theme="light" />
            
            {displayMenu && (
              <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
                <MenuItem
                  onClick={() => scrollToSection('features')}
                  sx={{ py: '6px', px: '12px' }}
                >
                  <Typography variant="body2">
                    {t('features')}
                  </Typography>
                </MenuItem>
                <MenuItem
                  onClick={() => scrollToSection('highlights')}
                  sx={{ py: '6px', px: '12px' }}
                >
                  <Typography variant="body2">
                    {t('highlights')}
                  </Typography>
                </MenuItem>
                <MenuItem
                  onClick={() => scrollToSection('pricing')}
                  sx={{ py: '6px', px: '12px' }}
                >
                  <Typography variant="body2">
                    {t('pricing')}
                  </Typography>
                </MenuItem>
                <MenuItem
                  onClick={() => scrollToSection('testimonials')}
                  sx={{ py: '6px', px: '12px' }}
                >
                  <Typography variant="body2">
                    {t('testimonials')}
                  </Typography>
                </MenuItem>
                <MenuItem
                  onClick={() => scrollToSection('faq')}
                  sx={{ py: '6px', px: '12px' }}
                >
                  <Typography variant="body2">
                    {t('faq')}
                  </Typography>
                </MenuItem>
              </Box>
            )}
          </Box>

          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              gap: 0.5,
              alignItems: 'center',
            }}
          >
            <LanguageSwitcher color="white" />
            
            <Button
              color="primary.dark"
              variant="text"
              size="small"
              component="a"
              href="/login"
              //target="_blank"
            >
              {t('signIn')}
            </Button>
            <Button
              color="primary.dark"
              //variant="contained"
              size="small"
              component="a"
              href="/register"
              //target="_blank"
            >
              {t('signUp')}
            </Button>
          </Box>
          <Box sx={{ display: { sm: '', md: 'none' } }}>
            <Button
              variant="text"
              color="primary.dark"
              aria-label="menu"
              onClick={toggleDrawer(true)}
              sx={{ minWidth: '30px', p: '4px' }}
            >
              <MenuIcon />
            </Button>
            <Drawer anchor="right" open={open} onClose={toggleDrawer(false)}>
              <Box
                sx={{
                  minWidth: '60dvw',
                  p: 2,
                  backgroundColor: 'background.paper',
                  flexGrow: 1,
                }}
              >
                <MenuItem onClick={() => scrollToSection('features')}>
                  {t('features')}
                </MenuItem>
                <MenuItem onClick={() => scrollToSection('testimonials')}>
                  {t('testimonials')}
                </MenuItem>
                <MenuItem onClick={() => scrollToSection('highlights')}>
                  {t('highlights')}
                </MenuItem>
                <MenuItem onClick={() => scrollToSection('pricing')}>
                  {t('pricing')}
                </MenuItem>
                <MenuItem onClick={() => scrollToSection('faq')}>
                  {t('faq')}
                </MenuItem>
                
                <Divider />

                <LanguageSwitcher />

                <MenuItem>
                  <Button
                    color="primary"
                    variant="outlined"
                    component="a"
                    href="/login"
                    //target="_blank"
                    sx={{ width: '100%' }}
                  >
                    {t('signIn')}
                  </Button>
                </MenuItem>
                <MenuItem>
                  <Button
                    color="primary"
                    variant="contained"
                    component="a"
                    href="/register"
                    //target="_blank"
                    sx={{ width: '100%' }}
                  >
                    {t('signUp')}
                  </Button>
                </MenuItem>
              </Box>
            </Drawer>
          </Box>
        </Toolbar>
      </AppBar>
    </div>
  );
}

export default Navbar;