PROJECT MASTAR
- Project Start Date: 2023-11-28
- Last Updated Date: 2025-10-22

Concept:
- Schedule: Gantt Chart, Task Calendar
- Resource: Team
- Budget: Budget
- Quality: Task Dashboard
- Scope: Project Dashboard, Task TaskBoard
- Risk: Task Priority, Difficulty Level, Impact-Effort Matrix

Technology (MERN stack):
- MongoDB (Mongoose)
- Node.js (Express.js framework)
- React.js (Material UI framework)
- MUI X Charts (Chart - TaskCounts)
- Recharts (Chart - TaskCompletionTrend, TagDistribution, TeamPerformance)
- NoSQL
- Draft.js + Quill (Rich Text Format)

Not used files:
- /database/ProjectController
- /database/TaskController
- /components/MainAppBar_old.js
- /components/HelpBtn.js
- /components/project/ProjectSearchBar.js
- /components/task/TaskCalendar.js
- /components/task/task-calendar.css
- /components/task/TaskGanttChart_old.js
- /components/task/TaskGanttChartTable_old.js
- /components/task/MilestoneTaskList.js
- /components/task/TaskStatusFilter.js
- /components/team/StatsticsCard.js
- /components/custom/RichTextArea_old1.js
- /components/custom/RichTextArea_old2.js
- /components/custom/RichTextArea_old3.js
- /components/landing/Features.js

Routes:
- LandingPage / ProjectDashboard: http://localhost:3000/
- Private Policy: http://localhost:3000/privacy-policy
- Login: http://localhost:3000/login
- Register: http://localhost:3000/register
- User Profile: http://localhost:3000/user-profile/{userId}
- Account Settings: http://localhost:3000/account-settings
- TaskDashboard: http://localhost:3000/project/{projectId}/dashboard
- TaskProgress: http://localhost:3000/project/{projectId}/progress
- ProjectCalendar: http://localhost:3000/project/{projectId}/calendar
- EventPage: http://localhost:3000/project/{projectId}/event/{eventId}
- Team: http://localhost:3000/project/{projectId}/team
- ProjectSettings: http://localhost:3000/project/{projectId}/project-settings
- Help: http://localhost:3000/help
- TaskPage: http://localhost:3000/project/{projectId}/task/{taskId}
- AuditLog: http://localhost:3000/audit-log
- AccessControl: http://localhost:3000/access-control
- Announcement: http://localhost:3000/announcement
- Announcement (Project): http://localhost:3000/project/{projectId}/announcement
- AnnouncementPage: http://localhost:3000/project/{projectId}/announcement/{announcementId}

Bug (Frontend):
- ExportDropdown: Export Excel (Text length must not exceed 32767 characters)
- Burn-down chart display incorrect data
- create, update, delete milestone should notify all team members in the project instead of creator / updator
- TaskCompletionTrend display incorrect data
- Export CSV (personInCharge)
- User Management
	//- Create
	- Edit
	- Delete
//- Sometimes CreateTaskBtn is missing (failed to read user so no permission? only after I update code?)
- TabbedTaskList
	- After clicking the print button, failed to select another task (Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.)
	- after edit, not reflect changes in list
- [Removed login/register api audit log] Audit log (Login should not log user password)
- Remove "Person In Charge Name" in TaskCreateForm.js, TaskEditForm.js, ProjectCreateForm.js, ProjectEditForm.js
- TaskTimeline
	- i18n
	- Failed to display user name
	- auditLog need to add "item"=["project","task"], "title"=task.taskName, "user" column

Bug (Backend):
- tasksController.js
	- updateTaskStatus, deleteTask failed to send web push notification
- TaskTimeline
	- Failed to fetch userId when create the record


Code Refactoring:
- Remove TaskCreateForm (TaskEditForm -> mode="create")


Wish List:
- Auto-save
- TaskList (multi-level sort order should determined by user)
- Task & Issue are different (?)
- + Tag / + Milestone in drop-down
- Team concept (team leader/team members)
- Task Calendar (Resize task date)
- Radar Charts (Project Health Check: budget adherence, timeline, stakeholder satisfaction)
- User Manual & Video Tutorial
- Mark as In Progress
- Ask user to input "delete <projectName>" when confirm delete
- Access Control
	- ProjectDashboard
		- What if I take out the teamMember who mapped to a task?
			Solution: Keep the task unassigned / ask the user who remove the team member to reassign another team members to the task
	- Check which project I can see in backend
//- Private / Public tasks (how to handle task dashboard?)
//	- Private: only personInCharge can view the task
//	- Public: all users in the project can view the task
//- category default value: Milestone, Task, Story, Bug, Sub-task
//- Calculate and save duration and man-day in server-side, so that TaskCard and TaskTable can display these fields
	-> Gantt chart for milestone
- TaskDashboard
	- Activity Timeline (Auditing: Task has been created, updated, deleted, completed)
	- burn-down chart
	- on-time delivery
	- budget vairance
	- create task hierarchy
