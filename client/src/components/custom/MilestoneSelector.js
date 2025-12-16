import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FormControl, InputLabel, Select, MenuItem, IconButton } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import axios from 'axios';
import MilestoneFlag from '../MilestoneFlag';

const MilestoneSelector = ({ projectId, milestone = "", setMilestone, disabled=false }) => {
  const { t } = useTranslation();

  const [options, setOptions] = useState([]);
  const [selectedValue, setSelectedValue] = useState(milestone);

  useEffect(() => {
    const fetchMilestones = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/milestones/project/${projectId}/active`);
        setOptions(response.data);
        const storedMilestone = localStorage.getItem('selectedMilestone');
        if (storedMilestone) {
          setSelectedValue(JSON.parse(storedMilestone));
          setMilestone(JSON.parse(storedMilestone));
        } else if (milestone) {
          setSelectedValue(milestone);
        }
      } catch (error) {
        console.error('Error fetching milestones:', error);
      }
    };

    if (projectId) {
      fetchMilestones();
    }
  }, [projectId, milestone, setMilestone]);

  const handleSelectChange = (event) => {
    const selected = options.find(option => option._id === event.target.value);
    setSelectedValue(selected);
    setMilestone(selected);
    //localStorage.setItem('selectedMilestone', JSON.stringify(selected));
  };

  const handleClearSelection = () => {
    setSelectedValue(null);
    setMilestone(null);
    //localStorage.removeItem('selectedMilestone');
  };

  return (
    <FormControl fullWidth margin="dense" size="small">
      <InputLabel id="milestone-label">{t('milestone')}</InputLabel>
      <Select
        label={t('milestone')}
        fullWidth
        size="small"
        name="milestone"
        value={selectedValue?._id || ''}
        onChange={handleSelectChange}
        endAdornment={
          selectedValue && (
            <IconButton onClick={handleClearSelection} size="small" style={{ display: disabled? 'none':'flex' }}>
              <ClearIcon />
            </IconButton>
          )
        }
        sx={{
          minWidth: 200, // Ensures enough space for the content
          width: 'auto', // Adjusts to the content width dynamically
        }}
        disabled={disabled}
      >
        <MenuItem value="">
          <em>{t('none')}</em>
        </MenuItem>
        {options.map((option) => (
          <MenuItem key={option._id} value={option._id} dense>
            <MilestoneFlag milestone={option} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default MilestoneSelector;
