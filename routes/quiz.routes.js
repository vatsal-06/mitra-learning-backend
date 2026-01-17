import express from "express";
import { generateQuiz } from "../services/quiz.service.js";
import { submitQuiz } from "../services/quiz.submit.service.js";

const router = express.Router();

/**
 * POST /quiz/generate
 */
router.post("/generate", async (req, res) => {
  try {
    const { user_id, quiz_type, language, profession } = req.body;

    if (!user_id || !quiz_type || !language) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const quiz = await generateQuiz({
      quizType: quiz_type,
      profession,
      language,
    });

    // ❌ Remove answers before sending to Flutter
    const safeQuestions = quiz.questions.map(q => ({
      id: q.id,
      question: q.question,
      options: q.options,
    }));

    res.json({
      quiz_id: quiz.quiz_id,
      questions: safeQuestions,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Quiz generation failed" });
  }
});

/**
 * POST /quiz/submit
 */
router.post("/submit", async (req, res) => {
  try {
    const { user_id, quiz_id, answers } = req.body;

    if (!user_id || !quiz_id || !answers) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const result = await submitQuiz({
      userId: user_id,
      quizId: quiz_id,
      answers,
    });

    res.json(result);
  } catch (err) {
    console.error(err.message);
    res.status(400).json({ error: err.message });
  }
});

export default router;
