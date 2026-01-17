import { getOpenAI } from "../config/openai.js";
import {
  dailyQuizzes,
  userStats,
  userQuizAttempts,
} from "../db/store.js";

/**
 * Convert score to XP (system-controlled)
 */
function calculateXP(score, total) {
  const baseXP = 20;
  return Math.round((score / total) * baseXP);
}

/**
 * Streak update logic
 */
function updateStreak(stats) {
  const today = new Date().toISOString().split("T")[0];

  if (!stats.last_active_date) {
    stats.streak = 1;
  } else {
    const last = new Date(stats.last_active_date);
    const diff =
      (new Date(today) - last) / (1000 * 60 * 60 * 24);

    if (diff === 1) stats.streak += 1;
    else if (diff > 1) stats.streak = 1;
  }

  stats.last_active_date = today;
}

/**
 * MAIN SUBMIT HANDLER
 */
export async function submitQuiz({ userId, quizId, answers }) {
  const quiz = dailyQuizzes.get(quizId);

  if (!quiz) {
    throw new Error("Quiz not found");
  }

  // Prevent re-submission
  const attemptKey = `${userId}_${quizId}`;
  if (userQuizAttempts.has(attemptKey)) {
    throw new Error("Quiz already submitted");
  }

  const evaluationPrompt = `
You are an evaluator.

Quiz questions with correct answers:
${quiz.questions
  .map((q) => `Q${q.id}: correct=${q.correct_answer}`)
  .join("\n")}

User answers:
${Object.entries(answers)
  .map(([id, ans]) => `Q${id}: ${ans}`)
  .join("\n")}

Return STRICT JSON:
{
  "score": number,
  "out_of": number,
  "difficulty_feedback": "increase" | "same" | "decrease",
  "explanations": ["...", "..."]
}
`;

  // ✅ CREATE OPENAI CLIENT ONLY HERE
  const openai = getOpenAI();

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: evaluationPrompt }],
    temperature: 0.2,
  });

  const evaluation = JSON.parse(
    response.choices[0].message.content
  );

  // Auto-init stats if missing
  let stats = userStats.get(userId);
  if (!stats) {
    stats = {
      xp: 0,
      streak: 0,
      last_active_date: null,
    };
    userStats.set(userId, stats);
  }

  const xp = calculateXP(evaluation.score, evaluation.out_of);

  stats.xp += xp;
  updateStreak(stats);

  userQuizAttempts.set(attemptKey, {
    score: evaluation.score,
    completed_at: new Date(),
  });

  return {
    score: evaluation.score,
    out_of: evaluation.out_of,
    xp_gained: xp,
    streak: stats.streak,
    explanations: evaluation.explanations,
    difficulty_feedback: evaluation.difficulty_feedback,
  };
}
