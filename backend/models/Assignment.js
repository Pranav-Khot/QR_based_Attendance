// backend/models/Assignment.js
import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema({
  student:     { type: mongoose.Schema.Types.ObjectId, ref: "Register", required: true },
  fileUrl:     { type: String, required: true },
  note:        { type: String, default: "" },
  submittedAt: { type: Date, default: Date.now },
  reviewStatus:{ type: String, default: null },
});

const assignmentSchema = new mongoose.Schema(
  {
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Register",
      required: true,
    },
    title:            { type: String, required: true },
    domain:           { type: String, required: true },
    due:              { type: Date, required: true },
    description:      { type: String, default: "" },
    submissions:      { type: [submissionSchema], default: [] },
    submissionsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Assignment", assignmentSchema);