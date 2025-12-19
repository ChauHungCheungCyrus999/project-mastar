import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery, Stack, Avatar, MenuItem, Select } from '@mui/material';
import Folder from '@mui/icons-material/Folder';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import ProjectFolder from '../ProjectFolder';

import { useTranslation } from 'react-i18next';

import hexToRGB from '../../utils/ColorUtils.js';

const ProjectSwitcher = () => {
  const { t } = useTranslation();

  const page = window.location.href.split("/")[5];
  const projectId = window.location.href.split("/")[4];

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(localStorage.getItem('selectedProject') || projectId);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/projects`)
      .then(response => setProjects(response.data))
      .catch(error => console.error('Error fetching projects:', error));
  }, []);

  useEffect(() => {
    setSelectedProject(projectId);
    localStorage.setItem('selectedProject', projectId);
  }, [projectId]);

  const handleChange = (event) => {
    const projectId = event.target.value;
    setSelectedProject(projectId);
    localStorage.setItem('selectedProject', projectId);
    if (projectId) {
      navigate(`/project/${projectId}/${page}`);
      navigate(0);
    }
  };

  return (
    <Select
      value={selectedProject}
      onChange={handleChange}
      size="small"
      displayEmpty
      sx={{
        minWidth: !isMobile? '250px' : '',
        boxShadow: "none",
        ".MuiOutlinedInput-notchedOutline": { border: 0 },
        "&.MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline":
          {
            border: 0,
          },
        "&.MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
          {
            border: 0,
          },
      }}
      MenuProps={{
        anchorOrigin: {
          vertical: "bottom",
          horizontal: "left"
        },
        transformOrigin: {
          vertical: "top",
          horizontal: "left"
        },
        getContentAnchorEl: null
      }}
      renderValue={(selected) => {
        if (!selected) {
          return <em>{t('selectProject')}</em>;
        }
        const project = projects.find(proj => proj._id === selected || proj._id === projectId);
        return (
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
            <Avatar
              variant="rounded"
              sx={{
                bgcolor: `rgba(${hexToRGB(project?.color)})`,
                width: isMobile ? 30 : 30,
                height: isMobile ? 30 : 30,
                fontSize: isMobile ? '1rem' : '1rem',
                marginRight: '1rem',
              }}
            >
              <Folder />
            </Avatar>
            {project?.title}
          </div>
        );
      }}
    >
      <MenuItem value="" disabled>
        <em>{t('selectProject')}</em>
      </MenuItem>
      {projects.map((project) => (
        <MenuItem key={project._id} value={project._id}>
          <ProjectFolder project={project} />
        </MenuItem>
      ))}
    </Select>
  );
};

export default ProjectSwitcher;