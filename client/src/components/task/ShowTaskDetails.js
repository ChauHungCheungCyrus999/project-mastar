// Checkboxes
/*
import React, { useState, useEffect } from 'react';
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';

import { useTranslation } from 'react-i18next';

const ShowTaskDetails = ({ showTaskDetails, setShowTaskDetails }) => {
  const { t } = useTranslation();

  const storedShowTaskDetails = JSON.parse(localStorage.getItem('showTaskDetails'));
  const [selectAll, setSelectAll] = useState(Object.values(showTaskDetails).every((value) => value));

  useEffect(() => {
    // Retrieve the value from localStorage when the component mounts
    if (storedShowTaskDetails) {
      setShowTaskDetails(storedShowTaskDetails);
    }
  }, []);

  useEffect(() => {
    // Store the value in localStorage whenever it changes
    localStorage.setItem('showTaskDetails', JSON.stringify(showTaskDetails));
  }, [showTaskDetails]);

  const handleSelectAllChange = (event) => {
    const checked = event.target.checked;
    setSelectAll(checked);
    setShowTaskDetails({
      category: checked,
      description: checked,
      date: checked,
      personInCharge: checked,
      priority: checked,
      difficultyLevel: checked,
      hasAttachments: checked,
    });
  };

  const handleChange = (event) => {
    const { name, checked } = event.target;
    const allChecked = Object.values(showTaskDetails).every((value) => value);

    setShowTaskDetails((prevDetails) => ({
      ...prevDetails,
      [name]: checked,
    }));

    if (!checked) {
      setSelectAll(false);
    } else {
      setSelectAll(allChecked);
    }

    localStorage.setItem('showTaskDetails', JSON.stringify(showTaskDetails));
  };

  return (
    <FormGroup row>
      <FormControlLabel
        control={<Checkbox checked={selectAll} onChange={handleSelectAllChange} name="selectAll" />}
        label={t('all')}
        sx={{ marginRight: '2rem' }}
      />
      <FormControlLabel
        control={<Checkbox checked={showTaskDetails.category} onChange={handleChange} name="category" />}
        label={t('category')}
        sx={{ marginRight: '2rem' }}
      />
      <FormControlLabel
        control={<Checkbox checked={showTaskDetails.description} onChange={handleChange} name="description" />}
        label={t('description')}
        sx={{ marginRight: '2rem' }}
      />
      <FormControlLabel
        control={<Checkbox checked={showTaskDetails.date} onChange={handleChange} name="date" />}
        label={t('date')}
        sx={{ marginRight: '2rem' }}
      />
      <FormControlLabel
        control={<Checkbox checked={showTaskDetails.personInCharge} onChange={handleChange} name="personInCharge" />}
        label={t('personInCharge')}
        sx={{ marginRight: '2rem' }}
      />
      <FormControlLabel
        control={<Checkbox checked={showTaskDetails.priority} onChange={handleChange} name="priority" />}
        label={t('priority')}
        sx={{ marginRight: '2rem' }}
      />
      <FormControlLabel
        control={<Checkbox checked={showTaskDetails.difficultyLevel} onChange={handleChange} name="difficultyLevel" />}
        label={t('difficultyLevel')}
        sx={{ marginRight: '2rem' }}
      />
      <FormControlLabel
        control={<Checkbox checked={showTaskDetails.hasAttachments} onChange={handleChange} name="hasAttachments" />}
        label={t('attachments')}
      />
    </FormGroup>
  );
};

export default ShowTaskDetails;
*/

/*import React, { useState, useEffect } from 'react';
import { Checkbox, FormLabel, FormControlLabel, Menu, Button, Stack, useMediaQuery, SwipeableDrawer, Typography } from '@mui/material';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';

import CSwipeableDrawer from '../custom/CSwipeableDrawer';

import { useTranslation } from 'react-i18next';

const ShowTaskDetails = ({ showTaskDetails, setShowTaskDetails }) => {
  const { t } = useTranslation();
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const isMobile = useMediaQuery('(max-width:600px)');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const storedShowTaskDetails = JSON.parse(localStorage.getItem('showTaskDetails'));
  const [selectAll, setSelectAll] = useState(Object.values(showTaskDetails).every((value) => value));

  useEffect(() => {
    if (storedShowTaskDetails) {
      setShowTaskDetails(storedShowTaskDetails);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('showTaskDetails', JSON.stringify(showTaskDetails));
  }, [showTaskDetails]);

  const handleSelectAllChange = (event) => {
    const checked = event.target.checked;
    setSelectAll(checked);
    setShowTaskDetails({
      milestone: checked,
      category: checked,
      description: checked,
      estimatedDate: checked,
      actualDate: checked,
      personInCharge: checked,
      tags: checked,
      status: checked,
      priority: checked,
      difficultyLevel: checked,
      hasAttachments: checked,
      daysAgo: checked,
    });
  };

  const handleChange = (event) => {
    const { name, checked } = event.target;

    setShowTaskDetails((prevDetails) => ({
      ...prevDetails,
      [name]: checked,
    }));

    if (!checked) {
      setSelectAll(false);
    } else {
      setSelectAll(Object.values(showTaskDetails).every((value) => value));
    }

    localStorage.setItem('showTaskDetails', JSON.stringify(showTaskDetails));
  };

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

  const MenuContent = (
    <Stack direction="column" spacing={1} sx={{ px:'1rem', pt:0, pb:1, pr:3 }}>
      <FormLabel component="legend">
        <Typography variant="button">{t('fieldsToBeDisplayed')}</Typography>
      </FormLabel>
      <FormControlLabel
        control={<Checkbox checked={selectAll} onChange={handleSelectAllChange} name="selectAll" size="small" sx={{ pt: 0, pb: 0 }} />}
        label={t('all')}
        componentsProps={{ typography: { variant: 'body2' } }}
      />
      {Object.keys(showTaskDetails).map((key) => (
        <FormControlLabel
          key={key}
          control={<Checkbox checked={showTaskDetails[key]} onChange={handleChange} name={key} size="small" sx={{ pt: 0, pb: 0 }} />}
          label={t(key)}
          componentsProps={{ typography: { variant: 'body2' } }}
        />
      ))}
    </Stack>
  );

  return (
    <>
      <Button
        startIcon={<ViewColumnIcon />}
        onClick={handleMenuOpen}
        sx={{ mr: 0.5 }}
      >
        {t('showDetails')}
      </Button>

      {isMobile ? (
        <CSwipeableDrawer
          open={drawerOpen}
          onOpen={() => {}}
          onClose={handleDrawerClose}
        >
          <Typography variant="subtitle2" align="center" sx={{ my: '0.5rem', mt: '1rem' }}>{t('showDetails')}</Typography>
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

export default ShowTaskDetails;*/

