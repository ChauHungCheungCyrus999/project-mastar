// Import necessary modules
import React from 'react';
import { Card, CardContent, Box, Typography, Divider } from '@mui/material';

import { useTranslation } from 'react-i18next';

import AccountAvatar from '../AccountAvatar';

import { capitalizeWordsExceptFirst } from '../../utils/StringUtils.js';

const StatusWithDot = ({ color, label }) => (
  <Box display="flex" alignItems="center">
    <Box
      sx={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        backgroundColor: color,
        marginRight: 1,
      }}
    />
    <Typography variant="body2" color="#777">{label}</Typography>
  </Box>
);

const TeamMemberCard = ({ teamMember, tasks, handleTeamMemberClick, getTaskCount }) => {
  const { t } = useTranslation();

  return (
    <Card
        onClick={() => handleTeamMemberClick(teamMember)}
        sx={{
          cursor: 'pointer',
          ':hover': {
            boxShadow: '10',
          }
        }}
      >
        <CardContent sx={{ backgroundColor: 'background.paper', p: 0, m: 0 }}>
          <Box sx={{ p: 2, color: 'white', backgroundColor: 'primary.main' }}>
            <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
              <AccountAvatar users={teamMember} size="large" displayPopper={false} />
            </Box>
            <Typography variant="subtitle2" align="center">{`${teamMember.firstName} ${teamMember.lastName}`}</Typography>
            <Typography variant="body2" align="center" sx={{ color: '#B5C4DA' }}>
              {`${t(capitalizeWordsExceptFirst(teamMember.role))}`}
            </Typography>
          </Box>
          <Box m={2} mb={0}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <StatusWithDot color="#89CFF0" label={t('toDo')} />
              <Typography variant="body1" color="primary.main">{getTaskCount(teamMember, 'To Do')}</Typography>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <StatusWithDot color="#FFE5A0" label={t('inProgress')} />
              <Typography variant="body1" color="primary.main">{getTaskCount(teamMember, 'In Progress')}</Typography>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <StatusWithDot color="#E6CFF2" label={t('underReview')} />
              <Typography variant="body1" color="primary.main">{getTaskCount(teamMember, 'Under Review')}</Typography>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <StatusWithDot color="#D4EDBC" label={t('completed')} />
              <Typography variant="body1" color="primary.main">{getTaskCount(teamMember, 'Done')}</Typography>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <StatusWithDot color="#FF6347" label={t('overdue')} />
              <Typography variant="body1" color="primary.main">{getTaskCount(teamMember, 'Overdue')}</Typography>
            </div>
            <Divider sx={{ my: 0.5, bgcolor: "primary.main" }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <StatusWithDot color="primary.main" label={t('total')} />
              <Typography variant="body1" color="primary.main">
                {tasks.filter(task => task.personInCharge.some(person => person._id === teamMember._id)).length}
              </Typography>
            </div>
          </Box>
        </CardContent>
      </Card>
  );
};

export default TeamMemberCard;