import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import Quiz from "../../components/quiz/Quiz";
import { demoSlides, type DemoSlide } from "../../components/quiz/DemoSlides";
import { introBackgrounds } from "../../components/quiz/IntroBackgrounds";

export default function Intro() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalWrong, setTotalWrong] = useState(0);

  const currentSlide: DemoSlide = demoSlides[currentIndex];
  const currentBg = introBackgrounds[currentIndex];

  const nextSlide = () => {
    if (currentIndex < demoSlides.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const handleQuizFinish = (correct: number, wrong: number) => {
    setTotalCorrect(totalCorrect + correct);
    setTotalWrong(totalWrong + wrong);
    nextSlide();
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black-100 p-4 relative overflow-hidden">
      {currentBg && (
        <>
          <div
            className="absolute inset-0 bg-center bg-cover"
            style={{ backgroundImage: `url(${currentBg})` }}
          />
          <div className="absolute inset-0 bg-primer/60" />
        </>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.3 }}
          className="relative bg-white/80 shadow-xl rounded-figma-lg p-8 w-full max-w-3xl flex flex-col items-center z-10 backdrop-blur-md"
        >
          {!currentSlide.isQuiz ? (
            <>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center text-gray-900">
                {currentSlide.title}
              </h2>
              {currentSlide.content && (
                <div className="text-gray-700 mb-6 text-center space-y-2">
                  {currentSlide.content.split("\n").map((line, idx) =>
                    line.trim() ? <p key={idx}>{line.trim()}</p> : null
                  )}
                </div>
              )}
              {currentIndex < demoSlides.length - 1 && (
                <button
                  onClick={nextSlide}
                  className="px-6 py-3 bg-sekunder text-white font-semibold rounded-lg hover:bg-sekunder/90 transition"
                >
                  Selanjutnya
                </button>
              )}
            </>
          ) : (
            <>
              <Quiz questions={currentSlide.quizQuestions!} onFinish={handleQuizFinish} />
              <div className="mt-4 text-center text-gray-700 font-medium">
                Total Benar: {totalCorrect} | Total Salah: {totalWrong}
              </div>
            </>
          )}

          {currentIndex === demoSlides.length - 1 && (
            <div className="flex flex-col md:flex-row gap-4 mt-6 justify-center w-full">
              <Link
                to="/cerita"
                className="px-6 py-3 bg-primer text-white rounded-lg hover:bg-primer/90 text-center"
              >
                Lihat Cerita
              </Link>
              <Link
                to="/makna-kata"
                className="px-6 py-3 bg-tersier text-white rounded-lg hover:bg-tersier/90 text-center"
              >
                Lihat Makna Kata
              </Link>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}