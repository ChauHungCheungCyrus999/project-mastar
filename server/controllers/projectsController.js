const Project = require('../models/project');
const Task = require('../models/task');
const User = require('../models/user');
const Role = require('../models/role');
const Permission = require('../models/permission');
const Notification = require('../models/notification');
const Milestone = require('../models/milestone');

const { usersio } = require('../socketio');

/*const sendNotification = async (person, notificationPayload) => {
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
};*/

// Create a new project
exports.createProject = async (req, res) => {
  try {
    const projectData = req.body;
    const project = await Project.create(projectData);
    const currentUserId = req.body.createdBy;

    // Notification
    for (const person of project.teamMembers) {
      if (person._id.toString() !== currentUserId.toString()) {
        //try {
          const notification = await Notification.create({
            user: person._id,
            type: "Create Project",
            title: {
              enUS: project.title,
              zhHK: project.title,
              zhCN: project.title
            },
            description: {
              enUS: `A new project "${project.title}" has been created. You're the "${person.role.toLowerCase()}" of the project.`,
              zhHK: `新項目「${project.title}」已建立。您是該專案的「${person.role.toLowerCase()}」。`,
              zhCN: `新项目「${project.title}」已建立。您是该专案的「${person.role.toLowerCase()}」。`
            },
            link: `/project/${project._id}/dashboard`,
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
              sendNotification(personInCharge._id, JSON.stringify({
                title: 'New Project Created',
                body: `A new project "${project.title}" has been created. You're the "${person.role.toLowerCase()}" of the project.`,
                link: `/project/${project._id}`
              }));
            }
          }
          else {
            console.warn(`No subscription found for user ${person._id}. Check if the subscription is correctly stored in the database.`);
          }*/
        /*} catch (notificationError) {
          console.error(`Error creating notification for user ${person._id}:`, notificationError);
        }*/
      }
    }

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create project' });
  }
};

// Get all projects with associated tasks
exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName')
      .populate({
        path: 'teamMembers._id',
        model: 'User',
        select: 'firstName lastName gender email phone organization department jobTitle createdDate updatedDate'
      });

    const transformedProjects = await Promise.all(projects.map(async project => {
      const tasks = await Task.find({ project: project._id });
      
      const transformedTeamMembers = project.teamMembers.map(member => {
        return {
          _id: member._id._id,
          firstName: member._id.firstName,
          lastName: member._id.lastName,
          gender: member._id.gender,
          email: member._id.email,
          phone: member._id.phone,
          organization: member._id.organization,
          department: member._id.department,
          jobTitle: member._id.jobTitle,
          createdDate: member._id.createdDate,
          updatedDate: member._id.updatedDate,
          role: member.role
        };
      });

      const totalTasks = tasks.filter(task => task.status !== 'Cancelled').length;
      const completedTasks = tasks.filter(task => task.status === 'Done').length;

      return {
        _id: project._id,
        title: project.title,
        description: project.description,
        teamMembers: transformedTeamMembers,
        color: project.color,
        createdDate: project.createdDate,
        updatedDate: project.updatedDate,
        totalTasks,
        completedTasks,
        updatedBy: project.updatedBy,
        createdBy: project.createdBy
      };
    }));

    res.status(200).json(transformedProjects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
};

