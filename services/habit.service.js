import { getOpenAI } from "../config/openai.js";
import { dailyHabits, userStats } from "../db/store.js";

/**
 * Generate habit key
 */
function getHabitKey(date, profession, language) {
  return `${date}_${profession}_${language}`;
}

/**
 * Build AI prompt
 */
function buildHabitPrompt({ profession, language }) {
  return `
Generate ONE very small daily financial habit.
Audience profession: ${profession}
Language: ${language}

Rules:
- Must be actionable TODAY
- Must take less than 5 minutes
- Must not require internet
- Must not involve borrowing money
- Use simple language
- One sentence only

Return STRICT JSON:
{
  "habit": "..."
}
`;
}

/**
 * Fetch or generate daily habit
 */
export async function getDailyHabit({ userId, profession, language }) {
  const today = new Date().toISOString().split("T")[0];
  const key = getHabitKey(today, profession, language);

  // 🔁 Return cached habit if exists
  if (dailyHabits.has(key)) {
    return dailyHabits.get(key);
  }

  // ✅ CREATE OPENAI CLIENT HERE (SAFE)
  const openai = getOpenAI();

  const prompt = buildHabitPrompt({ profession, language });

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.6,
  });

  const parsed = JSON.parse(response.choices[0].message.content);

  const habit = {
    habit_id: key,
    habit: parsed.habit,
    xp: 5,
    completed_users: new Set(),
  };

  dailyHabits.set(key, habit);
  return habit;
}

/**
 * Mark habit completed
 */
export function completeHabit({ userId, habit }) {
  if (habit.completed_users.has(userId)) {
    return { alreadyCompleted: true };
  }

  habit.completed_users.add(userId);

  // Auto-init stats if needed
  let stats = userStats.get(userId);
  if (!stats) {
    stats = { xp: 0, streak: 0, last_active_date: null };
    userStats.set(userId, stats);
  }

  stats.xp += habit.xp;

  return { alreadyCompleted: false };
}
