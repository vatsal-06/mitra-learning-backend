import openai from "../config/openai.js";
import { dailyQuizzes } from "../db/store.js";

/**
 * Generate a unique key per day & quiz type
 */
function getQuizKey(date, quizType, profession, language) {
  return `${date}_${quizType}_${profession}_${language}`;
}

/**
 * AI PROMPT BUILDER
 */
function buildQuizPrompt({ quizType, profession, language, difficulty }) {
  const base = `
Generate a ${difficulty} level financial literacy quiz.
Language: ${language}

Rules:
- 3 multiple choice questions
- 4 options each
- Only ONE correct option
- Return STRICT JSON
- No explanations
`;

  if (quizType === "general") {
    return `
${base}
Audience: General public
Topics: savings, budgeting, banking, digital payments

JSON FORMAT:
{
  "questions": [
    {
      "id": 1,
      "question": "...",
      "options": ["A", "B", "C", "D"],
      "correct_answer": "A"
    }
  ]
}`;
  }

  return `
${base}
Audience profession: ${profession}
Topics: finance relevant to ${profession}

JSON FORMAT:
{
  "questions": [
    {
      "id": 1,
      "question": "...",
      "options": ["A", "B", "C", "D"],
      "correct_answer": "A"
    }
  ]
}`;
}

/**
 * MAIN GENERATOR
 */
export async function generateQuiz({
  quizType,
  profession,
  language,
  difficulty = "beginner",
}) {
  const today = new Date().toISOString().split("T")[0];
  const key = getQuizKey(today, quizType, profession, language);

  // 🔁 Return cached quiz if exists
  if (dailyQuizzes.has(key)) {
    return dailyQuizzes.get(key);
  }

  const prompt = buildQuizPrompt({
    quizType,
    profession,
    language,
    difficulty,
  });

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  const raw = response.choices[0].message.content;
  const parsed = JSON.parse(raw);

  const quiz = {
    quiz_id: key,
    questions: parsed.questions.map(q => ({
      id: q.id,
      question: q.question,
      options: q.options,
      correct_answer: q.correct_answer, // stored server-side
    })),
  };

  dailyQuizzes.set(key, quiz);
  return quiz;
}
