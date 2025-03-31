import { useState, useEffect } from "react";

const API_URL = "https://iq-backend-bc3f.onrender.com";

export default function IQTestApp() {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [log, setLog] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/questions`)
      .then((res) => res.json())
      .then(setQuestions);
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      handleAnswer(null);
      return;
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const handleAnswer = (selected) => {
    const q = questions[current];
    const correct = selected === q.answer;
    const inTime = timeLeft > 0;
    const timeTaken = 30 - timeLeft;
    const weight = q.weight;
    const earned = correct && inTime ? weight : 0;

    setLog((prev) => [
      ...prev,
      { question: q.question, selected, correct: q.answer, timeTaken, earned },
    ]);
    setScore((s) => s + earned);
    setTimeLeft(30);
    setCurrent((c) => c + 1);
  };

  const getIQ = () => {
    const max = questions.reduce((sum, q) => sum + q.weight, 0);
    return Math.round(85 + (score / max) * 60);
  };

  if (questions.length === 0) return <p>Loading...</p>;
  if (current >= questions.length) {
    return (
      <div style={{ padding: 20 }}>
        <h1>Your IQ Score</h1>
        <p>Estimated IQ: {getIQ()}</p>
        <ul>
          {log.map((entry, i) => (
            <li key={i}>
              Q{i + 1}: {entry.selected || "(No answer)"} | Correct: {entry.correct} | Time: {entry.timeTaken}s | +{entry.earned}
            </li>
          ))}
        </ul>
      </div>
    );
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
