const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const taskSchema = new Schema({
  taskName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  milestone: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Milestone',
    required: false
  },
  category: {
    type: String,
    required: false,
  },
  tags: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tag',
      required: false,
    },
  ],
  personInCharge: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
  ],
  status: {
    type: String,
    enum: ['To Do', 'In Progress', 'Under Review', 'Done', 'On Hold', 'Cancelled'],
    default: 'To Do',
    required: true,
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
  subtasks: [
    {
      name: {
        type: String,
        required: false
      },
      completed: {
        type: Boolean,
        required: false
      }
    }
  ],
  comments: [
    {
      content: {
        type: String,
        required: true,
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
      updatedDate: {
        type: Date,
        required: true,
      },
    }
  ],
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
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  }
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;