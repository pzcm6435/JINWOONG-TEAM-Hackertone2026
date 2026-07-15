// Points the frontend at the Voice Check API (deployed as its own Render Web Service).
const API_BASE = ["localhost", "127.0.0.1"].includes(window.location.hostname)
  ? "http://localhost:4000"
  : "https://voice-check-api0.onrender.com";
