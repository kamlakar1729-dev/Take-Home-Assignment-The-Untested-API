const request = require("supertest");
const app = require("../src/app");
const taskService = require("../src/services/taskService");

describe("Task Routes", () => {
  beforeEach(() => {
    taskService._reset();
  });

  test("POST /tasks should create a task", async () => {
    const response = await request(app)
      .post("/tasks")
      .send({
        title: "Learn Testing",
        priority: "high",
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.title).toBe("Learn Testing");
    expect(response.body.priority).toBe("high");
    expect(response.body).toHaveProperty("id");
  });

  test("POST /tasks should return 400 when title is missing", async () => {
    const response = await request(app)
      .post("/tasks")
      .send({
        priority: "high",
      });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("error");
  });

  test("POST /tasks should return 400 for invalid priority", async () => {
    const response = await request(app)
      .post("/tasks")
      .send({
        title: "Test Task",
        priority: "urgent",
      });

    expect(response.statusCode).toBe(400);
  });

  test("GET /tasks should return all tasks", async () => {
    taskService.create({
      title: "Task One",
    });

    taskService.create({
      title: "Task Two",
    });

    const response = await request(app).get("/tasks");

    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(2);
  });

  test("GET /tasks should filter by status", async () => {
    taskService.create({
      title: "Todo Task",
      status: "todo",
    });

    taskService.create({
      title: "Done Task",
      status: "done",
    });

    const response = await request(app)
      .get("/tasks?status=todo");

    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].title).toBe("Todo Task");
  });

  test("GET /tasks should support pagination", async () => {
    for (let i = 1; i <= 15; i++) {
      taskService.create({
        title: `Task ${i}`,
      });
    }

    const response = await request(app)
      .get("/tasks?page=1&limit=10");

    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(10);
    expect(response.body[0].title).toBe("Task 1");
  });

  test("PUT /tasks/:id should update a task", async () => {
    const task = taskService.create({
      title: "Old Title",
    });

    const response = await request(app)
      .put(`/tasks/${task.id}`)
      .send({
        title: "New Title",
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.title).toBe("New Title");
  });

  test("PUT /tasks/:id should return 404 for invalid task", async () => {
    const response = await request(app)
      .put("/tasks/invalid-id")
      .send({
        title: "Updated",
      });

    expect(response.statusCode).toBe(404);
  });

  test("DELETE /tasks/:id should delete a task", async () => {
    const task = taskService.create({
      title: "Delete Me",
    });

    const response = await request(app)
      .delete(`/tasks/${task.id}`);

    expect(response.statusCode).toBe(204);
  });

  test("DELETE /tasks/:id should return 404 for invalid task", async () => {
    const response = await request(app)
      .delete("/tasks/invalid-id");

    expect(response.statusCode).toBe(404);
  });

  test("PATCH /tasks/:id/complete should complete a task", async () => {
    const task = taskService.create({
      title: "Complete Me",
    });

    const response = await request(app)
      .patch(`/tasks/${task.id}/complete`);

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("done");
    expect(response.body.completedAt).not.toBeNull();
  });

  test("PATCH /tasks/:id/complete should return 404 for invalid task", async () => {
    const response = await request(app)
      .patch("/tasks/invalid-id/complete");

    expect(response.statusCode).toBe(404);
  });

  test("GET /tasks/stats should return statistics", async () => {
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

    const response = await request(app)
      .get("/tasks/stats");

    expect(response.statusCode).toBe(200);
    expect(response.body.todo).toBe(1);
    expect(response.body.in_progress).toBe(1);
    expect(response.body.done).toBe(1);
  });
});

test("PATCH /tasks/:id/assign should assign task", async () => {
  const task = taskService.create({
    title: "Assign Me",
  });

  const response = await request(app)
    .patch(`/tasks/${task.id}/assign`)
    .send({
      assignee: "Kamalakar",
    });

  expect(response.statusCode).toBe(200);
  expect(response.body.assignee).toBe("Kamalakar");
});

test("PATCH /tasks/:id/assign should return 400 for empty assignee", async () => {
  const task = taskService.create({
    title: "Assign Me",
  });

  const response = await request(app)
    .patch(`/tasks/${task.id}/assign`)
    .send({
      assignee: "",
    });

  expect(response.statusCode).toBe(400);
});

test("PATCH /tasks/:id/assign should return 404 for invalid task", async () => {
  const response = await request(app)
    .patch("/tasks/invalid-id/assign")
    .send({
      assignee: "Kamalakar",
    });

  expect(response.statusCode).toBe(404);
});