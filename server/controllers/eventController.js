const path = require('path');
const fs = require('fs');

const Event = require('../models/event');
const User = require('../models/user');
const Project = require('../models/project');
const Notification = require('../models/notification');

const { usersio } = require('../socketio');
const webpush = require('web-push');

// Helper function to send notifications
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

// Create a new event
exports.createEvent = async (req, res) => {
  try {
    const eventData = req.body;
    const currentUserId = req.body.createdBy;

    // Attach file URLs if provided
    if (req.files && req.files.attachments) {
      const fileUrls = req.files.attachments.map(file => `/uploads/${file.filename}`);
      eventData.attachments = fileUrls;
    }

    const event = await Event.create(eventData);

    // Populate the organizers & attendees field
    const organizers = await User.find(
      { _id: { $in: event.organizers } }
    );

    const attendees = await User.find(
      { _id: { $in: event.attendees } }
    );

    event.attendees = attendees;

    // Respond with the created event
    res.status(201).json(event);

    // Send notifications to attendees
    const project = await Project.findById(event.project);

    for (const person of event.attendees) {
      if (person._id.toString() !== currentUserId.toString()) {
        try {
          const notification = await Notification.create({
            user: person._id,
            type: 'Create Event',
            title: {
              enUS: project.title,
              zhHK: project.title,
              zhCN: project.title,
            },
            description: {
              enUS: `You have been invited to the event "${event.title}".`,
              zhHK: `您被邀請參加活動「${event.title}」。`,
              zhCN: `您被邀请参加活动「${event.title}」。`,
            },
            link: `/project/${event.project}/calendar`,
            read: false,
          });

          if (usersio && usersio[person._id]) {
            usersio[person._id].emit('notification', notification);
          } else {
            console.warn(`No active socket connection for user ${person._id}`);
          }

          // Send web push notification
          if (person.subscription) {
            const personInCharge = await User.findById(person._id);
            
            if (personInCharge) {
              sendNotification(person, JSON.stringify({
                title: 'New Event Invitation',
                body: `You have been invited to the event "${event.title}".`,
                link: `/project/${event.project}/event/${event._id}`,
              }));
            }
          }
        } catch (notificationError) {
          console.error(`Error creating notification for user ${person._id}:`, notificationError);
        }
      }
    }
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
};

// Retrieve all events
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate('attendees')
      .populate('organizers')
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName')
      .populate('project', 'title');

    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};

// Get event by ID
exports.getEventById = async (req, res) => {
  const eventId = req.params.id;
  try {
    const event = await Event.findById(eventId)
      .populate('attendees')
      .populate('organizers')
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName')
      .populate('project', 'title');

    if (event) {
      res.status(200).json(event);
    } else {
      res.status(404).json({ error: 'Event not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch event' });
  }
};

// Get events by project ID
exports.getEventsByProjectId = async (req, res) => {
  const projectId = req.params.projectId;

  try {
    const events = await Event.find({ project: projectId })
      .populate('attendees')
      .populate('organizers')
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName')
      .populate('project', 'title');

    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};

// Update an event
exports.updateEvent = async (req, res) => {
  const eventId = req.params.id;
  const eventData = req.body;
  const currentUserId = req.body.updatedBy;

  try {
    const event = await Event.findByIdAndUpdate(eventId, eventData, { new: true })
      .populate('attendees');

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Send notifications to attendees about the update
    for (const person of event.attendees) {
      if (person._id.toString() !== currentUserId.toString()) {
        try {
          const project = await Project.findById(event.project);
          const notification = await Notification.create({
            user: person._id,
            type: 'Update Event',
            title: {
              enUS: project.title,
              zhHK: project.title,
              zhCN: project.title,
            },
            description: {
              enUS: `The event "${event.title}" has been updated.`,
              zhHK: `活動「${event.title}」已更新。`,
              zhCN: `活动「${event.title}」已更新。`,
            },
            link: `/project/${event.project}/event/${event._id}`,
            read: false,
          });

          if (usersio && usersio[person._id]) {
            usersio[person._id].emit('notification', notification);
          }

          sendNotification(person, JSON.stringify({
            title: 'Event Update',
            body: `The event "${event.title}" has been updated.`,
            link: `/project/${event.project}/event/${event._id}`,
          }));
        } catch (notificationError) {
          console.error(`Error creating notification for user ${person._id}:`, notificationError);
        }
      }
    }

    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update event' });
  }
};

// Delete an event
exports.deleteEvent = async (req, res) => {
  const eventId = req.params.id;

  try {
    const event = await Event.findByIdAndDelete(eventId);

    if (event) {
      // Delete associated attachments
      const deletePromises = event.attachments.map(attachment => {
        const fullPath = path.join(__dirname, '..', attachment.path);

        return new Promise((resolve, reject) => {
          fs.access(fullPath, fs.constants.F_OK, (err) => {
            if (err) {
              console.warn(`File not found: ${fullPath}`);
              resolve();
            } else {
              fs.unlink(fullPath, (unlinkErr) => {
                if (unlinkErr) {
                  console.error('File deletion error:', unlinkErr);
                  reject(unlinkErr);
                } else {
                  resolve();
                }
              });
            }
          });
        });
      });

      await Promise.all(deletePromises);

      res.status(200).json({ message: 'Event and attachments deleted successfully' });
    } else {
      res.status(404).json({ error: 'Event not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete event' });
  }
};