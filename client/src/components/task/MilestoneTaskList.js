import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  List,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import MilestoneFlag from '../MilestoneFlag';
import StatusChip from '../StatusChip';

const MilestoneTaskList = () => {
  const projectId = window.location.href.split("/")[4];

  const [milestones, setMilestones] = useState([]);
  const isMobile = false; // Placeholder for mobile check

  useEffect(() => {
    const fetchMilestones = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/tasksGroupByMilestone/project/${projectId}`);
        setMilestones(response.data);
      } catch (error) {
        console.error('Error fetching milestones:', error);
      }
    };

    fetchMilestones();
  }, [projectId]);

  return (
    <Box sx={{ overflowY: 'auto', maxHeight: isMobile ? '100%' : '70vh' }}>
      {milestones?.length > 0 ? (
        milestones.map((milestone) => (
          <Accordion key={milestone._id} variant="outlined" disableGutters>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <MilestoneFlag milestone={milestone} numOfTasks={milestone.tasks.length} size="large" />
            </AccordionSummary>
            <AccordionDetails>
              <List disablePadding>
                {milestone?.tasks?.map((task) =>
                  task.subtasks?.length > 0 ? (
                    <Accordion key={task._id} variant="outlined" disableGutters>
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        sx={{ paddingLeft: isMobile ? '' : '20px' }}
                      >
                        <ListItemText
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            width: '100%',
                          }}
                          primary={task.taskName}
                          secondary={<StatusChip status={task.status} />}
                          primaryTypographyProps={{ variant: isMobile ? 'body2' : 'body1', style: { marginRight: 'auto' } }}
                        />
                      </AccordionSummary>
                      <AccordionDetails>
                        <List disablePadding>
                          {task.subtasks.map((subtask) => (
                            <ListItemButton
                              key={subtask._id}
                              sx={{
                                paddingLeft: isMobile ? '' : '40px',
                                py: 0,
                              }}
                            >
                              <ListItemText
                                sx={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  width: '100%',
                                }}
                                primary={subtask.name}
                                secondary={<Typography variant="body2" color="textSecondary">{subtask.completed}</Typography>}
                                primaryTypographyProps={{ variant: isMobile ? 'body2' : 'body1', style: { marginRight: 'auto' } }}
                              />
                            </ListItemButton>
                          ))}
                        </List>
                      </AccordionDetails>
                    </Accordion>
                  ) : (
                    <ListItemButton
                      key={task._id}
                      sx={{
                        paddingLeft: isMobile ? '' : '20px',
                        py: 0,
                      }}
                    >
                      <ListItemText
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          width: '100%',
                        }}
                        primary={task.taskName}
                        secondary={<StatusChip status={task.status} />}
                        primaryTypographyProps={{ variant: isMobile ? 'body2' : 'body1', style: { marginRight: 'auto' } }}
                      />
                    </ListItemButton>
                  )
                )}
              </List>
            </AccordionDetails>
          </Accordion>
        ))
      ) : (
        <Typography variant="body1" sx={{ m: 2 }}>No tasks found for this project.</Typography>
      )}
    </Box>
  );
};

export default MilestoneTaskList;