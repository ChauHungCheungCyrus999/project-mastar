import React from 'react';
import { Box } from '@mui/material';

const firstRowImages = [
  '/static/landing/visuals/img1.jpg',
  '/static/landing/visuals/img2.jpg',
  '/static/landing/visuals/img3.jpg',
  '/static/landing/visuals/img4.jpg',
  '/static/landing/visuals/img5.jpg',
];

const secondRowImages = [
  '/static/landing/visuals/img6.jpg',
  '/static/landing/visuals/img7.jpg',
  '/static/landing/visuals/img8.jpg',
  '/static/landing/visuals/img9.jpg',
  '/static/landing/visuals/img10.jpg',
];

const VisualsSection = () => {
  const imageWidth = 320;
  const imageCount = firstRowImages.length;
  const totalWidth = imageCount * imageWidth;

  return (
    <Box sx={{ overflow: 'hidden', width: '100%' }}>
      {/* First Row - Move Left */}
      <Box
        sx={{
          display: 'flex',
          width: `${totalWidth * 2}px`,
          animation: 'moveLeft 20s linear infinite',
          '&:hover': { animationPlayState: 'paused' },
          '@keyframes moveLeft': {
            '0%': { transform: 'translateX(0)' },
            '100%': { transform: `translateX(-${totalWidth}px)` },
          },
        }}
      >
        {[...firstRowImages, ...firstRowImages].map((img, index) => (
          <Box
            key={index}
            sx={{
              display: 'inline-block',
              overflow: 'hidden',
              width: `${imageWidth}px`,
              height: '240px',
              border: '10px solid white',
              borderBottom: '0',
              borderRight: '0'
            }}
          >
            <Box
              component="img"
              src={img}
              sx={{
                width: `${imageWidth}px`,
                height: '240px',
                objectFit: 'cover',
                transition: 'transform 0.1s ease',
                '&:hover': { transform: 'scale(1.2)' },
              }}
            />
          </Box>
        ))}
      </Box>

      {/* Second Row - Move Right */}
      <Box
        sx={{
          display: 'flex',
          width: `${totalWidth * 2}px`,
          animation: 'moveRight 20s linear infinite',
          '&:hover': { animationPlayState: 'paused' },
          '@keyframes moveRight': {
            '0%': { transform: `translateX(-${totalWidth}px)` },
            '100%': { transform: 'translateX(0)' },
          },
        }}
      >
        {[...secondRowImages, ...secondRowImages].map((img, index) => (
          <Box
            key={index}
            sx={{
              display: 'inline-block',
              overflow: 'hidden',
              width: `${imageWidth}px`,
              height: '240px',
              border: '10px solid white',
              borderRight: '0'
            }}
          >
            <Box
              component="img"
              src={img}
              sx={{
                width: `${imageWidth}px`,
                height: '240px',
                objectFit: 'cover',
                transition: 'transform 0.1s ease',
                '&:hover': { transform: 'scale(1.2)' },
              }}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default VisualsSection;