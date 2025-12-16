const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  permissions: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Permission' }
  ],
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

const Role = mongoose.model('Role', roleSchema);

module.exports = Role;