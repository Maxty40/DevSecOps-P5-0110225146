const request = require("supertest");
const app = require("../src/app");
const TaskModel = require("../src/models/taskModel");

describe("API Security & Functionality Tests", () => {
  beforeEach(() => {
    // Reset data sebelum setiap test untuk menjaga isolasi test
    TaskModel.reset();
    TaskModel.create({
      title: "Initial Task",
      description: "Sample description",
      status: "pending",
      priority: "medium",
    });
  });

  describe("Base & Health Endpoints", () => {
    it("should return API metadata on GET /", async () => {
      const res = await request(app).get("/");
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("name", "Secure Task Management API");
      expect(res.body).toHaveProperty("status", "healthy");
    });

    it("should return health status on GET /health", async () => {
      const res = await request(app).get("/health");
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("status", "UP");
      expect(res.body).toHaveProperty("uptime");
    });

    it("should return security headers on responses", async () => {
      const res = await request(app).get("/");
      expect(res.headers["x-content-type-options"]).toBe("nosniff");
      expect(res.headers["x-frame-options"]).toBe("DENY");
      expect(res.headers["x-xss-protection"]).toBe("1; mode=block");
    });

    it("should return 404 for unknown endpoints", async () => {
      const res = await request(app).get("/api/unknown-endpoint");
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /api/tasks", () => {
    it("should return a list of all tasks", async () => {
      const res = await request(app).get("/api/tasks");
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(1);
    });

    it("should filter tasks by status query parameter", async () => {
      const res = await request(app).get("/api/tasks?status=pending");
      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(1);

      const emptyRes = await request(app).get("/api/tasks?status=completed");
      expect(emptyRes.statusCode).toBe(200);
      expect(emptyRes.body.data.length).toBe(0);
    });

    it("should filter tasks by priority query parameter", async () => {
      const res = await request(app).get("/api/tasks?priority=medium");
      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(1);
    });
  });

  describe("GET /api/tasks/:id", () => {
    it("should return a single task when ID exists", async () => {
      const res = await request(app).get("/api/tasks/1");
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(1);
    });

    it("should return 404 when task ID is not found", async () => {
      const res = await request(app).get("/api/tasks/999");
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 when task ID is invalid format", async () => {
      const res = await request(app).get("/api/tasks/invalid-id");
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("POST /api/tasks", () => {
    it("should create a new task successfully with valid input", async () => {
      const payload = {
        title: "Write DevSecOps Pipeline",
        description: "Integrate SonarCloud SAST in GitHub Actions",
        status: "in-progress",
        priority: "high",
      };

      const res = await request(app).post("/api/tasks").send(payload);
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe(payload.title);
      expect(res.body.data.status).toBe("in-progress");
      expect(res.body.data).toHaveProperty("id");
    });

    it("should reject creation if title is missing", async () => {
      const res = await request(app).post("/api/tasks").send({
        description: "Missing title",
      });
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain("Validation Error: 'title' is required");
    });

    it("should reject creation if title exceeds 100 characters", async () => {
      const longTitle = "A".repeat(101);
      const res = await request(app).post("/api/tasks").send({
        title: longTitle,
      });
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain("cannot exceed 100 characters");
    });

    it("should reject creation if status is invalid", async () => {
      const res = await request(app).post("/api/tasks").send({
        title: "Valid title",
        status: "invalid-status",
      });
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain("Validation Error: 'status' must be one of");
    });

    it("should reject creation if priority is invalid", async () => {
      const res = await request(app).post("/api/tasks").send({
        title: "Valid title",
        priority: "critical-not-allowed",
      });
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain("Validation Error: 'priority' must be one of");
    });
  });

  describe("PUT /api/tasks/:id", () => {
    it("should update a task successfully", async () => {
      const res = await request(app).put("/api/tasks/1").send({
        title: "Updated Task Title",
        status: "completed",
      });
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe("Updated Task Title");
      expect(res.body.data.status).toBe("completed");
    });

    it("should return 404 when updating non-existent task", async () => {
      const res = await request(app).put("/api/tasks/999").send({
        title: "Non-existent task",
      });
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 when updating with invalid title", async () => {
      const res = await request(app).put("/api/tasks/1").send({
        title: "",
      });
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("DELETE /api/tasks/:id", () => {
    it("should delete an existing task", async () => {
      const res = await request(app).delete("/api/tasks/1");
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      const checkRes = await request(app).get("/api/tasks/1");
      expect(checkRes.statusCode).toBe(404);
    });

    it("should return 404 when deleting a non-existent task", async () => {
      const res = await request(app).delete("/api/tasks/999");
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});

