/**
 * Server Entry Point
 * Menjalankan server HTTP Express pada port yang ditentukan dan menangani graceful shutdown.
 */

const app = require("./app");

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`[INFO] Server running on http://localhost:${PORT}`);
  console.log(`[INFO] Environment: ${process.env.NODE_ENV || "development"}`);
});

// Graceful shutdown handling
const handleShutdown = (signal) => {
  console.log(`[INFO] Received ${signal}. Gracefully shutting down...`);
  server.close(() => {
    console.log("[INFO] HTTP server closed.");
    process.exit(0);
  });
};

process.on("SIGTERM", () => handleShutdown("SIGTERM"));
process.on("SIGINT", () => handleShutdown("SIGINT"));

module.exports = server;
