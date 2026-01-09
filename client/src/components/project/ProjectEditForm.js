import React, { useContext, useState, useEffect, useRef } from 'react';
import {
  Typography, TextField, Autocomplete, OutlinedInput, Select , Chip, MenuItem, InputLabel, IconButton,
  Box, Grid,
  FormControl,
  Stepper, Step, StepLabel,
} from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import axios from 'axios';

import SimpleColorPicker from '../SimpleColorPicker';

import { htmlToDraftContent, draftToHtmlContent } from '../../utils/RichTextUtils';

import { useTranslation } from 'react-i18next';

import { initUsers } from "../init/InitUsers";

import CDialog from '../custom/CDialog';
import RichTextArea from '../custom/RichTextArea';
import CAlert from '../custom/CAlert';

import { formatDate } from '../../utils/DateUtils';

import UserContext from '../../UserContext';

import { fetchUser } from '../../database/UserController';

const ProjectEditForm = ({ project, open, handleClose, handleSave }) => {
  const { user, setUser } = useContext(UserContext);

  const { t } = useTranslation();

  const [activeStep, setActiveStep] = useState(0);

  const [editedProject, setEditedProject] = useState(project);
  const [description, setDescription] = useState();
  const [teamMemberOptions, setTeamMemberOptions] = useState(
    []
    /*initUsers().map((user) => ({
    _id: user._id,
    name: user.firstName + " " + user.lastName
    }))*/
  );

  const [roles, setRoles] = useState([]);

  // Alert
  const alertRef = useRef();

  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/users`);
        const users = response.data;
        //console.log("users = " + users);
        if (users) {
          const formattedOptions = users
          //.filter((user) => user._id === user._id)
          .map(user => ({
            _id: user._id,
            name: `${user.firstName} ${user.lastName}`,
            role: user.role  // Add the role attribute
          }));
          console.log("formattedOptions = " + JSON.stringify(formattedOptions));
          setTeamMemberOptions(formattedOptions);
        }
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/roles`);
        setRoles(response.data);
      } catch (error) {
        console.error('Error fetching roles:', error);
      }
    };

    fetchRoles();
  }, []);

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


  /*const fetchTeamMembers = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/project/${project._id}`);
      const teamMembers = response.data.teamMembers;
      if (teamMembers) {
        const formattedOptions = teamMembers.map(member => ({
          _id: member._id,
          name: `${member.firstName} ${member.lastName}`,
          role: member.role
        }));
        setTeamMemberOptions(formattedOptions);
      }
    } catch (error) {
      console.error('Failed to fetch team members:', error);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);*/

  useEffect(() => {
    const updateTeamMembers = async () => {
      if (editedProject.teamMembers) {
        const userPromises = editedProject.teamMembers.map(async (teamMember) => {
          try {
            const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/project/${project._id}/teamMember/${teamMember._id}`);
            const user = response.data;
            return { _id: user._id, name: `${user.firstName} ${user.lastName}`, role: user.role };
          } catch (error) {
            console.error(`Failed to fetch user with ID ${teamMember._id}:`, error);
            return { _id: teamMember._id, name: 'Unknown User', role: 'Unknown Role' };
          }
        });

        const updatedTeamMemberOptions = await Promise.all(userPromises);

        const updatedTeamMembers = editedProject.teamMembers.map((teamMember, index) => {
          const updatedName = updatedTeamMemberOptions[index].name;
          return { ...teamMember, name: updatedName };
        });

        setTeamMemberOptions(updatedTeamMemberOptions);
        setEditedProject((prevProject) => ({
          ...prevProject,
          teamMembers: updatedTeamMembers,
        }));
      }
    };

    updateTeamMembers();
  }, []);


  // Stepper
  const handleNext = () => {
    if (activeStep === 0 && !editedProject.title) {
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


  // Rich Text Description
  const [initialized, setInitialized] = useState(false);
  useEffect(() => {
    if (!initialized) {
      setDescription(htmlToDraftContent(project.description));
      setInitialized(true);
    }
  }, [initialized, htmlToDraftContent(project.description)]);

  const handleDescriptionChange = (value) => {
    //console.log("draftToHtmlContent(value) = " + draftToHtmlContent(value));

    const updatedProject = {
      ...editedProject,
      description: draftToHtmlContent(value)
    };
    
    setEditedProject(updatedProject);
    //console.log("editedProject = " + JSON.stringify(editedProject));
  };

  const handleChange = (event) => {
    if (event && event.target) {
      const { name, value } = event.target;
      setEditedProject((prevProject) => ({
        ...prevProject,
        [name]: value,
      }));
    }
  };

  const handleTeamMembersChange = (event, value) => {
    const selectedTeamMembers = value.map(item => {
      // Check if this member already exists in the editedProject.teamMembers
      const existingMember = editedProject.teamMembers.find(member => member._id === item._id);
      
      return {
        _id: item._id,
        name: item.name,
        // If the member already exists, keep their current role; otherwise set default
        role: existingMember ? existingMember.role : (item._id === user._id ? "Project Manager" : "Team Member")
      };
    });
    setEditedProject(prevProject => ({
      ...prevProject,
      teamMembers: selectedTeamMembers
    }));
    
    const selectedTeamMemberIds = selectedTeamMembers.map(member => member._id);
    const updatedTeamMemberOptions = teamMemberOptions.filter(option => selectedTeamMemberIds.includes(option._id));
    setTeamMemberOptions(updatedTeamMemberOptions);
  };

  const handleSubmit = () => {
    if (!editedProject.title) {
      setError(true);
      return;
    }
    else {
      setError(false);
    }

    const updatedProject = {
      ...editedProject,
      updatedBy: user._id,
      updatedDate: new Date(),
    };

    // Check if there is at least one Project Manager
    const hasProjectManager = editedProject.teamMembers.some(
      (member) => member.role === 'Project Manager'
    );
  
    if (!hasProjectManager) {
      alertRef.current.displayAlert('error', t('atLeastOneProjectManager'));
      return;
    }

    if (activeStep === 1) {
      const hasMissingRole = editedProject.teamMembers.some((member) => !member.role);
      if (hasMissingRole) {
        alertRef.current.displayAlert('error', t('selectRoles'));
        return;
      }
    }

    console.log("Updated Project = " + JSON.stringify(updatedProject));
    handleSave(updatedProject);
    alertRef.current.displayAlert('success', t('saveSuccess'));
    //handleClose();
  };

  // Change color of project card
  const handleColor = (updatedColor) => {
    editedProject.color = updatedColor.hex;
  };

  // User Role
  /*const searchOptions = (inputValue) => {
    return teamMemberOptions.filter(
      (option) =>
        option.name.toLowerCase().includes(inputValue.toLowerCase()) &&
        !editedProject.teamMembers.some((member) => member._id === option._id)
    );
  };*/
  const searchOptions = (inputValue) => {
    return searchResults.filter((option) => {
      const fullName = option.name.toLowerCase();
      const email = option.email;
      const searchInput = inputValue.toLowerCase();
      const isAlreadySelected = editedProject.teamMembers.some(
        (member) => member._id === option._id
      );
      return (
        (fullName.includes(searchInput) || email.includes(searchInput)) &&
        !isAlreadySelected &&
        option.email !== process.env.REACT_APP_ADMIN_EMAIL
      );
    });
  };

  const handleRemoveTeamMember = (userId) => {
    const updatedMembers = editedProject.teamMembers.filter(
      (member) => member._id !== userId
    );
  
    // Update teamMemberOptions by removing the corresponding member
    const updatedOptions = teamMemberOptions.filter(
      (option) => option._id !== userId
    );
  
    setEditedProject((prevProject) => ({
      ...prevProject,
      teamMembers: updatedMembers
    }));
  
    // Update teamMemberOptions state
    setTeamMemberOptions(updatedOptions);
  };

  const handleRoleChange = (userId, role) => {
    setEditedProject((prevProject) => ({
      ...prevProject,
      teamMembers: prevProject.teamMembers.map((member) =>
        member._id === userId ? { ...member, role } : member
      ),
    }));
  };

  return (
    <>
      <CDialog
        mode="update"
        item="project"
        open={open}
        onClose={handleClose}
        handleSubmit={handleSubmit}
        title={`${t('editProject')} - ${project.title}`}
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
            <SimpleColorPicker color={project.color} handleColor={handleColor} displayPreviousColor={false} />

            <TextField
              label={t('projectTitle')}
              name="title"
              value={editedProject.title}
              onChange={handleChange}
              error={editedProject.title === '' && error}
              fullWidth
              margin="dense"
              size="small"
              required
              sx={{ mt:'1rem' }}
            />

            <InputLabel id="description-label" sx={{ mt: '1rem' }}>{t('description')}</InputLabel>
            <RichTextArea
              description={description}
              handleDescriptionChange={handleDescriptionChange}
            />

            <Grid container spacing={2} sx={{ mt:'0.1rem' }}>
              <Grid item xs={6}>
                <TextField
                  label={t('createdBy')}
                  name="createdBy"
                  value={editedProject.createdBy ? editedProject.createdBy.firstName + ' ' + editedProject.createdBy.lastName : 'Unknown'}
                  fullWidth
                  margin="dense"
                  size="small"
                  disabled
                />
                <TextField
                  label={t('updatedBy')}
                  name="updatedBy"
                  value={editedProject.updatedBy ? editedProject.updatedBy.firstName + ' ' + editedProject.updatedBy.lastName : 'Unknown'}
                  fullWidth
                  margin="dense"
                  size="small"
                  disabled
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label={t('createdDate')}
                  name="createdDate"
                  value={formatDate(editedProject.createdDate)}
                  fullWidth
                  margin="dense"
                  size="small"
                  disabled
                />
                <TextField
                  label={t('updatedDate')}
                  name="updatedDate"
                  value={formatDate(editedProject.updatedDate)}
                  fullWidth
                  margin="dense"
                  size="small"
                  disabled
                />
              </Grid>
            </Grid>
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
                value={editedProject.teamMembers}
                onChange={handleTeamMembersChange}
                options={searchResults}
                getOptionLabel={(option) => option.name}
                filterOptions={(options, state) =>
                  searchOptions(state.inputValue)
                }
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
                      deleteIcon={<CancelIcon style={{ display: 'none' }} />}
                    />
                  ))
                }
              />
            </Box>

            {editedProject.teamMembers && editedProject.teamMembers.length >= 1 && (
              <Box marginBottom={2}>
                <InputLabel>{t('role')}</InputLabel>
                {editedProject.teamMembers.map((member) => (
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
                    <>
                      <FormControl variant="outlined" size="small" fullWidth>
                        {/*<InputLabel id={`role-label-${member._id}`}>
                          {t('role')}
                        </InputLabel>*/}
                        <Select
                          value={member.role}
                          onChange={(e) => handleRoleChange(member._id, e.target.value)}
                        >
                          {roles.filter((role) => role.name !== 'Administrator').map((role) => (
                            <MenuItem key={role.name} value={role.name}>
                              {role.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                        <IconButton
                        size="small"
                        onClick={() => handleRemoveTeamMember(member._id)}
                      >
                        <RemoveCircleOutlineIcon />
                      </IconButton>
                    </>
                    {/*<Select
                      value={member.role}
                      onChange={(e) =>
                        handleRoleChange(member._id, e.target.value)
                      }
                      input={<OutlinedInput />}
                      fullWidth
                      size="small"
                    >
                      <MenuItem value="Project Manager">{t('projectManager')}</MenuItem>
                      <MenuItem value="Team Member">{t('teamMember')}</MenuItem>
                      <MenuItem value="Stakeholder">{t('stakeholder')}</MenuItem>
                    </Select>*/}
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

export default ProjectEditForm;