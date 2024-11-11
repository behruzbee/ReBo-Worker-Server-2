import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import WorkerService from './workers-service.js' // Adjust the path to your WorkerService

export interface ITask {
  id: string // Unique task identifier
  store_name: string // Store or location of the task
  description: string // Task description
  completed_by?: string // Worker who completed the task (if completed)
  completed_at?: string // Completion timestamp
  created_at: string // Task creation timestamp
  status: 'pending' | 'completed' // Task status (pending or completed)
}

class TasksService {
  private dbFilePath: string
  private workerService: WorkerService

  constructor(dbFilePath: string, workerService: WorkerService) {
    this.dbFilePath = dbFilePath
    this.workerService = workerService
  }

  // Create a new task
  createTask(description: string, storeName: string): ITask {
    const tasks = this.readData()
    const newTask: ITask = {
      id: uuidv4(),
      description,
      store_name: storeName,
      created_at: new Date().toISOString(),
      status: 'pending'
    }
    tasks.push(newTask)
    this.writeData(tasks)
    return newTask
  }

  // Get all tasks
  getAllTasks(): ITask[] {
    return this.readData()
  }

  // Get tasks by store name
  getTasksByStoreName(storeName: string): ITask[] {
    const tasks = this.readData()
    return tasks.filter((task) => task.store_name === storeName)
  }

  // Get a specific task by ID
  getTaskById(taskId: string): ITask | undefined {
    const tasks = this.readData()
    return tasks.find((task) => task.id === taskId)
  }

  // Update task description and/or store name
  updateTask(
    taskId: string,
    description?: string,
    storeName?: string
  ): ITask | null {
    const tasks = this.readData()
    const taskIndex = tasks.findIndex((task) => task.id === taskId)

    if (taskIndex === -1) return null

    if (description) tasks[taskIndex].description = description
    if (storeName) tasks[taskIndex].store_name = storeName

    this.writeData(tasks)
    return tasks[taskIndex]
  }

  // Delete a task by ID
  deleteTask(taskId: string): boolean {
    const tasks = this.readData()
    const updatedTasks = tasks.filter((task) => task.id !== taskId)

    if (updatedTasks.length === tasks.length) return false // Task not found

    this.writeData(updatedTasks)
    return true
  }

  // Mark a task as completed
  completeTask(workerId: string, taskId: string): boolean {
    const tasks = this.readData()
    const task = tasks.find((task) => task.id === taskId)

    if (!task) {
      return false // Task not found
    }

    const worker = this.workerService.getWorkerById(workerId)
    if (!worker) {
      return false // Worker not found
    }

    task.completed_by = `${worker.name} ${worker.firstName}`
    task.completed_at = new Date().toISOString()
    task.status = 'completed'

    this.writeData(tasks)
    return true
  }

  // Read tasks from the file
  private readData(): ITask[] {
    if (!fs.existsSync(this.dbFilePath)) {
      return []
    }
    const rawData = fs.readFileSync(this.dbFilePath, 'utf-8')
    return JSON.parse(rawData).tasks || []
  }

  // Write tasks to the file
  private writeData(tasks: ITask[]): void {
    const data = { tasks }
    fs.writeFileSync(this.dbFilePath, JSON.stringify(data, null, 2))
  }
}

export default TasksService
