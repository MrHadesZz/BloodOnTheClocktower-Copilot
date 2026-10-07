import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener(
    "load",
    () => {
      void navigator.serviceWorker.register("/sw.js").catch(() => {
        // Online operation remains available if this browser blocks offline storage.
      });
    },
    { once: true },
  );
}
