import { IHistory } from '../types/history-type.js'
import WorkersService from './workers-service.js'
import fs from 'fs'

class HistoriesService {
  private dbFilePath: string
  private workersService: WorkersService

  constructor(dbFilePath: string, workersService: WorkersService) {
    this.dbFilePath = dbFilePath
    this.workersService = workersService
  }

  // Метод для добавления истории работы и обновления статуса работника
  addHistory(newHistory: IHistory): boolean {
    // Сначала пытаемся найти работника по ID
    let worker = this.workersService.getWorkerById(newHistory.worker_id)

    // Если работник не найден по ID
    if (!worker) {
      return false
    }

    const status_working = newHistory.status_type === 'enter' ? 'working' : 'not_working'
    
    if(status_working === worker.status_working) {
      return false
    }


    this.addHistoryEntry(newHistory)
    this.workersService.updateWorkerStatus(worker.id, status_working)

    return true
  }

  deleteHistory(historyId: string) {
    const histories = this.readData()
    const filteredHistory = histories.filter(
      (history) => history.id !== historyId
    )
    this.writeData(filteredHistory)
    if (histories.length === filteredHistory.length) {
      return false
    }
    return true
  }

  getHistoriesByWorkerId(workerId: string): IHistory[] {
    const histories = this.readData()
    return histories.filter((history) => history.worker_id === workerId)
  }
  // Метод для получения всех историй
  getHistories(): IHistory[] {
    return this.readData()
  }

  // Метод для добавления записи в истории
  private addHistoryEntry(history: IHistory): void {
    const histories = this.readData()
    histories.push(history)
    this.writeData(histories)
  }

  // Прочие методы (например, для чтения или записи данных)
  private readData(): IHistory[] {
    // Логика чтения данных из файла
    if (!fs.existsSync(this.dbFilePath)) {
      return []
    }

    const rawData = fs.readFileSync(this.dbFilePath, 'utf-8')
    return JSON.parse(rawData).histories || []
  }

  private writeData(histories: IHistory[]): void {
    // Логика записи данных в файл
    const data = { histories }
    fs.writeFileSync(this.dbFilePath, JSON.stringify(data, null, 2))
  }
}

export default HistoriesService
