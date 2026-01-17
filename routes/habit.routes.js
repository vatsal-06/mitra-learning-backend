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
 * POST /habit/complete
 */
router.post("/complete", (req, res) => {
  try {
    const { user_id, habit_id } = req.body;

    const habit = dailyHabits.get(habit_id);
    if (!habit) {
      return res.status(400).json({ error: "Habit not found" });
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
