================================================================================
                        TEAM TASK MANAGER (TTM)
                     A Full-Stack Project Management App
================================================================================

OVERVIEW
--------
Team Task Manager (TTM) is a full-stack MERN (MongoDB, Express, React, Node.js)
web application designed for teams to manage projects, assign tasks, and track
member workloads — all from a clean, role-aware interface.

Live URL  : https://ttm-project-psi.vercel.app/
GitHub    : https://github.com/Amanyadav0007/TTM-Project


--------------------------------------------------------------------------------
FEATURES
--------------------------------------------------------------------------------
- JWT-based user authentication (Register / Login / Logout)
- Project creation and management
- Task assignment within projects (with status & priority tracking)
- Team member management with role-based visibility
- Analytics dashboard (task progress, overdue tasks, member workload)
- Protected routes — unauthenticated users are redirected to login
- Fully responsive UI built with React + Tailwind CSS
- Deployed backend on Vercel (serverless)


--------------------------------------------------------------------------------
TECH STACK
--------------------------------------------------------------------------------
Frontend:
  - React (Vite)
  - React Router DOM
  - Tailwind CSS
  - Axios (HTTP client)
  - Context API (Auth state management)

Backend:
  - Node.js + Express.js (v5)
  - MongoDB + Mongoose
  - JSON Web Tokens (jsonwebtoken)
  - bcryptjs (password hashing)
  - CORS, dotenv

Deployment:
  - Vercel (both client and server)


--------------------------------------------------------------------------------
PROJECT STRUCTURE
--------------------------------------------------------------------------------
Team Task Manager/
├── client/                        # React frontend (Vite)
│   └── src/
│       ├── App.jsx                # Root component & route definitions
│       ├── main.jsx               # Entry point
│       ├── index.css              # Global styles
│       ├── components/
│       │   └── Sidebar.jsx        # Navigation sidebar
│       ├── context/
│       │   └── AuthContext.jsx    # Auth state & JWT handling
│       ├── pages/
│       │   ├── Login.jsx          # Login page
│       │   ├── Register.jsx       # Registration page
│       │   ├── Dashboard.jsx      # Analytics & overview
│       │   ├── Projects.jsx       # Project listing & creation
│       │   ├── ProjectDetails.jsx # Tasks within a project
│       │   └── Members.jsx        # Team member management
│       └── utils/                 # Helper utilities / API config
│
└── server/                        # Express backend (Node.js)
    ├── server.js                  # Entry point
    ├── vercel.json                # Vercel deployment config
    ├── config/                    # DB connection (MongoDB)
    ├── models/
    │   ├── User.js                # User schema
    │   ├── Project.js             # Project schema
    │   └── Task.js                # Task schema
    ├── controllers/               # Route handler logic
    ├── middleware/                # Auth middleware (JWT verify)
    └── routes/                    # Express route definitions


--------------------------------------------------------------------------------
GETTING STARTED (Local Development)
--------------------------------------------------------------------------------

PREREQUISITES
  - Node.js >= 18
  - MongoDB (local or MongoDB Atlas URI)
  - npm

1. CLONE THE REPOSITORY
   ----------------------
   git clone https://github.com/Amanyadav0007/TTM-Project.git
   cd TTM-Project

2. SETUP THE SERVER
   -----------------
   cd server
   npm install

   Create a .env file in /server with the following variables:
     MONGO_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret_key
     PORT=5000

   Start the server:
     npm run server      (development with nodemon)
     npm start           (production)

3. SETUP THE CLIENT
   -----------------
   cd ../client
   npm install

   Update the API base URL in src/utils/ (or axios config) to point to:
     http://localhost:5000   (for local development)
     https://ttm-project-psi.vercel.app/  (for production)

   Start the client:
     npm run dev

4. OPEN IN BROWSER
   ----------------
   Visit: http://localhost:5173


--------------------------------------------------------------------------------
ROUTES SUMMARY
--------------------------------------------------------------------------------
Page             | URL                  | Auth Required?
-----------------|----------------------|---------------
Login            | /login               | No
Register         | /register            | No
Dashboard        | /                    | Yes
Projects List    | /projects            | Yes
Project Details  | /projects/:id        | Yes
Members          | /members             | Yes


--------------------------------------------------------------------------------
API ENDPOINTS (Backend)
--------------------------------------------------------------------------------
Auth:
  POST  /api/auth/register     - Register new user
  POST  /api/auth/login        - Login and receive JWT

Projects:
  GET   /api/projects          - Get all projects
  POST  /api/projects          - Create a new project
  GET   /api/projects/:id      - Get a single project
  PUT   /api/projects/:id      - Update a project
  DELETE /api/projects/:id     - Delete a project

Tasks:
  GET   /api/tasks/:projectId  - Get tasks for a project
  POST  /api/tasks             - Create a task
  PUT   /api/tasks/:id         - Update a task
  DELETE /api/tasks/:id        - Delete a task

Members:
  GET   /api/users             - Get all team members


--------------------------------------------------------------------------------
DEPLOYMENT (Vercel)
--------------------------------------------------------------------------------
Both client and server are deployed on Vercel.

Server vercel.json routes all API requests through Express by rewriting
/* to server.js, enabling serverless function support.

To deploy your own instance:
  1. Push to GitHub
  2. Import both /client and /server as separate Vercel projects
  3. Set environment variables (MONGO_URI, JWT_SECRET) in Vercel dashboard
  4. Update the client API base URL to the deployed server URL


--------------------------------------------------------------------------------
AUTHOR
------------------------------------------------------------------------
Developed by Aman Yadav
GitHub: https://github.com/Amanyadav0007


================================================================================
