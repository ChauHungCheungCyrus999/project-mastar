import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FormControl, InputLabel, MenuItem, Select, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import ProjectFolder from '../ProjectFolder';

import { useTranslation } from 'react-i18next';

const ProjectSelector = ({ projectId = '', onChange, displayAllOption = true, disabled = false }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(displayAllOption ? '' : projectId || '');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/projects`);
        setProjects(response.data);

        if (displayAllOption && !projectId) {
          setSelectedProjectId('');
          onChange(''); // Set the default selected project to "all"
        } else if (projectId) {
          setSelectedProjectId(projectId); // Set the default selected project to the provided projectId
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    fetchProjects();
  }, [projectId, displayAllOption, onChange]);

  const handleChange = (event) => {
    setSelectedProjectId(event.target.value);
    onChange(event.target.value);
  };

  return (
    <FormControl margin="dense" size="small" fullWidth>
      <Select
        labelId="project-selector-label"
        value={selectedProjectId}
        onChange={handleChange}
        displayEmpty
        renderValue={(selected) => {
          if (selected === '') {
            return <ProjectFolder project={{ title: t('all'), color: theme.palette.primary.main }} />;
          }
          const selectedProject = projects.find((project) => project._id === selected);
          return selectedProject ? (
            <ProjectFolder project={selectedProject} />
          ) : (
            <ProjectFolder project={{ title: t('all'), color: theme.palette.primary.main }} />
          );
        }}
        disabled={disabled}
        sx={{
          minWidth: 200, // Ensures enough space for the content
          width: 'auto', // Adjusts to the content width dynamically
        }}
      >
        {displayAllOption && (
          <MenuItem dense value="">
            <ProjectFolder project={{ title: t('all'), color: theme.palette.primary.main }} />
          </MenuItem>
        )}
        {projects.map((project) => (
          <MenuItem dense key={project._id} value={project._id}>
            <ProjectFolder project={project} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default ProjectSelector;