import express from "express";
import { pool } from "../index.js";
import { getEligibleSchemes } from "../services/schemes.service.js";

const router = express.Router();

/**
 * GET all schemes
 */
router.get("/all", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM government_schemes"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed to fetch schemes",
    });
  }
});

/**
 * POST eligibility check
 */
router.post("/eligible", async (req, res) => {
  try {
    const { profession, income } = req.body;

    if (!profession || !income) {
      return res.status(400).json({
        error: "profession and income required",
      });
    }

    const eligible = await getEligibleSchemes({
      profession,
      income,
    });

    res.json(eligible);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Eligibility check failed",
    });
  }
});

export default router;
