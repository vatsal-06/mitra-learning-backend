import express from "express";
import { getDailyHabit, completeHabit } from "../services/habit.service.js";
import { dailyHabits } from "../db/store.js";

const router = express.Router();

/**
 * GET /habit/daily
 */
router.get("/daily", async (req, res) => {
  try {
    const { user_id, profession, language } = req.query;

    if (!user_id || !profession || !language) {
      return res.status(400).json({ error: "Missing query params" });
    }

    const habit = await getDailyHabit({
      userId: user_id,
      profession,
      language,
    });

    res.json({
      habit_id: habit.habit_id,
      habit: habit.habit,
      xp: habit.xp,
      completed: habit.completed_users.has(user_id),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get daily habit" });
  }
});

/**
 * POST /habit/complete  ✅ BULLETPROOF
 */
router.post("/complete", async (req, res) => {
  try {
    const { user_id, habit_id } = req.body;

    if (!user_id || !habit_id) {
      return res.status(400).json({ error: "Missing fields" });
    }

    let habit = dailyHabits.get(habit_id);

    // 🔥 AUTO-RECOVER IF MEMORY LOST
    if (!habit) {
      const [date, profession, language] = habit_id.split("_");

      habit = await getDailyHabit({
        userId: user_id,
        profession,
        language,
      });
    }

    const result = completeHabit({ userId: user_id, habit });

    res.json({
      success: true,
      xp_gained: result.alreadyCompleted ? 0 : habit.xp,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to complete habit" });
  }
});

export default router;