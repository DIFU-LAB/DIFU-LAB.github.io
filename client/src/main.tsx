import "./i18n";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
createRoot(document.getElementById("root")!).render(<App />);

// Optional performance enhancement; the first visit and unsupported browsers
// continue to use normal HTTP caching. Never block rendering on registration.
if (import.meta.env.PROD && 'serviceWorker' in navigator && window.isSecureContext) {
  const register = () => { void navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {}); };
  if (document.readyState === 'complete') register();
  else window.addEventListener('load', register, { once: true });
}
