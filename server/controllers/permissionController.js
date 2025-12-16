const Permission = require('../models/permission');
const Role = require('../models/role');

// Create a new permission
exports.createPermission = (req, res) => {
  const permissionData = req.body;
  Permission.create(permissionData)
    .then(permission => {
      res.status(201).json(permission);
    })
    .catch(error => {
      res.status(500).json({ error: 'Failed to create permission: ' + error.message });
    });
};

// Get all permissions
exports.getAllPermissions = (req, res) => {
  Permission.find()
    .then(permissions => {
      res.status(200).json(permissions);
    })
    .catch(error => {
      res.status(500).json({ error: 'Failed to fetch permissions' });
    });
};

// Get a permission by ID
exports.getPermissionById = (req, res) => {
  const permissionId = req.params.id;
  Permission.findById(permissionId)
    .then(permission => {
      if (permission) {
        res.status(200).json(permission);
      } else {
        res.status(404).json({ error: 'Permission not found' });
      }
    })
    .catch(error => {
      res.status(500).json({ error: 'Failed to fetch permission' });
    });
};

// Update a permission by ID
exports.updatePermission = (req, res) => {
  const permissionId = req.params.id;
  const permissionData = req.body;
  Permission.findByIdAndUpdate(permissionId, permissionData, { new: true })
    .then(permission => {
      if (permission) {
        res.status(200).json(permission);
      } else {
        res.status(404).json({ error: 'Permission not found' });
      }
    })
    .catch(error => {
      res.status(500).json({ error: 'Failed to update permission' });
    });
};

// Delete a permission by ID
exports.deletePermission = (req, res) => {
  const permissionId = req.params.id;
  Permission.findByIdAndDelete(permissionId)
    .then(permission => {
      if (permission) {
        res.status(200).json({ message: 'Permission deleted successfully' });
      } else {
        res.status(404).json({ error: 'Permission not found' });
      }
    })
    .catch(error => {
      res.status(500).json({ error: 'Failed to delete permission' });
    });
};

// Update role permissions by ID
exports.grantPermissionsToRole = (req, res) => {
  const roleId = req.params.roleId;
  const permissions = req.body.permissions; // Array of permission IDs

  Role.findByIdAndUpdate(roleId, { permissions: permissions }, { new: true })
    .populate('permissions') // Optional: Populate the permissions field in the response
    .then(role => {
      if (role) {
        res.status(200).json(role);
      } else {
        res.status(404).json({ error: 'Role not found' });
      }
    })
    .catch(error => {
      res.status(500).json({ error: 'Failed to update role permissions' });
    });
};

exports.getRolePermissions = (req, res) => {
  const roleId = req.params.roleId;

  Role.findById(roleId)
    .populate('permissions')
    .then(role => {
      if (role) {
        res.status(200).json(role.permissions);
      } else {
        res.status(404).json({ error: 'Role not found' });
      }
    })
    .catch(error => {
      res.status(500).json({ error: 'Failed to fetch role permissions' });
    });
};