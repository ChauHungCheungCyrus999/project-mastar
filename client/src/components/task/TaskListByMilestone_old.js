import React, { useEffect, useState } from 'react';
import TaskList from './TaskList';
import { Box, Accordion, AccordionSummary, AccordionDetails, Button } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import axios from 'axios';

import { useTranslation } from 'react-i18next';
import MilestoneFlag from '../MilestoneFlag';

const TaskListByMilestone = ({ project, tasks, setTasks, showTaskDetails, displayTab }) => {
  const { t } = useTranslation();
  const [milestones, setMilestones] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [allExpanded, setAllExpanded] = useState(true);

  useEffect(() => {
    const fetchMilestones = async () => {
      try {
        const milestonesRes = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/milestones/project/${project._id}/active`);
        setMilestones(milestonesRes.data);
        const initialExpandedState = {};
        milestonesRes.data.forEach(m => {
          initialExpandedState[m._id] = true;
        });
        initialExpandedState['others'] = true;
        setExpanded(initialExpandedState);
      } catch (error) {
        console.error('Error fetching milestones:', error);
      }
    };

    fetchMilestones();
  }, [project._id]);

  const handleToggleAll = () => {
    if (allExpanded) {
      setExpanded({});
    } else {
      const allExpandedState = {};
      milestones.forEach(milestone => {
        allExpandedState[milestone._id] = true;
      });
      allExpandedState['others'] = true;
      setExpanded(allExpandedState);
    }
    setAllExpanded(!allExpanded);
  };

  const toggleAccordion = (milestoneId) => {
    setExpanded(prev => ({
      ...prev,
      [milestoneId]: !prev[milestoneId],
    }));
  };

  const tasksByMilestone = milestones.reduce((acc, milestone) => {
    const milestoneTasks = tasks.filter(task => task.milestone?._id === milestone._id);
    if (milestoneTasks.length > 0) {
      acc[milestone._id] = milestoneTasks;
    }
    return acc;
  }, {});

  const otherTasks = tasks.filter(task => !task.milestone || !milestones.some(m => m._id === task.milestone._id));

  return (
    <Box>
      {milestones.length > 0 && (
        <Box mb={2}>
          <Button variant="contained" size="small" onClick={handleToggleAll} startIcon={allExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}>
            {allExpanded ? t('collapseAll') : t('expandAll')}
          </Button>
        </Box>
      )}

      {Object.entries(tasksByMilestone).map(([milestoneId, milestoneTasks]) => {
        const milestone = milestones.find(m => m._id === milestoneId);
        return (
          <Accordion
            key={milestoneId}
            variant="outlined"
            disableGutters
            expanded={!!expanded[milestoneId]}
            onChange={() => toggleAccordion(milestoneId)}
            sx={{ mb: 2 }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`panel-content-${milestoneId}`}
              id={`panel-header-${milestoneId}`}
            >
              <MilestoneFlag milestone={milestone} numOfTasks={milestoneTasks.length} size="large" />
            </AccordionSummary>
            <AccordionDetails>
              <TaskList
                tasks={milestoneTasks}
                setTasks={setTasks}
                showTaskDetails={showTaskDetails}
                height="350px"
              />
            </AccordionDetails>
          </Accordion>
        );
      })}

      {milestones.length > 0 && otherTasks.length > 0 && (
        <Accordion
          variant="outlined"
          disableGutters
          expanded={!!expanded['others']}
          onChange={() => toggleAccordion('others')}
          sx={{ mb: 2 }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel-content-others"
            id="panel-header-others"
          >
            <MilestoneFlag milestone={{ title: t('uncategorized') }} numOfTasks={otherTasks.length} size="large" />
          </AccordionSummary>
          <AccordionDetails>
            <TaskList
              tasks={otherTasks}
              setTasks={setTasks}
              showTaskDetails={showTaskDetails}
              height="350px"
            />
          </AccordionDetails>
        </Accordion>
      )}

      {milestones.length === 0 && (
        <TaskList
          tasks={otherTasks}
          setTasks={setTasks}
          showTaskDetails={showTaskDetails}
          height="64vh"
        />
      )}
    </Box>
  );
};

export default TaskListByMilestone;