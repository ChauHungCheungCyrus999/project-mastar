const Tag = require('../models/tag');

// Create a new tag
exports.createTag = (req, res) => {
  const tagData = req.body;
  Tag.create(tagData)
    .then(tag => {
      res.status(201).json(tag);
    })
    .catch(error => {
      res.status(500).json({ error: 'Failed to create tag' });
    });
};

// Get all tag
exports.getAllTag = (req, res) => {
  Tag.find()
    .then(categories => {
      res.status(200).json(categories);
    })
    .catch(error => {
      res.status(500).json({ error: 'Failed to fetch tag' });
    });
};

// Get a tag by ID
exports.getTagById = (req, res) => {
  const tagId = req.params.id;
  Tag.findById(tagId)
    .then(tag => {
      if (tag) {
        res.status(200).json(tag);
      } else {
        res.status(404).json({ error: 'Tag not found' });
      }
    })
    .catch(error => {
      res.status(500).json({ error: 'Failed to fetch tag' });
    });
};

// Get tag by project ID
exports.getTagsByProjectId = (req, res) => {
  const projectId = req.params.projectId;
  Tag.find({ project: projectId })
    .then(tag => {
      res.status(200).json(tag);
    })
    .catch(error => {
      res.status(500).json({ error: 'Failed to fetch tag' });
    });
};

exports.getActiveTagsByProjectId = (req, res) => {
  const projectId = req.params.projectId;
  Tag.find({ project: projectId, active: true })
    .then(tag => {
      res.status(200).json(tag);
    })
    .catch(error => {
      res.status(500).json({ error: 'Failed to fetch tag' });
    });
};

// Update a tag by ID
exports.updateTag = (req, res) => {
  const tagId = req.params.id;
  const tagData = req.body;
  Tag.findByIdAndUpdate(tagId, tagData, { new: true })
    .then(tag => {
      if (tag) {
        res.status(200).json(tag);
      } else {
        res.status(404).json({ error: 'Tag not found' });
      }
    })
    .catch(error => {
      res.status(500).json({ error: 'Failed to update tag' });
    });
};

// Delete a tag by ID
exports.deleteTag = (req, res) => {
  const tagId = req.params.id;
  Tag.findByIdAndDelete(tagId)
    .then(tag => {
      if (tag) {
        res.status(200).json({ message: 'Tag deleted successfully' });
      } else {
        res.status(404).json({ error: 'Tag not found' });
      }
    })
    .catch(error => {
      res.status(500).json({ error: 'Failed to delete tag' });
    });
};