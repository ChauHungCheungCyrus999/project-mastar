const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationSchema = new Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, require: true },
    type: { type: String, require: true },
    title: {
      enUS: { type: String, require: true },
      zhHK: { type: String, require: true },
      zhCN: { type: String, require: true }
    },
    description: {
      enUS: { type: String, require: true },
      zhHK: { type: String, require: true },
      zhCN: { type: String, require: true }
    },
    link: { type: String },
    read: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model('Notification', notificationSchema);