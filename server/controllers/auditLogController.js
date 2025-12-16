const AuditLog = require('../models/auditLog');

// Create a new audit log entry
exports.createAuditLog = (req, res) => {
  const logData = req.body;
  AuditLog.create(logData)
    .then(logEntry => {
      res.status(201).json(logEntry);
    })
    .catch(error => {
      res.status(500).json({ error: 'Failed to create audit log entry' });
    });
};

// Get all audit log entries
exports.getAllAuditLogs = (req, res) => {
  AuditLog.find()
    .then(logEntries => {
      res.status(200).json(logEntries);
    })
    .catch(error => {
      res.status(500).json({ error: 'Failed to fetch audit log entries' });
    });
};

// Get an audit log entry by ID
exports.getAuditLogById = (req, res) => {
  const logId = req.params.id;
  AuditLog.findById(logId)
    .then(logEntry => {
      if (logEntry) {
        res.status(200).json(logEntry);
      } else {
        res.status(404).json({ error: 'Audit log entry not found' });
      }
    })
    .catch(error => {
      res.status(500).json({ error: 'Failed to fetch audit log entry' });
    });
};

// Update an audit log entry by ID
exports.updateAuditLog = (req, res) => {
  const logId = req.params.id;
  const logData = req.body;
  AuditLog.findByIdAndUpdate(logId, logData, { new: true })
    .then(logEntry => {
      if (logEntry) {
        res.status(200).json(logEntry);
      } else {
        res.status(404).json({ error: 'Audit log entry not found' });
      }
    })
    .catch(error => {
      res.status(500).json({ error: 'Failed to update audit log entry' });
    });
};

// Delete an audit log entry by ID
exports.deleteAuditLog = (req, res) => {
  const logId = req.params.id;
  AuditLog.findByIdAndDelete(logId)
    .then(logEntry => {
      if (logEntry) {
        res.status(200).json({ message: 'Audit log entry deleted successfully' });
      } else {
        res.status(404).json({ error: 'Audit log entry not found' });
      }
    })
    .catch(error => {
      res.status(500).json({ error: 'Failed to delete audit log entry' });
    });
};