/**
 * Task Routes
 * Mendefinisikan endpoint REST API untuk resource Tasks.
 */

const express = require("express");
const router = express.Router();
const TaskController = require("../controllers/taskController");
const {
  validateTaskCreate,
  validateTaskUpdate,
  validateIdParam,
} = require("../middleware/validator");

router.get("/", TaskController.getAllTasks);
router.get("/:id", validateIdParam, TaskController.getTaskById);
router.post("/", validateTaskCreate, TaskController.createTask);
router.put("/:id", validateIdParam, validateTaskUpdate, TaskController.updateTask);
router.delete("/:id", validateIdParam, TaskController.deleteTask);

module.exports = router;
