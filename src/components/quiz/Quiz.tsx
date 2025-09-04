import { useState } from "react";

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

const quizQuestions: QuizQuestion[] = [
  {
    question: "Which of these is a content type in our website?",
    options: ["cerita", "makna_kata", "artikel", "all of the above"],
    correctIndex: 3,
  },
  {
    question: "Who can approve content?",
    options: ["users", "moderators", "admins", "both moderators and admins"],
    correctIndex: 3,
  },
  {
    question: "What is the main purpose of Bahasa Indah Nusantara?",
    options: ["Gaming", "Preserve and explore Indonesian language", "Social media", "Shopping"],
    correctIndex: 1,
  },
];

export default function Quiz() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const currentQuestion = quizQuestions[currentIndex];

  const handleOptionClick = (idx: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(idx);
    setShowFeedback(true);
    if (idx === currentQuestion.correctIndex) setScore(score + 1);
  };

  const nextQuestion = () => {
    setSelectedOption(null);
    setShowFeedback(false);
    if (currentIndex < quizQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const restartQuiz = () => {
    setCurrentIndex(0);
    setScore(0);
    setSelectedOption(null);
    setShowFeedback(false);
  };

  if (currentIndex >= quizQuestions.length) {
    return (
      <div className="p-6 max-w-md mx-auto bg-white shadow-md rounded-lg text-center">
        <h2 className="text-xl font-bold mb-4">Quiz Completed!</h2>
        <p className="mb-4">
          Your score: {score} / {quizQuestions.length}
        </p>
        <button
          onClick={restartQuiz}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Restart Quiz
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-md mx-auto bg-white shadow-md rounded-lg">
      <h3 className="text-lg font-semibold mb-2">{currentQuestion.question}</h3>
      <div className="flex flex-col gap-2">
        {currentQuestion.options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => handleOptionClick(idx)}
            disabled={selectedOption !== null}
            className={`px-4 py-2 rounded-lg border transition ${
              showFeedback
                ? idx === currentQuestion.correctIndex
                  ? "bg-green-500 text-white"
                  : idx === selectedOption
                  ? "bg-red-500 text-white"
                  : "bg-gray-100"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      {showFeedback && currentIndex < quizQuestions.length && (
        <div className="mt-4">
          {selectedOption === currentQuestion.correctIndex ? (
            <p className="text-green-600 font-semibold">Correct!</p>
          ) : (
            <p className="text-red-600 font-semibold">Incorrect!</p>
          )}
          {currentIndex < quizQuestions.length - 1 && (
            <button
              onClick={nextQuestion}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Next Question
            </button>
          )}
        </div>
      )}
    </div>
  );
}