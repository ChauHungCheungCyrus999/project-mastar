import React, { useEffect, useState } from 'react';
import TaskList from './TaskList';
import { Box, Chip, Tabs, Tab, Typography } from '@mui/material';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const TaskListByMilestone = ({ project, tasks, setTasks, showTaskDetails, displayTab }) => {
  const { t } = useTranslation();
  const [milestones, setMilestones] = useState([]);
  const [selectedMilestone, setSelectedMilestone] = useState('all'); // Default to showing all tasks

  useEffect(() => {
    const fetchMilestones = async () => {
      try {
        const milestonesRes = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/milestones/project/${project._id}/active`);
        setMilestones(milestonesRes.data);
      } catch (error) {
        console.error('Error fetching milestones:', error);
      }
    };

    fetchMilestones();
  }, [project._id]);

  const handleMilestoneClick = (milestoneId) => {
    //setSelectedMilestone((prev) => (prev === milestoneId ? 'all' : milestoneId));
    setSelectedMilestone(milestoneId);
  };

  // Group tasks by milestone
  const tasksByMilestone = milestones.reduce((acc, milestone) => {
    const milestoneTasks = tasks.filter(task => task.milestone?._id === milestone._id);
    if (milestoneTasks.length > 0) {
      acc[milestone._id] = milestoneTasks;
    }
    return acc;
  }, {});

  // Tasks not associated with any milestone
  const otherTasks = tasks.filter(task => !task.milestone || !milestones.some(m => m._id === task.milestone._id));

  // Combine all tasks if "All Milestones" is selected
  const allTasks = tasks;

  return (
    <Box>
      {/* Render milestone tabs */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        <Chip
          label={t('all')}
          onClick={() => handleMilestoneClick('all')}
          color={selectedMilestone === 'all' ? 'primary' : 'default'}
          variant={selectedMilestone === 'all' ? 'filled' : 'outlined'}
          clickable
        />

        {milestones.map((milestone) => (
          <Chip
            key={milestone._id}
            label={milestone.title}
            onClick={() => handleMilestoneClick(milestone._id)}
            color={selectedMilestone === milestone._id ? 'primary' : 'default'}
            variant={selectedMilestone === milestone._id ? 'filled' : 'outlined'}
            clickable
          />
        ))}

        {tasks.some((task) => !task.milestone) && (
          <Chip
            label={t('uncategorized')}
            onClick={() => handleMilestoneClick('others')}
            color={selectedMilestone === 'others' ? 'primary' : 'default'}
            variant={selectedMilestone === 'others' ? 'filled' : 'outlined'}
            clickable
          />
        )}
      </Box>

      {/* Render task lists based on selected milestone */}
      {selectedMilestone === 'all' ? (
        // Show all tasks
        <TaskList
          tasks={allTasks}
          setTasks={setTasks}
          showTaskDetails={showTaskDetails}
          height="62vh"
        />
      ) : selectedMilestone === 'others' ? (
        // Show "other tasks" list
        <TaskList
          tasks={otherTasks}
          setTasks={setTasks}
          showTaskDetails={showTaskDetails}
          height="62vh"
        />
      ) : (
        // Show tasks for the selected milestone
        <TaskList
          tasks={tasksByMilestone[selectedMilestone] || []}
          setTasks={setTasks}
          showTaskDetails={showTaskDetails}
          height="62vh"
        />
      )}
    </Box>
  );
};

export default TaskListByMilestone;
