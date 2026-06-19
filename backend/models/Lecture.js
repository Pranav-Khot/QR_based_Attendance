import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Register",      // ← Must match your model name
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  division: {
    type: String,
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  durationMinutes: {
    type: Number,
    required: true
  },
  zoomLink: {
    type: String,
    default: ""
  }
}, { timestamps: true });

const Lecture = mongoose.model("Lecture", lectureSchema);
export default Lecture;