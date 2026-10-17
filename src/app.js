/**
 * Express Application Setup
 * Mengonfigurasi middleware keamanan, parsing, routing, dan penanganan error.
 */

const express = require("express");
const taskRoutes = require("./routes/taskRoutes");

const app = express();

// Keamanan: Sembunyikan informasi framework dari header HTTP
app.disable("x-powered-by");

// Keamanan: Security headers dasar
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );
  next();
});

// Keamanan: Batasi ukuran payload untuk mencegah Denial of Service (DoS)
app.use(express.json({ limit: "10kb" }));

// Root endpoint: API metadata
app.get("/", (req, res) => {
  res.status(200).json({
    name: "Secure Task Management API",
    version: "1.0.0",
    status: "healthy",
    description: "DevSecOps Task Management REST API with SonarCloud SAST Integration",
    endpoints: {
      health: "/health",
      tasks: "/api/tasks",
    },
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "UP",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Mount resource routes
app.use("/api/tasks", taskRoutes);

// 404 Handler untuk route yang tidak ditemukan
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Endpoint '${req.originalUrl}' not found.`,
  });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  // Hindari membocorkan stack trace internal ke klien publik
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || "Internal Server Error",
  });
});

module.exports = app;
