const path = require('path');
const fs = require('fs');

const Announcement = require('../models/announcement');
const Notification = require('../models/notification');

const { usersio } = require('../socketio');
const webpush = require('web-push');

// Create a new announcement
exports.createAnnouncement = async (req, res) => {
  try {
    const announcementData = req.body;

    // Ensure project is null if it is an empty string
    if (announcementData.project === '') {
      announcementData.project = null;
    }

    // Attach file URLs if provided
    if (req.files && req.files.attachments) {
      const fileUrls = req.files.attachments.map(file => `/uploads/${file.filename}`);
      announcementData.attachments = fileUrls;
    }

    const announcement = await Announcement.create(announcementData);

    const projectId = announcement.project && (announcement.project._id || announcement.project);

    // Send notifications to all related users
    const notifications = announcement.visibleTo.map((userId) => ({
      user: userId,
      type: "Create Announcement",
      title: {
        enUS: "New Announcement",
        zhHK: "新公告",
        zhCN: "新公告",
      },
      description: {
        enUS: `The announcement "${announcement.title}" has been created.`,
        zhHK: `公告「${announcement.title}」已建立。`,
        zhCN: `公告「${announcement.title}」已创建。`,
      },
      link: projectId ? `/project/${projectId}/announcement/${announcement._id}` : `/announcement/${announcement._id}`,
      read: false,
    }));

    const savedNotifications = await Notification.insertMany(notifications);

    // Emit notifications to all related users
    if (usersio) {
      announcement.visibleTo.forEach((userId) => {
        if (usersio[userId]) {
          usersio[userId].emit('notification', savedNotifications.find((n) => n.user.toString() === userId.toString()));
        }
      });
    }

    res.status(201).json(announcement);
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ error: 'Failed to create announcement' });
  }
};

// Get all announcements
exports.getAllAnnouncements = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set the time to the start of the day
    
    const announcements = await Announcement.find()
      .populate('visibleTo')
      .populate('createdBy')
      .populate('updatedBy')
      .populate('project')
      .sort({ startDate: -1 });

    res.status(200).json(announcements);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
};

// Get all active announcements by user
exports.getAllActiveAnnouncementsByUser = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set the time to the start of the day

    const userId = req.user._id; // Assuming the user ID is available in the request object

    const announcements = await Announcement.find({
      active: true,
      startDate: { $lte: today },
      endDate: { $gte: today },
      $or: [
        { visibleTo: userId }, // Check if the user is in the visibleTo array
        { visibleTo: userId, project: null } // Check if visibleTo does not include userId and project is null
      ]
    })
      .populate('visibleTo')
      .populate('createdBy')
      .populate('updatedBy')
      .populate('project')
      .sort({ startDate: -1 });

    res.status(200).json(announcements);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
};


// Get active announcements by project ID
exports.getActiveAnnouncementsByProjectId = async (req, res) => {
  const projectId = req.params.projectId;
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set the time to the start of the day

    const userId = req.user._id; // Assuming the user ID is available in the request object

    const announcements = await Announcement.find({
      project: projectId,
      active: true,
      startDate: { $lte: today },
      endDate: { $gte: today },
      visibleTo: userId, // Check if the user is in the visibleTo array
    })
      .populate('visibleTo')
      .populate('createdBy')
      .populate('updatedBy')
      .populate('project')
      .sort({ startDate: -1 });

    res.status(200).json(announcements);
  } catch (error) {
    console.error('Error fetching announcements for the project:', error);
    res.status(500).json({ error: 'Failed to fetch announcements for the project' });
  }
};

// Get announcements by project ID
exports.getAnnouncementsByProjectId = async (req, res) => {
  const projectId = req.params.projectId;
  try {
    const announcements = await Announcement.find({ project: projectId })
      .populate('visibleTo')
      .populate('createdBy')
      .populate('updatedBy')
      .populate('project')
      .sort({ startDate: -1 });

    res.status(200).json(announcements);
  } catch (error) {
    console.error('Error fetching announcements for the project:', error);
    res.status(500).json({ error: 'Failed to fetch announcements for the project' });
  }
};

