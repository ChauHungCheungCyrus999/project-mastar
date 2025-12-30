import axios from 'axios';

export const fetchProjects = async () => {
  try {
    const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/projects`);
    const projects = await response.json();
    return projects;
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
};

export const fetchProject = async (projectId) => {
  try {
    const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/project/${projectId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching project:', error);
  }
};

export const createProject = async (newProject) => {
  try {
    const response = await axios.post(`${process.env.REACT_APP_SERVER_HOST}/api/project`, newProject);
    return response.data;
  } catch (error) {
    console.error('Error adding project:', error);
  }
};

export const updateProject = async (updatedProject) => {
  try {
    const response = await axios.put(`${process.env.REACT_APP_SERVER_HOST}/api/project/${updatedProject._id}`, updatedProject);
    return response.data;
  } catch (error) {
    console.error('Error updating project:', error);
    return null;
  }
};

export const deleteProject = async (projectId) => {
  try {
    await axios.delete(`${process.env.REACT_APP_SERVER_HOST}/api/project/${projectId}`);
    console.log('Project deleted successfully');
  } catch (error) {
    console.error('Failed to delete project:', error);
  }
};