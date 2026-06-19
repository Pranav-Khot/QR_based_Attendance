import express from "express";
import Project from "../models/Project.js";
import Register from "../models/register.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, async (req, res) => {
  try {
    const projects = await Project.find({ teacher: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ projects });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch projects" });
  }
});

router.get("/mine", protect, async (req, res) => {
  try {
    const student = await Register.findById(req.user.id);
    if (!student || !student.domain) {
      return res.status(200).json({ projects: [] });
    }

    const projects = await Project.find({ domain: student.domain }).sort({ createdAt: -1 });

    const shaped = projects.map((project) => {
      const sub = (project.submissions || []).find(
        (item) => item.student.toString() === req.user.id.toString()
      );

      return {
        _id: project._id,
        title: project.title,
        domain: project.domain,
        deadline: project.deadline,
        description: project.description,
        status: project.status,
        submitted: !!sub,
        repoUrl: sub?.repoUrl || "",
        note: sub?.note || "",
        reviewStatus: sub?.reviewStatus || null,
        submittedAt: sub?.submittedAt || null,
      };
    });

    res.status(200).json({ projects: shaped });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch your projects" });
  }
});

router.post("/", protect, async (req, res) => {
  try {
    const { title, domain, deadline, description } = req.body;
    if (!title || !domain || !deadline) {
      return res.status(400).json({ message: "Title, domain, and deadline are required" });
    }

    const project = await Project.create({
      teacher: req.user.id,
      title,
      domain,
      deadline: new Date(deadline),
      description: description || "",
      status: "ongoing",
      submissions: [],
    });

    res.status(201).json({ project });
  } catch (err) {
    res.status(500).json({ message: "Failed to create project", error: err.message });
  }
});

router.post("/submit", protect, async (req, res) => {
  try {
    const { projectId, repoUrl, note } = req.body;
    if (!projectId || !repoUrl) {
      return res.status(400).json({ message: "Project ID and repo URL are required" });
    }

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const existingIdx = (project.submissions || []).findIndex(
      (item) => item.student.toString() === req.user.id.toString()
    );

    if (existingIdx > -1) {
      project.submissions[existingIdx].repoUrl = repoUrl;
      project.submissions[existingIdx].note = note || "";
      project.submissions[existingIdx].submittedAt = new Date();
    } else {
      project.submissions.push({
        student: req.user.id,
        repoUrl,
        note: note || "",
        submittedAt: new Date(),
        reviewStatus: null,
      });
      project.submissionsCount = (project.submissionsCount || 0) + 1;
    }

    await project.save();
    res.status(200).json({ success: true, message: "Project submitted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Project submission failed", error: err.message });
  }
});

router.delete("/:id", protect, async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, teacher: req.user.id });
    if (!project) return res.status(404).json({ message: "Not found or unauthorized" });

    await project.deleteOne();
    res.status(200).json({ success: true, message: "Project deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete project" });
  }
});

export default router;
