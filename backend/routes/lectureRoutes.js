import express from "express";
import Lecture from "../models/Lecture.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// ─── PUBLIC/STUDENT ROUTES ────────────────────────────────────

// GET live lecture by domain (Check for lectures created in the last 5 mins)
router.get("/live", async (req, res) => {
  try {
    const { domain } = req.query;
    if (!domain) {
      return res.status(400).json({ message: "domain is required" });
    }

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const lecture = await Lecture.findOne({
      division: domain,                    // Matches what teacher selected
      createdAt: { $gte: fiveMinutesAgo }, // Created within last 5 minutes
    }).sort({ createdAt: -1 });            // Get the most recent one

    if (!lecture) {
      return res.status(200).json({ lecture: null });
    }

    res.status(200).json({ lecture });
  } catch (err) {
    console.error("Live lecture error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ─── PROTECTED TEACHER ROUTES ─────────────────────────────────

// GET all lectures of logged-in teacher
router.get("/", protect, async (req, res) => {
  try {
    const lectures = await Lecture.find({ teacher: req.user.id })
      .sort({ startTime: -1 });

    res.json(lectures);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// POST create new lecture
router.post("/create", protect, async (req, res) => {
  try {
    const { subject, division, startTime, durationMinutes, zoomLink } = req.body;

    const lecture = await Lecture.create({
      teacher: req.user.id,
      subject,
      division,
      startTime: new Date(startTime),
      durationMinutes: Number(durationMinutes),
      zoomLink: zoomLink || ""
    });

    // Returns the lecture object directly to the frontend
    res.status(201).json({ lecture });   
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: "Failed to create lecture", 
      error: error.message 
    });
  }
});

export default router;