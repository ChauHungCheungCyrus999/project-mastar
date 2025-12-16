import axios from 'axios';

export const fetchTasks = async (projectId) => {
  try {
    const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/tasks/project/${projectId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching tasks:', error);
  }
}

export const updateTask = async (updatedTask) => {
  try {
    const response = await axios.put(`${process.env.REACT_APP_SERVER_HOST}/api/task/${updatedTask._id}`, updatedTask);
    return response.data;
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

export const deleteTask = async (taskId) => {
  try {
    await axios.delete(`${process.env.REACT_APP_SERVER_HOST}/api/task/${taskId}`);
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};

export const createTask = async (newTask) => {
  try {
    const response = await axios.post(`${process.env.REACT_APP_SERVER_HOST}/api/task`, newTask);
    return response.data;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};