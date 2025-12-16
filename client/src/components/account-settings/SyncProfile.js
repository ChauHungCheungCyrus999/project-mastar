import React, { useState, useContext, useRef, useEffect } from 'react';
import { Container, Box, Button, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

import UserContext from '../../UserContext';
import { Save, Restore } from '@mui/icons-material';
import CAlert from '../custom/CAlert';

const SyncProfile = () => {
  const { user } = useContext(UserContext);
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [isRestoreEnabled, setIsRestoreEnabled] = useState(false); // State to track the Restore button status

  // Alert
  const alertRef = useRef();

  // Check localStorage for existing data to enable the Restore button
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/user/retrieve-user-profile/${user._id}`);
        if (response.data) {
          setIsRestoreEnabled(true); // Enable if data exists
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [user._id]);

  const handleSaveProfile = async () => {
    setLoading(true);
    
    try {
      const views = Object.keys(localStorage)
        .filter(key => key.startsWith('dataGridView_'))
        .map(viewName => {
          const viewData = localStorage.getItem(viewName);
          return viewData ? { name: viewName.replace('dataGridView_', ''), data: JSON.parse(viewData) } : null;
        })
        .filter(view => view !== null);

      /*if (views.length === 0) {
        alertRef.current.displayAlert('warning', t('noViewsToStore'));
        setLoading(false);
        return;
      }*/

      await axios.post(`${process.env.REACT_APP_SERVER_HOST}/api/user/store-user-profile`, {
        userId: user._id,
        language: localStorage.getItem('language'),
        theme: localStorage.getItem('theme'),
        primaryColor: localStorage.getItem('primaryColor'),
        componentSize: localStorage.getItem('componentSize'),
        views,
        dashboardPinState: localStorage.getItem('dashboardPinState'),
        showTaskDetails: localStorage.getItem('showTaskDetails'),
      });

      localStorage.setItem('dataGridViews', JSON.stringify(views.map(view => view.name)));

      alertRef.current.displayAlert('success', t('saveProfileSuccess'));

      // Update Restore button state after saving
      setIsRestoreEnabled(true);
    } catch (error) {
      console.error('Error saving views:', error);
      alertRef.current.displayAlert('error', t('restoreProfileFail'));
    } finally {
      setLoading(false);
    }
  };

  const handleRetrieveProfile = async () => {
    setLoading(true);

    try {
      const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/user/retrieve-user-profile/${user._id}`);
      
      localStorage.setItem('language', response.data.language);
      localStorage.setItem('theme', response.data.theme);
      localStorage.setItem('primaryColor', response.data.primaryColor);
      localStorage.setItem('componentSize', response.data.componentSize);
      localStorage.setItem('dashboardPinState', response.data.dashboardPinState);

      localStorage.setItem('showTaskDetails', response.data.showTaskDetails);
      
      const views = response.data.views;
      views.forEach(view => {
        localStorage.setItem(`dataGridView_${view.name}`, JSON.stringify(view.data));
      });
      localStorage.setItem('dataGridViews', JSON.stringify(views.map(view => view.name)));

      alertRef.current.displayAlert('success', t('restoreProfileSuccess'));
    } catch (error) {
      console.error('Error retrieving views:', error);
      alertRef.current.displayAlert('error', t('restoreProfileFail'));
    } finally {
      setLoading(false);
      window.location.reload();
    }
  };

  return (
    <Container component="main">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '20px',
        }}
      >
        <Typography component="h1" variant="h5" sx={{ marginBottom: '20px' }}>
          {t('syncProfile')}
        </Typography>

        <Typography component="body1" variant="body1" sx={{ textAlign: 'justify', marginBottom: '20px' }}>
          {t('syncProfileDesc.body')}
          <ul>
            {t('syncProfileDesc.syncList', { returnObjects: true }).map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, marginBottom: '20px' }}>
          <Button
            variant="contained"
            startIcon={<Save />}
            color="primary"
            onClick={handleSaveProfile}
            disabled={loading}
          >
            {loading ? t('saving') : t('saveProfile')}
          </Button>
          <Button
            variant="contained"
            startIcon={<Restore />}
            color="secondary"
            onClick={handleRetrieveProfile}
            disabled={loading || !isRestoreEnabled} // Disable if loading or no data in localStorage
          >
            {loading ? t('restoring') : t('restoreProfile')}
          </Button>
        </Box>
        
        <CAlert ref={alertRef} />
      </Box>
    </Container>
  );
};

export default SyncProfile;
