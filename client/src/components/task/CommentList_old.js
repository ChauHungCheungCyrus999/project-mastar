/*
import React, { useContext, useState } from 'react';
import { Box, Typography, Button, IconButton, Tooltip, Divider } from '@mui/material';
import { Delete, Edit, Save } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import UserContext from '../../UserContext';
import RichTextArea from '../custom/RichTextArea';
import AccountAvatar from '../AccountAvatar';
import { getDaysTimeAgo } from '../../utils/DateUtils.js';

const CommentList = ({ task, comments, setComments, handleSave }) => {
  const { user } = useContext(UserContext);
  const { t, i18n } = useTranslation();
  const [editingIndex, setEditingIndex] = useState(null);
  const [newComment, setNewComment] = useState('');

  const addComment = async () => {
    if (newComment.trim()) {
      try {
        const response = await axios.post(`${process.env.REACT_APP_SERVER_HOST}/api/task/${task._id}/comment`, {
          content: newComment,
          createdBy: user._id,
        });

        setComments(response.data.comments);
        setNewComment('');
      } catch (error) {
        console.error('Error adding comment:', error);
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
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const removeComment = async (index) => {
    const comment = comments[index];
    try {
      const response = await axios.delete(`${process.env.REACT_APP_SERVER_HOST}/api/task/${task._id}/comment/${comment._id}`);

      setComments(response.data.comments);
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  return (
    <Box>
      <Typography sx={{ mt: '1rem' }}>{t('comments')}</Typography>

      {comments.map((comment, index) => (
        <Box key={index} display="flex" flexDirection="row" sx={{ mb: '1rem', alignItems: 'flex-start' }}>
          <Box flex="1">
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box style={{ display: 'flex', alignItems: 'center' }}>
                <AccountAvatar users={comment.createdBy} displayPopper={true} />
                <Box ml={2}>
                  <Typography variant="body1"><strong>{`${comment.createdBy.firstName} ${comment.createdBy.lastName}`}</strong> - {getDaysTimeAgo(comment.createdDate, t, i18n)}</Typography>
                </Box>
              </Box>

              {user._id === comment.createdBy._id && (
                <Box display="flex" mt={1}>
                  <Tooltip title={editingIndex === index ? t('save') : t('edit')}>
                    <IconButton onClick={() => editingIndex === index ? updateComment(index) : setEditingIndex(index)}>
                      {editingIndex === index ? <Save /> : <Edit />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t('delete')}>
                    <IconButton onClick={() => removeComment(index)}><Delete /></IconButton>
                  </Tooltip>
                </Box>
              )}
            </Box>

            {editingIndex === index ? (
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <AccountAvatar users={user} displayPopper={true} />
                <RichTextArea
                  description={comment.content}
                  handleDescriptionChange={(value) => handleCommentChange(index, value)}
                  height={200}
                />
              </Box>
            ) : (
              <Box ml={7} dangerouslySetInnerHTML={{ __html: comment.content }} />
            )}

            <Divider sx={{ ml: '3rem' }} />
          </Box>
        </Box>
      ))}

      <Box style={{ display: 'flex', flexDirection: 'column' }}>
        <Box display="flex" alignItems="centerTop" justifyContent="space-between">
          <AccountAvatar users={user} displayPopper={true} />
          <Box ml={2}>
            <RichTextArea
              description={newComment}
              handleDescriptionChange={setNewComment}
              height={250}
            />
          </Box>
        </Box>
        <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" onClick={addComment}>{t('leaveComment')}</Button>
        </div>
      </Box>
    </Box>
  );
};

export default CommentList;
*/

import React, { useContext, useState } from 'react';
import { Box, Typography, Button, IconButton, Tooltip, Divider } from '@mui/material';
import { Delete, Edit, Save } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import UserContext from '../../UserContext';
import RichTextArea from '../custom/RichTextArea';
import AccountAvatar from '../AccountAvatar';
import { getDaysTimeAgo } from '../../utils/DateUtils.js';

const CommentList = ({ mode, task, comments, setComments }) => {
  const { user } = useContext(UserContext);
  const { t, i18n } = useTranslation();
  const [editingIndex, setEditingIndex] = useState(null);
  const [newComment, setNewComment] = useState('');

  const addComment = async () => {
    if (newComment.trim()) {
      try {
        await axios.post(`${process.env.REACT_APP_SERVER_HOST}/api/task/${task._id}/comment`, {
          content: newComment,
          createdBy: user._id
        });

        // Fetch updated comments
        const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/task/${task._id}/comments`);
        setComments(response.data);
        setNewComment('');
      } catch (error) {
        console.error('Error adding comment:', error);
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
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const removeComment = async (index) => {
    const comment = comments[index];
    try {
      const response = await axios.delete(`${process.env.REACT_APP_SERVER_HOST}/api/task/${task._id}/comment/${comment._id}`);
      setComments(response.data.comments);
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleCommentChange = (index, value) => {
    const updatedComments = [...comments];
    updatedComments[index].content = value;
    updatedComments[index].updatedDate = new Date();
    setComments(updatedComments);
  };

  return (
    <Box>
      <Typography sx={{ mb: '1rem' }}>{t('comments')}</Typography>

      {mode==="edit" && (
        <Box style={{ display: 'flex', flexDirection: 'column' }}>
          <Box display="flex" alignItems="centerTop" justifyContent="space-between">
            <AccountAvatar users={user} displayPopper={true} />
            <Box ml={2}>
              <RichTextArea
                description={newComment}
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

      {comments.length !== 0 && (
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

              {user._id === comment.createdBy._id && mode==="edit" && (
                <Box display="flex" mt={1}>
                  <Tooltip title={editingIndex === index ? t('save') : t('edit')}>
                    <IconButton onClick={() => editingIndex === index ? updateComment(index) : setEditingIndex(index)}>
                      {editingIndex === index ? <Save /> : <Edit />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t('delete')}>
                    <IconButton onClick={() => removeComment(index)}><Delete /></IconButton>
                  </Tooltip>
                </Box>
              )}
            </Box>

            {editingIndex === index ? (
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <AccountAvatar users={user} displayPopper={true} />
                <RichTextArea
                  description={comment.content}
                  handleDescriptionChange={(value) => handleCommentChange(index, value)}
                  height={200}
                />
              </Box>
            ) : (
              <Box ml={7} dangerouslySetInnerHTML={{ __html: comment.content }} />
            )}

            {index !== comments.length -1 && (
              <Divider sx={{ ml: '3rem' }} />
            )}
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default CommentList;