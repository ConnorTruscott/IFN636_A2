# Campus Complaint Management System

A lightweight full-stack app for campuses to **create**, **view**, **update**, and **delete** complaints.  
Supports user access, status tracking, post-resolution feedback, and ratings.  
Easy to deploy on cloud or locally.

---

##  Quick Start

### 1. Clone the Repo

```bash
git clone https://github.com/cookieis-yummy/ifn636_a1
cd ifn636_a1
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

##  Accessing the App

- **Live Version:** [http://13.236.85.224/](http://13.236.85.224/)
- **Local:** [http://localhost:3000](http://localhost:3000)

---

##  Test Feedback Feature

- Feedback is activated when status is set to **"closed"**
- To test:
  - Login with:
    - **Email:** feedback@test.com
    - **Password:** 1
  - Or manually set complaint status to "closed" in MongoDB

---

##  Key Features

- Secure sign-up / login, profile management
- Create, view, update, delete own complaints with attachments
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
