import express from "express";

const router = express.Router();

router.get("/ping", (req, res) => {
  res.json({ status: "habit routes ready" });
});

export default router;
