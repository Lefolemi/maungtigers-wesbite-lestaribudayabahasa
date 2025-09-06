// src/main.tsx
import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "@fontsource/inter/800.css";
import "react-easy-crop/react-easy-crop.css";
import WordPopup from "./components/makna-kata/WordPopup.tsx";

// mount App as usual
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

/*
// ✅ TEST ONLY: mount WordPopup into #modal-root
const modalRoot = document.getElementById("modal-root");
if (modalRoot) {
  function ModalTester() {
    const [open, setOpen] = useState(true);

    return (
      <WordPopup
        open={open}
        setOpen={setOpen}
        onSelect={(word) => {
          console.log("Selected word:", word);
          setOpen(false);
        }}
      />
    );
  }

  createRoot(modalRoot).render(
    <StrictMode>
      <ModalTester />
    </StrictMode>
  );
}
*/