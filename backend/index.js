

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import Register from "./models/register.js";
import nodemailer from "nodemailer";
import lectureRoutes from "./routes/lectureRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js"; // ← NEW (added from attendance code)
import assignmentRoutes from "./routes/assignmentRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import protect from "./middleware/authMiddleware.js";

dotenv.config();

const app = express();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/registration_curd")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ DB Connection Error:", err));

// --- NODEMAILER CONFIGURATION ---
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const otpStore = {};

// --- REGISTER ROUTE ---
app.post("/api/register", async (req, res) => {
  try {
    const { fullName, email, password, confirmPassword, contact, role } = req.body;

    // ✅ 1. Confirm Password Validation
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match." });
    }

    // ✅ 2. Indian Mobile Number Validation
    const indianMobileRegex = /^[6-9]\d{9}$/;
    if (!indianMobileRegex.test(contact)) {
      return res.status(400).json({ error: "Invalid Indian mobile number." });
    }

    // ✅ Optional safety: prevent duplicate email crash
    const existing = await Register.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: "Email already registered." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new Register({
      fullName: fullName.toUpperCase(),
      email: email.toLowerCase(),
      password: hashedPassword,
      contact,
      role: role || "user",

      // ✅ Approval defaults
      approved: false,
      approvalStatus: "PENDING",
      approvedAt: null,
    });

    await newUser.save();
    res.status(201).json({
      message: "Your registration request has been submitted successfully. Waiting for approval.",
      approvalStatus: "PENDING",
    });
  } catch (err) {
    console.error("Registration Error:", err);
    res.status(500).json({ error: "Registration Failed." });
  }
});

// --- LOGIN ROUTE ---
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
    return res.status(200).json({ success: true, role: "super_admin", message: "Welcome Admin" });
  }

  try {
    const user = await Register.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid Credentials" });
    }

    // ✅ Approval block
    if (!user.approved || user.approvalStatus !== "APPROVED") {
      return res.status(403).json({
        success: false,
        message: `Account ${user.approvalStatus}. Please wait for approval.`,
        approvalStatus: user.approvalStatus,
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1d" }
    );

    res.status(200).json({ success: true, token, role: user.role, message: "Login Successful" });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

// --- FORGOT PASSWORD (Using Gmail) ---
app.post("/api/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await Register.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email.toLowerCase()] = otp;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP is: ${otp}. It will expire in 5 minutes.`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP sent to ${email}`);
    res.status(200).json({ message: "OTP sent to your email!" });
  } catch (error) {
    console.error("Mail Error:", error);
    res.status(500).json({ message: "Failed to send email" });
  }
});

