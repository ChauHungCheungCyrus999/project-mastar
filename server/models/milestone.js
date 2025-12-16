const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const milestoneSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      enum: ['To Do', 'In Progress', 'Under Review', 'Done', 'On Hold', 'Cancelled'],
      default: 'To Do',
      required: false,
    },
    priority: {
      type: String,
      enum: ['', 'Very High', 'High', 'Medium', 'Low', 'Very Low'],
      required: false,
    },
    difficultyLevel: {
      type: String,
      enum: ['', 'Easy', 'Moderate', 'Difficult', 'Very Difficult'],
      required: false,
    },
    color: {
      type: String,
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
    actualStartDate: {
      type: Date,
      required: false,
    },
    actualEndDate: {
      type: Date,
      required: false,
    },
    active: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  },
  {
    timestamps: {
      createdAt: 'createdDate',
      updatedAt: 'updatedDate'
    }
  }
);

const Milestone = mongoose.model('Milestone', milestoneSchema);

module.exports = Milestone;