# QR-Based Attendance System

A full-stack web application that automates attendance management using QR codes. Faculty can generate QR codes for attendance sessions, and students can scan the QR code to mark their attendance quickly and securely.

---

## 🚀 Features

- User Authentication & Authorization
- QR Code-Based Attendance System
- Student Attendance Tracking
- Attendance Record Management
- Secure Backend APIs
- MongoDB Database Integration
- Responsive User Interface
- Real-Time Attendance Storage

---

## 🛠️ Tech Stack

### Frontend
- React.js
- JavaScript
- HTML5
- CSS3

### Backend
- Node.js
- Express.js

### Database
- MongoDB
- Mongoose

### Authentication & Security
- JWT (JSON Web Token)
- bcryptjs

### Additional Packages
- dotenv
- cors
- validator
- xlsx

---

## 📂 Project Structure

```text
QR_based_Attendance/
│
├── page1/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── Backend/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── package.json
│   └── server.js
│
└── README.md
```

---

## ⚙️ Installation

### Clone the Repository

```bash
git clone https://github.com/Pranav-Khot/QR_based_Attendance.git
```

### Move to Project Directory

```bash
cd QR_based_Attendance
```

### Install Backend Dependencies

```bash
cd Backend
npm install
```

### Install Frontend Dependencies

```bash
cd ../page1
npm install
```

---

## 🔐 Environment Variables

Create a `.env` file inside the Backend directory:

```env
PORT=5000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key
```

---

## ▶️ Running the Application

### Start Backend

```bash
cd Backend
npm run server
```

or

```bash
npm start
```

### Start Frontend

```bash
cd page1
npm run dev
```

---

## 📋 Application Workflow

1. User logs into the system.
2. Faculty/Admin creates an attendance session.
3. A QR code is generated.
4. Students scan the QR code.
5. Attendance is recorded in MongoDB.
6. Faculty can view and manage attendance records.

---

## 📸 Screenshots

Add screenshots here after uploading them to your repository.

### Login Page

```md
![Login Page](screenshots/login.png)
```

### Dashboard

```md
![Dashboard](screenshots/dashboard.png)
```

### QR Attendance

```md
![QR Attendance](screenshots/attendance.png)
```

---

## 🔮 Future Enhancements

- Attendance Analytics Dashboard
- Attendance Percentage Calculation
- Export Attendance to Excel/PDF
- Email Notifications
- Role-Based Access Control
- Mobile Application Support

---

## 👨‍💻 Author

**Pranav Khot**

GitHub: https://github.com/Pranav-Khot

Project Repository:
https://github.com/Pranav-Khot/QR_based_Attendance

---

## ⭐ Support

If you found this project useful, consider giving it a star on GitHub.

---

## 📄 License

This project is developed for educational and learning purposes.
