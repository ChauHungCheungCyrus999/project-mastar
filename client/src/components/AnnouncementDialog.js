import React, { useContext } from 'react';
import { Box, Stack, Typography, Divider } from '@mui/material';
import CDialog from './custom/CDialog';
import AccountAvatar from './AccountAvatar';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { displayHtml } from '../utils/RichTextUtils';
import ProjectFolder from './ProjectFolder';
import AttachmentList from './AttachmentList';

import UserContext from '../UserContext';

const AnnouncementDialog = ({ open, onClose, announcement }) => {
  const { user, setUser } = useContext(UserContext);

  const { t } = useTranslation();

  if (!announcement) return null;

  return (
    <CDialog open={open} onClose={onClose} maxWidth="md" title={
      <Stack direction="row">
        {announcement.project ? (
          <>
            <ProjectFolder project={announcement.project} />
            <Typography variant="subtitle2">{t('colon')}{announcement.title}</Typography>
          </>
        ) : (
          <>
            <Typography variant="subtitle2">{announcement.title}</Typography>
          </>
        )}
      </Stack>
    }>
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="body1">{t('date')}</Typography>
            <Typography variant="body2">
              {dayjs(announcement.startDate).format('YYYY-MM-DD')}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body1">{t('createdBy')}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {announcement.createdBy ? (
                <>
                  <AccountAvatar users={[announcement.createdBy]} size="small" />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    {`${announcement.createdBy.firstName} ${announcement.createdBy.lastName}`}
                  </Typography>
                </>
              ) : (
                <>
                  <AccountAvatar users={[user]} size="small" />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    {`${user.firstName} ${user.lastName}`}
                  </Typography>
                </>
              )}
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/*<Typography variant="subtitle1" sx={{ mb: 1 }}>{t('content')}</Typography>*/}
        <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
          {displayHtml(announcement.content)}
        </Typography>

        {announcement.attachments.length >= 1 && (
          <Box sx={{ mt: '2rem' }}>
            <AttachmentList mode="read" files={announcement.attachments} folder="tasks" />
          </Box>
        )}
      </Box>
    </CDialog>
  );
};

export default AnnouncementDialog;
