// Points the frontend at the Voice Check API. Update the production URL once
// the server/ API is deployed as its own Render Web Service.
const API_BASE = ["localhost", "127.0.0.1"].includes(window.location.hostname)
  ? "http://localhost:4000"
  : "https://voice-check-api.onrender.com";
