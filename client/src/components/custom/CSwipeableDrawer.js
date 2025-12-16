import React from 'react';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

const Puller = styled(Box)(({ theme }) => ({
  width: 30,
  height: 6,
  backgroundColor: theme.palette.grey[300],
  borderRadius: 3,
  position: 'absolute',
  top: 8,
  left: 'calc(50% - 15px)',
}));

const CSwipeableDrawer = ({ open, onOpen, onClose, height, children }) => {
  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onOpen={onOpen}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: '10px 10px 0 0',
          height: height
        },
      }}
    >
      <Puller />
      {children}
    </SwipeableDrawer>
  );
};

export default CSwipeableDrawer;