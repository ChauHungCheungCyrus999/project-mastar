import React from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, Stack, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

import { useTranslation } from 'react-i18next';
import AccountAvatar from '../AccountAvatar';

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

const TeamTaskTable = ({ filteredTeamMembers, tasks, handleTeamMemberClick, getTaskCount }) => {
  const theme = useTheme();
  
  const { t } = useTranslation();

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table
        size="small"
        stickyHeader
        sx={{
          "& .MuiTableRow-root:hover": {
            backgroundColor: theme.palette.action.hover
          }
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell>{t('name')}</TableCell>
            <TableCell><StatusWithDot color="#89CFF0" label={t('toDo')} /></TableCell>
            <TableCell><StatusWithDot color="#FFE5A0" label={t('inProgress')} /></TableCell>
            <TableCell><StatusWithDot color="#E6CFF2" label={t('underReview')} /></TableCell>
            <TableCell><StatusWithDot color="#D4EDBC" label={t('completed')} /></TableCell>
            <TableCell><StatusWithDot color="#FF6347" label={t('overdue')} /></TableCell>
            <TableCell><StatusWithDot color="#193f70" label={t('total')} /></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredTeamMembers.map((teamMember) => (
            <TableRow key={teamMember._id}>
              <TableCell>
                <Stack direction="row" alignItems="center">
                  <AccountAvatar users={teamMember} />
                  <Typography variant="body2" style={{ marginLeft: '0.5rem' }}>
                    {`${teamMember.firstName} ${teamMember.lastName}`}
                  </Typography>
                </Stack>
              </TableCell>
              <TableCell onClick={() => handleTeamMemberClick(teamMember)}>
                {getTaskCount(teamMember, 'To Do')}
              </TableCell>
              <TableCell onClick={() => handleTeamMemberClick(teamMember)}>
                {getTaskCount(teamMember, 'In Progress')}
              </TableCell>
              <TableCell onClick={() => handleTeamMemberClick(teamMember)}>
                {getTaskCount(teamMember, 'Under Review')}
              </TableCell>
              <TableCell onClick={() => handleTeamMemberClick(teamMember)}>
                {getTaskCount(teamMember, 'Done')}
              </TableCell>
              <TableCell onClick={() => handleTeamMemberClick(teamMember)}>
                {getTaskCount(teamMember, 'Overdue')}
              </TableCell>
              <TableCell onClick={() => handleTeamMemberClick(teamMember)}>
                {tasks.filter(task => task.personInCharge.some(person => person._id === teamMember._id)).length}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TeamTaskTable;