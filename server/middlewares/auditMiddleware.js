const AuditLog = require('../models/auditLog');

function auditMiddleware(req, res, next) {
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

  const auditLogEntry = new AuditLog({
    action,
    timestamp: new Date(),
    userId,
    ipAddress: req.ip,
    requestUrl: req.originalUrl,
    requestData: req.body,
    responseStatus: res.statusCode,
    responseData: res.locals.data,
  });

  auditLogEntry.save()
    .then(() => next())
    .catch((error) => {
      console.error('Error saving audit log:', error);
      next(error); // Pass the error to the error handling middleware
    });
}

module.exports = auditMiddleware;