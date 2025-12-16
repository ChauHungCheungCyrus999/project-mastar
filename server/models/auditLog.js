const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const auditLogSchema = new Schema({
  action: String,
  timestamp: { type: Date, default: Date.now },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  ipAddress: String,
  requestUrl: String,
  requestData: Object,
  responseStatus: Number,
  responseData: Object,
});

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;