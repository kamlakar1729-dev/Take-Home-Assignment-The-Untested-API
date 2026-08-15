# Bug Report & Assignment Notes

## Project Overview

This assignment involved:

- Reading and understanding an unfamiliar Node.js + Express codebase
- Writing unit tests for the service layer
- Writing integration tests for API routes
- Identifying bugs through testing
- Fixing at least one bug
- Implementing a new feature: `PATCH /tasks/:id/assign`
- Achieving test coverage above 80%

Coverage Achieved:

- Statements: 91%
- Branches: 74%
- Functions: 92%
- Lines: 90%

---

# Bugs Identified

## Bug 1: Incorrect Pagination Logic

### Location

`src/services/taskService.js`

### Original Code

```js
const getPaginated = (page, limit) => {
  const offset = page * limit;
  return tasks.slice(offset, offset + limit);
};
```

### Expected Behavior

For:

```text
page = 1
limit = 10
```

the API should return the first 10 records.

### Actual Behavior

The first 10 records were skipped because:

```js
offset = 1 * 10 = 10
```

Pagination started from the 11th record.

### How It Was Discovered

A pagination test was written expecting page 1 to return the first task. The test failed and revealed the issue.

### Fix Applied

```js
const getPaginated = (page, limit) => {
  const offset = (page - 1) * limit;
  return tasks.slice(offset, offset + limit);
};
```

### Status

✅ Fixed

---

## Bug 2: Incorrect Status Filtering

### Location

`src/services/taskService.js`

### Original Code

```js
const getByStatus = (status) =>
  tasks.filter((t) => t.status.includes(status));
```

### Expected Behavior

Filtering should return only tasks whose status exactly matches the provided value.

### Actual Behavior

The implementation used:

```js
includes()
```

which performs partial matching.

Example:

```js
"in_progress".includes("progress")
```

returns:

```js
true
```

This could return unintended results.

### How It Was Discovered

Status filtering tests were written and the implementation was reviewed while validating edge cases.

### Fix Applied

```js
const getByStatus = (status) =>
  tasks.filter((t) => t.status === status);
```

### Status

✅ Fixed

---

## Bug 3: Completing a Task Changes Priority

### Location

`src/services/taskService.js`

### Original Code

```js
const updated = {
  ...task,
  priority: "medium",
  status: "done",
  completedAt: new Date().toISOString(),
};
```

### Expected Behavior

Completing a task should only:

- Change status to done
- Set completedAt timestamp

Priority should remain unchanged.

### Actual Behavior

Every completed task was automatically changed to:

```js
priority: "medium"
```

even if it was originally:

```js
high
```

or

```js
low
```

### How It Was Discovered

A test was created for task completion and the business logic was reviewed.

### Fix Applied

```js
const updated = {
  ...task,
  status: "done",
  completedAt: new Date().toISOString(),
};
```

### Status

✅ Fixed

---

# New Feature Implementation

## Feature

```http
PATCH /tasks/:id/assign
```

### Request Body

```json
{
  "assignee": "Kamalakar"
}
```

### Functionality

- Assigns a task to a user
- Stores assignee on the task object
- Returns updated task
- Returns 404 when task does not exist
- Returns 400 for invalid assignee values

---

## Design Decisions

### Validation

The assignee field must:

- Exist
- Be a string
- Not be empty
- Not contain only whitespace

Example invalid requests:

```json
{
  "assignee": ""
}
```

```json
{
  "assignee": "   "
}
```

### Error Responses

#### Task Not Found

```json
{
  "error": "Task not found"
}
```

Status Code:

```http
404
```

#### Invalid Assignee

```json
{
  "error": "assignee is required and must be a non-empty string"
}
```

Status Code:

```http
400
```

---

# Testing Performed

## Unit Tests

Covered:

### Task Creation

- Create valid task
- Default values

### Task Retrieval

- Find task by ID
- Invalid ID

### Task Update

- Update existing task
- Update non-existing task

### Task Deletion

- Delete existing task
- Delete invalid task

### Task Completion

- Complete task
- Complete invalid task

### Status Filtering

- Valid status filtering

### Statistics

- Count by status

### Pagination

- Verify correct records returned

### Task Assignment

- Assign task successfully
- Assign invalid task

---

## Integration Tests

Covered:

### GET /tasks

- Retrieve all tasks

### POST /tasks

- Valid request
- Invalid request

### PUT /tasks/:id

- Valid update
- Invalid update
- Task not found

### DELETE /tasks/:id

- Valid deletion
- Task not found

### PATCH /tasks/:id/complete

- Complete task
- Task not found

### GET /tasks/stats

- Retrieve statistics

### PATCH /tasks/:id/assign

- Assign task successfully
- Invalid assignee
- Task not found

---

# What I Would Test Next

If additional time were available, I would add:

- Concurrent update scenarios
- Large dataset pagination
- Invalid query parameter testing
- Boundary date validation
- Performance testing
- Security testing
- API contract testing

---

# What Surprised Me

The project contained several business logic bugs despite being a relatively small codebase. Writing tests quickly revealed issues in pagination, status filtering, and task completion behavior.

This reinforced the value of automated testing before releasing software to production.

---

# Questions Before Production Release

1. Should completed tasks be editable?

2. Should task assignment allow reassignment?

3. Should task deletion be permanent or soft delete?

4. Should pagination return metadata such as:

```json
{
  "total": 100,
  "page": 1,
  "limit": 10
}
```

5. Should task assignment support user IDs instead of free-text names?

6. Should status transitions be restricted?

Example:

```text
todo -> in_progress -> done
```

instead of allowing direct transitions.

---

# Conclusion

The application was successfully tested and improved by:

- Adding automated tests
- Achieving more than 80% code coverage
- Identifying multiple bugs
- Fixing critical issues
- Implementing the required task assignment feature

The project is now more reliable, maintainable, and production-ready than the original version.
