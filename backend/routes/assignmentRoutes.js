// backend/routes/assignmentRoutes.js
import express from "express";
import Assignment from "../models/Assignment.js";
import protect from "../middleware/authMiddleware.js";
import Register from "../models/register.js";

const router = express.Router();

// ─────────────────────────────────────────────────────────────
// GET /api/assignments
// Teacher: all assignments they created
// ─────────────────────────────────────────────────────────────
router.get("/", protect, async (req, res) => {
  try {
    const assignments = await Assignment.find({ teacher: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ assignments });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch assignments" });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/assignments/mine
// Student: assignments for their domain + submission status
// ─────────────────────────────────────────────────────────────
router.get("/mine", protect, async (req, res) => {
  try {
    const student = await Register.findById(req.user.id);
    if (!student || !student.domain) {
      return res.status(200).json({ assignments: [] });
    }

    const assignments = await Assignment.find({ domain: student.domain }).sort({ createdAt: -1 });

    // Attach submission status per student
    const shaped = assignments.map((a) => {
      const sub = (a.submissions || []).find(
        (s) => s.student.toString() === req.user.id.toString()
      );
      return {
        _id:         a._id,
        title:       a.title,
        domain:      a.domain,
        due:         a.due,
        description: a.description,
        submitted:   !!sub,
        fileUrl:     sub?.fileUrl || "",
        note:        sub?.note || "",
        reviewStatus: sub?.reviewStatus || null,
        submittedAt: sub?.submittedAt || null,
      };
    });

    res.status(200).json({ assignments: shaped });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch your assignments" });
  }
});

// ─────────────────────────────────────────────────────────────
// POST /api/assignments
// Teacher creates assignment for a domain
// Body: { title, domain, due, description }
// ─────────────────────────────────────────────────────────────
router.post("/", protect, async (req, res) => {
  try {
    const { title, domain, due, description } = req.body;
    if (!title || !domain || !due) {
      return res.status(400).json({ message: "Title, domain, and due date are required" });
    }

    const assignment = await Assignment.create({
      teacher:     req.user.id,
      title,
      domain,
      due:         new Date(due),
      description: description || "",
      submissions: [],
    });

    res.status(201).json({ assignment });
  } catch (err) {
    res.status(500).json({ message: "Failed to create assignment", error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// POST /api/assignments/submit
// Student submits assignment
// Body: { assignmentId, fileUrl, note }
// ─────────────────────────────────────────────────────────────
router.post("/submit", protect, async (req, res) => {
  try {
    const { assignmentId, fileUrl, note } = req.body;
    if (!assignmentId || !fileUrl) {
      return res.status(400).json({ message: "Assignment ID and file URL are required" });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });

    // Check if already submitted — update instead of duplicate
    const existingIdx = (assignment.submissions || []).findIndex(
      (s) => s.student.toString() === req.user.id.toString()
    );

    if (existingIdx > -1) {
      assignment.submissions[existingIdx].fileUrl = fileUrl;
      assignment.submissions[existingIdx].note = note || "";
      assignment.submissions[existingIdx].submittedAt = new Date();
    } else {
      assignment.submissions.push({
        student:     req.user.id,
        fileUrl,
        note:        note || "",
        submittedAt: new Date(),
        reviewStatus: null,
      });
      assignment.submissionsCount = (assignment.submissionsCount || 0) + 1;
    }

    await assignment.save();
    res.status(200).json({ success: true, message: "Assignment submitted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Submission failed", error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// DELETE /api/assignments/:id
// Teacher deletes assignment
// ─────────────────────────────────────────────────────────────
router.delete("/:id", protect, async (req, res) => {
  try {
    const assignment = await Assignment.findOne({ _id: req.params.id, teacher: req.user.id });
    if (!assignment) return res.status(404).json({ message: "Not found or unauthorized" });

    await assignment.deleteOne();
    res.status(200).json({ success: true, message: "Assignment deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete assignment" });
  }
});

export default router;