import React, { useState } from 'react';
import { Fab, Tooltip } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

import EventDialog from './EventDialog';

const CreateEventBtn = () => {
  const { t } = useTranslation();

  const projectId = window.location.href.split("/")[4];

  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSave = async (eventData) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_SERVER_HOST}/api/event`,
        eventData
      );
      console.log('Event created:', response.data);
      handleClose();
      return true;
    } catch (error) {
      console.error('Error creating event:', error);
      return false;
    }
  };

  return (
    <div>
      <Tooltip title={t('createEvent')}>
        <Fab color="primary" onClick={handleOpen} sx={{ position: 'fixed', bottom: { xs:'4rem', sm:'1rem', md:'1rem', lg:'1rem', xl:'1rem' }, right: '1rem' }}>
          <AddIcon />
        </Fab>
      </Tooltip>
        
      <EventDialog projectId={projectId} open={open} onClose={handleClose} onSubmit={handleSave} mode="create" />
    </div>
  );
};

export default CreateEventBtn;