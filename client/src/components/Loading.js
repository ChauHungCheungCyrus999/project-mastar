import React from 'react';
import { Backdrop, CircularProgress, LinearProgress } from '@mui/material';

import TriangleGrid from './shapes/TriangleGrid';

const Loading = ({ showProgressBar }) => {
  return (
    <Backdrop
      sx={{
        color: 'rgba(255, 255, 255, 0.5)', // Set the alpha value to control transparency
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
      open={true}
    >
      {/*<CircularProgress color="inherit" />*/}
      <TriangleGrid />
      {showProgressBar && <LinearProgress color="inherit" />}
    </Backdrop>
  );
};

export default Loading;