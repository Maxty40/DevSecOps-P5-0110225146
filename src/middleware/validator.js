/**
 * Input Validation & Sanitization Middleware
 * Memastikan payload request aman, bertipe benar, dan mencegah malformed inputs.
 */

const ALLOWED_STATUSES = ["pending", "in-progress", "completed"];
const ALLOWED_PRIORITIES = ["low", "medium", "high"];

// Membersihkan karakter berbahaya sederhana (basic sanitization)
function sanitizeString(input) {
  if (typeof input !== "string") return "";
  return input.replace(/[<>]/g, "");
}

function validateTaskCreate(req, res, next) {
  const { title, description, status, priority } = req.body;

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: "Validation Error: 'title' is required and must be a non-empty string.",
    });
  }

  if (title.trim().length > 100) {
    return res.status(400).json({
      success: false,
      error: "Validation Error: 'title' cannot exceed 100 characters.",
    });
  }

  if (status && !ALLOWED_STATUSES.includes(status.toLowerCase())) {
    return res.status(400).json({
      success: false,
      error: `Validation Error: 'status' must be one of: ${ALLOWED_STATUSES.join(", ")}.`,
    });
  }

  if (priority && !ALLOWED_PRIORITIES.includes(priority.toLowerCase())) {
    return res.status(400).json({
      success: false,
      error: `Validation Error: 'priority' must be one of: ${ALLOWED_PRIORITIES.join(", ")}.`,
    });
  }

  // Sanitasi input teks
  req.body.title = sanitizeString(title);
  if (description) {
    req.body.description = sanitizeString(description);
  }

  next();
}

function validateTaskUpdate(req, res, next) {
  const { title, description, status, priority } = req.body;

  if (title !== undefined) {
    if (typeof title !== "string" || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Validation Error: 'title' must be a non-empty string.",
      });
    }
    if (title.trim().length > 100) {
      return res.status(400).json({
        success: false,
        error: "Validation Error: 'title' cannot exceed 100 characters.",
      });
    }
    req.body.title = sanitizeString(title);
  }

  if (status !== undefined && !ALLOWED_STATUSES.includes(status.toLowerCase())) {
    return res.status(400).json({
      success: false,
      error: `Validation Error: 'status' must be one of: ${ALLOWED_STATUSES.join(", ")}.`,
    });
  }

  if (priority !== undefined && !ALLOWED_PRIORITIES.includes(priority.toLowerCase())) {
    return res.status(400).json({
      success: false,
      error: `Validation Error: 'priority' must be one of: ${ALLOWED_PRIORITIES.join(", ")}.`,
    });
  }

  if (description !== undefined && typeof description === "string") {
    req.body.description = sanitizeString(description);
  }

  next();
}

function validateIdParam(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      error: "Validation Error: Task ID must be a positive integer.",
    });
  }
  next();
}

module.exports = {
  validateTaskCreate,
  validateTaskUpdate,
  validateIdParam,
};
