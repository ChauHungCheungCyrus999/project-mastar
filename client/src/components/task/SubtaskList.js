import React from 'react';
import { Box, InputLabel, TextField, Checkbox, FormControlLabel, Button, IconButton, Tooltip, Typography } from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const SubtaskList = ({ mode, subtasks, setSubtasks }) => {
  const { t } = useTranslation();

  const handleAddSubtask = () => {
    setSubtasks([...subtasks, { name: '', completed: false }]);
  };

  const handleSubtaskChange = (index, field, value) => {
    const updatedSubtasks = [...subtasks];
    updatedSubtasks[index][field] = value;
    setSubtasks(updatedSubtasks);
  };

  const handleRemoveSubtask = (index) => {
    const updatedSubtasks = subtasks.filter((_, i) => i !== index);
    setSubtasks(updatedSubtasks);
  };
  
  //console.log('mode = ' + mode);

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        {(mode === "edit" || subtasks.length !== 0) && (
          <InputLabel id="subtasks-label">{t('subtasks')}</InputLabel>
        )}

        {mode === "edit" && (
          <Tooltip title={t('addSubtask')}>
            <Button variant="contained" size="small" startIcon={<Add />} onClick={handleAddSubtask}>
              {t('addSubtask')}
            </Button>
          </Tooltip>
        )}
      </Box>

      {mode === "edit" ? (
        subtasks.map((subtask, index) => (
          <Box key={index} display="flex" alignItems="center">
            <FormControlLabel
              control={
                <Tooltip title={subtask.completed ? t('completed') : t('incompleted')}>
                  <Checkbox
                    checked={subtask.completed}
                    onChange={(e) => handleSubtaskChange(index, 'completed', e.target.checked)}
                  />
                </Tooltip>
              }
            />
            <TextField
              value={subtask.name}
              onChange={(e) => handleSubtaskChange(index, 'name', e.target.value)}
              fullWidth
              margin="dense"
              size="small"
            />
            <Tooltip title={t('delete')}>
              <IconButton onClick={() => handleRemoveSubtask(index)}><Delete /></IconButton>
            </Tooltip>
          </Box>
        ))
      ) : (
        <Box mt={1}>
          {subtasks.map((subtask, index) => (
            <Box key={index} display="flex" alignItems="center">
              <Checkbox
                checked={subtask.completed}
                disabled
              />
              <Typography variant="body1">{subtask.name}</Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default SubtaskList;