import React, { useState, useEffect } from 'react';
import { Typography, Link, Divider, Chip, Stack, Box, Grid } from '@mui/material';
//import { Carousel } from 'react-responsive-carousel';
//import 'react-responsive-carousel/lib/styles/carousel.min.css';
import axios from 'axios';

import { AccessTime, PermIdentity, AttachmentOutlined, RateReviewOutlined, Done, RotateLeftOutlined, AccessAlarmOutlined, AssignmentOutlined, PauseOutlined, CloseOutlined } from '@mui/icons-material';

import CCard from '../custom/CCard';
import StatusChip from '../StatusChip';
import PriorityChip from '../PriorityChip';
import DifficultyLevelChip from '../DifficultyLevelChip';
import MilestoneFlag from '../MilestoneFlag';
import TagChip from '../TagChip';
import AccountAvatar from '../AccountAvatar';
import MoveTaskDialog from './MoveTaskDialog';

import { useTranslation } from 'react-i18next';

import { parseISO } from 'date-fns';
import { formatDate, getDaysAgo } from '../../utils/DateUtils.js';
import { displayHtml } from '../../utils/RichTextUtils';

const TaskCard = ({ task, tasks, setTasks, setMode, setEditedTask, setEditFormOpen, handleMarkAsCompleted, handleEdit, setTaskToDelete, handleDelete, setOpenConfirmDeleteDialog, showTaskDetails, showOptions = true, onShowAlert }) => {
  const { t, i18n } = useTranslation();

  const [showMore, setShowMore] = useState(false);
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);

  /*const [personInChargeNames, setPersonInChargeNames] = useState([]);

  useEffect(() => {
    if (showTaskDetails.personInCharge && task.personInCharge) {
      fetchPersonInChargeNames();
    }
  }, [showTaskDetails.personInCharge, task.personInCharge]);

  const fetchPersonInChargeNames = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/users`, {
        params: {
          userIds: task.personInCharge,
        },
      });
      const users = response.data;
      const names = task.personInCharge.map((personId) => {
        const user = users.find((user) => user._id === personId);
        if (user) {
          return `${user.firstName} ${user.lastName}`;
        }
        return '';
      });
      setPersonInChargeNames(names);
    } catch (error) {
      console.log('Error fetching user details:', error);
    }
  };*/

  const toggleShowMore = (event) => {
    event.stopPropagation();
    setShowMore(!showMore);
  };

  // Edit
  const onEdit = () => {
    setEditFormOpen(true);
    handleEdit(task._id, 'update', tasks, setMode, setEditedTask, setEditFormOpen);
  };

  // Move
  const onMove = () => {
    setMoveDialogOpen(true);
  };

  // Handle move success
  const handleMoveSuccess = (message, type = 'success') => {
    if (onShowAlert) {
      onShowAlert(message, type);
    } else {
      console.log(`${type}: ${message}`);
    }
  };

  // Duplicate
  const onDuplicate = () => {
    setEditFormOpen(true);
    handleEdit(task._id, "duplicate", tasks, setMode, setEditedTask, setEditFormOpen);
  };

  const onDelete = () => {
    setOpenConfirmDeleteDialog(true);
    handleDelete(task._id, setOpenConfirmDeleteDialog, setTaskToDelete);
  };

  return (
    <>
      <CCard
        mode="task"
        item={task}
        setItems={setTasks}
        handleRead={onEdit}
        handleMarkAsCompleted={handleMarkAsCompleted}
        handleEdit={onEdit}
        handleMove={onMove}
        handleDuplicate={onDuplicate}
        handleDelete={onDelete}
        title={task.taskName}
        subheader={showTaskDetails?.category && task?.category}
        showOptions={showOptions}
        icon={
          task.status === "Done"? Done
            : task.endDate && new Date(task.endDate) < new Date()+1 && task.status !== "Done" && task.status !== "Cancelled"? AccessAlarmOutlined
            : task.status === "On Hold"? PauseOutlined
            : task.status === "In Progress"? RotateLeftOutlined
            : task.status === "Under Review"? RateReviewOutlined
            : task.status === "Cancelled"? CloseOutlined
            : AssignmentOutlined
        }
      >
      {showTaskDetails?.milestone && task?.milestone && (
        <Box my={0.5}>
          <MilestoneFlag milestone={task?.milestone} />
        </Box>
      )}
      
      {showTaskDetails?.tags && task?.tags && (
        <Box my={0.5}>
          <TagChip tags={task?.tags} />
        </Box>
      )}

      {/*{showTaskDetails.date && task.startDate && task.endDate && (
        <Typography variant='body2' color="text.secondary" gutterBottom>
          {`${formatDate(task.startDate)} ~ ${formatDate(task.endDate)} (${Math.ceil((new Date(task.endDate) - new Date(task.startDate)) / (1000 * 60 * 60 * 24))} ${Math.ceil((new Date(task.endDate) - new Date(task.startDate)) / (1000 * 60 * 60 * 24)) <= 1 ? t('day') : t('days')})`}
        </Typography>
      )}*/}

      {/*<Typography variant='body2'>Start Date: { task.startDate ? new Date(task.startDate).toISOString().split('T')[0] : "" }</Typography>
      <Typography variant='body2' sx={{ mb: 1.5 }}>End Date: { task.endDate ? new Date(task.endDate).toISOString().split('T')[0] : "" }</Typography>

      <Typography variant='body2'>Created At: { task.createdDate? new Date(task.createdDate).toISOString().replace(/T/, ' ').replace(/\..+/, '') : "" }</Typography>
      <Typography variant='body2' sx={{ mb: 1.5 }}>Updated At: { task.updatedDate? new Date(task.updatedDate).toISOString().replace(/T/, ' ').replace(/\..+/, '') : "" }</Typography>*/}
      
      <Typography variant="body2" sx={{ wordWrap: 'break-word', overflow: 'hidden', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' }} gutterBottom>
        {showTaskDetails?.description ? (
          <>
            {showMore ? displayHtml(task?.description) : displayHtml(task?.description.slice(0, 250))}
            {task.description?.length > 250 && !showMore && (
              <span>
                ...
                <Typography variant="body2" sx={{ float: 'right' }}>
                  <Link href="#show-more" onClick={toggleShowMore}>
                    {t("showMore")}
                  </Link>
                </Typography>
              </span>
            )}
            {showMore && task.description.length > 250 && (
              <Typography variant="body2" sx={{ float: 'right' }}>
                <Link href="#show-more" onClick={toggleShowMore}>
                  {t("showLess")}
                </Link>
              </Typography>
            )}
          </>
        ) : null}
      </Typography>

      {/*{task.images && task.images.length > 0 && (
        <div sx={{ mt: '1rem' }}>
          <Carousel showThumbs={true}>
            {task.images.map((image, index) => (
              <div key={index}>
                <img src={image} alt={`Image ${index + 1}`} />
              </div>
            ))}
          </Carousel>
        </div>
      )}*/}

      {/*{(showTaskDetails.date || showTaskDetails.personInCharge || showTaskDetails.priority || showTaskDetails.difficultyLevel || showTaskDetails.attachments) && (
        <Divider sx={{ mt: 1, mb: 1 }} />
      )}*/}

      <Stack direction="row" justifyContent="space-between">
        <div>          
          {showTaskDetails?.personInCharge && task?.personInCharge && task?.personInCharge.length > 0 && (
            <Grid container justify="flex-start" sx={{ m:1, ml:0 }}>
              <AccountAvatar users={task?.personInCharge} size="small" displayPopper={true} />
            </Grid>
            /*<Chip
              icon={<PermIdentity sx={{ color: "DimGray !important" }} />}
              label={
                task.personInCharge
                ? task.personInCharge.map((person) => {
                  return `${person?.firstName} ${person?.lastName}` || '';
                }).join(t('comma'))
                : ''
              }
              size="small"
              sx={{ mr: 0.5, mb: 0.5, color: 'black', backgroundColor: '#cae6ff', whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '15rem' }}
            />*/
          )}

          {showTaskDetails?.status && task.status && (
            <StatusChip status={task.status} />
          )}

          {showTaskDetails?.priority && task.priority && (
            <PriorityChip priority={task.priority} />
          )}
          
          {showTaskDetails?.difficultyLevel && task.difficultyLevel && (
            <DifficultyLevelChip mode="icon" difficultyLevel={task.difficultyLevel} />
          )}
          
          {showTaskDetails?.hasAttachments && task.attachments && task.attachments.length > 0 && (
            <Chip
              icon={<AttachmentOutlined />}
              label={t('attachments')}
              size="small"
            />
          )}
        </div>

        {showTaskDetails?.daysAgo && task.updatedDate && (
          <Box style={{ display: 'flex', alignItems: 'end' }}>
            <Typography variant='body2' color="#777" style={{ display: 'flex', alignItems: 'center' }}>
              <AccessTime sx={{ mr:1 }} />
              {`${getDaysAgo(parseISO(task.updatedDate), t, i18n)}`}
            </Typography>
          </Box>
        )}
      </Stack>
      </CCard>

      <MoveTaskDialog
        open={moveDialogOpen}
        onClose={() => setMoveDialogOpen(false)}
        taskId={task._id}
        currentProjectId={task.project._id}
        onTaskMoved={(taskId) => {
          if (setTasks && typeof setTasks === 'function') {
            setTasks(prevTasks => prevTasks.filter(t => t._id !== taskId));
          }
        }}
        onSuccess={handleMoveSuccess}
      />
    </>
  );
};

export default TaskCard;
