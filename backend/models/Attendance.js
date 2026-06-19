// backend/models/Attendance.js

import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Register",   
      required: true,
    },
    lecture: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lecture",
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    domain: {
      type: String,
      required: true,
    },
    present: {
      type: Boolean,
      default: false,
    },
    markedAt: {
      type: Date,
      default: Date.now,
    },
    zoomLink: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

attendanceSchema.index({ student: 1, lecture: 1 }, { unique: true });

const Attendance = mongoose.model("Attendance", attendanceSchema);
export default Attendance;