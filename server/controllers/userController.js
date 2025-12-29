const User = require('../models/user');
const Project = require('../models/project');
const Role = require('../models/role');
const Permission = require('../models/permission');
const Task = require('../models/task');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Login
exports.login = async (req, res) => {
  try {
    if (req.body && req.body.username && req.body.password) {
      const userData = await User.findOne({ username: req.body.username });
      //console.log(userData);
      if (userData) {
        const isPasswordValid = await bcrypt.compare(
          req.body.password,
          userData.password
        );
        if (isPasswordValid) {
          const token = jwt.sign({
            _id: userData._id,
            user: userData.username,
            email: userData.email
          }, process.env.JWT_SECRET_KEY,
          { expiresIn: '24h' });
          res.status(200).json({
            title: 'Logged in successfully!',
            status: true,
            token: token,
            user: userData
          });
        } else {
          res.status(401).json({
            errorMessage: 'Invalid username or password!',
            status: false
          });
        }
      } else {
        res.status(401).json({
          errorMessage: 'Invalid username or password!',
          status: false
        });
      }
    } else {
      res.status(400).json({
        errorMessage: 'The fields must not be empty!',
        status: false
      });
    }
  } catch (e) {
    res.status(400).json({
      errorMessage: 'Something went wrong! ',
      status: false
    });
  }
};

// Register
exports.register = async (req, res) => {
  try {
    if (
      req.body &&
      req.body.firstName &&
      req.body.lastName &&
      req.body.gender &&
      req.body.email &&
      /*req.body.phone &&
      req.body.organization &&
      req.body.department &&
      req.body.jobTitle &&*/
      req.body.username &&
      req.body.password &&
      req.body.createdDate &&
      req.body.updatedDate &&
      req.body.active
    ) {
      const data = await User.find({ username: req.body.username });
      //console.log(data);
      if (data.length === 0) {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const newUser = new User({
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          gender: req.body.gender,
          email: req.body.email,
          phone: req.body.phone,
          organization: req.body.organization,
          department: req.body.department,
          jobTitle: req.body.jobTitle,
          username: req.body.username,
          password: hashedPassword,
          createdDate: req.body.createdDate,
          updatedDate: req.body.updatedDate,
          active: req.body.active,
        });
        const savedUser = await newUser.save();
        res.status(200).json({
          title: "Registered Successfully!",
          status: true,
        });
      } else {
        res.status(400).json({
          errorMessage: `Username ${req.body.username} Already Exist!`,
          status: false,
        });
      }
    } else {
      res.status(400).json({
        errorMessage: "The fields must not be empty!",
        status: false,
      });
    }
  }
  catch (e) {
    console.log(e);
    res.status(400).json({
      errorMessage: "Something went wrong!",
      status: false,
    });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const userId = req.params.id;
    const { currentPassword, newPassword } = req.body;
    
    // Check if the user with the given ID exists in the database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the current password matches the one stored in the database
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid current password' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password with the hashed password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('An error occurred while updating password:', error);
    res.status(500).json({ message: 'Failed to update password: ' + error.message });
  }
};

// Get all users
exports.getUsers = (req, res) => {
  User.find()
    .then(users => {
      res.status(200).json(users);
    })
    .catch(error => {
      res.status(500).json({ error: 'Failed to fetch users' });
    });
};

// Get a user by ID
exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Find the user by userId
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userObject = user.toObject();

    // Find the projects that the user is a part of
    const projects = await Project.find({ 'teamMembers._id': userId });

    const userProjects = await Promise.all(projects.map(async (project) => {
      const teamMember = project.teamMembers.find(member => member._id.toString() === userId);
      const role = await Role.findOne({ name: teamMember.role }).populate('permissions');
      const permissions = role ? role.permissions.map(permission => permission.toObject()) : [];
      
      return {
        _id: project._id,
        role: teamMember.role,
        permissions: permissions
      };
    }));

    userObject.projects = userProjects;

    res.json(userObject);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Search users by keywords
exports.getUsersBySearch = async (req, res) => {
  try {
    const keywords = req.query.keywords;

    // Build the search query
    const searchQuery = {
      $or: [
        { firstName: { $regex: keywords, $options: 'i' } },
        { lastName: { $regex: keywords, $options: 'i' } },
        { email: { $regex: keywords, $options: 'i' } },
        /*{ phone: { $regex: keywords, $options: 'i' } },
        { organization: { $regex: keywords, $options: 'i' } },
        { department: { $regex: keywords, $options: 'i' } },
        { jobTitle: { $regex: keywords, $options: 'i' } },
        { username: { $regex: keywords, $options: 'i' } },*/
      ],
    };

    // Find users matching the search query
    const users = await User.find(searchQuery);

    res.status(200).json(users);
  } catch (error) {
    console.error('An error occurred while searching users:', error);
    res.status(500).json({ message: 'Failed to search users: ' + error.message });
  }
};

// Update a user by ID
exports.updateUser = (req, res) => {
  const userId = req.params.id;
  const userData = req.body;
  User.findByIdAndUpdate(userId, userData, { new: true })
    .then(user => {
      if (user) {
        res.status(200).json(user);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    })
    .catch(error => {
      res.status(500).json({ error: 'Failed to update user' });
    });
};

// Get a user's projects
exports.getUserProjects = async (req, res) => {
  try {
    const userId = req.params.id;

    // Find the user by _id
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find projects where the user is a team member and populate teamMembers
    const projects = await Project.find({ 'teamMembers._id': userId })
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName')
      .populate({
        path: 'teamMembers._id',
        model: 'User',
        select: 'firstName lastName gender email phone organization department jobTitle createdDate updatedDate'
      });

    // Import Task model if not already imported
    // const Task = require('../models/task');

    const transformedProjects = await Promise.all(projects.map(async project => {
      const tasks = await Task.find({ project: project._id });
      
      const transformedTeamMembers = project.teamMembers.map(member => {
        return {
          _id: member._id._id,
          firstName: member._id.firstName,
          lastName: member._id.lastName,
          gender: member._id.gender,
          email: member._id.email,
          phone: member._id.phone,
          organization: member._id.organization,
          department: member._id.department,
          jobTitle: member._id.jobTitle,
          createdDate: member._id.createdDate,
          updatedDate: member._id.updatedDate,
          role: member.role
        };
      });

      const totalTasks = tasks.filter(task => task.status !== 'Cancelled').length;
      const completedTasks = tasks.filter(task => task.status === 'Done').length;

      return {
        _id: project._id,
        title: project.title,
        description: project.description,
        teamMembers: transformedTeamMembers,
        color: project.color,
        createdDate: project.createdDate,
        updatedDate: project.updatedDate,
        totalTasks,
        completedTasks
      };
    }));

    res.json(transformedProjects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get a user's projects and tasks
/*exports.getUserProjectsAndTasks = (req, res) => {
  const userId = req.params.id;
  User.findById(userId)
    .populate({
      path: 'projects',
      populate: {
        path: 'tasks',
        model: 'Task'
      }
    })
    .then(user => {
      if (user) {
        res.status(200).json(user.projects);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    })
    .catch(error => {
      res.status(500).json({ error: 'Failed to fetch user projects and tasks' });
    });
};*/