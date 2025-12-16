const notification = require('../models/notification');
const io = require('../socketio');

// @desc Get all notifications
// @Route GET /notes
// @Access Private
const getAllNotifications = async (req, res) => {
  const { id } = req.params;
  const notifications = await notification.find({ user: id }).sort({ _id: -1 })/*.limit(1000)*/.lean();

  if (!notifications || notifications.length === 0) {
    //return res.status(400).json({ message: 'No notifications found' });
    return res.status(200).json([]);
  }

  const allNotifications = notifications.map((notification) => ({
    ...notification,
  }));

  res.json(allNotifications);
};

// @desc Create a new notification
// @Route POST /notifications
// @Access Private
const createNotification = async (req, res) => {
  const { user, title, type, description } = req.body;
  if (!user || !title || !type || !description) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const newNotification = await notification.create({ user, title, type, description });

  // Emit the new notification to the specific user
  io.emit('notification', user, newNotification);

  res.status(201).json(newNotification);
};

// @desc delete a notification
// @Route DELETE /notifications
// @Private access
const deleteNotification = async (req, res) => {
  const { id } = req.body;
  if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ message: `You must give a valid id: ${id}` });
  }

  const deleteNotification = await notification.findById(id).exec();
  if (!deleteNotification) {
    return res
      .status(400)
      .json({ message: `Can't find a notification with id: ${id}` });
  }
  const result = await deleteNotification.deleteOne();
  if (!result) {
    return res
      .status(400)
      .json({ message: `Can't delete the notification with id: ${id}` });
  }
  res.json({ message: `Notification with id: ${id} deleted with success` });
};

// @desc delete All notification
// @Route DELETE /notifications/all
// @Private access
const deleteAllNotifications = async (req, res) => {
  const { id } = req.body;
  if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ message: `You must give a valid id: ${id}` });
  }
  const notificationsDeleteMany = await notification.deleteMany({ user: id });
  if (!notificationsDeleteMany) {
    return res
      .status(400)
      .json({ message: 'Error Deleting all notifications as read' });
  }
  res.json({ message: `All notifications for user ${id}marked was deleted` });
};

// @desc Mark One Notification As Read
// @Route Patch /notifications/
// @Access Private
const markOneNotificationAsRead = async (req, res) => {
  const { id } = req.params;

  if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ message: 'Invalid notification ID' });
  }

  const notificationDoc = await notification.findById(id);
  if (!notificationDoc) {
    return res.status(404).json({ message: 'Notification not found' });
  }

  notificationDoc.read = true;
  await notificationDoc.save();

  res.json({ message: 'Notification marked as read', notification: notificationDoc });
};

// @desc Mark one notification as unread
// @Route PATCH /notifications/:id/unread
// @Access Private
const markOneNotificationAsUnread = async (req, res) => {
  const { id } = req.params;

  if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ message: 'Invalid notification ID' });
  }

  const notificationDoc = await notification.findById(id);
  if (!notificationDoc) {
    return res.status(404).json({ message: 'Notification not found' });
  }

  notificationDoc.read = false;
  await notificationDoc.save();

  res.json({ message: 'Notification marked as unread', notification: notificationDoc });
};

// @desc Mark All Notifications As Read
// @Route Patch /notifications/All
// @Access Private
const markAllNotificationsAsRead = async (req, res) => {
  const { userId } = req.params;

  if (!userId || !userId.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ message: `Invalid user ID: ${userId}` });
  }

  try {
    const result = await notification.updateMany(
      { user: userId, read: false },
      { $set: { read: true } }
    );

    if (!result.modifiedCount) {
      return res.status(400).json({ message: 'No unread notifications found for this user' });
    }

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred while marking notifications as read', error });
  }
};

module.exports = {
  getAllNotifications,
  createNotification,
  deleteNotification,
  deleteAllNotifications,
  markOneNotificationAsRead,
  markOneNotificationAsUnread,
  markAllNotificationsAsRead,
};