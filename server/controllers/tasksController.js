const path = require('path');
const fs = require('fs');

const Task = require('../models/task');
const Project = require('../models/project');
const Milestone = require('../models/milestone');
const User = require('../models/user');
const Role = require('../models/role');
const Notification = require('../models/notification');

const { usersio } = require('../socketio');
const webpush = require('web-push');

const sendNotification = async (person, notificationPayload) => {
  if (person.subscription) {
    try {
      await webpush.sendNotification(person.subscription, notificationPayload);
      console.log(`Notification sent to ${person._id}`);
    } catch (error) {
      console.error(`Error sending notification to ${person._id}:`, error);
      // Handle specific error cases, e.g., remove invalid subscription
    }
  } else {
    console.warn(`No subscription found for user ${person._id}`);
  }
};

// Create a new task
exports.createTask = async (req, res) => {
  try {
    const taskData = req.body;
    const currentUserId = req.body.createdBy;

    // Attach file URLs if provided
    if (req.files && req.files.attachments) {
      const fileUrls = req.files.attachments.map(file => `/uploads/${file.filename}`);
      taskData.attachments = fileUrls;
    }

    const task = await Task.create(taskData);

    // Fetch the full user objects for personInCharge
    const personInCharge = await User.find({
      _id: { $in: task.personInCharge }
    });

    // Replace the personInCharge field with the full user objects
    task.personInCharge = personInCharge;

    // Send the response once the task is created and user objects are fetched
    res.status(201).json(task);

    // Notification
    const project = await Project.findById(task.project);

    for (const person of task.personInCharge) {
      if (person._id.toString() !== currentUserId.toString()) {
        try {
          const notification = await Notification.create({
            user: person._id,
            type: "Create Task",
            title: {
              enUS: project.title,
              zhHK: project.title,
              zhCN: project.title
            },
            description: {
              enUS: `The task "${task.taskName}" is assigned to you.`,
              zhHK: `任務「${task.taskName}」已指派給您。`,
              zhCN: `任务「${task.taskName}」已分配给您。`
            },
            link: `/project/${task.project}/task/${task._id}`,
            read: false,
          });

          // Check if `usersio` and the specific user socket are defined
          if (usersio && usersio[person._id]) {
            usersio[person._id].emit('notification', notification);
          } else {
            console.warn(`No active socket connection for user ${person._id}`);
          }

          // Send web push notification
          if (person.subscription) {
            const personInCharge = await User.findById(person._id);
            
            if (personInCharge) {
              sendNotification(personInCharge, JSON.stringify({
                title: 'New Task Assigned',
                body: `The task "${task.taskName}" is assigned to you.`,
                link: `/project/${task.project}/task/${task._id}`
              }));
            }
          }
          else {
            console.warn(`No subscription found for user ${person._id}. Check if the subscription is correctly stored in the database.`);
          }
        } catch (notificationError) {
          console.error(`Error creating notification for user ${person._id}:`, notificationError);
        }
      }
    }
  } catch (error) {
    console.error('Error creating task:', error);

    // Only send the error response if headers haven't been sent yet
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to create task' });
    }
  }
};

