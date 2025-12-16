const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },

  gender: { type: String, enum: ['Male', 'Female'] },

  email: { type: String, required: true, unique: true },
  phone: { type: String },

  organization: { type: String },
  department: { type: String },
  jobTitle: { type: String },

  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  createdDate: Date,
  updatedDate: Date,

  subscription: {
    endpoint: String,
    keys: {
      p256dh: String,
      auth: String,
    },
  },
  
  active: { type: Boolean, required: true }
});

const User = mongoose.model('User', userSchema);

module.exports = User;