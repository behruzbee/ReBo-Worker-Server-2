import { Router, Request, Response } from 'express';
import TasksService from '../service/task-service.js';
import WorkerService from '../service/workers-service.js';

const router = Router();
const workerService = new WorkerService('./workers.json')
const tasksService = new TasksService('./tasks-market.json', workerService);

// Utility function to check for missing required fields
const checkRequiredFields = (req: Request, res: Response, fields: string[]) => {
  for (const field of fields) {
    if (!req.body[field]) {
      return res.status(400).json({ error: `${field} is required.` });
    }
  }
  return null;
};

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     description: Create a new task
 *     parameters:
 *       - name: description
 *         in: body
 *         description: The description of the task
 *         required: true
 *         type: string
 *       - name: store_name
 *         in: body
 *         description: The name of the store where the task needs to be performed
 *         required: true
 *         type: string
 *     responses:
 *       201:
 *         description: Task created successfully
 *       400:
 *         description: Missing required fields
 */
//@ts-ignore

router.post('/tasks', (req: Request, res: Response) => {
  const { description, store_name } = req.body;

  const validationError = checkRequiredFields(req, res, ['description', 'store_name']);
  if (validationError) return validationError;

  const newTask = tasksService.createTask(description, store_name);
  res.status(201).json(newTask);
});

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     description: Get all tasks
 *     responses:
 *       200:
 *         description: List of tasks
 *       500:
 *         description: Server error
 */
router.get('/tasks', (req: Request, res: Response) => {
  const tasks = tasksService.getAllTasks();
  res.json(tasks);
});

/**
 * @swagger
 * /api/tasks/task/{store_name}:
 *   get:
 *     description: Get tasks by store name
 *     parameters:
 *       - name: store_name
 *         in: path
 *         description: Name of the store to filter tasks
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: List of tasks for the specified store
 *       404:
 *         description: No tasks found for the store
 */
router.get('/tasks/task/:store_name', (req: Request, res: Response) => {
  const storeName = req.params.store_name;
  const tasks = tasksService.getTasksByStoreName(storeName);

  if (tasks.length > 0) {
    res.json(tasks);
  } else {
    res.status(404).json({ error: `No tasks found for store ${storeName}` });
  }
});

/**
 * @swagger
 * /api/task/{taskId}:
 *   get:
 *     description: Get a task by ID
 *     parameters:
 *       - name: taskId
 *         in: path
 *         description: Task ID to retrieve the task
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Task details
 *       404:
 *         description: Task not found
 */
router.get('/task/:taskId', (req: Request, res: Response) => {
  const taskId = req.params.taskId;
  const task = tasksService.getTaskById(taskId);

  if (task) {
    res.json(task);
  } else {
    res.status(404).json({ error: `Task with ID ${taskId} not found` });
  }
});

/**
 * @swagger
 * /api/task/{taskId}:
 *   patch:
 *     description: Update a task
 *     parameters:
 *       - name: taskId
 *         in: path
 *         description: Task ID to update
 *         required: true
 *         type: string
 *       - name: description
 *         in: body
 *         description: Updated task description
 *         type: string
 *       - name: store_name
 *         in: body
 *         description: Updated store name
 *         type: string
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       400:
 *         description: Missing required fields
 *       404:
 *         description: Task not found
 */
router.patch('/task/:taskId', (req: Request, res: Response) => {
  const taskId = req.params.taskId;
  const { description, store_name } = req.body;

  const updatedTask = tasksService.updateTask(taskId, description, store_name);

  if (updatedTask) {
    res.json(updatedTask);
  } else {
    res.status(404).json({ error: `Task with ID ${taskId} not found` });
  }
});

/**
 * @swagger
 * /api/task/{taskId}:
 *   delete:
 *     description: Delete a task by ID
 *     parameters:
 *       - name: taskId
 *         in: path
 *         description: Task ID to delete
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       404:
 *         description: Task not found
 */
router.delete('/task/:taskId', (req: Request, res: Response) => {
  const taskId = req.params.taskId;

  const success = tasksService.deleteTask(taskId);

  if (success) {
    res.json({ message: `Task with ID ${taskId} deleted` });
  } else {
    res.status(404).json({ error: `Task with ID ${taskId} not found` });
  }
});

/**
 * @swagger
 * /api/complete/{taskId}:
 *   post:
 *     summary: Mark a task as completed by a worker
 *     description: Marks a specific task as completed by a specified worker.
 *     parameters:
 *       - name: taskId
 *         in: path
 *         description: Unique identifier of the task to be marked as completed
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       description: JSON object containing the workerId
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               workerId:
 *                 type: string
 *                 description: ID of the worker completing the task
 *     responses:
 *       200:
 *         description: Task successfully marked as completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Task marked as completed
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: workerId is required
 *       404:
 *         description: Task or worker not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Task or worker not found
 */
//@ts-ignore
router.post('/complete/:taskId', (req: Request, res: Response) => {
    const { workerId } = req.body;
    const { taskId } = req.params;
  
    if (!workerId) {
      return res.status(400).json({ error: 'workerId is required' });
    }
  
    const success = tasksService.completeTask(workerId, taskId);
  
    if (success) {
      res.json({ message: 'Task marked as completed' });
    } else {
      res.status(404).json({ error: 'Task or worker not found' });
    }
  });

export default router;
