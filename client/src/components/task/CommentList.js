import React, { useContext, useState, useRef } from 'react';
import { Box, Typography, InputLabel, Button, IconButton, Tooltip, Divider, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { Delete, Edit, Save } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import UserContext from '../../UserContext';
import RichTextArea from '../custom/RichTextArea';
import AccountAvatar from '../AccountAvatar';
import { getDaysTimeAgo } from '../../utils/DateUtils.js';
import { draftToHtmlContent } from '../../utils/RichTextUtils';
import ConfirmDeleteDialog from '../custom/ConfirmDeleteDialog';
import CAlert from '../custom/CAlert';

const CommentList = ({ mode, task, comments, setComments }) => {
  const { user } = useContext(UserContext);
  const { t, i18n } = useTranslation();
  const [editingIndex, setEditingIndex] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);
  
  const alertRef = useRef();

  const addComment = async () => {
    if (newComment.trim()) {
      try {
        await axios.post(`${process.env.REACT_APP_SERVER_HOST}/api/task/${task._id}/comment`, {
          content: newComment,
          createdBy: user._id,
        });

        const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/task/${task._id}/comments`);
        setComments(response.data);
        setNewComment('');
        alertRef.current.displayAlert('success', t('commentAdded'));
      } catch (error) {
        console.error('Error adding comment:', error);
        alertRef.current.displayAlert('error', t('commentAddError'));
      }
    }
  };

  const updateComment = async (index) => {
    const comment = comments[index];
    try {
      const response = await axios.put(`${process.env.REACT_APP_SERVER_HOST}/api/task/${task._id}/comment/${comment._id}`, {
        content: comment.content,
      });

      setComments(response.data.comments);
      setEditingIndex(null);
      alertRef.current.displayAlert('success', t('commentUpdated'));
    } catch (error) {
      console.error('Error updating comment:', error);
      alertRef.current.displayAlert('error', t('commentUpdateError'));
    }
  };

  const removeComment = async () => {
    const comment = comments[deleteIndex];
    try {
      const response = await axios.delete(`${process.env.REACT_APP_SERVER_HOST}/api/task/${task._id}/comment/${comment._id}`);
      setComments(response.data?.comments);
      setDialogOpen(false);
      setDeleteIndex(null);
      alertRef.current.displayAlert('success', t('commentDeleted'));
    } catch (error) {
      console.error('Error deleting comment:', error);
      alertRef.current.displayAlert('error', t('commentDeleteError'));
    }
  };

  const handleCommentChange = (index, value) => {
    const updatedComments = [...comments];
    updatedComments[index].content = draftToHtmlContent(value);
    setComments(updatedComments);
  };

  const handleDeleteClick = (index) => {
    setDeleteIndex(index);
    setDialogOpen(true);
  };

  return (
    <Box>
      <InputLabel id="comments-label" sx={{ mb:'1rem' }}>{t('comments')}</InputLabel>

      {mode === "edit" && (
        <Box style={{ display: 'flex', flexDirection: 'column' }}>
          <Box display="flex" alignItems="centerTop" justifyContent="space-between">
            <AccountAvatar users={user} displayPopper={true} />
            <Box ml={2}>
              <RichTextArea
                value={newComment}
                handleDescriptionChange={setNewComment}
                height={250}
              />
            </Box>
          </Box>
          <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="contained" size="small" onClick={addComment}>{t('leaveComment')}</Button>
          </div>
        </Box>
      )}

      {comments?.length !== 0 && (
        <Divider sx={{ m: '1rem 0', ml: '3rem' }} />
      )}

      {comments?.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate))
        .map((comment, index) => (
          <Box key={index} display="flex" flexDirection="row" sx={{ mb: '1rem', alignItems: 'flex-start' }}>
            <Box flex="1">
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box style={{ display: 'flex', alignItems: 'center' }}>
                  <AccountAvatar users={comment.createdBy} displayPopper={true} />
                  <Box ml={2}>
                    <Typography variant="body1"><strong>{`${comment.createdBy.firstName} ${comment.createdBy.lastName}`}</strong> - {getDaysTimeAgo(comment.createdDate, t, i18n)}</Typography>
                  </Box>
                </Box>

                {user._id === comment.createdBy._id && mode === "edit" && (
                  <Box display="flex" mt={1}>
                    <Tooltip title={editingIndex === index ? t('save') : t('edit')}>
                      <IconButton onClick={() => editingIndex === index ? updateComment(index) : setEditingIndex(index)}>
                        {editingIndex === index ? <Save /> : <Edit />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t('delete')}>
                      <IconButton onClick={() => handleDeleteClick(index)}><Delete /></IconButton>
                    </Tooltip>
                  </Box>
                )}
              </Box>

              {editingIndex === index ? (
                <Box ml={7}>
                  <RichTextArea
                    description={comments[editingIndex].content}
                    handleDescriptionChange={(value) => handleCommentChange(index, value)}
                    height={200}
                  />
                </Box>
              ) : (
                <Box ml={7} dangerouslySetInnerHTML={{ __html: comment.content }} />
              )}

              {index !== comments?.length - 1 && (
                <Divider sx={{ ml: '3rem' }} />
              )}
            </Box>
          </Box>
        ))}

      <ConfirmDeleteDialog
        title={t('deleteComment')}
        content={t('confirmDeleteComment')}
        open={dialogOpen}
        onCancel={() => setDialogOpen(false)}
        onConfirm={removeComment}
      />

      <CAlert ref={alertRef} />
    </Box>
  );
};

export default CommentList;
