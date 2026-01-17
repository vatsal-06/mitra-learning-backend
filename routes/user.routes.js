import express from "express";
import { createOrGetUser } from "../services/user.service.js";

const router = express.Router();

router.post("/init", (req, res) => {
  const { user_id, language, profession } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: "user_id is required" });
  }

  const data = createOrGetUser(user_id, language, profession);

  res.json({
    success: true,
    user: data.user,
    stats: data.stats,
  });
});

export default router;
