// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "@fontsource/inter/800.css";
import "react-easy-crop/react-easy-crop.css";

// mount App as usual
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);