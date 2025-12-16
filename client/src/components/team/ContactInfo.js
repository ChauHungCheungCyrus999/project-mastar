import React from 'react';
import { Paper, Typography, Link, Grid, List, ListItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { Wc, EmailOutlined, PersonOutlineOutlined, WorkOutlineOutlined, PhoneOutlined, BusinessOutlined, AccountTreeOutlined, GroupOutlined } from '@mui/icons-material';

import AccountAvatar from '../AccountAvatar';

import { capitalizeWordsExceptFirst } from '../../utils/StringUtils.js';

import { useTranslation } from 'react-i18next';

const ContactInfo = ({ selectedTeamMember }) => {
  const { t } = useTranslation();

  const ContactItem = ({ icon, label, value }) => (
    <ListItem disableGutters>
      <ListItemIcon>{icon}</ListItemIcon>
      <ListItemText primary={label} secondary={value} />
    </ListItem>
  );

  return (
    <Paper variant="outlined" elevation={0}>
      <Grid container spacing={2} p={2}>
        <Grid item xs={12} sm={6} md={3} container justifyContent="center" alignItems="center">
          <AccountAvatar users={selectedTeamMember} size="large" displayPopper={false} />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Typography variant="subtitle1" style={{ display: 'flex', alignItems: 'center', fontWeight: '500', marginBottom: '1rem' }}>
            <span style={{ borderBottom: '5px solid #FFCC00', paddingBottom: '0.5rem', width: '100%' }}>{t('about')}</span>
          </Typography>
          <List dense={true} disablePadding>
            <ContactItem
              icon={<PersonOutlineOutlined />}
              label={t('name')}
              value={`${selectedTeamMember?.firstName || '-'} ${selectedTeamMember?.lastName || '-'}`}
            />
            <ContactItem
              icon={<Wc />}
              label={t('gender')}
              value={t(capitalizeWordsExceptFirst(selectedTeamMember?.gender || '-'))}
            />
          </List>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Typography variant="subtitle1" style={{ display: 'flex', alignItems: 'center', fontWeight: '500', marginBottom: '1rem' }}>
            <span style={{ borderBottom: '5px solid #00ff88', paddingBottom: '0.5rem', width: '100%' }}>{t('contacts')}</span>
          </Typography>
          <List dense={true} disablePadding>
            <ContactItem
              icon={<EmailOutlined />}
              label={t('email')}
              value={<Link href={`mailto:${selectedTeamMember?.email}`}>{selectedTeamMember?.email || '-'}</Link>}
            />
            <ContactItem
              icon={<PhoneOutlined />}
              label={t('phone')}
              value={selectedTeamMember?.phone || '-'}
            />
          </List>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Typography variant="subtitle1" style={{ display: 'flex', alignItems: 'center', fontWeight: '500', marginBottom: '1rem' }}>
            <span style={{ borderBottom: '5px solid #00d9ff', paddingBottom: '0.5rem', width: '100%' }}>{t('work')}</span>
          </Typography>
          <List dense={true} disablePadding>
            <ContactItem
              icon={<BusinessOutlined />}
              label={t('organization')}
              value={selectedTeamMember?.organization || '-'}
            />
            <ContactItem
              icon={<AccountTreeOutlined />}
              label={t('department')}
              value={selectedTeamMember?.department || '-'}
            />
            <ContactItem
              icon={<WorkOutlineOutlined />}
              label={t('jobTitle')}
              value={selectedTeamMember?.jobTitle || '-'}
            />
            {selectedTeamMember?.role && (
              <ContactItem
                icon={<GroupOutlined />}
                label={t('role')}
                value={t(capitalizeWordsExceptFirst(selectedTeamMember?.role) || '-')}
              />
            )}
          </List>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ContactInfo;