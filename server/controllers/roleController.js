const Role = require('../models/role');

// Create a new role
exports.createRole = (req, res) => {
  const roleData = req.body;
  Role.create(roleData)
    .then(role => {
      res.status(201).json(role);
    })
    .catch(error => {
      res.status(500).json({ error: 'Failed to create role' });
    });
};

// Get all roles
exports.getAllRoles = (req, res) => {
  Role.find()
    .then(roles => {
      res.status(200).json(roles);
    })
    .catch(error => {
      res.status(500).json({ error: 'Failed to fetch roles' });
    });
};

// Get a role by ID
exports.getRoleById = (req, res) => {
  const roleId = req.params.id;
  Role.findById(roleId)
    .then(role => {
      if (role) {
        res.status(200).json(role);
      } else {
        res.status(404).json({ error: 'Role not found' });
      }
    })
    .catch(error => {
      res.status(500).json({ error: 'Failed to fetch role' });
    });
};

// Update a role by ID
exports.updateRole = (req, res) => {
  const roleId = req.params.id;
  const roleData = req.body;
  Role.findByIdAndUpdate(roleId, roleData, { new: true })
    .then(role => {
      if (role) {
        res.status(200).json(role);
      } else {
        res.status(404).json({ error: 'Role not found' });
      }
    })
    .catch(error => {
      res.status(500).json({ error: 'Failed to update role' });
    });
};

// Delete a role by ID
exports.deleteRole = (req, res) => {
  const roleId = req.params.id;
  Role.findByIdAndDelete(roleId)
    .then(role => {
      if (role) {
        res.status(200).json({ message: 'Role deleted successfully' });
      } else {
        res.status(404).json({ error: 'Role not found' });
      }
    })
    .catch(error => {
      res.status(500).json({ error: 'Failed to delete role' });
    });
};