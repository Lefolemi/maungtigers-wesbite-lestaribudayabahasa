import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Quiz from "../../components/quiz/Quiz";

interface DemoSlide {
  title: string;
  content?: string;
  image?: string;
  isQuiz?: boolean;
}

const slides: DemoSlide[] = [
  {
    title: "What is Bahasa Indah Nusantara?",
    content:
      "A platform to explore and preserve the richness of Indonesian words, stories, and meanings.",
  },
  {
    title: "Why it matters",
    content:
      "We aim to celebrate the beauty of language and connect people with cultural heritage.",
  },
  {
    title: "How you can participate",
    content:
      "Read, explore, and contribute your own stories or meanings if you sign up.",
  },
  {
    title: "Demo Quiz",
    isQuiz: true,
  },
];

export default function DemoPage() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    if (currentIndex < slides.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const prevSlide = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const currentSlide = slides[currentIndex];

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="bg-white shadow-md rounded-lg p-6"
        >
          {!currentSlide.isQuiz ? (
            <>
              <h2 className="text-xl font-bold mb-2">{currentSlide.title}</h2>
              {currentSlide.content && (
                <p className="text-gray-700 mb-4">{currentSlide.content}</p>
              )}
              {currentSlide.image && (
                <img
                  src={currentSlide.image}
                  alt={currentSlide.title}
                  className="mb-4 rounded"
                />
              )}
              <div className="flex justify-between">
                <button
                  onClick={prevSlide}
                  disabled={currentIndex === 0}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
                >
                  Prev
                </button>
                {currentIndex < slides.length - 1 ? (
                  <button
                    onClick={nextSlide}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={() => alert("Demo finished!")}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Finish
                  </button>
                )}
              </div>
            </>
          ) : (
            <Quiz />
          )}

          {!currentSlide.isQuiz && (
            <div className="flex justify-center mt-4 gap-2">
              {slides.map((_, idx) => (
                <span
                  key={idx}
                  className={`w-2 h-2 rounded-full ${
                    idx === currentIndex ? "bg-blue-500" : "bg-gray-300"
                  }`}
                ></span>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}