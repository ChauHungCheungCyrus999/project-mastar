import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FormControl, InputLabel, Select, MenuItem, OutlinedInput, Box, Chip, ListItemIcon, ListItemText } from '@mui/material';
import axios from 'axios';
import AccountAvatar from '../AccountAvatar';

const TeamMemberSelector = ({ label, personInCharge = [], setPersonInCharge, disabled=false }) => {
  const { t } = useTranslation();
  const projectId = window.location.href.split("/")[4] ;
  const [options, setOptions] = useState([]);
  const [selectedValues, setSelectedValues] = useState([]);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/project/${projectId}`);
        const teamMembers = response.data.teamMembers;
        setOptions(teamMembers);

        // Initialize selectedValues based on personInCharge
        if (personInCharge.length > 0) {
          const initialSelectedValues = personInCharge.map(person => person?._id);
          setSelectedValues(initialSelectedValues);
        }
      } catch (error) {
        console.error('Error fetching team members:', error);
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/users`);
        setOptions(response.data);
      } catch (error) {
        console.error('Error fetching project:', error);
      }
    };  

    if (projectId !== 'undefined') {
      fetchTeamMembers();
    }
    else {
      fetchUsers();
    }
  }, [projectId]);

  const handleSelectChange = (event) => {
    const value = event.target.value;

    // Check if "All" is selected
    if (value.includes('all')) {
      // If "All" is selected, check if it was already selected
      if (selectedValues.length === options.length) {
        // If all are already selected, deselect all
        setSelectedValues([]);
        setPersonInCharge([]);
      } else {
        // Otherwise, select all options
        const allIds = options.map(option => option._id);
        setSelectedValues(allIds);
        setPersonInCharge(options);
      }
    } else {
      setSelectedValues(value);
      const selectedPersons = value.map(id => options.find(option => option._id === id));
      setPersonInCharge(selectedPersons);
    }
  };

  useEffect(() => {
    setSelectedValues(personInCharge.map(person => person?._id));
  }, [personInCharge]);

  return (
    <FormControl fullWidth margin="dense" size="small">
      <InputLabel id="teamMembers-label">{label}</InputLabel>
      <Select
        label={label}
        multiple
        fullWidth
        size="small"
        name="teamMembers"
        value={selectedValues}
        onChange={handleSelectChange}
        renderValue={(selected) => (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {selected.map((value) => {
              const selectedOption = options.find(option => option?._id === value);
              const displayValue = selectedOption
                ? `${selectedOption.firstName} ${selectedOption.lastName}`
                : '';

              return (
                <Chip
                  key={value}
                  label={displayValue}
                  size="small"
                  icon={<AccountAvatar users={selectedOption} size="small" displayPopper={true} />}
                />
              );
            })}
          </Box>
        )}
        disabled={disabled}
      >
        {/* "All" option */}
        <MenuItem value="all" dense>
          <ListItemIcon>
            <AccountAvatar users={null} size="small" displayPopper={false} />
          </ListItemIcon>
          <ListItemText>{t('all')}</ListItemText>
        </MenuItem>
        
        {options.map(option => (
          <MenuItem key={option._id} value={option._id} dense>
            <ListItemIcon>
              <AccountAvatar users={option} size="small" displayPopper={false} />
            </ListItemIcon>
            <ListItemText>{`${option.firstName} ${option.lastName}`}</ListItemText>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default TeamMemberSelector;
