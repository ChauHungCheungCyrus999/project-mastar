import axios from 'axios';

// Close Task Edit Form
export const handleCloseEditForm = (setEditedTask, setEditFormOpen) => {
  setEditedTask(null);
  setEditFormOpen(false);
};


// Update/Duplicate Task
export const handleEdit = (taskId, mode, tasks, setMode, setEditedTask, setEditFormOpen) => {
  if (mode === 'update' || mode === 'duplicate') {
    setMode(mode);
    const taskToEdit = tasks.find((task) => task._id === taskId);
    if (taskToEdit) {
      setEditedTask(taskToEdit);
      setEditFormOpen(true);
    }
  }
};

export const handleSaveTask = async (updatedTask, tasks, setTasks) => {
  try {
    const response = await axios.put(`${process.env.REACT_APP_SERVER_HOST}/api/task/${updatedTask._id}`, updatedTask);
    const updatedTasks = tasks.map((task) =>
      task._id === updatedTask._id ? response.data : task
    );
    setTasks(updatedTasks);
    //handleCloseForm();
  } catch (error) {
    console.error('Error updating task:', error);
  }
};

export const handleDuplicate = async (duplicatedTask, setTasks, setEditFormOpen) => {
  //console.log("duplicatedTask = " + JSON.stringify(duplicatedTask));
  delete duplicatedTask._id;
  duplicatedTask.createdDate = new Date();
  duplicatedTask.updatedDate = new Date();
  try {
    const response = await axios.post(`${process.env.REACT_APP_SERVER_HOST}/api/task`, duplicatedTask);
    setTasks((prevTasks) => [...prevTasks, response.data]);
  } catch (error) {
    console.error('Error adding task:', error);
  }
  setEditFormOpen(false);
};


// Delete Task
export const handleDelete = (taskId, setOpenConfirmDeleteDialog, setTaskToDelete) => {
  setOpenConfirmDeleteDialog(true);
  setTaskToDelete(taskId);
};

export const confirmDelete = async (taskToDelete, setTasks, setOpenConfirmDeleteDialog) => {
  try {
    await axios.delete(`${process.env.REACT_APP_SERVER_HOST}/api/task/${taskToDelete}`);
    setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskToDelete));
  } catch (error) {
    console.error('Error deleting task:', error);
  }
  console.log("Deleted task: " + taskToDelete);
  setOpenConfirmDeleteDialog(false);
};

export const cancelDelete = (setOpenConfirmDeleteDialog) => {
  setOpenConfirmDeleteDialog(false);
};


// Mark as Completed
export const handleMarkAsCompleted = async (taskId, tasks, setTasks, user, status) => {
  try {
    const response = await axios.put(`${process.env.REACT_APP_SERVER_HOST}/api/task/${taskId}/status`, { status: status, updatedBy: user._id });
    const updatedTasks = tasks.map((task) =>
      task._id === taskId ? { ...task, status: status } : task
    );
    setTasks(updatedTasks);
  } catch (error) {
    console.error('Error updating task:', error);
  }
}