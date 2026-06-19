// backend/routes/attendanceRoutes.js

import express from "express";
import jwt from "jsonwebtoken";
import Attendance from "../models/Attendance.js";
import Lecture from "../models/Lecture.js";
import Register from "../models/register.js";

const router = express.Router();

// ─── inline auth helper ───────────────────────────────────────────────────────
const getUser = (req) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return null;
    return jwt.verify(token, process.env.JWT_SECRET || "secret");
  } catch {
    return null;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/attendance/mark
// Called when student scans QR code.
// QR value = lectureId (plain MongoDB ObjectId string).
// JWT identifies the student — no spoofing possible.
// Body: { lectureId }   (qrValue is the same as lectureId from QR scan)
// ─────────────────────────────────────────────────────────────────────────────
router.post("/mark", async (req, res) => {
  try {
    const decoded = getUser(req);
    if (!decoded) return res.status(401).json({ message: "Unauthorized" });

    // qrValue comes from the QR scan — it IS the lectureId
    const { lectureId, qrValue } = req.body;
    const resolvedLectureId = lectureId || qrValue;

    if (!resolvedLectureId) {
      return res.status(400).json({ message: "lectureId is required." });
    }

    // Find the lecture
    const lecture = await Lecture.findById(resolvedLectureId);
    if (!lecture) return res.status(404).json({ message: "Lecture not found." });

    // Check QR is still valid — 5 minute window from startTime
    const expiresAt = new Date(new Date(lecture.startTime).getTime() + 5 * 60 * 1000);
    if (new Date() > expiresAt) {
      return res.status(400).json({
        message: "QR code has expired. You cannot mark attendance now.",
      });
    }

    // Find student
    const student = await Register.findById(decoded.id);
    if (!student) return res.status(404).json({ message: "Student not found." });

    // Check domain matches lecture division
    if (student.domain !== lecture.division) {
      return res.status(403).json({ message: "This lecture is not for your domain." });
    }

    // Upsert attendance — prevents duplicate records
    const attendance = await Attendance.findOneAndUpdate(
      { student: decoded.id, lecture: resolvedLectureId },
      {
        student:  decoded.id,
        lecture:  resolvedLectureId,
        subject:  lecture.subject,
        domain:   lecture.division,
        present:  true,
        markedAt: new Date(),
        zoomLink: lecture.zoomLink || "",
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      message:  "Attendance marked successfully! ✅",
      attendance,
      zoomLink: lecture.zoomLink || "",
      lectureSubject: lecture.subject,
    });

  } catch (err) {
    console.error("Mark attendance error:", err);
    if (err.code === 11000) {
      // Already marked — still return zoomLink so student can join
      try {
        const resolvedLectureId = req.body.lectureId || req.body.qrValue;
        const lecture = await Lecture.findById(resolvedLectureId);
        return res.status(200).json({
          message: "Attendance already marked! ✅",
          zoomLink: lecture?.zoomLink || "",
          alreadyMarked: true,
        });
      } catch {
        return res.status(400).json({ message: "Attendance already marked for this lecture." });
      }
    }
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/attendance/join
// Called when student clicks "Join Meeting" button on a live lecture
// (without scanning — marks present AND returns zoom link)
// Body: { lectureId }
// ─────────────────────────────────────────────────────────────────────────────
router.post("/join", async (req, res) => {
  try {
    const decoded = getUser(req);
    if (!decoded) return res.status(401).json({ message: "Unauthorized" });

    const { lectureId } = req.body;
    if (!lectureId) return res.status(400).json({ message: "lectureId is required." });

    const lecture = await Lecture.findById(lectureId);
    if (!lecture) return res.status(404).json({ message: "Lecture not found." });

    // Check QR still valid (5-min window)
    const expiresAt = new Date(new Date(lecture.startTime).getTime() + 5 * 60 * 1000);
    if (new Date() > expiresAt) {
      // After expiry — still let them join meeting but don't mark attendance
      return res.status(200).json({
        message: "QR expired — joining without marking attendance.",
        zoomLink: lecture.zoomLink || "",
        marked: false,
      });
    }

    const student = await Register.findById(decoded.id);
    if (!student) return res.status(404).json({ message: "Student not found." });

    if (student.domain !== lecture.division) {
      return res.status(403).json({ message: "This lecture is not for your domain." });
    }

    // Mark attendance
    await Attendance.findOneAndUpdate(
      { student: decoded.id, lecture: lectureId },
      {
        student:  decoded.id,
        lecture:  lectureId,
        subject:  lecture.subject,
        domain:   lecture.division,
        present:  true,
        markedAt: new Date(),
        zoomLink: lecture.zoomLink || "",
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      message: "Attendance marked & joining! ✅",
      zoomLink: lecture.zoomLink || "",
      marked: true,
    });

  } catch (err) {
    console.error("Join error:", err);
    // Even on error — return zoom link if possible
    try {
      const lecture = await Lecture.findById(req.body.lectureId);
      return res.status(200).json({ zoomLink: lecture?.zoomLink || "", marked: false });
    } catch {
      return res.status(500).json({ message: "Server error", error: err.message });
    }
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/attendance/mine
// Student gets their own full attendance history including NOT attended lectures
// Returns all lectures for their domain with present/absent flag
// ─────────────────────────────────────────────────────────────────────────────
router.get("/mine", async (req, res) => {
  try {
    const decoded = getUser(req);
    if (!decoded) return res.status(401).json({ message: "Unauthorized" });

    const student = await Register.findById(decoded.id);
    if (!student) return res.status(404).json({ message: "Student not found." });

    // Get all lectures for student's domain
    const Lecture = (await import("../models/Lecture.js")).default;
    const allLectures = student.domain
      ? await Lecture.find({ division: student.domain }).sort({ startTime: -1 })
      : [];

    // Get student's actual attendance records
    const attendanceRecords = await Attendance.find({ student: decoded.id });
    const attendedLectureIds = new Set(attendanceRecords.map(a => a.lecture.toString()));

    // Build full record: attended + not attended
    const shaped = allLectures.map((lec) => {
      const attended = attendedLectureIds.has(lec._id.toString());
      const record = attendanceRecords.find(a => a.lecture.toString() === lec._id.toString());
      return {
        _id:      record?._id || lec._id,
        lectureId: lec._id,
        subject:  lec.subject,
        domain:   lec.division,
        present:  attended,
        date:     record?.markedAt || lec.startTime,
        zoomLink: lec.zoomLink || "",
        lecture:  lec,
      };
    });

    return res.status(200).json({ records: shaped });

  } catch (err) {
    console.error("Get my attendance error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/attendance/student/:id
// Teacher views a specific student's full attendance log (all lectures in domain)
// ─────────────────────────────────────────────────────────────────────────────
router.get("/student/:id", async (req, res) => {
  try {
    const decoded = getUser(req);
    if (!decoded) return res.status(401).json({ message: "Unauthorized" });

    const student = await Register.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found." });

    // All lectures for this student's domain
    const LectureMod = (await import("../models/Lecture.js")).default;
    const allLectures = student.domain
      ? await LectureMod.find({ division: student.domain }).sort({ startTime: -1 })
      : [];

    // Actual attendance records
    const attendanceRecords = await Attendance.find({ student: req.params.id });
    const attendedLectureIds = new Set(attendanceRecords.map(a => a.lecture.toString()));

    const shaped = allLectures.map((lec) => {
      const attended = attendedLectureIds.has(lec._id.toString());
      const record = attendanceRecords.find(a => a.lecture.toString() === lec._id.toString());
      return {
        _id:      record?._id || lec._id,
        lectureId: lec._id,
        subject:  lec.subject,
        domain:   lec.division,
        present:  attended,
        date:     record?.markedAt || lec.startTime,
        zoomLink: lec.zoomLink || "",
        lecture:  lec,
      };
    });

    return res.status(200).json({ records: shaped });

  } catch (err) {
    console.error("Get student attendance error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;