- TaskEditForm
	- click link read in browser instead of download
	- Disable fields for non-creator except comment list (Avoid task cover by others when saving the task)
//- ProjectCreateForm / ProjectEditForm
//	- Change project icon
- TaskBoard
	- drag-and-drop task to other states (dnd-kit)
- TaskTable
	- Full-featured CRUD (mui-datagrid-full-edit)
	- import task from CSV (Not support attachment) / JSON
	- select all > "Delete All Selected"
- TaskGanttChart
	- dependencies (Move a task in the Gantt chart will move all subsequent tasks)
	- milestone
- Task
	- Bookmark
	- Online (Avatar has green dot) (Reference: https://mui.com/material-ui/react-avatar/#with-badge)
//- Risk management (create risk register, risk ownership, tract mitigation action, monitor impact)
- Budget (equipments, human resource, salary, man-day)
//- File sharing
- Rollback from audit log
- Send auto reminder
//- Weekly Briefing
- Import tasks from Excel / CSV
- Backup (Delete task is not really delete, change active=false)


A task has the following attributes:
- _id
- taskName (text)
- category (text)
- description (html text)
- personInCharge (userId array)
- status (To Do, In Progress, Under Review, Done, On Hold, Cancelled)
- priority (Very High (#b10202), High (#FFCFC9), Medium (#FFE5A0), Low (#D4EDBC), Very Low (#E6CFF2))
- difficultyLevel (Easy, Moderate, Difficult, Very Difficult)
- color (text)
- attachments [{name: string, path: string}]
- startDate (date)
- endDate (date)
- actualStartDate (date)
- actualEndDate (date)
- createdBy (userId)
- createdDate (date)
- updatedBy (userId)
- updatedDate (date)


Feature:
- User Role (Administrator, Project Manager, Team Member, Stakeholder)
- Landing Page
- Login
	- Show Password
- Register
- MainAppBar
	- Collapse/Expand Sidebar
	- Website Name (Back to landing page)
	- Menu (If no project is selected, do not display menu)
		- Dashboard (TaskDashboard)
		- Progress (TaskProgress)
		- Team
	- Global Search
		- Search Projects & Tasks
		- Search Users
	- Switch Theme (Light/Dark)
		- Store in localStorage
	- Switch Language (English / Traditional Chinese / Simplified Chinese)
		- Store in localStorage
	- Help
	- Notification (Received in real-time, no need refresh page)
		(Do not send notification to createdBy for create operation)
		(Do not send notification to updatedBy for update operation)
		(Send notification to all personInCharge for delete operation)
		- Number of new notifications
		- A list of notifications
			- Inform team members when a task is created and assigned to the team member
		- Read / Unread Notification
		- Read All Notifications
		- Mark as Unread for a notification
		- Notification Center
			- Search Notifications
			- All / Unread / Read notifications
	- Account
		- User Profile
			- Contact Information
			- Projects & Tasks
		- Account Settings
			- Update User Profile
			- Security (Change Password)
		- Audit Log (Only administrator can access)
		- Role-Based Access Control (RBAC)
			- Role Management
			- Permission Management
			- Grant Permissions
		- User Management
		- Logout
- Breadcrumb
- Project Dashboard
	- User Greeting
	- Dashboard Configuration (Customize dashboard blocks)
	- Project List
		- Change color of project card
		- Tag Setup
		- Announcement Management
		- Edit Project (Title, Description)
			- Rich Text Description (Reference: https://xdsoft.net/jodit/)
		- Delete Project (Also delete its tasks)
		- If no project, display create project button
		- Display createdDate, updatedDate, team members, task completion rate
	- Announcement
		- "Learn More" button will display all announcements related to all projects
	- Upcoming Tasks
	- Distribution (Status, Priority, Difficulty Level)
		- Export Report
	- Project Task Overview
		- Export Report
	- User Upcoming Tasks (Display the tasks that the user is responsible for (Team Member) or has access to (Project Manager/Stakeholder) within the next 30 days)
		- If user's role is "Project Manager" or "Stakeholder", display all tasks within 30 days.
		- If user's role is "Team Member", display own tasks within 30 days.
- Create Project (Title, Description)
	- The one who created the project must be the project manager of the project
	- Allow user to search team member options by keywords
	- A project should have at least 1 project manager
- Sidebar
	/*- Search Projects
	- Project List*/
- Task Dashboard
	- Project Information
	- Announcement
		- "Learn More" button will only display the announcement related to the project
	/*- ProjectCalendar
		- Filter tasks for whole year/month/day
		- Display My Tasks Only*/
	- Project Duration
	- Task Completion Rate
		- Incompleted and Completed Tasks (Dialog)
	- Task Velocity
	- Milestone Overview
	- Distribution (Status, Priority, Difficulty Level)
		- Export Report
	- Task Completion Trend
		- Number of tasks completed in a specific period of time
		- Period Filter
		- Click data point to display completed tasks on specific date
	- Team Performance
		- Total number of team members
		- Completed Tasks & Incompleted Tasks
	- Upcoming Tasks
	- Overdue Tasks
- Progress (TaskProgress)
	- ModeSwitcher
		- TaskBoard (Categorize tasks by status)
			- Scrollable
			- Number of tasks in each status
			- TaskCard (Task Name, Category, Description, Person in Charge, Status, Priority, Difficulty Level, Color, Start Date, End Date, Attachments)
				- Rich Text Description (Reference: https://xdsoft.net/jodit/)
				- Change color of task card (Reference: https://casesandberg.github.io/react-color/)
				- Click the card to open TaskReadForm
				- Three dots
					- Share Task (Copy task link)
					- Duplicate Task
					- Delete Task (Also delete attachments)
		- TaskList
			- Status Filter
		- TabbedTaskList
			- Status Filter
			- Left side: TaskList
			- Right side: Task
				- Print
				- Edit Task
				- Copy Task
				- Delete Task
		- TaskTable (DataGrid)
			- Export CSV, JSON, Print
			- Edit Task (TaskEditForm)
			- Duplicate Task
			- Delete Task
			- Store customized DataGrid columns into localStorage
		- Impact-Effort Matrix
		- TaskCalendar
			- Plan / Actual calendar
			- If selected a date that contains no task, display create task dialog
			- If selected a date that contains tasks, display task list on that date
			- If selected a task in a date, display the TaskEditForm
			- Drag-and-drop task to other date, save calendar
		- TaskGanttChart
			- ViewSwitcher (Day/Week/Month/Year)
			- Tasks are sorted by startDate
			- Show Task List
				- Filter Column
			- Click bar to open TaskEditForm
			- Drag-and-drop Task Start Date & End Date, click "SAVE" button to update the task start date and end date
	- View Cancelled Tasks
	- Search Tasks
	- Filters
		- Filter tasks by color
		- Filter tasks by status
		- Filter tasks by priority
		- Filter tasks by difficulty Level
		- Filter tasks by period (From ... To ...)
			- Clear button
		- Display My Tasks Only
			- Store in localStorage
	- Show Task Details (Milestone, Category, Description, Estimated Date, Actual Date, Tags, Status, Person in Charge, Priority, Difficulty Level, Color, Has Attachments, Days Ago)
		- Each display mode has different state stored in localStorage
	- Sort
		- Sort by priority ("Very High" > "High" > "Medium" > "Low" > "Very Low" > "" in desc order)
		- Sort by difficultLevel ("Very Difficult" > "Difficult" > "Moderate" > "Easy" > "" in desc order)
	- Export Excel / CSV / JSON (with task count)
	- TaskCreateForm (Add Task Floating Action Button)
		- StartDate < EndDate
		- Upload Attachments (Store files in "/upload/tasks")
		- Drag-and-drop files
		- Paste copied image
			- Delete Attachments (Also delete uploade files in "/upload/tasks")
	- TaskEditForm (Edit / Duplicate Task)
		- Share task (http://localhost:3000/project/{projectId}/task/{taskId}/)
  - ProjectCalendar
	- Only event creator can edit fields, otherwise read-only
	- If event is 'Private' or the user is creator or the user is one of the organizers or the user is one of the attendees, the event should be shown to user
  - Team
    - Members
		- Switch view between card view and table view
		- Search Team Members
		- Team Member Card
			- Team Member Details
			- Tasks
	- Schedule
		- Plan / Actual Schedule in calendar month view
		- Tasks of each member
		- Duration & Man-day
- Footer
  - PrivacyPolicy
  - Copyright

Customized Components:
- CDialog
	-  Create/Edit/Share/Duplicate/Delete Project/Task
		- mode = ['create', 'update', 'duplicate', 'share']
		- Disable backdropClick for create/update/duplicate/share operation
		- Full Screen Dialog (Dialog is full screen when mobile)
	- Display TaskDashboard Dialog
- CCard





Check Permission inside a project:
```
const fetchUserByProject = async () => {
  try {
    const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/project/${projectId}/teamMember/${user._id}`);
    //console.log("user = " + JSON.stringify(response.data));
    setUser(response.data);
  } catch (error) {
    console.error('Error fetching user by project:', error);
  }
};

useEffect(() => {
  fetchUserByProject();
}, []);

{user.email === process.env.REACT_APP_ADMIN_EMAIL || user?.role?.permissions?.some(permission => permission.name === "readNext7DaysTasks") ? (
) : null}
```

Check user role outside a project:
```
const userRole = project.teamMembers?.find(member => member._id === user._id)?.role;
```
```
const fetchUserWithProjects = async () => {
  try {
    const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/user/${user._id}`);
    //console.log("user = " + JSON.stringify(response.data));
    setUser(response.data);
  } catch (error) {
    console.error('Error fetching user by project:', error);
  }
};

useEffect(() => {
  fetchUserWithProjects();
}, []);

{user.email === process.env.REACT_APP_ADMIN_EMAIL ||
  (
    project.teamMembers?.find(member => member._id === user._id)?.role === "Project Manager" && 
    user.projects?.find(project => project.permissions?.some(permission => permission.name === 'editProject'))
  ) ? (
) : null}
```