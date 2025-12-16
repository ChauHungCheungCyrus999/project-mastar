const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tagSchema = new Schema({
  name: {
    enUS: { type: String, require: true },
    zhHK: { type: String, require: true },
    zhCN: { type: String, require: true }
  },
  color: {
    type: String,
    required: false,
  },
  active: {
    type: Boolean,
    required: true,
  },
  timestamp: { type: Date, default: Date.now },
  project: { type: Schema.Types.ObjectId, ref: 'Project' }
});

const Tag = mongoose.model('Tag', tagSchema);

module.exports = Tag;