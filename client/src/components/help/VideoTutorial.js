import React, { useState, useEffect } from 'react';
import { useTheme, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Paper, Typography } from '@mui/material';
import { LoginOutlined, FolderOutlined, AssignmentOutlined, EditNoteOutlined } from '@mui/icons-material';
import { useMediaQuery } from '@mui/material';

const VideoTutorial = () => {
  const theme = useTheme();

  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState('');
  const isTablet = useMediaQuery('(max-width:900px)');

  useEffect(() => {
    const videoFiles = [
      {
        icon: <LoginOutlined />,
        name: 'Sign Up & Sign In.mp4'
      },
      {
        icon: <FolderOutlined />,
        name: 'Create Project.mp4'
      },
      {
        icon: <AssignmentOutlined />,
        name: 'Create Task.mp4'
      },
      {
        icon: <EditNoteOutlined />,
        name: 'Edit Task.mp4'
      }
    ];
    setVideos(videoFiles);
    setSelectedVideo(videoFiles[0]);
  }, []);

  const handleVideoSelect = (video) => {
    setSelectedVideo(video);
  };

  return (
    <div style={{ display: 'flex', flexDirection: isTablet ? 'column' : 'row' }}>
      <Paper sx={{ bgcolor: theme.palette.background.paper, width: isTablet ? '100%' : '30%', mb: isTablet ? '10px' : '0', mr: isTablet ? '0' : '10px' }}>
        <List>
          {videos.map((video, index) => (
            <ListItem disablePadding>
              <ListItemButton
                key={index}
                onClick={() => handleVideoSelect(video)}
                selected={selectedVideo.name === video.name}
              >
                <ListItemIcon>{video.icon}</ListItemIcon>
                <ListItemText primary={video.name?.slice(0, -4)} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Paper>
      <Paper style={{ width: isTablet ? '100%' : '70%', padding: '10px' }}>
        <Typography variant="subtitle2">{selectedVideo.name?.slice(0, -4)}</Typography>
        <video
          width="100%"
          controls
          src={`video-tutorials/${selectedVideo.name}`}
        />
      </Paper>
    </div>
  );
};

export default VideoTutorial;