// Get a project by ID
/*exports.getProjectById = (req, res) => {
  const projectId = req.params.id;
  Project.findById(projectId)
    .then(project => {
      if (project) {
        res.status(200).json(project);
      } else {
        res.status(404).json({ error: 'Project not found' });
      }
    })
    .catch(error => {
      res.status(500).json({ error: 'Failed to fetch project' });
    });
};*/
exports.getProjectById = async (req, res) => {
  try {
    const projectId = req.params.id;

    // Find the project by ID and populate the teamMembers' details
    const project = await Project.findById(projectId)
      .populate({
        path: 'teamMembers._id',
        model: User,
        select: 'firstName lastName gender email phone organization department jobTitle createdDate updatedDate'
      })
      .populate('createdBy', 'firstName lastName') // Populate the createdBy field with user data
      .populate('updatedBy', 'firstName lastName'); // Populate the updatedBy field with user data

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Transform the populated team members
    const transformedTeamMembers = project.teamMembers.map(member => {
      return {
        _id: member._id._id,
        firstName: member._id.firstName,
        lastName: member._id.lastName,
        gender: member._id.gender,
        email: member._id.email,
        phone: member._id.phone,
        organization: member._id.organization,
        department: member._id.department,
        jobTitle: member._id.jobTitle,
        createdDate: member._id.createdDate,
        updatedDate: member._id.updatedDate,
        role: member.role
      };
    });

    const response = {
      _id: project._id,
      title: project.title,
      description: project.description,
      teamMembers: transformedTeamMembers,
      color: project.color,
      createdDate: project.createdDate,
      updatedDate: project.updatedDate,
      tasks: project.tasks,
      updatedBy: project.updatedBy,
      createdBy: project.createdBy
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a team member's role in a project by user _id and project teamMembers _id
exports.getUserByProjectId = async (req, res) => {
  const { projectId, teamMemberId } = req.params;

  try {
    const project = await Project.findById(projectId).populate('teamMembers._id', '-password');
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const teamMember = project.teamMembers.find(member => member._id._id.toString() === teamMemberId);
    if (!teamMember) {
      return res.status(404).json({ error: 'Team member not found in the project' });
    }

    const user = teamMember._id;
    const roleName = teamMember.role;

    let permissions = [];
    if (roleName) {
      const roleDoc = await Role.findOne({ name: roleName }).populate('permissions', 'name');
      if (roleDoc?.permissions) {
        permissions = roleDoc.permissions.map(permission => permission.name);
      }
    }

    res.status(200).json({
      _id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      gender: user.gender,
      email: user.email,
      phone: user.phone,
      organization: user.organization,
      department: user.department,
      jobTitle: user.jobTitle,
      createdDate: user.createdDate ? user.createdDate.toISOString() : null,
      updatedDate: user.updatedDate ? user.updatedDate.toISOString() : null,
      role: roleName,
      permissions,
    });
  } catch (error) {
    console.error('Error fetching user by project:', error);
    res.status(500).json({ error: 'Failed to fetch project team member' });
  }
};

// Get users by project ID
exports.getUsersByProjectId = async (req, res) => {
  const { projectId } = req.params;

  try {
    const project = await Project.findById(projectId).populate('teamMembers._id', '-password');
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const users = project.teamMembers.map(member => {
      const user = member._id;
      return {
        _id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        gender: user.gender,
        email: user.email,
        phone: user.phone,
        organization: user.organization,
        department: user.department,
        jobTitle: user.jobTitle,
        createdDate: user.createdDate ? user.createdDate.toISOString() : null,
        updatedDate: user.updatedDate ? user.updatedDate.toISOString() : null,
        role: member.role,
      };
    });

    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users by project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
};

// Get task count by project and status (admin)
exports.getTaskCountByProject = async (req, res) => {
  try {
    const projects = await Project.find();

    const projectTaskCounts = await Promise.all(projects.map(async (project) => {
      const tasks = await Task.find({ project: project._id })
        .populate('project');

      const statusCounts = {
        all: tasks.length,
        toDo: tasks.filter(task => task.status === 'To Do').length,
        inProgress: tasks.filter(task => task.status === 'In Progress').length,
        underReview: tasks.filter(task => task.status === 'Under Review').length,
        done: tasks.filter(task => task.status === 'Done').length,
        onHold: tasks.filter(task => task.status === 'On Hold').length,
        cancelled: tasks.filter(task => task.status === 'Cancelled').length,
      };

      return {
        _id: project._id,
        title: project.title,
        color: project.color,
        statusCounts
      };
    }));

    res.status(200).json(projectTaskCounts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch task counts by project' });
  }
};

// Get task count by project and status (general user)
exports.getTaskCountByProjectByUserId = async (req, res) => {
  try {
    const userId = req.body.userId;

    const projects = await Project.find({
      'teamMembers._id': userId
    });

    const projectTaskCounts = await Promise.all(projects.map(async (project) => {
      const tasks = await Task.find({ project: project._id })
        .populate('project');

      const statusCounts = {
        all: tasks.length,
        toDo: tasks.filter(task => task.status === 'To Do').length,
        inProgress: tasks.filter(task => task.status === 'In Progress').length,
        underReview: tasks.filter(task => task.status === 'Under Review').length,
        done: tasks.filter(task => task.status === 'Done').length,
        onHold: tasks.filter(task => task.status === 'On Hold').length,
        cancelled: tasks.filter(task => task.status === 'Cancelled').length,
      };

      return {
        _id: project._id,
        title: project.title,
        color: project.color,
        statusCounts
      };
    }));

    res.status(200).json(projectTaskCounts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch task counts by project' });
  }
};

exports.getMilestoneStatusDistribution = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Find milestones for the given project
    const milestones = await Milestone.find({ project: projectId });

    // Fetch tasks and group them by milestone and status
    const response = await Promise.all(
      milestones.map(async (milestone) => {
        const tasks = await Task.find({ milestone: milestone._id })
          .populate('personInCharge')
          .populate('milestone')
          .populate('tags')
          .populate('createdBy', 'firstName lastName') // Populate the createdBy field with user data
          .populate('updatedBy', 'firstName lastName') // Populate the updatedBy field with user data;

        const groupedTasks = {
          _id: milestone._id,
          milestoneTitle: milestone.title,
          toDo: [],
          inProgress: [],
          underReview: [],
          done: [],
          onHold: [],
          cancelled: []
        };

        tasks.forEach(task => {
          switch (task.status) {
            case 'To Do':
              groupedTasks.toDo.push(task);
              break;
            case 'In Progress':
              groupedTasks.inProgress.push(task);
              break;
            case 'Under Review':
              groupedTasks.underReview.push(task);
              break;
            case 'Done':
              groupedTasks.done.push(task);
              break;
            case 'On Hold':
              groupedTasks.onHold.push(task);
              break;
            case 'Cancelled':
              groupedTasks.cancelled.push(task);
              break;
          }
        });

        return groupedTasks;
      })
    );

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while fetching milestones and tasks.' });
  }
}

// Update a project by ID
exports.updateProject = async (req, res) => {
  const projectId = req.params.id;
  const projectData = req.body;
  const currentUserId = req.body.createdBy;
  
  try {
    const project = await Project.findByIdAndUpdate(projectId, projectData, { new: true });

    if (project) {
      // Notification
      for (const person of project.teamMembers) {
        if (person._id.toString() !== currentUserId.toString()) {
          try {
            const notification = await Notification.create({
              user: person._id,
              type: "Update Project",
              title: {
                enUS: project.title,
                zhHK: project.title,
                zhCN: project.title
              },
              description: {
                enUS: `The project information of "${project.title}" has been updated.`,
                zhHK: `「${project.title}」的專案資訊已更新。`,
                zhCN: `「${project.title}」的项目信息已更新。`
              },
              link: `/project/${project._id}/dashboard`,
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
                sendNotification(personInCharge._id, JSON.stringify({
                  title: 'Project has been deleted',
                  body: `The project "${project.title}" has been deleted.`,
                  link: `/`
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

      res.status(200).json(project);
    } else {
      res.status(404).json({ error: 'Project not found' });
    }
  } catch (error) {
    console.error('Failed to update project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
};

// Delete a project by ID
exports.deleteProject = async (req, res) => {
  const projectId = req.params.id;

  try {
    const project = await Project.findByIdAndDelete(projectId);

    if (project) {
      // Delete related tasks
      await Task.deleteOne({ project: projectId });

      // Notification
      for (const person of project.teamMembers) {
        try {
          const notification = await Notification.create({
            user: person._id,
            type: "Delete Project",
            title: {
              enUS: project.title,
              zhHK: project.title,
              zhCN: project.title
            },
            description: {
              enUS: `The project "${project.title}" has been deleted.`,
              zhHK: `項目「${project.title}」已被刪除。`,
              zhCN: `项目「${project.title}」已被删除。`
            },
            link: `/`,
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
              sendNotification(personInCharge._id, JSON.stringify({
                title: 'Project has been deleted',
                body: `The project "${project.title}" has been deleted.`,
                link: `/`
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

      res.status(200).json({ message: 'Project and related tasks deleted successfully' });
    } else {
      res.status(404).json({ error: 'Project not found' });
    }
  } catch (error) {
    console.error('Failed to delete project and related tasks:', error);
    res.status(500).json({ error: 'Failed to delete project and related tasks' });
  }
};

