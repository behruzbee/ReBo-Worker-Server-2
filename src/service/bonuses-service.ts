import { IBonus } from '../types/bonus-type.js'
import WorkersService from './workers-service.js'
import fs from 'fs'

class BonusesService {
  private dbFilePath: string
  private workersService: WorkersService

  constructor(dbFilePath: string, workersService: WorkersService) {
    this.dbFilePath = dbFilePath
    this.workersService = workersService
  }

  addBonus(newBonus: IBonus): boolean {
    let worker = this.workersService.getWorkerById(newBonus.worker_id)

    if (!worker) {
      return false
    }

    this.addBonusEntry(newBonus)

    return true
  }

  // Метод для удаления штрафа
  deleteBonus(id: string): boolean {
    const bonuses = this.readData()
    const updatedBonuses = bonuses.filter((bonus) => bonus.id !== id)

    if (updatedBonuses.length === bonuses.length) {
      return false
    }

    this.writeData(updatedBonuses)
    return true
  }

  // Метод для получения всех штрафов
  getBonuses(): IBonus[] {
    return this.readData()
  }

  // Метод для получения штрафов по ID работника
  getBonusesByWorkerId(workerId: string): IBonus[] {
    const bonuses = this.readData()
    return bonuses.filter((bonus) => bonus.worker_id === workerId)
  }

  // Метод для добавления записи штрафа
  private addBonusEntry(bonus: IBonus): void {
    const bonuses = this.readData()
    bonuses.push(bonus)
    this.writeData(bonuses)
  }

  // Прочие методы (например, для чтения или записи данных)
  private readData(): IBonus[] {
    if (!fs.existsSync(this.dbFilePath)) {
      return []
    }

    const rawData = fs.readFileSync(this.dbFilePath, 'utf-8')
    return JSON.parse(rawData).bonuses || []
  }

  private writeData(bonuses: IBonus[]): void {
    const data = { bonuses }
    fs.writeFileSync(this.dbFilePath, JSON.stringify(data, null, 2))
  }
}

export default BonusesService
