import React from 'react';
import { Popper, Paper, Typography, Divider, Grid, Box } from '@mui/material';
import { AccessTime, LocationOn, Event, Person, People, Description } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

import AccountAvatar from '../AccountAvatar';
//import StatusChip from '../StatusChip';
//import PriorityChip from '../PriorityChip';

import { capitalizeWordsExceptFirst } from '../../utils/StringUtils.js';

const EventPopper = ({ event, anchorEl, open }) => {
  const { t, i18n } = useTranslation();

  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement="bottom-end"
      disablePortal
      sx={{
        zIndex: 10000,
        minWidth: 300,
        maxWidth: 500,
      }}
    >
      <Paper sx={{ p: 2, borderRadius: 2, boxShadow: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="subtitle2" gutterBottom>
            {event?.title}
          </Typography>
          {/*<Box display="flex" alignItems="center">
            <StatusChip status={t(capitalizeWordsExceptFirst(event?.status))} />
            <PriorityChip priority={t(capitalizeWordsExceptFirst(event?.priority))} />
          </Box>*/}
        </Box>
        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Box display="flex" alignItems="center">
              <Event sx={{ mr: 1 }} />
              <Typography variant="body1" sx={{ flexShrink: 0, mr: 1 }}>
                <strong>{t('category')}{t('colon')}</strong>
              </Typography>
              <Typography variant="body1" sx={{ textAlign: 'left' }}>{event?.category}</Typography>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box display="flex" alignItems="center">
              <AccessTime sx={{ mr: 1 }} />
              <Typography variant="body1" sx={{ flexShrink: 0, mr: 1 }}>
                <strong>{t('date')}{t('colon')}</strong>
              </Typography>
              <Typography variant="body1" sx={{ textAlign: 'left' }}>
                {event?.allDay
                  ? `${event?.startDate ? new Date(event?.startDate).toLocaleDateString() : t('unknown')} - ${event?.endDate ? new Date(event?.endDate).toLocaleDateString() : t('unknown')}`
                  : `${event?.startDate ? new Date(event?.startDate).toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : t('unknown')} - ${event?.endDate ? new Date(event?.endDate).toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : t('unknown')}`}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box display="flex" alignItems="center">
              <LocationOn sx={{ mr: 1 }} />
              <Typography variant="body1" sx={{ flexShrink: 0, mr: 1 }}>
                <strong>{t('location')}{t('colon')}</strong>
              </Typography>
              <Typography variant="body1" sx={{ textAlign: 'left' }}>{event?.location}</Typography>
            </Box>
          </Grid>

          <Grid item xs={6}>
            <Box display="flex" alignItems="center">
              <Person sx={{ mr: 1 }} />
              <Typography variant="body1" sx={{ flexShrink: 0, mr: 1 }}>
                <strong>{t('organizers')}{t('colon')}</strong>
              </Typography>
              <Typography variant="body1" sx={{ textAlign: 'left' }}>
                <AccountAvatar users={event?.organizers} size="small" />
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={6}>
            <Box display="flex" alignItems="center">
              <People sx={{ mr: 1 }} />
              <Typography variant="body1" sx={{ flexShrink: 0, mr: 1 }}>
                <strong>{t('attendees')}{t('colon')}</strong>
              </Typography>
              <Typography variant="body1" sx={{ textAlign: 'left' }}>
                <AccountAvatar users={event?.attendees} size="small" />
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ mt: 1 }} />
        <Box display="flex" alignItems="center" mt={1}>
          <Description sx={{ mr: 1 }} />
          <Typography variant="body2">
            <strong>{t('description')}{t('colon')}</strong> {event?.description}
          </Typography>
        </Box>
      </Paper>
    </Popper>
  );
};

export default EventPopper;
