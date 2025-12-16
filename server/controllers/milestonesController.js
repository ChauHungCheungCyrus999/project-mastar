const Milestone = require('../models/milestone');
const Project = require('../models/project');
const Notification = require('../models/notification');

const { usersio } = require('../socketio');

// Create a new milestone
exports.createMilestone = async (req, res) => {
  try {
    const milestoneData = req.body;
    const milestone = await Milestone.create(milestoneData);

    // Send notifications
    const project = await Project.findById(milestone.project);

    const notification = await Notification.create({
      user: milestone.createdBy,
      type: "Create Milestone",
      title: {
        enUS: project.title,
        zhHK: project.title,
        zhCN: project.title
      },
      description: {
        enUS: `The milestone "${milestone.title}" has been created.`,
        zhHK: `里程碑「${milestone.title}」已建立。`,
        zhCN: `里程碑「${milestone.title}」已创建。`
      },
      link: `/project/${milestone.project}/dashboard`,
      read: false,
    });

    if (usersio && usersio[milestone.createdBy]) {
      usersio[milestone.createdBy].emit('notification', notification);
    }

    res.status(201).json(milestone);
  } catch (error) {
    console.error('Error creating milestone:', error);
    res.status(500).json({ error: 'Failed to create milestone' });
  }
};

// Get all milestones
exports.getAllMilestones = async (req, res) => {
  try {
    const milestones = await Milestone.find()
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName')
      .populate('project', 'title');

    res.status(200).json(milestones);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch milestones' });
  }
};

// Get milestone by ID
exports.getMilestoneById = async (req, res) => {
  const milestoneId = req.params.id;
  try {
    const milestone = await Milestone.findById(milestoneId)
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName')
      .populate('project', 'title');

    if (milestone) {
      res.status(200).json(milestone);
    } else {
      res.status(404).json({ error: 'Milestone not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch milestone' });
  }
};

// Get milestones by project ID
exports.getMilestonesByProjectId = async (req, res) => {
  const projectId = req.params.projectId;
  try {
    const milestones = await Milestone.find({ project: projectId })
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName');

    res.status(200).json(milestones);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch milestones for the project' });
  }
};

exports.getActiveMilestonesByProjectId = async (req, res) => {
  const projectId = req.params.projectId;
  try {
    const milestones = await Milestone.find({ project: projectId, active: true })
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName');

    res.status(200).json(milestones);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch milestones for the project' });
  }
};

// Get milestones by project ID and status
exports.getMilestonesByProjectIdAndStatus = async (req, res) => {
  const { projectId, status } = req.params;
  try {
    const milestones = await Milestone.find({ project: projectId, status })
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName');

    res.status(200).json(milestones);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch milestones' });
  }
};

// Update a milestone by ID
exports.updateMilestone = async (req, res) => {
  const milestoneId = req.params.id;
  const milestoneData = req.body;

  try {
    const milestone = await Milestone.findByIdAndUpdate(milestoneId, milestoneData, { new: true })
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName');

    if (milestone) {
      // Send notifications
      const project = await Project.findById(milestone.project);

      const notification = await Notification.create({
        user: milestone.createdBy,
        type: "Update Milestone",
        title: {
          enUS: project.title,
          zhHK: project.title,
          zhCN: project.title
        },
        description: {
          enUS: `The milestone "${milestone.title}" has been updated.`,
          zhHK: `里程碑「${milestone.title}」已更新。`,
          zhCN: `里程碑「${milestone.title}」已更新。`
        },
        link: `/project/${milestone.project}/dashboard`,
        read: false,
      });

      if (usersio && usersio[milestone.updatedBy]) {
        usersio[milestone.updatedBy].emit('notification', notification);
      }

      res.status(200).json(milestone);
    } else {
      res.status(404).json({ error: 'Milestone not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update milestone' });
  }
};

// Update milestone status
exports.updateMilestoneStatus = async (req, res) => {
  const milestoneId = req.params.id;
  const { status, updatedBy } = req.body;

  try {
    const milestone = await Milestone.findByIdAndUpdate(milestoneId, { status, updatedBy, updatedDate: new Date() }, { new: true });

    if (milestone) {
      // Send notifications
      const project = await Project.findById(milestone.project);

      const notification = await Notification.create({
        user: milestone.createdBy,
        type: "Delete Milestone",
        title: {
          enUS: project.title,
          zhHK: project.title,
          zhCN: project.title
        },
        description: {
          enUS: `The status of the milestone "${milestone.title}" has been updated to "${milestone.status}".`,
          zhHK: `里程碑「${milestone.title}」的狀態已更新為「${milestone.status}」。`,
          zhCN: `里程碑「${milestone.title}」的状态已更新为「${milestone.status}」。`
        },
        link: `/project/${milestone.project}/dashboard`,
        read: false,
      });

      if (usersio && usersio[updatedBy]) {
        usersio[updatedBy].emit('notification', notification);
      }

      res.status(200).json(milestone);
    } else {
      res.status(404).json({ error: 'Milestone not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update milestone status' });
  }
};

// Delete a milestone by ID
exports.deleteMilestone = async (req, res) => {
  try {
    const milestoneId = req.params.id;
    const milestone = await Milestone.findByIdAndDelete(milestoneId);

    if (milestone) {
      // Send notifications
      const project = await Project.findById(milestone.project);

      const notification = await Notification.create({
        user: milestone.createdBy,
        type: "Delete Milestone",
        title: {
          enUS: project.title,
          zhHK: project.title,
          zhCN: project.title
        },
        description: {
          enUS: `The milestone "${milestone.title}" has been deleted.`,
          zhHK: `里程碑「${milestone.title}」已被刪除。`,
          zhCN: `里程碑「${milestone.title}」已被刪除。`
        },
        link: `/project/${milestone.project}/dashboard`,
        read: false,
      });

      if (usersio && usersio[milestone.createdBy]) {
        usersio[milestone.createdBy].emit('notification', notification);
      }

      res.status(200).json({ message: 'Milestone deleted successfully' });
    } else {
      res.status(404).json({ error: 'Milestone not found' });
    }
  } catch (error) {
    res.status(500).json({ error: `Failed to delete milestone: ${error.message}` });
  }
};