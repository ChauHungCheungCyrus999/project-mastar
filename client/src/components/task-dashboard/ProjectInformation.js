import React from 'react';
import { Box, Typography } from '@mui/material';
import { Description } from '@mui/icons-material';

import DashboardCard from '../custom/DashboardCard';

import { useTranslation } from 'react-i18next';

import { displayHtml } from '../../utils/RichTextUtils';
import AccountAvatar from '../AccountAvatar';

const ProjectInformation = ({ project }) => {
  const { t } = useTranslation();

  const projectManagers = project.teamMembers.filter(
    (member) => member.role === 'Project Manager'
  );

  return (
    <DashboardCard
      dashboardId="Task Dashboard"
      cardId="Project Information"
      title={t('projectInfo')}
      description={t('projectInfoDesc')}
      height={400}
      icon={Description}
      color={project?.color}
    >
      <Box style={{ height: '310px', overflow: 'auto' }}>
        {/*{project.teamMembers.filter(member => member.role === 'Project Manager').length > 0 && (
          <Typography variant="body2" component="div" gutterBottom>
            <strong>{`${t('projectManager')}${t('colon')}`}</strong>
            {project.teamMembers.filter(member => member.role === 'Project Manager').map((manager, index) => (
              `${manager.firstName} ${manager.lastName}${index < project.teamMembers?.filter(member => member.role === 'Project Manager').length - 1 ? ',' : ''}`
            )).join(' ')}
          </Typography>
        )}*/}
        
        <Typography variant="body2" component="div" gutterBottom>
          <strong>{`${t('projectManager')}${t('colon')}`}</strong>
          {`${projectManagers.length} ${t('members')}`}
        </Typography>
        <Box display="flex" justifyContent="flex-start">
          {projectManagers.length > 0 && (
            <AccountAvatar users={projectManagers} size="small" />
          )}
        </Box>

        <Typography variant="body2" component="div" gutterBottom>
          <strong>{`${t('teamSize')}${t('colon')}`}</strong>
          {`${project.teamMembers.length} ${t('members')}`}
        </Typography>
        <Box display="flex" justifyContent="flex-start">
          <AccountAvatar users={project.teamMembers} size="small" />
        </Box>

        <Typography variant="body2" component="div">
          <strong>{`${t('description')}${t('colon')}`}</strong>
          {displayHtml(project.description)}
        </Typography>
      </Box>
    </DashboardCard>
  );
};

export default ProjectInformation;