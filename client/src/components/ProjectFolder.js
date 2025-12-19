import React from 'react';
import { Avatar } from '@mui/material';
import Folder from '@mui/icons-material/Folder';
import { useTheme } from '@mui/material/styles'; // Import the useTheme hook
import { useTranslation } from 'react-i18next';
import hexToRGB from '../utils/ColorUtils.js';

const ProjectFolder = ({ project }) => {
  const theme = useTheme(); // Access the current theme
  const { t } = useTranslation();

  // Scale the icon size dynamically based on the theme's font size
  const avatarSize = theme.typography.fontSize * 1.5;
  const iconSize = theme.typography.fontSize * 1.3;

  // Handle null/undefined project - display "All" with primary color
  const displayProject = project || { 
    title: t('all'), 
    color: theme.palette.primary.main 
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
      <Avatar
        variant="rounded"
        sx={{
          bgcolor: `rgba(${hexToRGB(displayProject.color)})`,
          width: avatarSize,
          height: avatarSize,
          marginRight: '1rem',
        }}
      >
        <Folder sx={{ fontSize: iconSize }} /> {/* Adjust the icon size dynamically */}
      </Avatar>
      {displayProject.title}
    </div>
  );
};

export default ProjectFolder;