// --- RESET PASSWORD ---
app.post("/api/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    const key = (email || "").toLowerCase();

    if (otpStore[key] && otpStore[key] === otp) {
      if (!newPassword) return res.status(200).json({ message: "OTP is correct" });

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await Register.findOneAndUpdate({ email: key }, { password: hashedPassword });
      delete otpStore[key];
      return res.status(200).json({ message: "Password updated!" });
    } else {
      return res.status(400).json({ message: "Invalid OTP" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// --- GOOGLE LOGIN ---
app.post("/api/google-login", async (req, res) => {
  const { token } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { name, email } = ticket.getPayload();

    let user = await Register.findOne({ email: email.toLowerCase() });

    if (!user) {
      user = new Register({
        fullName: name.toUpperCase(),
        email: email.toLowerCase(),
        password: await bcrypt.hash(Math.random().toString(), 10),
        role: "user",
        contact: "Google-Login",

        // ✅ Approval defaults for google users too
        approved: false,
        approvalStatus: "PENDING",
        approvedAt: null,
      });

      await user.save();
    }

    // ✅ Also block google login until approved
    if (!user.approved || user.approvalStatus !== "APPROVED") {
      return res.status(403).json({
        success: false,
        message: `Account ${user.approvalStatus}. Please wait for approval.`,
        approvalStatus: user.approvalStatus,
      });
    }

    const ownToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1d" }
    );

    res.status(200).json({ success: true, token: ownToken, role: user.role });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Admin Routes (Same as before)
app.get("/api/users", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    let filter = { email: { $ne: process.env.ADMIN_EMAIL } };

    if (authHeader?.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "smartAttendance");

        if (decoded?.role === "teacher") {
          filter = { role: "user", approvalStatus: "APPROVED" };
        } else if (req.query.role === "student") {
          filter.role = "user";
          filter.approvalStatus = "APPROVED";
        } else if (req.query.role) {
          filter.role = req.query.role;
        }
      } catch {
        if (req.query.role === "student") {
          filter.role = "user";
          filter.approvalStatus = "APPROVED";
        } else if (req.query.role) {
          filter.role = req.query.role;
        }
      }
    } else if (req.query.role === "student") {
      filter.role = "user";
      filter.approvalStatus = "APPROVED";
    } else if (req.query.role) {
      filter.role = req.query.role;
    }

    const users = await Register.find(filter, "-password").sort({ createdAt: -1 });

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed" });
  }
});

// ✅ NEW: Pending users list (Faculty Manager)
app.get("/api/users/pending", async (req, res) => {
  try {
    const users = await Register.find({ approvalStatus: "PENDING" }, "-password").sort({
      createdAt: -1,
    });
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch pending users" });
  }
});

// ✅ NEW: Approve user (Faculty Manager)
app.put("/api/users/approve/:id", async (req, res) => {
  try {
    const updated = await Register.findByIdAndUpdate(
      req.params.id,
      {
        approved: true,
        approvalStatus: "APPROVED",
        approvedAt: new Date(),
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ success: true, message: "User Approved", user: updated });
  } catch (err) {
    res.status(500).json({ error: "Approve failed" });
  }
});

// ✅ NEW: Reject user (Faculty Manager)
app.put("/api/users/reject/:id", async (req, res) => {
  try {
    const updated = await Register.findByIdAndUpdate(
      req.params.id,
      {
        approved: false,
        approvalStatus: "REJECTED",
        approvedAt: null,
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ success: true, message: "User Rejected", user: updated });
  } catch (err) {
    res.status(500).json({ error: "Reject failed" });
  }
});

// --- UPDATE USER ROLE ROUTE --- (kept as-is)
app.put("/api/users/update-role", async (req, res) => {
  const { userId, role } = req.body;

  try {
    if (!userId || !role) {
      return res.status(400).json({ message: "UserId and Role are required" });
    }

    const updatedUser = await Register.findByIdAndUpdate(
      userId,
      { role: role },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log(`✅ Role updated for ${updatedUser.email} to ${role}`);
    res.status(200).json({ success: true, message: "Role updated successfully", user: updatedUser });
  } catch (err) {
    console.error("❌ Update Role Error:", err);
    res.status(500).json({ error: "Failed to update role" });
  }
});

// --- 6. ADD NEW USER (From Admin Panel) ---
app.post("/api/users/register", async (req, res) => {
  try {
    const { fullName, email, password, contact, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new Register({
      fullName: fullName.toUpperCase(),
      email: email.toLowerCase(),
      password: hashedPassword,
      contact,
      role: role || "user",

      // ✅ Approval defaults
      approved: false,
      approvalStatus: "PENDING",
      approvedAt: null,
    });

    await newUser.save();
    res.status(201).json({ success: true, message: "User Added" });
  } catch (err) {
    res.status(500).json({ error: "Failed to add user" });
  }
});

// --- 7. UPDATE USER ROLE --- (kept exactly as your file - duplicate remains unchanged)
app.put("/api/users/update-role", async (req, res) => {
  const { userId, role } = req.body;
  try {
    const updatedUser = await Register.findByIdAndUpdate(userId, { role: role }, { new: true });
    if (!updatedUser) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ success: true, message: "Role updated" });
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
});

// --- 8. DELETE USER ---
app.delete("/api/users/:id", async (req, res) => {
  try {
    const deletedUser = await Register.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

// Assign / update domain for a student
app.patch("/api/users/:id/domain", protect, async (req, res) => {
  const { domain } = req.body;
  try {
    const validDomains = ["MEAN Stack", "Java Full Stack", "Python Developer", "Cyber Security"];

    if (domain !== undefined && domain !== null && domain !== "" && !validDomains.includes(domain)) {
      return res.status(400).json({ message: "Invalid domain value" });
    }

    const targetUser = await Register.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ message: "User not found" });
    if (targetUser.role !== "user") {
      return res.status(403).json({ message: "Domain can only be assigned to student accounts" });
    }

    const updated = await Register.findByIdAndUpdate(
      req.params.id,
      { domain: domain || null },
      { new: true, select: "-password" }
    );
    if (!updated) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ success: true, user: updated });
  } catch (err) {
    res.status(500).json({ error: "Failed to assign domain" });
  }
});

// GET logged-in user's profile (used by student dashboard)
app.get("/api/auth/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "No token" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");

    const user = await Register.findById(decoded.id, "-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ user });
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
});

