const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const socketIo = require('socket.io');

const Project = require('./models/project');
const Milestone = require('./models/milestone');
const Task = require('./models/task');
const Tag = require('./models/tag');
const Event = require('./models/event');
const User = require('./models/user');
const Announcement = require('./models/announcement');

const authMiddleware = require('./middlewares/authMiddleware');

const dotenv = require('dotenv');
dotenv.config();

const app = express();


// Set up storage for multer (修正: 防止檔案覆蓋，確保唯一檔名)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = '';
    uploadPath = path.join(__dirname, 'uploads', req.body.folder || 'tasks'); // 預設為 tasks
    // 確保目錄存在
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // 使用毫秒級時間戳+隨機數，確保唯一
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${uniqueSuffix}-${decodeURI(name)}${ext}`);
  },
});

const upload = multer({ storage });

// Connect to MongoDB
mongoose.connect(process.env.DB_CONNECTION_URL, {
  //useNewUrlParser: true,
  //useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB');

  // Start the server after successfully connecting to the database
  const server = http.createServer(app);
  const io = socketIo(server, {
    cors: {
      origin: process.env.CLIENT_HOST,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      credentials: true
    }
  });

  // Middleware to parse JSON request bodies
  app.use(cors());  // Enable CORS
  app.use(bodyParser.urlencoded({
    limit: '256mb',
    extended: false
  }));
  app.use(express.json());

  // Socket.IO setup
  io.on('connection', (socket) => {
    //console.log('A user connected');
    // handle socket events here
  });

  require('./socketio')(io);

  // API routes
  // Protected route
  app.get('/api/protected', verifyToken, (req, res) => {
    res.status(200).json({
      message: 'Protected route accessed successfully!',
      status: true
    })
  });

  // Upload endpoint
  app.post('/api/upload', upload.array('files'), (req, res) => {
    const files = req.files.map(file => ({
      name: file.originalname,
      path: req.body.folder ? `/uploads/${req.body.folder}/${file.filename}` : `/uploads/tasks/${file.filename}`,
    }));
    res.json({ files });
  });

  // Delete file endpoint
  app.delete('/api/delete-file', (req, res) => {
    const filePath = req.body.path;
    
    if (!filePath) {
      return res.status(400).json({ error: 'No file path provided' });
    }

    const fullPath = path.join(__dirname, filePath); // Adjust the path as needed

    fs.unlink(fullPath, (err) => {
      if (err) {
        console.error('File deletion error:', err);
        return res.status(500).json({ error: 'Failed to delete file' });
      }
      res.status(200).json({ message: 'File deleted successfully' });
    });
  });

  // Serve static files from the uploads directory
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


  /* Web Push Notification */
  const webpush = require('web-push');
  // VAPID keys should be generated only once.
  const publicVapidKey = 'BHNXT50DUJsYtrt24psRdputkztj3rzxSn851BAbyxREmjo8ICQxiYFPsDRMeh0NpIl4tpQWpxbOjvCG-6MhuuI';
  const privateVapidKey = '6vC3f3oYpHlDllEdQezHGyvIdQhkVzDPoIvk4-R35f8';
  webpush.setVapidDetails('mailto:bubbleschu@hotmail.com.hk', publicVapidKey, privateVapidKey);

  // Create route for allow client to subscribe to push notification.
  app.post('/subscribe', async (req, res) => {
    const { userId, subscription } = req.body;
    try {
      await User.findByIdAndUpdate(userId, { subscription });
      res.status(200).json({ message: 'Subscription saved' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to save subscription' });
    }
  });


  // Global search
  app.get('/api/search/:keywords', auditMiddleware, async (req, res) => {
    try {
      const keywords = req.params.keywords;
      const userId = req.query.userId;

      console.log('Search request:', { keywords, userId });

      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      if (!keywords || keywords.trim() === '') {
        return res.json({
          projectResults: [],
          userResults: []
        });
      }

      // Find tags matching the keywords
      const tagIds = await Tag.find({
        $or: [
          { 'name.enUS': { $regex: keywords, $options: 'i' } },
          { 'name.zhHK': { $regex: keywords, $options: 'i' } },
          { 'name.zhCN': { $regex: keywords, $options: 'i' } }
        ]
      }).select('_id');

      console.log('Found tag IDs:', tagIds.length);

      // Find milestones matching the keywords
      const milestoneIds = await Milestone.find({
        title: { $regex: keywords, $options: 'i' }
      }).select('_id');

      console.log('Found milestone IDs:', milestoneIds.length);

      // Find tasks matching the keywords or associated with found tags/milestones
      const taskResults = await Task.find({
        $or: [
          { taskName: { $regex: keywords, $options: 'i' } },
          { description: { $regex: keywords, $options: 'i' } },
          { category: { $regex: keywords, $options: 'i' } },
          { status: { $regex: keywords, $options: 'i' } },
          { priority: { $regex: keywords, $options: 'i' } },
          { difficultyLevel: { $regex: keywords, $options: 'i' } },
          { tags: { $in: tagIds } },
          { milestone: { $in: milestoneIds } }
        ]
      })
        .populate('project', '_id title teamMembers')
        .select('_id taskName status project');

      console.log('Found tasks:', taskResults.length);

      const userResults = await User.find({
        $or: [
          { firstName: { $regex: keywords, $options: 'i' } },
          { lastName: { $regex: keywords, $options: 'i' } },
          { email: { $regex: keywords, $options: 'i' } },
          { username: { $regex: keywords, $options: 'i' } }
        ]
      }).select('firstName lastName email username');

      console.log('Found users:', userResults.length);

      const results = [];
      const processedProjectIds = new Set();

      taskResults.forEach(task => {
        console.log('Processing task:', task.taskName, 'Project:', task.project?.title);

        if (task.project) {
          const projectId = task.project._id.toString();

          if (!processedProjectIds.has(projectId)) {
            results.push({
              projectId: projectId,
              title: task.project.title,
              tasks: []
            });
            processedProjectIds.add(projectId);
          }

          // Find the project in results and add the task
          const projectResult = results.find(p => p.projectId === projectId);
          if (projectResult) {
            projectResult.tasks.push({
              taskId: task._id.toString(),
              taskName: task.taskName,
              status: task.status
            });
          }
        }
      });

      console.log('Final results:', { projectResults: results.length, userResults: userResults.length });

      res.json({
        projectResults: results,
        userResults: userResults.filter(user => user.email !== "bubbleschu@hotmail.com.hk")
      });
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({ error: 'Search failed', message: error.message });
    }
  });


  // Import project and task controllers
  const auditLogController = require('./controllers/auditLogController');
  const notificationController = require('./controllers/notificationController');
  const projectsController = require('./controllers/projectsController');
  const milestonesController = require('./controllers/milestonesController');
  const tasksController = require('./controllers/tasksController');
  const tagController = require('./controllers/tagController');
  const eventController = require('./controllers/eventController');
  const userController = require('./controllers/userController');
  const userProfileController = require('./controllers/userProfileController');
  const roleController = require('./controllers/roleController');
  const permissionController = require('./controllers/permissionController');
  const announcementController = require('./controllers/announcementController');

  // Notification
  app.get('/api/notifications/:id', notificationController.getAllNotifications);
  app.patch('/api/notifications/:id/read', notificationController.markOneNotificationAsRead);
  app.patch('/api/notifications/:id/unread', notificationController.markOneNotificationAsUnread);
  app.patch('/api/notifications/:userId/readAll', notificationController.markAllNotificationsAsRead);

  // Audit Log
  //app.post('/api/audit-logs', auditLogController.createAuditLog);
  app.get('/api/audit-logs', auditMiddleware, auditLogController.getAllAuditLogs);
  //app.get('/api/audit-logs/:id', auditLogController.getAuditLogById);
  //app.put('/api/audit-logs/:id', auditLogController.updateAuditLog);
  //app.delete('/api/audit-logs/:id', auditLogController.deleteAuditLog);

  // Project routes
  app.post('/api/project', auditMiddleware, projectsController.createProject);
  app.get('/api/projects', auditMiddleware, projectsController.getAllProjects);
  app.get('/api/project/:id', auditMiddleware, projectsController.getProjectById);
  app.get('/api/project/:projectId/teamMember/:teamMemberId', auditMiddleware, projectsController.getUserByProjectId);
  //app.get('/api/project/:projectId/teamMembers', projectsController.getUsersByProjectId);
  app.get('/api/milestone/project/:projectId', auditMiddleware, projectsController.getMilestoneStatusDistribution);
  app.post('/api/projects/taskCount/admin', auditMiddleware, projectsController.getTaskCountByProject);
  app.post('/api/projects/taskCount', auditMiddleware, projectsController.getTaskCountByProjectByUserId);
  app.put('/api/project/:id', auditMiddleware, projectsController.updateProject);
  app.delete('/api/project/:id', auditMiddleware, projectsController.deleteProject);

  // Milestone routes
  app.post('/api/milestone', auditMiddleware, milestonesController.createMilestone);
  app.get('/api/milestones', auditMiddleware, milestonesController.getAllMilestones);
  app.get('/api/milestone/:id', auditMiddleware, milestonesController.getMilestoneById);
  app.get('/api/milestones/project/:projectId', auditMiddleware, milestonesController.getMilestonesByProjectId);
  app.get('/api/milestones/project/:projectId/active', auditMiddleware, milestonesController.getActiveMilestonesByProjectId);
  app.get('/api/milestones/project/:projectId/status/:status', auditMiddleware, milestonesController.getMilestonesByProjectIdAndStatus);
  app.put('/api/milestone/:id', auditMiddleware, milestonesController.updateMilestone);
  app.put('/api/milestone/:id/status', auditMiddleware, milestonesController.updateMilestoneStatus);
  app.delete('/api/milestone/:id', auditMiddleware, milestonesController.deleteMilestone);
  
  // Task routes
  app.post('/api/task', auditMiddleware, upload.array('attachments'), tasksController.createTask);
  app.get('/api/tasks', auditMiddleware, tasksController.getAllTasks);
  app.get('/api/task/:id', auditMiddleware, tasksController.getTaskById);
  app.get('/api/tasks/project/:projectId', auditMiddleware, tasksController.getTasksByProjectId);
  app.get('/api/tasks/project/:projectId/user/:userId', auditMiddleware, tasksController.getTasksByProjectIdUserId);
  app.get('/api/tasks/project/:projectId/status/:status', auditMiddleware, tasksController.getTasksByProjectIdAndStatus);
  app.get('/api/tasks/milestone/:milestoneId/project/:projectId', auditMiddleware, tasksController.getTasksByMilestone);
  app.get('/api/tasksGroupByMilestone/project/:projectId', auditMiddleware, tasksController.getTasksGroupByMilestone);
  app.get('/api/tasks/upcoming/user/:userId', auditMiddleware, tasksController.getUserUpcomingTasks);
  app.get('/api/tasks/overdue/user/:userId', auditMiddleware, tasksController.getUserOverdueTasks);
  app.get('/api/task/project/:projectId/color', auditMiddleware, tasksController.getUniqueColorsByProjectId);
  app.put('/api/task/:id', auditMiddleware, tasksController.updateTask);
  app.put('/api/task/:id/status', auditMiddleware, tasksController.updateTaskStatus);
  //app.put('/api/tasks/:id/dates', auditMiddleware, tasksController.updateTaskDates);
  app.put('/api/moveProject/task/:taskId/project/:newProjectId', auditMiddleware, tasksController.moveTaskToAnotherProject);
  app.delete('/api/task/:id', auditMiddleware, tasksController.deleteTask);
  app.post('/api/tasks/import', auditMiddleware, tasksController.importTasks);

  // Task Dashboard
  app.get('/api/task-counts', authMiddleware, tasksController.getTaskCounts);

  // Tag routes
  app.post('/api/tag', auditMiddleware, tagController.createTag);
  app.get('/api/tags', auditMiddleware, tagController.getAllTag);
  app.get('/api/tags/project/:projectId', auditMiddleware, tagController.getTagsByProjectId);
  app.get('/api/tags/project/:projectId/active', auditMiddleware, tagController.getActiveTagsByProjectId);
  app.get('/api/tag/:id', auditMiddleware, tagController.getTagById);
  app.put('/api/tag/:id', auditMiddleware, tagController.updateTag);
  app.delete('/api/tag/:id', auditMiddleware, tagController.deleteTag);

  // Comments
  app.get('/api/task/:id/comments', auditMiddleware, tasksController.getCommentsByTaskId);
  app.post('/api/task/:id/comment', auditMiddleware, tasksController.addComment);
  app.put('/api/task/:taskId/comment/:commentId', auditMiddleware, tasksController.updateComment);
  app.delete('/api/task/:taskId/comment/:commentId', auditMiddleware, tasksController.deleteComment);

  // Events
  app.post('/api/event', auditMiddleware, upload.array('attachments'), eventController.createEvent);
  app.get('/api/events', auditMiddleware, eventController.getAllEvents);
  app.get('/api/event/:id', auditMiddleware, eventController.getEventById);
  app.get('/api/events/project/:projectId', auditMiddleware, eventController.getEventsByProjectId);
  app.put('/api/event/:id', auditMiddleware, upload.array('attachments'), eventController.updateEvent);
  app.delete('/api/event/:id', auditMiddleware, eventController.deleteEvent);

  // User routes
  app.post('/login', auditMiddleware, userController.login);
  app.post('/register', auditMiddleware, userController.register);
  app.post('/api/users', auditMiddleware, userController.register);
  app.put('/api/user/:id/change-password', auditMiddleware, userController.changePassword);
  app.get('/api/user/:userId', auditMiddleware, userController.getUserById);
  app.get('/api/users', auditMiddleware, userController.getUsers);
  app.get('/api/users/search', auditMiddleware, userController.getUsersBySearch);
  app.put('/api/user/:id/update', auditMiddleware, userController.updateUser);
  app.get('/api/user/:id/projects', auditMiddleware, userController.getUserProjects);
  app.post('/api/user/store-user-profile', auditMiddleware, userProfileController.storeUserProfile);
  app.get('/api/user/retrieve-user-profile/:userId', auditMiddleware, userProfileController.retrieveUserProfile)
  app.delete('/api/user/:id', auditMiddleware, userController.deleteUser);

  // Role routes
  app.post('/api/role', auditMiddleware, roleController.createRole);
  app.get('/api/roles', auditMiddleware, roleController.getAllRoles);
  app.get('/api/role/:id', auditMiddleware, roleController.getRoleById);
  app.put('/api/role/:id', auditMiddleware, roleController.updateRole);
  app.delete('/api/role/:id', auditMiddleware, roleController.deleteRole);

  // Permission routes
  app.post('/api/permission', auditMiddleware, permissionController.createPermission);
  app.get('/api/permissions', auditMiddleware, permissionController.getAllPermissions);
  app.get('/api/permission/:id', auditMiddleware, permissionController.getPermissionById);
  app.put('/api/permission/:id', auditMiddleware, permissionController.updatePermission);
  app.delete('/api/permission/:id', auditMiddleware, permissionController.deletePermission);

  app.get('/api/role/:roleId/permissions', auditMiddleware, permissionController.getRolePermissions);
  app.put('/api/role/:roleId/permissions', auditMiddleware, permissionController.grantPermissionsToRole);

  // Announcement
  app.post('/api/announcement', auditMiddleware, upload.array('attachments'), announcementController.createAnnouncement);
  app.get('/api/announcements', authMiddleware, announcementController.getAllAnnouncements);
  app.get('/api/announcementsByUser', authMiddleware, announcementController.getAllAnnouncementsByUser);
  app.get('/api/announcements/:projectId', auditMiddleware, announcementController.getAnnouncementsByProjectId);
  app.get('/api/announcements/:projectId/active', authMiddleware, announcementController.getActiveAnnouncementsByProjectId);
  app.get('/api/announcement/:id', auditMiddleware, announcementController.getAnnouncementById);
  app.put('/api/announcement/:id', auditMiddleware, upload.array('attachments'), announcementController.updateAnnouncement);
  app.delete('/api/announcement/:id', auditMiddleware, announcementController.deleteAnnouncement);

  // Start listening
  server.listen(process.env.PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
  });
})
.catch(error => {
  console.error('Error connecting to MongoDB:', error);
});

// Add headers before the routes are defined
app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', process.env.CLIENT_HOST);
  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  // Set to true if you need the website to include cookies in the requests sent to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);
  // Pass to next layer of middleware
  next();
});

// Audit Middleware
const auditMiddleware = require('./middlewares/auditMiddleware');

// Middleware to verify JWT token
function verifyToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(401).json({
      errorMessage: 'Token not provided!',
      status: false
    });
  }
  jwt.verify(token, 'shhhhh11111', (err, decoded) => {
    /*if (err) {
      return res.status(401).json({
        errorMessage: 'Invalid token!',
        status: false
      });
    }
    req.user = decoded.user;
    next();*/
    if (decoded && decoded.user) {
      req.user = decoded;
      next();
    } else {
      return res.status(401).json({
        errorMessage: 'User unauthorized!',
        status: false
      });
    }
  });
}
