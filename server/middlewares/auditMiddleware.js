const AuditLog = require('../models/auditLog');
const bcrypt = require('bcrypt');

async function auditMiddleware(req, res, next) {
  let action;

  // Determine the action based on the HTTP method or a custom field
  if (req.method === 'GET') {
    action = 'Read';
  }
  else if (req.method === 'POST') {
    if (req.path==='/login') {
      action = 'Login';
    }
    else
    if (req.path==='/register') {
      action = 'Register';
    }
    else {
      action = 'Create';
    }
  } else if (req.method === 'PUT') {
    action = 'Update';
  } else if (req.method === 'DELETE') {
    action = 'Delete';
  } else if (req.body && req.body.action) {
    action = req.body.action;
  } else {
    action = 'Unknown';
  }

  const { userId } = req;

  // Sanitize and encrypt sensitive data
  const sanitizedRequestData = { ...req.body };
  if (sanitizedRequestData.password) {
    sanitizedRequestData.password = await bcrypt.hash(sanitizedRequestData.password, 10); // Hash password like in database
  }
  if (sanitizedRequestData.currentPassword) {
    sanitizedRequestData.currentPassword = await bcrypt.hash(sanitizedRequestData.currentPassword, 10);
  }
  if (sanitizedRequestData.newPassword) {
    sanitizedRequestData.newPassword = await bcrypt.hash(sanitizedRequestData.newPassword, 10);
  }

  const auditLogEntry = new AuditLog({
    action,
    timestamp: new Date(),
    userId,
    ipAddress: req.ip,
    requestUrl: req.originalUrl,
    requestData: sanitizedRequestData,
    responseStatus: res.statusCode,
    responseData: res.locals.data,
  });

  try {
    await auditLogEntry.save();
    next();
  } catch (error) {
    console.error('Error saving audit log:', error);
    next(error);
  }
}

module.exports = auditMiddleware;