import mongoose from "mongoose";

const projectSubmissionSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Register", required: true },
  repoUrl: { type: String, required: true },
  note: { type: String, default: "" },
  submittedAt: { type: Date, default: Date.now },
  reviewStatus: { type: String, default: null },
});

const projectSchema = new mongoose.Schema(
  {
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Register",
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    domain: { type: String, required: true },
    deadline: { type: Date, required: true },
    status: { type: String, default: "ongoing" },
    submissions: { type: [projectSubmissionSchema], default: [] },
    submissionsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Project", projectSchema);
