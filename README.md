# Campus Complaint Management System

A lightweight full-stack app for campuses to **create**, **view**, **update**, and **delete** complaints.  
Supports user, staff, and admin access, status tracking, post-resolution feedback, and ratings.  
Easy to deploy on cloud or locally.

---

##  Quick Start

### 1. Clone the Repo

```bash
git clone https://github.com/ConnorTruscott/IFN636_A2
cd IFN636_A2
```

### 2. Backend Setup

- Edit `/backend/.env` (create if missing):

  ```
  MONGO_URI=<your_mongo_connection_string>
  JWT_SECRET=<your_jwt_secret>
  PORT=5001
  ```

### 3. Frontend API URL

- Open `frontend/src/axiosConfig.jsx` and set the API base URL:

  **For AWS EC2 (public IP):**
  ```js
  export default axios.create({
    baseURL: 'http://13.236.85.224', // live
    headers: { 'Content-Type': 'application/json' },
  });
  ```

  **For Local Development (backend on port 5001):**
  ```js
  export default axios.create({
    baseURL: 'http://localhost:5001', // local
    headers: { 'Content-Type': 'application/json' },
  });
  ```

### 4. Install Dependencies

```bash
npm run install-all
```

### 5. Start Backend & Frontend

```bash
npm run
```

---
---

##  Accessing the App

- **Live Version:** [http://13.236.85.224/](http://13.236.85.224/)
- **Local:** [http://localhost:3000](http://localhost:3000)

---

##  Admin Account Access

- There is a single admin account tied to this system
  - Login with:
    - **Email:** admin@admin
    - **Password:** Admin
  - It is HIGHLY reccomended to update and change these details.

  ##  Staff Account Access

- Here is a login for a staff account within the system
  - Login with:
    - **Email:** apple@a
    - **Password:** apple

  ##  Student Account Access

- Here is a login for a student account within the system
  - Login with:
    - **Email:** test@test
    - **Password:** test


---

##  Key Features

- Secure sign-up / login, profile management for staff and students
- Create, view, update, delete own complaints with attachments
- Change the status of ongoing complaints as they are being worked on
- View Staff and Complaint analytics
- Post-resolution rating & comments

---

##  Tech Stack

- **Frontend:** React.js
- **Backend:** Node.js + Express
- **Database:** MongoDB
- **Auth:** JWT
- **CI/CD:** GitHub
- **HTTP Client:** Axios

---

##  Prerequisites

Install and/or create accounts for:

- [Node.js](https://nodejs.org/en)
- [Git](https://git-scm.com/)
- [VS Code](https://code.visualstudio.com/)
- [MongoDB Account](https://account.mongodb.com/account/login)
- [GitHub Account](https://github.com/signup?source=login)

---
