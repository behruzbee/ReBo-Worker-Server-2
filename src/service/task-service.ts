import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'
import { ITask } from '../types/task-types.js'
import WorkerService from './workers-service.js' // Adjust the path to your WorkerService

class TasksService {
  private dbFilePath: string
  private workerService: WorkerService

  constructor(dbFilePath: string, workerService: WorkerService) {
    this.dbFilePath = dbFilePath
    this.workerService = workerService
  }

  // Create a new task
  createTask(newTask: ITask) {
    const tasks = this.readData()
    tasks.push(newTask)
    this.writeData(tasks)
    return true
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

  
  // Update task description and/or store name
  updateTask(
    taskId: string,
    task: ITask
  ): ITask | null {
    const tasks = this.readData()
    const index = tasks.findIndex((task) => task.id === taskId)
    if (index === -1) {
      return null
    }
    const updatedTask = { ...tasks[index], ...task }
    tasks[index] = updatedTask
    this.writeData(tasks)
    return task
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
    
    task.completed_by = `${worker.name} ${worker.lastName}`
    task.completed_at = new Date().toISOString()
    task.status = 'completed'
    
    this.writeData(tasks)
    return true
  }

  // Get a specific task by ID
  private getTaskById(taskId: string): ITask | undefined {
    const tasks = this.readData()
    return tasks.find((task) => task.id === taskId)
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
