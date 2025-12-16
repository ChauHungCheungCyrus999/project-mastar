const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const announcementSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    default: "",
    required: false,
  },
  startDate: {
    type: Date,
    required: false,
  },
  endDate: {
    type: Date,
    required: false,
  },
  active: {
    type: Boolean,
    default: true,
    required: true,
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
  visibleTo: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }],
  project: {
    type: Schema.Types.ObjectId, // Ensure this is ObjectId
    ref: 'Project',
    required: false,
    default: null, // Default to null
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdDate: {
    type: Date,
    required: true,
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  updatedDate: {
    type: Date,
    required: true,
  },
});

const Announcement = mongoose.model('Announcement', announcementSchema);

module.exports = Announcement;
