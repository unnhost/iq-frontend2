import { useState, useEffect } from "react";

const API_URL = "https://iq-backend-bc3f.onrender.com";
const USER_TOKEN = "user-token";

export default function IQTestApp() {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [log, setLog] = useState([]);

  useEffect(() => {
    fetch(\`\${API_URL}/questions\`)
      .then((res) => res.json())
      .then(setQuestions);
  }, []);

  useEffect(() => {
    if (submitted || current >= questions.length) return;
    if (timeLeft <= 0) {
      handleAnswer(null);
      return;
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, current, submitted]);

  const handleAnswer = (selected) => {
    const q = questions[current];
    const timeTaken = 30 - timeLeft;

    setAnswers((prev) => [
      ...prev,
      {
        question_id: q.id,
        selected: selected,
        time_taken: timeTaken,
      },
    ]);

    setLog((prev) => [
      ...prev,
      {
        question: q.question,
        selected: selected,
        correct: q.answer,
        timeTaken: timeTaken,
        status:
          selected === q.answer && timeTaken <= 30 ? "✅ Correct" : "❌ Incorrect",
      },
    ]);

    setTimeLeft(30);
    setCurrent((c) => c + 1);
  };

  useEffect(() => {
    if (current === questions.length && !submitted) {
      // Send to backend for real scoring
      fetch(\`\${API_URL}/submit\`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-token": USER_TOKEN,
        },
        body: JSON.stringify({ answers }),
      })
        .then((res) => res.json())
        .then(setResult)
        .then(() => setSubmitted(true));
    }
  }, [current, submitted, answers]);

  if (questions.length === 0) return <p style={{ padding: 20 }}>Loading...</p>;

  if (submitted) {
    return (
      <div style={{ padding: 20 }}>
        <h1>Your Real IQ Score</h1>
        <p>✅ Estimated IQ: {result?.estimated_iq}</p>
        <p>Score: {result?.score} / {result?.max_score}</p>
        <ul>
          {log.map((entry, i) => (
            <li key={i}>
              Q{i + 1}: {entry.selected || "(No answer)"} | Correct: {entry.correct} | Time: {entry.timeTaken}s | {entry.status}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (current >= questions.length) {
    return <p style={{ padding: 20 }}>Submitting your answers...</p>;
  }

  const q = questions[current];

  return (
    <div style={{ padding: 20 }}>
      <h2>Question {current + 1} / {questions.length}</h2>
      <p>{q.question}</p>
      <div>
        {Object.entries(q.options).map(([key, val]) => (
          <button key={key} onClick={() => handleAnswer(key)} style={{ margin: '5px' }}>
            {key}: {val}
          </button>
        ))}
      </div>
      <p>Time left: {timeLeft}s</p>
    </div>
  );
}
