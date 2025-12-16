const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userProfileSchema = new Schema({
  language: {
    type: String,
    required: false,
  },
  theme: {
    type: String,
    required: false,
  },
  primaryColor: {
    type: String,
    required: false,
  },
  componentSize: {
    type: String,
    required: false,
  },
  dataGridViews: [],
  dashboardPinState: {
    type: String,
    required: false,
  },
  showTaskDetails: {
    type: String,
    required: false,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
});

const UserProfile = mongoose.model('UserProfile', userProfileSchema);

module.exports = UserProfile;