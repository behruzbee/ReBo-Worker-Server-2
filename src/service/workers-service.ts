import fs from 'fs'
import path from 'path'
import { IWorker } from '../types/worker-type.js'

class WorkerService {
  private dbFilePath: string

  constructor(dbFilePath: string) {
    this.dbFilePath = dbFilePath
  }

  private readData(): IWorker[] {
    if (!fs.existsSync(this.dbFilePath)) {
      return []
    }
    const rawData = fs.readFileSync(this.dbFilePath, 'utf-8')
    return JSON.parse(rawData).workers || []
  }

  private writeData(workers: IWorker[]): void {
    const data = { workers }
    fs.writeFileSync(this.dbFilePath, JSON.stringify(data, null, 2))
  }

  // Получить список всех работников
  getWorkers(): IWorker[] {
    return this.readData()
  }

  // Получить работника по ID
  getWorkerById(id: string): IWorker | undefined {
    const workers = this.readData()
    return workers.find((worker) => worker.id === id)
  }

  // Добавить нового работника
  addWorker(newWorker: IWorker): IWorker {
    const workers = this.readData()
    workers.push(newWorker)
    this.writeData(workers)
    return newWorker
  }

  // Обновить информацию о работнике
  updateWorker(id: string, updatedData: Partial<IWorker>): IWorker | null {
    const workers = this.readData()
    const index = workers.findIndex((worker) => worker.id === id)
    if (index === -1) {
      return null
    }
    const updatedWorker = { ...workers[index], ...updatedData }
    workers[index] = updatedWorker
    this.writeData(workers)
    return updatedWorker
  }

  // Удалить работника по ID
  deleteWorker(id: string): boolean {
    let workers = this.readData()
    const index = workers.findIndex((worker) => worker.id === id)
    if (index === -1) {
      return false
    }
    workers = workers.filter((worker) => worker.id !== id)
    this.writeData(workers)
    return true
  }

  // Метод для обновления статуса работника
  updateWorkerStatus(id: string, status_working: 'working' | 'not_working'): IWorker | undefined {
    const workers = this.readData()
    const worker = workers.find((worker) => worker.id === id)
    if (!worker) return undefined

    worker.status_working = status_working
    this.writeData(workers)
    return worker
  }

  // Метод для обновления ежемесячных минут
  updateWorkerMonthlyMinutes(
    id: string,
    additionalMinutes: number
  ): IWorker | undefined {
    const workers = this.readData()
    const worker = workers.find((worker) => worker.id === id)
    if (!worker) return undefined

    // Добавляем новые минуты к текущим
    worker.monthly_worked_minutes += additionalMinutes
    this.writeData(workers)
    return worker
  }
}

export default WorkerService
