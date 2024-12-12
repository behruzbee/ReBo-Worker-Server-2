import { v4 as uuidv4 } from 'uuid'
import { IPenalty } from '../types/penalty-type.js'
import WorkersService from './workers-service.js'
import fs from 'fs'

class PenaltiesService {
  private dbFilePath: string
  private workersService: WorkersService

  constructor(dbFilePath: string, workersService: WorkersService) {
    this.dbFilePath = dbFilePath
    this.workersService = workersService
  }

  // Метод для добавления штрафа и обновления информации о работнике
  addPenalty(newPenalty: IPenalty): boolean {
    // Сначала пытаемся найти работника по ID
    let worker = this.workersService.getWorkerById(newPenalty.worker_id)

    // Если работник не найден
    if (!worker) {
      return false
    }

    // Добавляем штраф в историю работника
    this.addPenaltyEntry(newPenalty)

    return true
  }

  // Метод для удаления штрафа
  deletePenalty(id: string): boolean {
    const penalties = this.readData()
    const updatedPenalties = penalties.filter((penalty) => penalty.id !== id)

    if (updatedPenalties.length === penalties.length) {
      return false
    }

    this.writeData(penalties)
    return true
  }

  // Метод для получения всех штрафов
  getPenalties(): IPenalty[] {
    return this.readData()
  }

  // Метод для получения штрафов по ID работника
  getPenaltiesByWorkerId(workerId: string): IPenalty[] {
    const penalties = this.readData()
    return penalties.filter((penalty) => penalty.worker_id === workerId)
  }

  // Метод для добавления записи штрафа
  private addPenaltyEntry(penalty: IPenalty): void {
    const penalties = this.readData()
    penalties.push(penalty)
    this.writeData(penalties)
  }

  // Прочие методы (например, для чтения или записи данных)
  private readData(): IPenalty[] {
    if (!fs.existsSync(this.dbFilePath)) {
      return []
    }

    const rawData = fs.readFileSync(this.dbFilePath, 'utf-8')
    return JSON.parse(rawData).penalties || []
  }

  private writeData(penalties: IPenalty[]): void {
    const data = { penalties }
    fs.writeFileSync(this.dbFilePath, JSON.stringify(data, null, 2))
  }
}

export default PenaltiesService
