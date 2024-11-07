import { IHistory } from '../types/histories-type.js'
import WorkersService from './workers-service.js'
import fs from 'fs'
import path from 'path'

class HistoriesService {
  private dbFilePath: string
  private workersService: WorkersService

  constructor(dbFilePath: string, workersService: WorkersService) {
    this.dbFilePath = dbFilePath
    this.workersService = workersService
  }

  // Метод для добавления истории работы и обновления статуса работника
  addHistory(newHistory: IHistory): boolean {
    const scanTime = new Date().toISOString()

    // Сначала пытаемся найти работника по ID
    let worker = this.workersService.getWorkerById(newHistory.worker_id) && this.workersService.getWorkerByQrCode(newHistory.qr_code_text)

    // Если работник не найден ни по ID, ни по qr_code_text
    if (!worker) {
      return false
    }

    const workerIsWorking = worker.is_working

    if (workerIsWorking) {
      // Добавляем историю о начале работы
      const historyEntry = { ...newHistory, scan_time: scanTime }
      this.addHistoryEntry(historyEntry)
      this.workersService.updateWorkerStatus(worker.id, false)
    } else {
      // Добавляем историю о завершении работы
      const historyEntry = { ...newHistory, scan_time: scanTime }
      this.addHistoryEntry(historyEntry)
      const historyEntryForWorkTime = this.getHistoryEntryForWorker(worker.id)
      const workStartTime = new Date(historyEntryForWorkTime[0].scan_time)
      const workEndTime = new Date(scanTime)
      const workMinutes = this.calculateWorkMinutes(workStartTime, workEndTime)

      this.workersService.updateWorkerStatus(worker.id, true)
      this.workersService.updateWorkerMonthlyMinutes(worker.id, workMinutes)
    }

    return true
  }

  getHistoriesByWorkerId(workerId: number): IHistory[] {
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

  // Метод для получения истории по работнику
  private getHistoryEntryForWorker(workerId: number): IHistory[] {
    const histories = this.readData()
    return histories.filter((history) => history.worker_id === workerId)
  }

  // Метод для расчета времени работы в минутах
  private calculateWorkMinutes(start: Date, end: Date): number {
    const difference = end.getTime() - start.getTime()
    return Math.floor(difference / (1000 * 60)) // Конвертируем из миллисекунд в минуты
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
