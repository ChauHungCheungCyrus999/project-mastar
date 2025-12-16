const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const projectSchema = new Schema({
  title: {
    type: String,
    required: false,
  },
  description: {
    type: String,
    required: false,
  },
  color: {
    type: String,
    required: false
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
  teamMembers: [{ 
    _id: { type: Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['Administrator', 'Project Manager', 'Team Member', 'Stakeholder'] }
  }],
  tasks: [{ type: Schema.Types.ObjectId, ref: 'Task' }]
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;