// Get announcement by ID
exports.getAnnouncementById = async (req, res) => {
  const announcementId = req.params.id;
  try {
    const announcement = await Announcement.findById(announcementId)
      .populate('visibleTo')
      .populate('createdBy')
      .populate('updatedBy')
      .populate('project');

    if (announcement) {
      res.status(200).json(announcement);
    } else {
      res.status(404).json({ error: 'Announcement not found' });
    }
  } catch (error) {
    console.error('Error fetching announcement:', error);
    res.status(500).json({ error: 'Failed to fetch announcement' });
  }
};

// Update an announcement by ID
exports.updateAnnouncement = async (req, res) => {
  const announcementId = req.params.id;
  const announcementData = req.body;

  try {
    const announcement = await Announcement.findByIdAndUpdate(announcementId, announcementData, { new: true })
      .populate('visibleTo')
      .populate('createdBy')
      .populate('updatedBy')
      .populate('project');
    if (announcement) {
      const projectId = announcement.project && (announcement.project._id || announcement.project);

      // Send notifications to all related users
      const notifications = announcement.visibleTo.map((userId) => ({
        user: userId,
        type: "Update Announcement",
        title: {
          enUS: "Updated Announcement",
          zhHK: "更新公告",
          zhCN: "更新公告",
        },
        description: {
          enUS: `The announcement "${announcement.title}" has been updated.`,
          zhHK: `公告「${announcement.title}」已更新。`,
          zhCN: `公告「${announcement.title}」已更新。`,
        },
        link: projectId ? `/project/${projectId}/announcement/${announcement._id}` : `/announcement/${announcement._id}`,
        read: false,
      }));

      const savedNotifications = await Notification.insertMany(notifications);

      // Emit notifications to all related users
      if (usersio) {
        announcement.visibleTo.forEach((userId) => {
          if (usersio[userId]) {
            usersio[userId].emit('notification', savedNotifications.find((n) => n.user.toString() === userId.toString()));
          }
        });
      }

      res.status(200).json(announcement);
    } else {
      res.status(404).json({ error: 'Announcement not found' });
    }
  } catch (error) {
    console.error('Error updating announcement:', error);
    res.status(500).json({ error: 'Failed to update announcement' });
  }
};

// Delete an announcement by ID
exports.deleteAnnouncement = async (req, res) => {
  const announcementId = req.params.id;

  try {
    const announcement = await Announcement.findByIdAndDelete(announcementId);

    if (announcement) {
      const projectId = announcement.project && (announcement.project._id || announcement.project);

      // Send notifications to all related users
      const notifications = announcement.visibleTo.map((userId) => ({
        user: userId,
        type: "Delete Announcement",
        title: {
          enUS: "Deleted Announcement",
          zhHK: "刪除公告",
          zhCN: "删除公告",
        },
        description: {
          enUS: `The announcement "${announcement.title}" has been deleted.`,
          zhHK: `公告「${announcement.title}」已被刪除。`,
          zhCN: `公告「${announcement.title}」已被删除。`,
        },
        link: projectId ? `/project/${projectId}/announcement/${announcement._id}` : `/announcement/${announcement._id}`,
        read: false,
      }));

      const savedNotifications = await Notification.insertMany(notifications);

      // Emit notifications to all related users
      if (usersio) {
        announcement.visibleTo.forEach((userId) => {
          if (usersio[userId]) {
            usersio[userId].emit('notification', savedNotifications.find((n) => n.user.toString() === userId.toString()));
          }
        });
      }

      res.status(200).json({ message: 'Announcement deleted successfully' });
    } else {
      res.status(404).json({ error: 'Announcement not found' });
    }
  } catch (error) {
    console.error('Error deleting announcement:', error);
    res.status(500).json({ error: `Failed to delete announcement: ${error.message}` });
  }
};