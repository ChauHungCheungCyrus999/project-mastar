import React, { useContext, useState, useEffect, useRef } from 'react';
import {
  TextField, Chip, MenuItem, OutlinedInput, Autocomplete, InputLabel, Select, IconButton, Typography,
  Box,
  Stepper, Step, StepLabel,
  FormControl
} from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import axios from 'axios';

import SimpleColorPicker from '../SimpleColorPicker';

import { draftToHtmlContent } from '../../utils/RichTextUtils';

import { useTranslation } from 'react-i18next';

import { initUsers } from '../init/InitUsers';

import CDialog from '../custom/CDialog';
import RichTextArea from '../custom/RichTextArea';
import CAlert from '../custom/CAlert';

import UserContext from '../../UserContext';

const ProjectCreateForm = ({ open, handleClose, handleAddProject }) => {
  const { user, setUser } = useContext(UserContext);

  const { t } = useTranslation();

  const [activeStep, setActiveStep] = useState(0);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [teamMembers, setTeamMembers] = useState([
    {
      _id: user._id,
      name: user.firstName + ' ' + user.lastName,
      role: 'Project Manager',
    },
  ]);
  const [teamMemberOptions, setTeamMemberOptions] = useState(
    []
    /*initUsers().map((user) => ({
      _id: user._id,
      name: `${user.firstName} ${user.lastName}`,
    }))*/
  );
  const [color, setColor] = useState('transparent');
  const [createdBy, setCreatedBy] = useState(user._id);
  const [createdDate, setCreatedDate] = useState(new Date());
  const [updatedBy, setUpdatedBy] = useState(user._id);
  const [updatedDate, setUpdatedDate] = useState(new Date());

  const [roles, setRoles] = useState([]);

  // Alert
  const alertRef = useRef();

  const [error, setError] = useState(false);

  /*useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/users`);
        const users = response.data;
        if (users) {
          const formattedOptions = users.map((user) => ({
            _id: user._id,
            name: `${user.firstName} ${user.lastName}`
          }));
          setTeamMemberOptions(formattedOptions);
        }
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };

    fetchUsers();
  }, []);*/

  /* Seach teamMembers options when user typing */
  const [searchValue, setSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  useEffect(() => {
    if (searchValue) {
      const fetchUsers = async () => {
        try {
          const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/users/search?keywords=${searchValue}`);
          const users = response.data;
          if (users) {
            const formattedOptions = users.map((user) => ({
              _id: user._id,
              name: `${user.firstName} ${user.lastName}`,
              email: user.email
            }));
            console.log("search users = " + JSON.stringify(users));
            setSearchResults(formattedOptions);
          }
        } catch (error) {
          console.error('Failed to fetch users:', error);
        }
      };

      fetchUsers();
    } else {
      setSearchResults([]);
    }
  }, [searchValue]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/roles`);
        setRoles(response.data.filter((role) => role.name !== "Administrator"));
      } catch (error) {
        console.error('Error fetching roles:', error);
      }
    };

    fetchRoles();
  }, []);


  // Stepper
  const handleNext = () => {
    if (activeStep === 0 && !title) {
      setError(true);
      return;
    } else {
      setError(false);
    }

    setActiveStep(activeStep + 1);
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  
  const handleSubmit = (e) => {
    e.preventDefault();
  
    // Check if there is at least one Project Manager
    const hasProjectManager = teamMembers.some(
      (member) => member.role === 'Project Manager'
    );
  
    if (!hasProjectManager) {
      alertRef.current.displayAlert('error', t('atLeastOneProjectManager'));
      return;
    }

    if (activeStep === 1) {
      const hasMissingRole = teamMembers.some((member) => !member.role);
      if (hasMissingRole) {
        alertRef.current.displayAlert('error', t('selectRoles'));
        return;
      }
    }
  
    const teamMembersWithRole = teamMembers.map((member) => ({
      _id: member._id,
      role: member.role,
    }));
  
    const newProject = {
      title,
      description,
      teamMembers: teamMembersWithRole,
      color,
      createdBy: user._id,
      createdDate,
      updatedBy: user._id,
      updatedDate,
    };
  
    console.log('Project Created =', JSON.stringify(newProject));
  
    handleAddProject(newProject);
    alertRef.current.displayAlert('success', t('createSuccess'));
  
    setTitle('');
    setDescription('');
    setTeamMembers([
      {
        _id: user._id,
        name: user.firstName + ' ' + user.lastName,
        role: 'Project Manager',
      },
    ]);
    setColor('');
    setCreatedBy(user._id);
    setCreatedDate(new Date());
    setUpdatedBy(user._id);
    setUpdatedDate(new Date());
    setActiveStep(0);
  
    handleClose();
  };

  // Change color of project card
  const handleColor = (updatedColor) => {
    setColor(updatedColor.hex);
  };

  /*const searchOptions = (inputValue) => {
    return teamMemberOptions.filter(
      (option) =>
        option.name.toLowerCase().includes(inputValue.toLowerCase()) &&
        !teamMembers.some((member) => member._id === option._id)
    );
  };*/
  const searchOptions = (inputValue) => {
    return searchResults.filter((option) => {
      const fullName = option.name.toLowerCase();
      const email = option.email;
      const searchInput = inputValue.toLowerCase();
      const isAlreadySelected = teamMembers.some(
        (member) => member._id === option._id
      );
      return (
        (fullName.includes(searchInput) || email.includes(searchInput)) &&
        !isAlreadySelected &&
        option.name !== "Bubbles Chu"
      );
    });
  };

  const handleRemoveTeamMember = (userId) => {
    const updatedMembers = teamMembers.filter(
      (member) => member._id !== userId
    );
    setTeamMembers(updatedMembers);
  };


  const handleRoleChange = (userId, role) => {
    setTeamMembers((prevMembers) =>
      prevMembers.map((member) =>
        member._id === userId ? { ...member, role } : member
      )
    );
  };

  // Rich Text Description
  const handleDescriptionChange = (value) => {
    setDescription(draftToHtmlContent(value));
  };

  return (
    <>
      <CDialog
        mode="create"
        item="project"
        open={open}
        onClose={handleClose}
        handleSubmit={handleSubmit}
        title={t('createProject')}
        activeStep={activeStep}
        totalStep={2}
        handleBack={handleBack}
        handleNext={handleNext}
      >
        <Stepper activeStep={activeStep} sx={{ mb: '2rem' }}>
          <Step>
            <StepLabel>{t('projectInfo')}</StepLabel>
          </Step>
          <Step>
            <StepLabel>{t('teamMembersSetup')}</StepLabel>
          </Step>
        </Stepper>

        {activeStep === 0 && (
          <>
            <Typography color="text.secondary" sx={{ flex: '0 0 auto' }}>{t('color')}</Typography>
            <SimpleColorPicker handleColor={handleColor} displayPreviousColor={false} />

            <TextField
              label={t('projectTitle')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              error={title === '' && error}
              fullWidth
              margin="dense"
              size="small"
              required
              sx={{ mt:'1rem' }}
            />

            <InputLabel id="description-label" sx={{ mt: '1rem' }}>{t('description')}</InputLabel>
            <RichTextArea
              description=""
              handleDescriptionChange={handleDescriptionChange}
            />
          </>
        )}

        {activeStep === 1 && (
          <>
            <InputLabel id="team-members-label">{t('teamMembers')}</InputLabel>

            <Box display="flex" alignItems="center" marginBottom={2}>
              <Autocomplete
                multiple
                fullWidth
                id="team-members-label"
                value={teamMembers}
                onChange={(event, newValue) => setTeamMembers(newValue)}
                options={teamMemberOptions}
                getOptionLabel={(option) => option.name}
                filterOptions={(options, state) => searchOptions(state.inputValue)}
                disableClearable
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    size="small"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Backspace') {
                        event.stopPropagation();
                      }
                    }}
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      key={option._id}
                      label={option.name}
                      {...getTagProps({ index })}
                      color="primary"
                      size="small"
                      //deleteIcon={option._id === user._id ? <CancelIcon style={{ display: 'none' }} /> : <CancelIcon style={{ display: 'block' }} />}
                      deleteIcon={<CancelIcon style={{ display: 'none' }} />}
                    />
                  ))
                }
              />
            </Box>

            {teamMembers.length >= 1 && (
              <Box marginBottom={2}>
                <InputLabel>{t('role')}</InputLabel>
                {teamMembers.map((member) => (
                  <Box
                    key={member._id}
                    display="flex"
                    alignItems="center"
                    marginBottom={1}
                  >
                    <Chip
                      label={member.name}
                      color="primary"
                      size="small"
                      sx={{ mr: '8px' }}
                    />
                    {member._id === user._id ? (
                      <TextField fullWidth size="small" value="Project Manager" disabled />
                    ) : (
                      <>
                        <FormControl variant="outlined" size="small" fullWidth>
                          {/*<InputLabel id={`role-label-${member._id}`}>
                            {t('role')}
                          </InputLabel>*/}
                          <Select
                            value={member.role}
                            onChange={(e) => handleRoleChange(member._id, e.target.value)}
                          >
                            {roles.map((role) => (
                              <MenuItem key={role.name} value={role.name}>
                                {role.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        {member._id !== user._id && (
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveTeamMember(member._id)}
                          >
                            <RemoveCircleOutlineIcon />
                          </IconButton>
                        )}
                      </>
                    )}
                  </Box>
                ))}
              </Box>
            )}
          </>
        )}
      </CDialog>

      <CAlert ref={alertRef} />
    </>
  );
};

export default ProjectCreateForm;