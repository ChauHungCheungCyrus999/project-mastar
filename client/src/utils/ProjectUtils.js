import axios from 'axios';

// Close Project Edit Form
export const handleCloseEditForm = (setEditedProject, setEditFormOpen) => {
  /*if (reason && reason === "backdropClick")
    return;*/
  setEditedProject(null);
  setEditFormOpen(false);
};


// Create Project
export const handleCreate = async (newProject, setProjects) => {
  try {
    const response = await axios.post(`${process.env.REACT_APP_SERVER_HOST}/api/project`, newProject);
    setProjects((prevProjects) => [...prevProjects, response.data]);
  } catch (error) {
    console.error('Error adding project:', error);
  }
};

// Update/Duplicate Project
export const handleEdit = (projectId, mode, projects, setMode, setEditedProject, setEditFormOpen) => {
  /*if (mode === 'update' || mode === 'duplicate') {
    setMode(mode);*/
    const projectToEdit = projects.find((project) => project._id === projectId);
    if (projectToEdit) {
      setEditedProject(projectToEdit);
      setEditFormOpen(true);
    }
  //}
};

export const handleSaveProject = async (updatedProject, projects, setProjects) => {
  try {
    const response = await axios.put(`${process.env.REACT_APP_SERVER_HOST}/api/project/${updatedProject._id}`, updatedProject);
    const updatedProjects = projects.map((project) =>
      project._id === updatedProject._id ? response.data : project
    );
    setProjects(updatedProjects);
    //handleCloseForm();
  } catch (error) {
    console.error('Error updating project:', error);
  }
};

/*export const handleDuplicate = async (duplicatedProject, setProjects, setEditFormOpen) => {
  //console.log("duplicatedProject = " + JSON.stringify(duplicatedProject));
  delete duplicatedProject._id;
  duplicatedProject.createdDate = new Date();
  duplicatedProject.updatedDate = new Date();
  try {
    const response = await axios.post(`${process.env.REACT_APP_SERVER_HOST}/api/project`, duplicatedProject);
    setProjects((prevProjects) => [...prevProjects, response.data]);
  } catch (error) {
    console.error('Error adding project:', error);
  }
  setEditFormOpen(false);
};*/


// Delete Project
export const handleDelete = (projectId, setOpenConfirmDeleteDialog, setProjectToDelete) => {
  setOpenConfirmDeleteDialog(true);
  setProjectToDelete(projectId);
};

export const confirmDelete = async (projectId, setProjects, setOpenConfirmDeleteDialog) => {
  try {
    await axios.delete(`${process.env.REACT_APP_SERVER_HOST}/api/project/${projectId}`);
    setProjects((prevProjects) => prevProjects.filter((project) => project._id !== projectId));
  } catch (error) {
    console.error('Error deleting project:', error);
  }
  console.log("Deleted project: " + projectId);
  setOpenConfirmDeleteDialog(false);
};

export const cancelDelete = (setOpenConfirmDeleteDialog) => {
  setOpenConfirmDeleteDialog(false);
};

