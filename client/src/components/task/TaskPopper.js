import React, { useState } from 'react';
import { Popper, Paper } from '@mui/material';
import TaskCard from './TaskCard';

const TaskPopper = ({ task, anchorEl, open }) => {
  const [showTaskDetails, setShowTaskDetails] = useState({
    milestone: true,
    category: true,
    description: false,
    estimatedDate: true,
    actualDate: true,
    personInCharge: true,
    tags: true,
    status: true,
    priority: true,
    difficultyLevel: true,
    hasAttachments: true,
  });

  return (
    <Popper open={open} anchorEl={anchorEl} placement="bottom-end" disablePortal style={{ zIndex: 10000, minWidth: '300px', maxWidth: '500px' }}>
      <Paper>
        <TaskCard task={task} showTaskDetails={showTaskDetails} showOptions={false} />
      </Paper>
    </Popper>
  );
};

export default TaskPopper;