/**
 * Task Controller
 * Menangani business logic dan response HTTP untuk resource Task.
 */

const TaskModel = require("../models/taskModel");

class TaskController {
  static getAllTasks(req, res) {
    try {
      const { status, priority } = req.query;
      const tasks = TaskModel.getAll({ status, priority });
      return res.status(200).json({
        success: true,
        count: tasks.length,
        data: tasks,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: "Internal Server Error while retrieving tasks.",
      });
    }
  }

  static getTaskById(req, res) {
    try {
      const task = TaskModel.getById(req.params.id);
      if (!task) {
        return res.status(404).json({
          success: false,
          error: `Task with ID ${req.params.id} not found.`,
        });
      }
      return res.status(200).json({
        success: true,
        data: task,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: "Internal Server Error while retrieving task.",
      });
    }
  }

  static createTask(req, res) {
    try {
      const { title, description, status, priority } = req.body;
      const newTask = TaskModel.create({ title, description, status, priority });
      return res.status(201).json({
        success: true,
        message: "Task created successfully.",
        data: newTask,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: "Internal Server Error while creating task.",
      });
    }
  }

  static updateTask(req, res) {
    try {
      const updatedTask = TaskModel.update(req.params.id, req.body);
      if (!updatedTask) {
        return res.status(404).json({
          success: false,
          error: `Task with ID ${req.params.id} not found.`,
        });
      }
      return res.status(200).json({
        success: true,
        message: "Task updated successfully.",
        data: updatedTask,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: "Internal Server Error while updating task.",
      });
    }
  }

  static deleteTask(req, res) {
    try {
      const deleted = TaskModel.delete(req.params.id);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: `Task with ID ${req.params.id} not found.`,
        });
      }
      return res.status(200).json({
        success: true,
        message: `Task with ID ${req.params.id} deleted successfully.`,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: "Internal Server Error while deleting task.",
      });
    }
  }
}

module.exports = TaskController;

