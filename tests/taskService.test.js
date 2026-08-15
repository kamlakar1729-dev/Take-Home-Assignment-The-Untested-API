const taskService = require("../src/services/taskService");

describe("Task Service", () => {
  beforeEach(() => {
    taskService._reset();
  });

  test("should create a new task", () => {
    const task = taskService.create({
      title: "Learn Jest",
      priority: "high",
    });

    expect(task).toHaveProperty("id");
    expect(task.title).toBe("Learn Jest");
    expect(task.priority).toBe("high");
    expect(task.status).toBe("todo");
    expect(task.completedAt).toBeNull();
  });

  test("should find task by id", () => {
    const task = taskService.create({
      title: "Find Me",
    });

    const foundTask = taskService.findById(task.id);

    expect(foundTask).toEqual(task);
  });

  test("should return undefined for invalid id", () => {
    const task = taskService.findById("invalid-id");

    expect(task).toBeUndefined();
  });

  test("should update an existing task", () => {
    const task = taskService.create({
      title: "Old Title",
    });

    const updated = taskService.update(task.id, {
      title: "New Title",
      priority: "high",
    });

    expect(updated.title).toBe("New Title");
    expect(updated.priority).toBe("high");
  });

  test("should return null when updating non-existing task", () => {
    const updated = taskService.update("invalid-id", {
      title: "Updated",
    });

    expect(updated).toBeNull();
  });

  test("should delete an existing task", () => {
    const task = taskService.create({
      title: "Delete Me",
    });

    const deleted = taskService.remove(task.id);

    expect(deleted).toBe(true);
  });

  test("should return false when deleting non-existing task", () => {
    const deleted = taskService.remove("invalid-id");

    expect(deleted).toBe(false);
  });

  test("should mark task as completed", () => {
    const task = taskService.create({
      title: "Complete Me",
      priority: "high",
    });

    const completed = taskService.completeTask(task.id);

    expect(completed.status).toBe("done");
    expect(completed.completedAt).not.toBeNull();
  });

  test("should return null when completing non-existing task", () => {
    const completed = taskService.completeTask("invalid-id");

    expect(completed).toBeNull();
  });

  test("should return tasks filtered by status", () => {
    taskService.create({
      title: "Task 1",
      status: "todo",
    });

    taskService.create({
      title: "Task 2",
      status: "done",
    });

    const tasks = taskService.getByStatus("todo");

    expect(tasks.length).toBe(1);
    expect(tasks[0].title).toBe("Task 1");
  });

  test("should return correct task statistics", () => {
    taskService.create({
      title: "Todo Task",
      status: "todo",
    });

    taskService.create({
      title: "In Progress Task",
      status: "in_progress",
    });

    taskService.create({
      title: "Done Task",
      status: "done",
    });

    const stats = taskService.getStats();

    expect(stats.todo).toBe(1);
    expect(stats.in_progress).toBe(1);
    expect(stats.done).toBe(1);
  });

  test("should return paginated tasks", () => {
    for (let i = 1; i <= 15; i++) {
      taskService.create({
        title: `Task ${i}`,
      });
    }

    const page1 = taskService.getPaginated(1, 10);

    expect(page1.length).toBe(10);
    expect(page1[0].title).toBe("Task 1");
  });
});