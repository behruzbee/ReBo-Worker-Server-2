import { Router, Request, Response } from 'express'
import { v4 as uuidV4 } from 'uuid'
import TasksService from '../service/task-service.js'
import WorkerService from '../service/workers-service.js'
import { taskSchema } from '../model/taskSchema.js'
import { ITask } from '../types/task-types.js'
import checkToken from '../helpers/checkToken.js'
import checkPermission, { permissionIndex } from '../helpers/checkPermission.js'

const router = Router()
const workerService = new WorkerService('./workers.json')
const tasksService = new TasksService('./tasks.json', workerService)

router.post(
  '/tasks',
  // @ts-ignore
  checkToken,
  checkPermission([
    permissionIndex.admin,
    permissionIndex.director,
    permissionIndex.manager
  ]),
  (req: Request, res: Response) => {
    const task = req.body

    const newTask: ITask = {
      id: uuidV4(),
      status: 'pending',
      created_at: new Date().toISOString(),
      description: task.description,
      store_name: task.store
    }

    const result = taskSchema.safeParse(newTask)
    if (!result.success) {
      res.status(403).json({ errors: result.error.errors })
    }

    tasksService.createTask(newTask)
    res.status(201).json(newTask)
  }
)

router.get(
  '/tasks',
  // @ts-ignore
  checkToken,
  checkPermission([
    permissionIndex.admin,
    permissionIndex.director,
    permissionIndex.manager,
    permissionIndex.user
  ]),
  (req: Request, res: Response) => {
    const tasks = tasksService.getAllTasks()
    res.json(tasks)
  }
)

router.get(
  '/tasks/:store_name',
  // @ts-ignore
  checkToken,
  checkPermission([
    permissionIndex.admin,
    permissionIndex.director,
    permissionIndex.manager,
    permissionIndex.user
  ]),
  (req: Request, res: Response) => {
    const storeName = req.params.store_name
    const tasks = tasksService.getTasksByStoreName(storeName)

    if (tasks.length > 0) {
      res.json(tasks)
    } else {
      res.status(404).json({ error: `No tasks found for store ${storeName}` })
    }
  }
)
// @ts-ignore
router.patch(
  '/tasks/:taskId',
  // @ts-ignore
  checkToken,
  checkPermission([
    permissionIndex.admin,
    permissionIndex.director,
    permissionIndex.manager,
    permissionIndex.user
  ]),
  (req: Request, res: Response) => {
    const taskId = req.params.taskId
    const task = req.body

    const result = taskSchema.safeParse(task)

    if (!result.success) {
      return res.status(403).json({ errors: result.error.errors })
    }

    const updatedTask = tasksService.updateTask(taskId, task)

    if (updatedTask) {
      res.json(updatedTask)
    } else {
      res.status(404).json({ error: `Task with ID ${taskId} not found` })
    }
  }
)

router.delete(
  '/tasks/:taskId',
  // @ts-ignore
  checkToken,
  checkPermission([
    permissionIndex.admin,
    permissionIndex.director,
    permissionIndex.manager
  ]),
  (req: Request, res: Response) => {
    const taskId = req.params.taskId

    const success = tasksService.deleteTask(taskId)

    if (success) {
      res.json({ message: `Task with ID ${taskId} deleted` })
    } else {
      res.status(404).json({ error: `Task with ID ${taskId} not found` })
    }
  }
)
router.post(
  '/complete/:taskId',
  // @ts-ignore
  checkToken,
  checkPermission([
    permissionIndex.admin,
    permissionIndex.director,
    permissionIndex.user
  ]),
  // @ts-ignore
  (req: Request, res: Response) => {
    const { workerId } = req.body
    const { taskId } = req.params

    if (!workerId) {
      return res.status(400).json({ error: 'workerId is required' })
    }

    const success = tasksService.completeTask(workerId, taskId)

    if (success) {
      res.json({ message: 'Task marked as completed' })
    } else {
      res.status(404).json({ error: 'Task or worker not found' })
    }
  }
)

export default router
