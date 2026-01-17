import express from "express";

const router = express.Router();

router.get("/ping", (req, res) => {
  res.json({ status: "quiz routes ready" });
});

export default router;
