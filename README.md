**Remote Intern Management System**
Role-based app for mentors to manage remote interns (tasks, feedback, reports).

**Live**
* EC2 instance Public IP: http://13.55.160.228
* Demo user:
  Mentor:
    email: mentor@interntracker.com, password: mentor
  
  Intern:
    email: intern@intern.com, password: intern

**Quick Start**
git clone https://github.com/Takekami/intern_tracker.git
cd intern_tracker

**Backend**
cd backend
cp .env
npm i
npm run dev

**Frontend**
cd frontend
cp .env
npm i
npm run dev

**What's in it**
Tasks (CRUD): mentor adds/edits/assigns/deletes; intern updates their own task status
Feedback (CRUD): mentor submits/edits/deletes; latest score and comment shown in reports.
Auth & Roles: role-guarded API/UI (Mentor and Intern). If email domain is @interntracker.com -> mentor, other -> intern
Reports: Progress bar of task status (To Do, In Progress, Completed) and table (Task/Assignee/Status/Due/Latest Feedback/Score).

**Minimal API**
AUTH
POST /api/auth/register
POST /api/auth/login
GET /api/auth/profile
PUT /api/auth/profile
GET /api/auth/interns

Tasks
GET /api/tasks
POST /api/tasks
PUT /api/tasks/:id
DELETE /api/tasks/:id
PATCH /api/tasks/:id/status

Feedbacks
GET /api/feedback?taskId=&internId=
POST /api/feedback
PUT /api/feedback/:id
DELETE /api/feedback/:id

Reports
GET /api/reports
GET /api/reports/:internId
PUT /api/reports/:internId/final-comment

**Links for marking**
Jira : https://tkykmurakami.atlassian.net/jira/software/projects/INTERN/summary
EC2 Instance Link: https://ap-southeast-2.console.aws.amazon.com/ec2/home?region=ap-southeast-2#InstanceDetails:instanceId=i-023258e7a95bdaee7
GitHub: https://github.com/Takekami/intern_tracker
CI/CD: https://github.com/Takekami/intern_tracker/blob/main/.github/workflows/ci.yml

