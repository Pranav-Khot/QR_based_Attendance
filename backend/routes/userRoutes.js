// import express from "express";
// import Register from "../models/register.js";
// import protect from "../middleware/authMiddleware.js";

// const router = express.Router();

// // ─────────────────────────────────────────────────────────────
// // GET /api/users?role=student
// // Returns all approved students (used by teacher dashboard)
// // ─────────────────────────────────────────────────────────────
// router.get("/", protect, async (req, res) => {
//   try {
//     const { role } = req.query;

//     let filter = { email: { $ne: process.env.ADMIN_EMAIL } };

//     if (role === "student") {
//       // Students are users with role "user" who are APPROVED
//       filter.role = "user";
//       filter.approvalStatus = "APPROVED";
//     }

//     const users = await Register.find(filter, "-password").sort({ createdAt: -1 });

//     res.status(200).json({ students: users });
//   } catch (err) {
//     console.error("Fetch users error:", err);
//     res.status(500).json({ error: "Failed to fetch users" });
//   }
// });

// // ─────────────────────────────────────────────────────────────
// // PATCH /api/users/:id/domain
// // Assigns or updates a domain for a student
// // Body: { domain: "MEAN Stack" }
// // ─────────────────────────────────────────────────────────────
// router.patch("/:id/domain", protect, async (req, res) => {
//   try {
//     const { domain } = req.body;

//     const VALID_DOMAINS = ["MEAN Stack", "Java Full Stack", "Python Developer", "Cyber Security", ""];

//     if (domain !== undefined && domain !== "" && !VALID_DOMAINS.includes(domain)) {
//       return res.status(400).json({ message: "Invalid domain value" });
//     }

//     const updated = await Register.findByIdAndUpdate(
//       req.params.id,
//       { domain: domain || null },
//       { new: true, select: "-password" }
//     );

//     if (!updated) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     console.log(`✅ Domain "${domain}" assigned to ${updated.email}`);

//     res.status(200).json({
//       success: true,
//       message: `Domain "${domain}" assigned successfully`,
//       user: updated,
//     });
//   } catch (err) {
//     console.error("Assign domain error:", err);
//     res.status(500).json({ message: "Failed to assign domain", error: err.message });
//   }
// });

// export default router;


// In userRoutes.js
import express from "express";
import Register from "../models/register.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();
const VALID_DOMAINS = ["MEAN Stack", "Java Full Stack", "Python Developer", "Cyber Security"];

// GET /api/users?role=student  →  returns users with role="user"
router.get("/", protect, async (req, res) => {
  try {
    const filter = {};

    if (req.user?.role === "teacher") {
      filter.role = "user";
      filter.approvalStatus = "APPROVED";
    } else if (req.query.role === "student") {
      filter.role = "user";
      filter.approvalStatus = "APPROVED";
    } else if (req.query.role) {
      filter.role = req.query.role;
    }

    const students = await Register.find(filter, "-password").sort({ createdAt: -1 });
    res.status(200).json({ students });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// PATCH /api/users/:id/domain
router.patch("/:id/domain", protect, async (req, res) => {
  const { domain } = req.body;
  try {
    if (domain !== undefined && domain !== null && domain !== "" && !VALID_DOMAINS.includes(domain)) {
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

export default router;