// Get all tasks
exports.getAllTasks = async (req, res) => {
  try {
    // Find all tasks and populate the required fields
    const tasks = await Task.find()
      .populate('personInCharge', 'firstName lastName email phone organization department jobTitle') // Populate the personInCharge field with user data
      .populate('milestone')
      .populate('tags')
      .populate('createdBy', 'firstName lastName') // Populate the createdBy field with user data
      .populate('updatedBy', 'firstName lastName') // Populate the updatedBy field with user data
      .populate({
        path: 'comments.createdBy',
        select: 'firstName lastName email phone organization department jobTitle'
      });

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

exports.getTaskById = async (req, res) => {
  const taskId = req.params.id;
  try {
    // Find the task by ID and populate the required fields
    const task = await Task.findById(taskId)
      .populate('personInCharge', 'firstName lastName email phone organization department jobTitle') // Populate the personInCharge field with user data
      .populate('milestone')
      .populate('tags')
      .populate('createdBy', 'firstName lastName email') // Populate the createdBy field with user data
      .populate('updatedBy', 'firstName lastName email') // Populate the updatedBy field with user data
      .populate({
        path: 'comments.createdBy',
        select: 'firstName lastName email phone organization department jobTitle'
      })
      .populate('project');

    if (task) {
      res.status(200).json(task);
    } else {
      res.status(404).json({ error: 'Task not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch task' });
  }
};

// Get tasks by project ID
exports.getTasksByProjectId = (req, res) => {
  const projectId = req.params.projectId;

  Task.find({ project: projectId })
    .populate('project', 'title')
    .populate('milestone')
    .populate('tags')
    .populate('createdBy', 'firstName lastName email phone organization department jobTitle') // Populate the createdBy field with user data
    .populate('updatedBy', 'firstName lastName email phone organization department jobTitle') // Populate the updatedBy field with user data
    .populate({
      path: 'personInCharge',
      select: 'firstName lastName email phone organization department jobTitle'
    })
    .populate({
      path: 'comments.createdBy',
      select: 'firstName lastName email phone organization department jobTitle'
    })
    .then(tasks => {
      res.status(200).json(tasks);
    })
    .catch(error => {
      res.status(500).json({ error: 'Failed to fetch tasks for the project' });
    });
};

// Get tasks by project ID and user ID
exports.getTasksByProjectIdUserId = (req, res) => {
  const projectId = req.params.projectId;
  const userId = req.params.userId;
  
  Task.find({ project: projectId, personInCharge: userId })
    .populate({
      path: 'personInCharge',
      select: 'firstName lastName email phone organization department jobTitle'
    })
    .populate('milestone')
    .populate('tags')
    .populate('createdBy', 'firstName lastName') // Populate the createdBy field with user data
    .populate('updatedBy', 'firstName lastName') // Populate the updatedBy field with user data
    .populate({
      path: 'comments.createdBy',
      select: 'firstName lastName email phone organization department jobTitle'
    })
    .then(tasks => {
      res.status(200).json(tasks);
    })
    .catch(error => {
      res.status(500).json({ error: 'Failed to fetch tasks for the project and user' });
    });
};

// Retrieve all tasks of a specific project and status
exports.getTasksByProjectIdAndStatus = async (req, res) => {
  const { projectId, status } = req.params;

  try {
    // Map incoming status to allowed format
    const statusMap = {
      toDo: 'To Do',
      inProgress: 'In Progress',
      underReview: 'Under Review',
      done: 'Done',
      onHold: 'On Hold',
      cancelled: 'Cancelled'
    };

    const formattedStatus = statusMap[status];

    if (!formattedStatus) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    // Find tasks by project ID and correct status
    const tasks = await Task.find({ project: projectId, status: formattedStatus })
      .populate('personInCharge', 'firstName lastName email phone organization department jobTitle')
      .populate('milestone')
      .populate('tags')
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName')
      .populate({
        path: 'comments.createdBy',
        select: 'firstName lastName email phone organization department jobTitle'
      });

    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

exports.getUniqueColorsByProjectId = async (req, res) => {
  const { projectId } = req.params;

  try {
    const tasks = await Task.find({ project: projectId }).select('color');
    const uniqueColors = [...new Set(tasks.map(task => task.color).filter(color => color))];
    res.status(200).json(uniqueColors);
  } catch (error) {
    console.error('Error fetching unique colors:', error);
    res.status(500).json({ error: 'Failed to fetch unique colors' });
  }
};

exports.getTasksByMilestone = async (req, res) => {
  const { milestoneId } = req.params;

  try {
    // Find tasks associated with the given milestone ID
    const tasks = await Task.find({ milestone: milestoneId })
      .populate('project', 'title')
      .populate('milestone')
      .populate('tags')
      .populate('createdBy', 'firstName lastName email phone organization department jobTitle') // Populate the createdBy field with user data
      .populate('updatedBy', 'firstName lastName email phone organization department jobTitle') // Populate the updatedBy field with user data
      .populate({
        path: 'personInCharge',
        select: 'firstName lastName email phone organization department jobTitle'
      })
      .populate({
        path: 'comments.createdBy',
        select: 'firstName lastName email phone organization department jobTitle'
      });

    if (tasks.length > 0) {
      res.status(200).json(tasks);
    } else {
      res.status(404).json({ message: 'No tasks found for the specified milestone.' });
    }
  } catch (error) {
    console.error('Error fetching tasks by milestone:', error);
    res.status(500).json({ error: 'Failed to fetch tasks by milestone' });
  }
};

exports.getTasksGroupByMilestone = async (req, res) => {
  const { projectId } = req.params;

  try {
    // Find all milestones for the project
    const milestones = await Milestone.find({ project: projectId });

    // Prepare the response structure
    const response = await Promise.all(
      milestones.map(async (milestone) => {
        // Find active tasks for each milestone
        const tasks = await Task.find({ milestone: milestone._id, status: { $ne: 'Cancelled' } })
          .populate('tags')
          .populate('personInCharge', 'firstName lastName email phone organization department jobTitle')
          .populate('createdBy', 'firstName lastName')
          .populate('updatedBy', 'firstName lastName');

        return {
          _id: milestone._id,
          title: milestone.title,
          description: milestone.description,
          status: milestone.status,
          color: milestone.color,
          createdBy: milestone.createdBy,
          updatedBy: milestone.updatedBy,
          createdDate: milestone.createdDate,
          updatedDate: milestone.updatedDate,
          tasks: tasks.map(task => ({
            taskName: task.taskName,
            description: task.description,
            category: task.category,
            tags: task.tags,
            personInCharge: task.personInCharge,
            status: task.status,
            priority: task.priority,
            difficultyLevel: task.difficultyLevel,
            color: task.color,
            attachments: task.attachments,
            subtasks: task.subtasks,
            startDate: task.startDate,
            endDate: task.endDate,
            actualStartDate: task.actualStartDate,
            createdBy: task.createdBy,
            createdDate: task.createdDate,
            updatedBy: task.updatedBy,
            updatedDate: task.updatedDate,
          })),
        };
      })
    );

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching tasks by milestone:', error);
    res.status(500).json({ error: 'Failed to fetch tasks by milestone' });
  }
};

exports.getUserUpcomingTasks = async (req, res) => {
  const { userId } = req.params;
  const now = new Date();
  const next30Days = new Date();
  next30Days.setDate(now.getDate() + 30);

  try {
    const user = await User.findById(userId);
    const isAdmin = user?.email === process.env.ADMIN_EMAIL;

    // Find projects where the user is a team member
    const accessibleProjects = isAdmin
      ? await Project.find()
      : await Project.find({ 'teamMembers._id': userId });

    if (!accessibleProjects.length) {
      return res.status(200).json([]);
    }

    let tasks = [];

    for (const project of accessibleProjects) {
      const teamMember = project.teamMembers.find(member => member._id.toString() === userId);
      const userRoleName = isAdmin ? 'Project Manager' : teamMember?.role;

      if (['Project Manager', 'Stakeholder'].includes(userRoleName)) {
        // Fetch all tasks within the next 30 days for the project
        const projectTasks = await Task.find({
          project: project._id,
          endDate: { $gte: now, $lte: next30Days },
          status: { $nin: ['Done', 'Cancelled'] }
        })
        .sort({ endDate: 1 })
        .populate('milestone')
        .populate('tags')
        .populate('personInCharge', 'firstName lastName email phone organization department jobTitle')
        .populate('createdBy', 'firstName lastName')
        .populate('updatedBy', 'firstName lastName')
        .populate('project')
        .populate({
          path: 'comments.createdBy',
          select: 'firstName lastName email phone organization department jobTitle'
        });

        tasks = tasks.concat(projectTasks);

      } else if (userRoleName === 'Team Member') {
        // Fetch only tasks assigned to the user in the project
        const userTasks = await Task.find({
          project: project._id,
          personInCharge: userId,
          endDate: { $gte: now, $lte: next30Days },
          status: { $nin: ['Done', 'Cancelled'] }
        })
        .sort({ endDate: 1 })
        .populate('milestone')
        .populate('tags')
        .populate('personInCharge', 'firstName lastName email phone organization department jobTitle')
        .populate('createdBy', 'firstName lastName')
        .populate('updatedBy', 'firstName lastName')
        .populate({
          path: 'comments.createdBy',
          select: 'firstName lastName email phone organization department jobTitle'
        });

        tasks = tasks.concat(userTasks);
      }
    }

    res.status(200).json(tasks);

  } catch (error) {
    console.error('Error fetching user tasks:', error);
    res.status(500).json({ error: 'Failed to fetch user tasks' });
  }
};

exports.getUserOverdueTasks = async (req, res) => {
  const { userId } = req.params;
  const now = new Date();

  try {
    const user = await User.findById(userId);
    const isAdmin = user?.email === process.env.ADMIN_EMAIL;

    // Find projects where the user is a team member
    const accessibleProjects = isAdmin
      ? await Project.find()
      : await Project.find({ 'teamMembers._id': userId });

    if (!accessibleProjects.length) {
      return res.status(200).json([]);
    }

    let tasks = [];

    for (const project of accessibleProjects) {
      const teamMember = project.teamMembers.find(member => member._id.toString() === userId);
      const userRoleName = isAdmin ? 'Project Manager' : teamMember?.role;

      if (['Project Manager', 'Stakeholder'].includes(userRoleName)) {
        // Fetch all overdue tasks for the project
        const projectTasks = await Task.find({
          project: project._id,
          endDate: { $lt: now },
          status: { $nin: ['Done', 'Cancelled'] }
        })
        .sort({ endDate: 1 })
        .populate('milestone')
        .populate('tags')
        .populate('personInCharge', 'firstName lastName email phone organization department jobTitle')
        .populate('createdBy', 'firstName lastName')
        .populate('updatedBy', 'firstName lastName')
        .populate('project')
        .populate({
          path: 'comments.createdBy',
          select: 'firstName lastName email phone organization department jobTitle'
        });

        tasks = tasks.concat(projectTasks);

      } else if (userRoleName === 'Team Member') {
        // Fetch only overdue tasks assigned to the user in the project
        const userTasks = await Task.find({
          project: project._id,
          personInCharge: userId,
          endDate: { $lt: now },
          status: { $nin: ['Done', 'Cancelled'] }
        })
        .sort({ endDate: 1 })
        .populate('milestone')
        .populate('tags')
        .populate('personInCharge', 'firstName lastName email phone organization department jobTitle')
        .populate('createdBy', 'firstName lastName')
        .populate('updatedBy', 'firstName lastName')
        .populate({
          path: 'comments.createdBy',
          select: 'firstName lastName email phone organization department jobTitle'
        });

        tasks = tasks.concat(userTasks);
      }
    }

    res.status(200).json(tasks);

  } catch (error) {
    console.error('Error fetching overdue tasks:', error);
    res.status(500).json({ error: 'Failed to fetch overdue tasks' });
  }
};


// Get Task Count
exports.getTaskCounts = async (req, res) => {
  const { projectId } = req.query;
  const userId = req.user._id; // Assuming `user` is added to the request through authentication middleware
  const isAdmin = req.user?.email === process.env.ADMIN_EMAIL;

  try {
    // Find all accessible projects for the authenticated user
    const accessibleProjects = isAdmin
      ? await Project.find()
      : await Project.find({ 'teamMembers._id': userId });

    if (!accessibleProjects.length) {
      return res.status(200).json({ tasks: [] });
    }

    // Get the IDs of accessible projects
    const accessibleProjectIds = accessibleProjects.map(project => project._id.toString());

    // If projectId is provided, check if it is accessible
    if (projectId && !accessibleProjectIds.includes(projectId)) {
      return res.status(403).json({ error: 'You do not have access to this project' });
    }

    // Create a filter based on the accessible project IDs
    const filter = projectId ? { project: projectId } : { project: { $in: accessibleProjectIds } };

    // Fetch tasks based on the filter
    const tasks = await Task.find(filter)
      .populate('milestone')
      .populate('tags')
      .populate('personInCharge')
      .populate('createdBy')
      .populate('updatedBy')
      .populate('project');

    if (!tasks.length) {
      return res.status(404).json({ error: 'No tasks found' });
    }

    res.status(200).json({ tasks });
  } catch (error) {
    console.error('Error fetching task counts:', error);
    res.status(500).json({ error: 'Failed to fetch task counts' });
  }
};


// Update a task by ID
/*exports.updateTask = (req, res) => {
  const taskId = req.params.id;
  const taskData = req.body;
  Task.findByIdAndUpdate(taskId, taskData, { new: true })
    .populate('personInCharge') // Populate the personInCharge field with user objects
    .populate('tags')
    .then(task => {
      if (task) {
        res.status(200).json(task);
      } else {
        res.status(404).json({ error: 'Task not found' });
      }
    })
    .catch(error => {
      res.status(500).json({ error: 'Failed to update task' });
    });
};*/

exports.updateTask = async (req, res) => {
  const taskId = req.params.id;
  const taskData = req.body;
  const currentUserId = req.body.updatedBy;

  try {
    // Find the existing task to preserve comments
    const existingTask = await Task.findById(taskId);

    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check if current user is the task creator
    if (existingTask.createdBy.toString() !== currentUserId) {
      return res.status(403).json({ error: 'You can only edit tasks you created' });
    }

    // Preserve the existing comments
    taskData.comments = existingTask.comments;

    // Update the task
    let task = await Task.findByIdAndUpdate(taskId, taskData, { new: true });

    // Fetch the full user objects for personInCharge
    const personInCharge = await User.find({
      _id: { $in: task.personInCharge }
    });

    // Replace the personInCharge field with the full user objects
    task = task.toObject();
    task.personInCharge = personInCharge;

    // Send notifications to the person in charge
    for (const person of task.personInCharge) {
      if (person._id.toString() !== currentUserId.toString()) {
        try {
          const project = await Project.findById(task.project);
          const notification = await Notification.create({
            user: person._id,
            type: "Update Task",
            title: {
              enUS: project.title,
              zhHK: project.title,
              zhCN: project.title
            },
            description: {
              enUS: `There are some update in the task "${task.taskName}".`,
              zhHK: `任務「${task.taskName}」中有一些更新。`,
              zhCN: `任务「${task.taskName}」中有一些更新。`
            },
            link: `/project/${task.project}/task/${task._id}`,
            read: false,
          });

          if (usersio && usersio[person._id]) {
            usersio[person._id].emit('notification', notification);
          } else {
            console.warn(`No active socket connection for user ${person._id}`);
          }

          if (person.subscription) {
            const personInCharge = await User.findById(person._id);
            if (personInCharge) {
              sendNotification(personInCharge, JSON.stringify({
                title: 'Task Update',
                body: `There are some update in the task "${task.taskName}".`,
                link: `/project/${task.project}/task/${task._id}`
              }));
            }
          } else {
            console.warn(`No subscription found for user ${person._id}. Check if the subscription is correctly stored in the database.`);
          }
        } catch (notificationError) {
          console.error(`Error creating notification for user ${person._id}:`, notificationError);
        }
      }
    }

    // Send the updated task with populated personInCharge field
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task' });
  }
};

// Update task status
exports.updateTaskStatus = async (req, res) => {
  const taskId = req.params.id;
  const { status, updatedBy } = req.body;
  const currentUserId = req.body.updatedBy;

  const allowedStatuses = ['To Do', 'In Progress', 'Under Review', 'Done', 'On Hold', 'Cancelled'];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  try {
    const task = await Task.findByIdAndUpdate(taskId, { status, updatedBy: updatedBy, updatedDate: new Date() }, { new: true });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Notification
    for (const person of task.personInCharge) {
      if (person._id.toString() !== currentUserId.toString()) {
        try {
          const project = await Project.findById(task.project);
          const notification = await Notification.create({
            user: person._id,
            type: "Update Task Status",
            title: {
              enUS: project.title,
              zhHK: project.title,
              zhCN: project.title
            },
            description: {
              enUS: `The status of the task "${task.taskName}" has been updated to "${status}".`,
              zhHK: `任務「${task.taskName}」的狀態已更新為「${status}」。`,
              zhCN: `任务「${task.taskName}」的状态已更新为「${status}」。`
            },
            link: `/project/${task.project}/task/${task._id}`,
            read: false,
          });

          // Check if `usersio` and the specific user socket are defined
          if (usersio && usersio[person._id]) {
            usersio[person._id].emit('notification', notification);
          } else {
            console.warn(`No active socket connection for user ${person._id}`);
          }

          // Send web push notification
          /*if (person.subscription) {
            const personInCharge = await User.findById(person._id);
            
            if (personInCharge) {
              sendNotification(personInCharge, JSON.stringify({
                title: 'Task Status Update',
                body: `The status of the task "${task.taskName}" has been updated to "${status}".`,
                link: `/project/${task.project}/task/${task._id}`
              }));
            }
          }
          else {
            console.warn(`No subscription found for user ${person._id}. Check if the subscription is correctly stored in the database.`);
          }*/
        } catch (notificationError) {
          console.error(`Error creating notification for user ${person._id}:`, notificationError);
        }
      }
    }

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task status' });
  }
};

// Update task dates by ID
/*exports.updateTaskDates = (req, res) => {
  const taskId = req.params.id;
  const { startDate, endDate } = req.body;
  Task.findByIdAndUpdate(taskId, { startDate, endDate }, { new: true })
    .then(task => {
      if (task) {
        res.status(200).json(task);
      } else {
        res.status(404).json({ error: 'Task not found' });
      }
    })
    .catch(error => {
      res.status(500).json({ error: 'Failed to update task dates' });
    });
};*/

// Move Task to Other Project
exports.moveTaskToAnotherProject = async (req, res) => {
  const { taskId, newProjectId } = req.params;

  try {
    // Check if the new project exists
    const newProject = await Project.findById(newProjectId);
    if (!newProject) {
      return res.status(404).json({ error: 'New project not found' });
    }

    // Find the task to get the old project ID
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const oldProjectId = task.project;

    // Find the old project
    const oldProject = await Project.findById(oldProjectId);
    if (!oldProject) {
      return res.status(404).json({ error: 'Old project not found' });
    }

    // Update the task with the new project ID
    const updatedTask = await Task.findByIdAndUpdate(taskId, { project: newProjectId }, { new: true });

    // Emit real-time updates to users in old and new projects
    const allTeamMembers = [...oldProject.teamMembers, ...newProject.teamMembers];
    const uniqueUsers = allTeamMembers.filter((member, index, self) =>
      index === self.findIndex(m => m._id.toString() === member._id.toString())
    );

    uniqueUsers.forEach(member => {
      if (usersio && usersio[member._id]) {
        usersio[member._id].emit('taskMoved', { taskId, oldProjectId, newProjectId });
      }
    });

    res.status(200).json({ message: 'Task moved successfully', task: updatedTask });
  } catch (error) {
    console.error('Error moving task:', error);
    res.status(500).json({ error: 'Failed to move task' });
  }
};

// Delete a task by ID
exports.deleteTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const currentUserId = req.body.deletedBy;

    // First fetch the task to check creator before deleting
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check if current user is the task creator
    if (task.createdBy.toString() !== currentUserId) {
      return res.status(403).json({ error: 'You can only delete tasks you created' });
    }

    // Delete the task after authorization check
    await Task.findByIdAndDelete(taskId);

    if (task) {
      // Notification
      for (const person of task.personInCharge) {
        try {
          const project = await Project.findById(task.project);
          const notification = await Notification.create({
            user: person._id,
            type: "Delete Task",
            title: {
              enUS: project.title,
              zhHK: project.title,
              zhCN: project.title
            },
            description: {
              enUS: `The task "${task.taskName}" has been deleted.`,
              zhHK: `任務「${task.taskName}」已被刪除。`,
              zhCN: `任务「${task.taskName}」已被删除。`
            },
            link: `/project/${task.project}/task/${task._id}`,
            read: false,
          });
  
          // Check if `usersio` and the specific user socket are defined
          if (usersio && usersio[person._id]) {
            usersio[person._id].emit('notification', notification);
          } else {
            console.warn(`No active socket connection for user ${person._id}`);
          }

          // Send web push notification
          /*if (person.subscription) {
            const personInCharge = await User.findById(person._id);
            
            if (personInCharge) {
              sendNotification(personInCharge, JSON.stringify({
                title: 'Task is deleted',
                body: `The task "${task.taskName}" has been deleted.`,
                link: `/project/${task.project}/task/${task._id}`
              }));
            }
          }
          else {
            console.warn(`No subscription found for user ${person._id}. Check if the subscription is correctly stored in the database.`);
          }*/
        } catch (notificationError) {
          console.error(`Error creating notification for user ${person._id}:`, notificationError);
        }
      }

      const deletePromises = task.attachments.map(attachment => {
        const filePath = attachment.path;
  
        if (!filePath) {
          return Promise.reject(new Error('No file path provided'));
        }

        const fullPath = path.join(__dirname, '..', filePath);

        return new Promise((resolve, reject) => {
          fs.access(fullPath, fs.constants.F_OK, (accessErr) => {
            if (accessErr) {
              console.error(`File not found: ${fullPath}`);
              resolve(`File not found: ${fullPath}`);
            } else {
              fs.unlink(fullPath, (unlinkErr) => {
                if (unlinkErr) {
                  console.error('File deletion error:', unlinkErr);
                  reject(`Failed to delete file: ${fullPath}`);
                } else {
                  resolve(`File deleted successfully: ${fullPath}`);
                }
              });
            }
          });
        });
      });

      await Promise.all(deletePromises);

      res.status(200).json({ message: 'Task and attachments deleted successfully' });
    } else {
      res.status(404).json({ error: 'Task not found' });
    }
  } catch (error) {
    res.status(500).json({ error: `Failed to delete task: ${error.message}` });
  }
};

// Import Tasks
const validateTasks = (tasks) => {
  const errors = [];
  tasks.forEach((task, index) => {
    const row = index + 2; // +2 to account for the header row and 0-based index

    if (!task.taskName) {
      errors.push(`Row ${row}, Column Task Name: Task Name is required.`);
    }
    if (!task.status) {
      errors.push(`Row ${row}, Column Status: Status is required.`);
    }
    if (!task.project) {
      errors.push(`Row ${row}, Column Project ID: Project ID is required.`);
    }
    if (task.startDate && isNaN(Date.parse(task.startDate))) {
      errors.push(`Row ${row}, Column Start Date: Invalid date format.`);
    }
    if (task.endDate && isNaN(Date.parse(task.endDate))) {
      errors.push(`Row ${row}, Column End Date: Invalid date format.`);
    }
    if (task.startDate && task.endDate && new Date(task.startDate) > new Date(task.endDate)) {
      errors.push(`Row ${row}, Columns Start Date and End Date: Start Date cannot be after End Date.`);
    }
    // Add more validation checks as needed
  });
  return errors;
};

exports.importTasks = async (req, res) => {
  const { tasks, user } = req.body;

  // Log the tasks and userId to check the input data
  console.log("Tasks to be imported:", tasks);
  console.log("Authenticated user ID:", user._id);

  // Check if userId is available
  if (!user._id) {
    console.error('User ID is missing from the request.');
    return res.status(400).json({ error: 'User ID is required for importing tasks.' });
  }

  // Add createdDate, updatedDate, createdBy, and updatedBy to each task
  const currentDate = new Date();
  tasks.forEach(task => {
    task.createdDate = currentDate;
    task.updatedDate = currentDate;
    task.createdBy = user._id;
    task.updatedBy = user._id;
  });

  // Log validation errors
  const validationErrors = validateTasks(tasks);
  if (validationErrors.length > 0) {
    console.log("Validation Errors:", validationErrors);
    return res.status(400).json({ errors: validationErrors });
  }

  try {
    await Task.insertMany(tasks);
    res.status(200).json({ message: 'Tasks imported successfully' });
  } catch (err) {
    console.error('Error inserting tasks:', err);
    res.status(500).json({ error: 'Failed to import tasks. ' + err.message });
  }
};


// Comments
exports.getCommentsByTaskId = async (req, res) => {
  const { id } = req.params;

  try {
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.status(200).json(task.comments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update comment' });
  }
}

exports.addComment = async (req, res) => {
  const { content, createdBy } = req.body;
  
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const newComment = {
      content,
      createdBy,
      createdDate: new Date(),
      updatedDate: new Date(),
    };

    task.comments.push(newComment);
    await task.save();

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add comment' });
  }
};

exports.updateComment = async (req, res) => {
  const { taskId, commentId } = req.params;
  const { content, updatedBy } = req.body;

  try {
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const comment = task.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    comment.content = content;
    comment.updatedDate = new Date();
    comment.updatedBy = updatedBy;

    await task.save();

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update comment' });
  }
};

exports.deleteComment = async (req, res) => {
  const { taskId, commentId } = req.params;

  try {
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const comment = task.comments.find(comment => comment._id.toString() === commentId);

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    task.comments = task.comments.filter(comment => comment._id.toString() !== commentId);
    await task.save();

    res.status(200).json({ message: 'Comment deleted successfully', task });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
};