import React, { useState, useEffect } from 'react';
import {
  Checkbox,
  FormLabel,
  FormControlLabel,
  Menu,
  Button,
  Stack,
  useMediaQuery,
  Typography,
} from '@mui/material';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import CSwipeableDrawer from '../custom/CSwipeableDrawer';
import { useTranslation } from 'react-i18next';

const ShowTaskDetails = ({ displayMode, showTaskDetails, setShowTaskDetails }) => {
  const { t } = useTranslation();
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const isMobile = useMediaQuery('(max-width:600px)');
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Retrieve `showTaskDetails` for the current `displayMode` from localStorage
  useEffect(() => {
    const storedShowTaskDetails = JSON.parse(localStorage.getItem('showTaskDetails')) || {};
    if (storedShowTaskDetails[displayMode]) {
      setShowTaskDetails(storedShowTaskDetails[displayMode]);
    }
  }, [displayMode, setShowTaskDetails]);

  // Save `showTaskDetails` for the current `displayMode` to localStorage when it changes
  const handleSaveShowTaskDetails = (updatedDetails) => {
    const storedShowTaskDetails = JSON.parse(localStorage.getItem('showTaskDetails')) || {};
    storedShowTaskDetails[displayMode] = updatedDetails;
    localStorage.setItem('showTaskDetails', JSON.stringify(storedShowTaskDetails));
  };

  const [selectAll, setSelectAll] = useState(
    Object.values(showTaskDetails).every((value) => value)
  );

  const handleSelectAllChange = (event) => {
    const checked = event.target.checked;
    setSelectAll(checked);
    const updatedDetails = Object.keys(showTaskDetails).reduce(
      (acc, key) => ({ ...acc, [key]: checked }),
      {}
    );
    setShowTaskDetails(updatedDetails);
    handleSaveShowTaskDetails(updatedDetails); // Save changes
  };

  const handleChange = (event) => {
    const { name, checked } = event.target;
    const updatedDetails = {
      ...showTaskDetails,
      [name]: checked,
    };
    setShowTaskDetails(updatedDetails);
    handleSaveShowTaskDetails(updatedDetails); // Save changes

    if (!checked) {
      setSelectAll(false);
    } else {
      setSelectAll(Object.values(updatedDetails).every((value) => value));
    }
  };

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

  const MenuContent = (
    <Stack direction="column" spacing={1} sx={{ px: '1rem', pt: 0, pb: 1, pr: 3 }}>
      <FormLabel component="legend">
        <Typography variant="button">{t('fieldsToBeDisplayed')}</Typography>
      </FormLabel>
      <FormControlLabel
        control={
          <Checkbox
            checked={selectAll}
            onChange={handleSelectAllChange}
            name="selectAll"
            size="small"
            sx={{ pt: 0, pb: 0 }}
          />
        }
        label={t('all')}
        componentsProps={{ typography: { variant: 'body2' } }}
      />
      {Object.keys(showTaskDetails).map((key) => (
        <FormControlLabel
          key={key}
          control={
            <Checkbox
              checked={showTaskDetails[key]}
              onChange={handleChange}
              name={key}
              size="small"
              sx={{ pt: 0, pb: 0 }}
            />
          }
          label={t(key)}
          componentsProps={{ typography: { variant: 'body2' } }}
        />
      ))}
    </Stack>
  );

  return (
    <>
      <Button
        startIcon={<ViewColumnIcon />}
        onClick={handleMenuOpen}
        sx={{ mr: 0.5 }}
      >
        {t('showDetails')}
      </Button>

      {isMobile ? (
        <CSwipeableDrawer open={drawerOpen} onOpen={() => {}} onClose={handleDrawerClose}>
          <Typography variant="subtitle2" align="center" sx={{ my: '0.5rem', mt: '1rem' }}>
            {t('showDetails')}
          </Typography>
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

export default ShowTaskDetails;