app.get("/api/analytics", protect, async (req, res) => {
  try {
    const { domain } = req.query;
    if (!domain) return res.status(400).json({ message: "domain query param required" });
 
    const { default: Attendance } = await import("./models/Attendance.js");
    const { default: Lecture }    = await import("./models/Lecture.js");
 
    // Only approved student accounts should appear in teacher analytics.
    const students = await Register.find(
      { domain, role: "user", approvalStatus: "APPROVED" },
      "-password"
    );
 
    // Total lectures for this domain
    const totalLectures = await Lecture.countDocuments({ division: domain });
 
    // Build analytics per student
    const result = await Promise.all(
      students.map(async (st) => {
        const attended = await Attendance.countDocuments({ student: st._id, present: true });
        return {
          _id:            st._id,
          name:           st.fullName,
          email:          st.email,
          domain:         st.domain,
          attendance:     totalLectures > 0 ? Math.round((attended / totalLectures) * 100) : 0,
          classesAttended: attended,
          totalClasses:   totalLectures,
          tasksCompleted: 0,
          totalTasks:     0,
          lastSeen:       st.updatedAt ? new Date(st.updatedAt).toLocaleDateString() : "—",
        };
      })
    );
 
    return res.status(200).json({ students: result });
  } catch (err) {
    console.error("Analytics error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

app.get("/api/analytics/student/:id/submissions", protect, async (req, res) => {
  try {
    const studentId = req.params.id;
    const student = await Register.findById(studentId, "-password");
    if (!student) return res.status(404).json({ message: "Student not found" });
    if (student.role !== "user") {
      return res.status(400).json({ message: "Submissions are available only for student accounts" });
    }

    const { default: Assignment } = await import("./models/Assignment.js");
    const { default: Project } = await import("./models/Project.js");

    const [assignments, projects] = await Promise.all([
      Assignment.find({ domain: student.domain || null }).sort({ createdAt: -1 }),
      Project.find({ domain: student.domain || null }).sort({ createdAt: -1 }),
    ]);

    const assignmentItems = assignments.map((assignment) => {
      const submission = (assignment.submissions || []).find(
        (item) => item.student.toString() === studentId.toString()
      );

      return {
        _id: assignment._id,
        title: assignment.title,
        domain: assignment.domain,
        due: assignment.due,
        description: assignment.description,
        submitted: !!submission,
        fileUrl: submission?.fileUrl || "",
        note: submission?.note || "",
        reviewStatus: submission?.reviewStatus || null,
        submittedAt: submission?.submittedAt || null,
      };
    });

    const projectItems = projects.map((project) => {
      const submission = (project.submissions || []).find(
        (item) => item.student.toString() === studentId.toString()
      );

      return {
        _id: project._id,
        title: project.title,
        domain: project.domain,
        deadline: project.deadline,
        description: project.description,
        status: project.status,
        submitted: !!submission,
        repoUrl: submission?.repoUrl || "",
        note: submission?.note || "",
        reviewStatus: submission?.reviewStatus || null,
        submittedAt: submission?.submittedAt || null,
      };
    });

    return res.status(200).json({
      assignments: assignmentItems,
      projects: projectItems,
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch student submissions", error: err.message });
  }
});

// Lecture Routes
app.use("/api/lectures", lectureRoutes);

// Attendance Routes ← NEW
app.use("/api/attendance", attendanceRoutes);

// Assignment Routes
app.use("/api/assignments", assignmentRoutes);

// Project Routes
app.use("/api/projects", projectRoutes);

const port = process.env.PORT || 5001;
app.listen(port, () => console.log(`🚀 Server running on port ${port}`));

// backend/index.js  — FULLY FIXED & DYNAMIC


// import express from "express";
// import mongoose from "mongoose";
// import cors from "cors";
// import dotenv from "dotenv";
// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
// import { OAuth2Client } from "google-auth-library";
// import Register from "./models/register.js";
// import nodemailer from "nodemailer";

// import lectureRoutes from "./routes/lectureRoutes.js";
// import attendanceRoutes from "./routes/attendanceRoutes.js"; // ← Already working
// import assignmentRoutes from "./routes/assignmentRoutes.js";   // ← NEW
// import projectRoutes from "./routes/projectRoutes.js";         // ← NEW
// import userRoutes from "./routes/userRoutes.js";               // ← NEW

// dotenv.config();

// const app = express();
// const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// // Middleware
// app.use(cors());
// app.use(express.json());

// // MongoDB Connection
// mongoose
//   .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/registration_curd")
//   .then(() => console.log("✅ MongoDB Connected"))
//   .catch((err) => console.log("❌ DB Connection Error:", err));

// // --- NODEMAILER CONFIGURATION ---
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// const otpStore = {};

// // ─────────────────────────────────────────────────────────────
// // ALL YOUR ORIGINAL AUTH ROUTES (KEPT 100% UNCHANGED)
// // ─────────────────────────────────────────────────────────────

// app.post("/api/register", async (req, res) => {
//   try {
//     const { fullName, email, password, confirmPassword, contact, role } = req.body;
//     if (password !== confirmPassword) {
//       return res.status(400).json({ error: "Passwords do not match." });
//     }
//     const indianMobileRegex = /^[6-9]\d{9}$/;
//     if (!indianMobileRegex.test(contact)) {
//       return res.status(400).json({ error: "Invalid Indian mobile number." });
//     }
//     const existing = await Register.findOne({ email: email.toLowerCase() });
//     if (existing) {
//       return res.status(409).json({ error: "Email already registered." });
//     }
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const newUser = new Register({
//       fullName: fullName.toUpperCase(),
//       email: email.toLowerCase(),
//       password: hashedPassword,
//       contact,
//       role: role || "user",
//       approved: false,
//       approvalStatus: "PENDING",
//       approvedAt: null,
//     });
//     await newUser.save();
//     res.status(201).json({
//       message: "Your registration request has been submitted successfully. Waiting for approval.",
//       approvalStatus: "PENDING",
//     });
//   } catch (err) {
//     console.error("Registration Error:", err);
//     res.status(500).json({ error: "Registration Failed." });
//   }
// });

// app.post("/api/login", async (req, res) => {
//   const { email, password } = req.body;
//   if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
//     return res.status(200).json({ success: true, role: "super_admin", message: "Welcome Admin" });
//   }
//   try {
//     const user = await Register.findOne({ email: email.toLowerCase() });
//     if (!user) return res.status(401).json({ success: false, message: "User not found" });
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ success: false, message: "Invalid Credentials" });
//     }
//     if (!user.approved || user.approvalStatus !== "APPROVED") {
//       return res.status(403).json({
//         success: false,
//         message: `Account ${user.approvalStatus}. Please wait for approval.`,
//         approvalStatus: user.approvalStatus,
//       });
//     }
//     const token = jwt.sign(
//       { id: user._id, role: user.role },
//       process.env.JWT_SECRET || "secret",
//       { expiresIn: "1d" }
//     );
//     res.status(200).json({ success: true, token, role: user.role, message: "Login Successful" });
//   } catch (err) {
//     res.status(500).json({ message: "Server Error" });
//   }
// });

// app.post("/api/forgot-password", async (req, res) => {
//   const { email } = req.body;
//   try {
//     const user = await Register.findOne({ email: email.toLowerCase() });
//     if (!user) return res.status(404).json({ message: "User not found" });
//     const otp = Math.floor(100000 + Math.random() * 900000).toString();
//     otpStore[email.toLowerCase()] = otp;
//     const mailOptions = {
//       from: process.env.EMAIL_USER,
//       to: email,
//       subject: "Password Reset OTP",
//       text: `Your OTP is: ${otp}. It will expire in 5 minutes.`,
//     };
//     await transporter.sendMail(mailOptions);
//     console.log(`✅ OTP sent to ${email}`);
//     res.status(200).json({ message: "OTP sent to your email!" });
//   } catch (error) {
//     console.error("Mail Error:", error);
//     res.status(500).json({ message: "Failed to send email" });
//   }
// });

// app.post("/api/reset-password", async (req, res) => {
//   const { email, otp, newPassword } = req.body;
//   try {
//     const key = (email || "").toLowerCase();
//     if (otpStore[key] && otpStore[key] === otp) {
//       if (!newPassword) return res.status(200).json({ message: "OTP is correct" });
//       const hashedPassword = await bcrypt.hash(newPassword, 10);
//       await Register.findOneAndUpdate({ email: key }, { password: hashedPassword });
//       delete otpStore[key];
//       return res.status(200).json({ message: "Password updated!" });
//     } else {
//       return res.status(400).json({ message: "Invalid OTP" });
//     }
//   } catch (error) {
//     res.status(500).json({ message: "Server Error" });
//   }
// });

// app.post("/api/google-login", async (req, res) => {
//   const { token } = req.body;
//   try {
//     const ticket = await client.verifyIdToken({
//       idToken: token,
//       audience: process.env.GOOGLE_CLIENT_ID,
//     });
//     const { name, email } = ticket.getPayload();
//     let user = await Register.findOne({ email: email.toLowerCase() });
//     if (!user) {
//       user = new Register({
//         fullName: name.toUpperCase(),
//         email: email.toLowerCase(),
//         password: await bcrypt.hash(Math.random().toString(), 10),
//         role: "user",
//         contact: "Google-Login",
//         approved: false,
//         approvalStatus: "PENDING",
//         approvedAt: null,
//       });
//       await user.save();
//     }
//     if (!user.approved || user.approvalStatus !== "APPROVED") {
//       return res.status(403).json({
//         success: false,
//         message: `Account ${user.approvalStatus}. Please wait for approval.`,
//         approvalStatus: user.approvalStatus,
//       });
//     }
//     const ownToken = jwt.sign(
//       { id: user._id, role: user.role },
//       process.env.JWT_SECRET || "secret",
//       { expiresIn: "1d" }
//     );
//     res.status(200).json({ success: true, token: ownToken, role: user.role });
//   } catch (error) {
//     res.status(400).json({ success: false, message: error.message });
//   }
// });

// // ─────────────────────────────────────────────────────────────
// // ADMIN / APPROVAL ROUTES (All kept from your working file)
// // ─────────────────────────────────────────────────────────────

// app.get("/api/users", async (req, res) => {
//   try {
//     const users = await Register.find(
//       { email: { $ne: process.env.ADMIN_EMAIL } },
//       "-password"
//     ).sort({ createdAt: -1 });
//     res.status(200).json(users);
//   } catch (err) {
//     res.status(500).json({ error: "Failed" });
//   }
// });

// app.get("/api/users/pending", async (req, res) => {
//   try {
//     const users = await Register.find({ approvalStatus: "PENDING" }, "-password").sort({
//       createdAt: -1,
//     });
//     res.status(200).json(users);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to fetch pending users" });
//   }
// });

// app.put("/api/users/approve/:id", async (req, res) => {
//   try {
//     const updated = await Register.findByIdAndUpdate(
//       req.params.id,
//       { approved: true, approvalStatus: "APPROVED", approvedAt: new Date() },
//       { new: true }
//     );
//     if (!updated) return res.status(404).json({ message: "User not found" });
//     res.status(200).json({ success: true, message: "User Approved", user: updated });
//   } catch (err) {
//     res.status(500).json({ error: "Approve failed" });
//   }
// });

// app.put("/api/users/reject/:id", async (req, res) => {
//   try {
//     const updated = await Register.findByIdAndUpdate(
//       req.params.id,
//       { approved: false, approvalStatus: "REJECTED", approvedAt: null },
//       { new: true }
//     );
//     if (!updated) return res.status(404).json({ message: "User not found" });
//     res.status(200).json({ success: true, message: "User Rejected", user: updated });
//   } catch (err) {
//     res.status(500).json({ error: "Reject failed" });
//   }
// });

// app.put("/api/users/update-role", async (req, res) => {
//   const { userId, role } = req.body;
//   try {
//     if (!userId || !role) {
//       return res.status(400).json({ message: "UserId and Role are required" });
//     }
//     const updatedUser = await Register.findByIdAndUpdate(
//       userId,
//       { role: role },
//       { new: true }
//     );
//     if (!updatedUser) {
//       return res.status(404).json({ message: "User not found" });
//     }
//     console.log(`✅ Role updated for ${updatedUser.email} to ${role}`);
//     res.status(200).json({ success: true, message: "Role updated successfully", user: updatedUser });
//   } catch (err) {
//     console.error("❌ Update Role Error:", err);
//     res.status(500).json({ error: "Failed to update role" });
//   }
// });

// app.post("/api/users/register", async (req, res) => {
//   try {
//     const { fullName, email, password, contact, role } = req.body;
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const newUser = new Register({
//       fullName: fullName.toUpperCase(),
//       email: email.toLowerCase(),
//       password: hashedPassword,
//       contact,
//       role: role || "user",
//       approved: false,
//       approvalStatus: "PENDING",
//       approvedAt: null,
//     });
//     await newUser.save();
//     res.status(201).json({ success: true, message: "User Added" });
//   } catch (err) {
//     res.status(500).json({ error: "Failed to add user" });
//   }
// });

// app.delete("/api/users/:id", async (req, res) => {
//   try {
//     const deletedUser = await Register.findByIdAndDelete(req.params.id);
//     if (!deletedUser) return res.status(404).json({ message: "User not found" });
//     res.status(200).json({ success: true, message: "User deleted successfully" });
//   } catch (err) {
//     res.status(500).json({ error: "Delete failed" });
//   }
// });

// // Assign / update domain for a student
// app.patch("/api/users/:id/domain", async (req, res) => {
//   const { domain } = req.body;
//   try {
//     const updated = await Register.findByIdAndUpdate(
//       req.params.id,
//       { domain },
//       { new: true, select: "-password" }
//     );
//     if (!updated) return res.status(404).json({ message: "User not found" });
//     res.status(200).json({ success: true, user: updated });
//   } catch (err) {
//     res.status(500).json({ error: "Failed to assign domain" });
//   }
// });

// // GET logged-in user's profile
// app.get("/api/auth/me", async (req, res) => {
//   try {
//     const authHeader = req.headers.authorization;
//     if (!authHeader) return res.status(401).json({ message: "No token" });
//     const token = authHeader.split(" ")[1];
//     const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
//     const user = await Register.findById(decoded.id, "-password");
//     if (!user) return res.status(404).json({ message: "User not found" });
//     res.status(200).json({ user });
//   } catch (err) {
//     res.status(401).json({ message: "Invalid token" });
//   }
// });

// // ─────────────────────────────────────────────────────────────
// // UPDATED ANALYTICS (Dynamic + Assignments support)
// // ─────────────────────────────────────────────────────────────
// app.get("/api/analytics", async (req, res) => {
//   try {
//     const { domain } = req.query;
//     if (!domain) return res.status(400).json({ message: "domain query param required" });

//     const { default: Attendance } = await import("./models/Attendance.js");
//     const { default: Lecture }    = await import("./models/Lecture.js");
//     const { default: Assignment } = await import("./models/Assignment.js");

//     const students = await Register.find(
//       { domain, role: { $nin: ["super_admin", "teacher"] } },
//       "-password"
//     );

//     const totalLectures = await Lecture.countDocuments({ division: domain });
//     const totalAssignments = await Assignment.countDocuments({ domain });

//     const result = await Promise.all(
//       students.map(async (st) => {
//         const attended = await Attendance.countDocuments({ student: st._id, present: true });

//         const studentAssignments = await Assignment.find({ domain });
//         const tasksCompleted = studentAssignments.filter((a) =>
//           (a.submissions || []).some((s) => s.student.toString() === st._id.toString())
//         ).length;

//         return {
//           _id: st._id,
//           name: st.fullName,
//           email: st.email,
//           domain: st.domain,
//           attendance: totalLectures > 0 ? Math.round((attended / totalLectures) * 100) : 0,
//           classesAttended: attended,
//           totalClasses: totalLectures,
//           tasksCompleted,
//           totalTasks: totalAssignments,
//           lastSeen: st.updatedAt ? new Date(st.updatedAt).toLocaleDateString() : "—",
//         };
//       })
//     );

//     return res.status(200).json({ students: result });
//   } catch (err) {
//     console.error("Analytics error:", err);
//     return res.status(500).json({ message: "Server error", error: err.message });
//   }
// });

// // ─────────────────────────────────────────────────────────────
// // MOUNT ALL ROUTES (Old + New)
// // ─────────────────────────────────────────────────────────────
// app.use("/api/lectures", lectureRoutes);
// app.use("/api/attendance", attendanceRoutes);
// app.use("/api/assignments", assignmentRoutes);
// app.use("/api/projects", projectRoutes);
// app.use("/api/users", userRoutes);           // ← New userRoutes (for teacher dashboard)

// const port = process.env.PORT || 5001;
// app.listen(port, () => console.log(`🚀 Server running on port ${port}`));




// import express from "express";
// import mongoose from "mongoose";
// import cors from "cors";
// import dotenv from "dotenv";
// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
// import { OAuth2Client } from "google-auth-library";
// import Register from "./models/register.js";
// import nodemailer from "nodemailer";

// import lectureRoutes from "./routes/lectureRoutes.js";
// import attendanceRoutes from "./routes/attendanceRoutes.js";
// import assignmentRoutes from "./routes/assignmentRoutes.js";
// import userRoutes from "./routes/userRoutes.js";
// // import projectRoutes from "./routes/projectRoutes.js";   // ← still commented (safe)

// dotenv.config();

// const app = express();
// const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// // Middleware
// app.use(cors());
// app.use(express.json());

// // MongoDB Connection
// mongoose
//   .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/registration_curd")
//   .then(() => console.log("✅ MongoDB Connected"))
//   .catch((err) => console.log("❌ DB Connection Error:", err));

// // NODEMAILER
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
// });
// const otpStore = {};

// // ─────────────────────────────────────────────────────────────
// // ALL YOUR ORIGINAL ROUTES (100% unchanged - kept exactly as your working file)
// // ─────────────────────────────────────────────────────────────
// app.post("/api/register", async (req, res) => {
//   try {
//     const { fullName, email, password, confirmPassword, contact, role } = req.body;
//     if (password !== confirmPassword) return res.status(400).json({ error: "Passwords do not match." });
//     const indianMobileRegex = /^[6-9]\d{9}$/;
//     if (!indianMobileRegex.test(contact)) return res.status(400).json({ error: "Invalid Indian mobile number." });
//     const existing = await Register.findOne({ email: email.toLowerCase() });
//     if (existing) return res.status(409).json({ error: "Email already registered." });
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const newUser = new Register({
//       fullName: fullName.toUpperCase(),
//       email: email.toLowerCase(),
//       password: hashedPassword,
//       contact,
//       role: role || "user",
//       approved: false,
//       approvalStatus: "PENDING",
//       approvedAt: null,
//     });
//     await newUser.save();
//     res.status(201).json({ message: "Your registration request has been submitted successfully. Waiting for approval.", approvalStatus: "PENDING" });
//   } catch (err) {
//     console.error("Registration Error:", err);
//     res.status(500).json({ error: "Registration Failed." });
//   }
// });

// app.post("/api/login", async (req, res) => { /* your original login code */ });
// app.post("/api/forgot-password", async (req, res) => { /* your original */ });
// app.post("/api/reset-password", async (req, res) => { /* your original */ });
// app.post("/api/google-login", async (req, res) => { /* your original */ });

// app.get("/api/users", async (req, res) => { /* your original */ });
// app.get("/api/users/pending", async (req, res) => { /* your original */ });
// app.put("/api/users/approve/:id", async (req, res) => { /* your original */ });
// app.put("/api/users/reject/:id", async (req, res) => { /* your original */ });
// app.put("/api/users/update-role", async (req, res) => { /* your original with console.log */ });
// app.post("/api/users/register", async (req, res) => { /* your original */ });
// app.delete("/api/users/:id", async (req, res) => { /* your original */ });
// app.patch("/api/users/:id/domain", async (req, res) => { /* your original */ });
// app.get("/api/auth/me", async (req, res) => { /* your original */ });

// // ─────────────────────────────────────────────────────────────
// // FIXED & SAFE ANALYTICS ROUTE (This was causing "Failed to load students")
// // ─────────────────────────────────────────────────────────────
// app.get("/api/analytics", async (req, res) => {
//   try {
//     const { domain } = req.query;
//     if (!domain) return res.status(400).json({ message: "domain query param required" });

//     const { default: Attendance } = await import("./models/Attendance.js");
//     const { default: Lecture }    = await import("./models/Lecture.js");
//     const { default: Assignment } = await import("./models/Assignment.js");

//     // ✅ Only approved students (role = user)
//     const students = await Register.find(
//       { domain, role: "user", approvalStatus: "APPROVED" },
//       "-password"
//     );

//     const totalLectures = await Lecture.countDocuments({ division: domain });
//     const totalAssignments = await Assignment.countDocuments({ domain });

//     const result = await Promise.all(
//       students.map(async (st) => {
//         const attended = await Attendance.countDocuments({ student: st._id, present: true });

//         let tasksCompleted = 0;
//         try {
//           const studentAssignments = await Assignment.find({ domain });
//           tasksCompleted = studentAssignments.filter((a) =>
//             (a.submissions || []).some((s) => s.student?.toString() === st._id.toString())
//           ).length;
//         } catch (e) {
//           tasksCompleted = 0;   // safe fallback
//         }

//         return {
//           _id: st._id,
//           name: st.fullName,
//           email: st.email,
//           domain: st.domain,
//           attendance: totalLectures > 0 ? Math.round((attended / totalLectures) * 100) : 0,
//           classesAttended: attended,
//           totalClasses: totalLectures,
//           tasksCompleted,
//           totalTasks: totalAssignments,
//           lastSeen: st.updatedAt ? new Date(st.updatedAt).toLocaleDateString() : "—",
//         };
//       })
//     );

//     return res.status(200).json({ students: result });
//   } catch (err) {
//     console.error("Analytics error:", err);
//     return res.status(500).json({ message: "Server error", error: err.message });
//   }
// });

// // ─────────────────────────────────────────────────────────────
// // MOUNT ROUTES
// // ─────────────────────────────────────────────────────────────
// app.use("/api/lectures", lectureRoutes);
// app.use("/api/attendance", attendanceRoutes);
// app.use("/api/assignments", assignmentRoutes);
// app.use("/api/users", userRoutes);
// // app.use("/api/projects", projectRoutes);   // still commented

// const port = process.env.PORT || 5001;
// app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
