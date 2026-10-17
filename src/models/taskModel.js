/**
 * Data Model & Storage for Tasks
 * Mengelola penyimpanan in-memory dan operasi data tugas.
 */

let tasks = [
  {
    id: 1,
    title: "Setup CI/CD Pipeline",
    description: "Mengonfigurasi GitHub Actions dan integrasi SAST SonarCloud",
    status: "in-progress",
    priority: "high",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: "SAST Security Analysis",
    description: "Melakukan static code analysis untuk mendeteksi vulnerability",
    status: "pending",
    priority: "high",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let nextId = 3;

class TaskModel {
  static getAll(query = {}) {
    let result = [...tasks];
    if (query.status) {
      result = result.filter(
        (task) => task.status.toLowerCase() === query.status.toLowerCase()
      );
    }
    if (query.priority) {
      result = result.filter(
        (task) => task.priority.toLowerCase() === query.priority.toLowerCase()
      );
    }
    return result;
  }

  static getById(id) {
    const numericId = Number(id);
    return tasks.find((task) => task.id === numericId) || null;
  }

  static create(data) {
    const now = new Date().toISOString();
    const newTask = {
      id: nextId++,
      title: data.title.trim(),
      description: data.description ? data.description.trim() : "",
      status: data.status || "pending",
      priority: data.priority || "medium",
      createdAt: now,
      updatedAt: now,
    };
    tasks.push(newTask);
    return newTask;
  }

  static update(id, data) {
    const numericId = Number(id);
    const index = tasks.findIndex((task) => task.id === numericId);
    if (index === -1) {
      return null;
    }

    const updatedTask = {
      ...tasks[index],
      ...data,
      id: numericId, // id tidak boleh diubah
      updatedAt: new Date().toISOString(),
    };

    tasks[index] = updatedTask;
    return updatedTask;
  }

  static delete(id) {
    const numericId = Number(id);
    const index = tasks.findIndex((task) => task.id === numericId);
    if (index === -1) {
      return false;
    }
    tasks.splice(index, 1);
    return true;
  }

  static reset() {
    tasks = [];
    nextId = 1;
  }
}

module.exports = TaskModel;

