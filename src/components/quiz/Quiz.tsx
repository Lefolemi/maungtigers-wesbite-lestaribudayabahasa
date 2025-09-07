import { useState } from "react";

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

interface QuizProps {
  questions: QuizQuestion[];
  onFinish: (correct: number, wrong: number) => void;
}

export default function Quiz({ questions, onFinish }: QuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);

  const currentQuestion = questions[currentIndex];

  const handleOptionClick = (idx: number) => {
    if (selectedOption !== null) return;

    setSelectedOption(idx);
    setShowFeedback(true);

    if (idx === currentQuestion.correctIndex) setCorrectCount(correctCount + 1);
    else setWrongCount(wrongCount + 1);
  };

  const nextQuestion = () => {
    setSelectedOption(null);
    setShowFeedback(false);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onFinish(correctCount, wrongCount); // Finish Quiz
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white/20 backdrop-blur-md shadow-lg rounded-lg">
      {/* Question */}
      <h3 className="text-lg font-semibold mb-4 text-center text-gray-900">
        {currentQuestion.question}
      </h3>

      {/* Options */}
      <div className="flex flex-col gap-2">
        {currentQuestion.options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => handleOptionClick(idx)}
            disabled={selectedOption !== null}
            className={`px-4 py-2 rounded-lg border transition font-medium ${
              showFeedback
                ? idx === currentQuestion.correctIndex
                  ? "bg-green-500 text-white"
                  : idx === selectedOption
                  ? "bg-red-500 text-white"
                  : "bg-white/40 text-gray-900"
                : "bg-white/40 hover:bg-white/50 text-gray-900"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>

      {/* Feedback */}
      {showFeedback && (
        <div className="mt-4 text-center">
          {selectedOption === currentQuestion.correctIndex ? (
            <p className="text-green-500 font-semibold mb-2">Benar!</p>
          ) : (
            <p className="text-red-500 font-semibold mb-2">Salah!</p>
          )}
          <button
            onClick={nextQuestion}
            className="mt-2 px-6 py-2 bg-sekunder text-white rounded-lg hover:bg-sekunder/90 transition font-semibold"
          >
            {currentIndex < questions.length - 1 ? "Next Question" : "Selanjutnya"}
          </button>
        </div>
      )}
    </div>
  );
}