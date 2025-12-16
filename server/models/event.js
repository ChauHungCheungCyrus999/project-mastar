const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: false,
  },
  description: {
    type: String,
    required: false,
  },
  allDay: {
    type: Boolean,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  location: {
    type: String,
    required: false,
  },
  organizers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    }
  ],
  attendees: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    }
  ],
  recurrence: {
    type: String,
    enum: ['None', 'Daily', 'Weekly', 'Monthly', 'Yearly'],
    default: 'None',
    required: true,
  },
  color: {
    type: String,
    required: false,
  },
  attachments: [
    {
      name: {
        type: String,
        required: false,
      },
      path: {
        type: String,
        required: false,
      }
    }
  ],
  /*status: {
    type: String,
    enum: ['To Do', 'In Progress', 'Under Review', 'Done', 'On Hold', 'Cancelled'],
    default: 'To Do',
    required: true,
  },
  priority: {
    type: String,
    enum: ['Very High', 'High', 'Medium', 'Low', 'Very Low', ''],
    required: false,
  },*/
  visibility: {
    type: String,
    enum: ['Private', 'Public'],
    default: 'Public',
    required: true,
  },
  remarks: {
    type: String,
    required: false,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdDate: {
    type: Date,
    required: true,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  updatedDate: {
    type: Date,
    required: true,
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  }
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
