import fs from 'fs'
import { IUser } from '../types/user-type.js'

class UserService {
  private dbFilePath: string

  constructor(dbFilePath: string) {
    this.dbFilePath = dbFilePath
  }

  private readData(): IUser[] {
    if (!fs.existsSync(this.dbFilePath)) {
      return []
    }
    const rawData = fs.readFileSync(this.dbFilePath, 'utf-8')
    return JSON.parse(rawData).users || []
  }

  private writeData(users: IUser[]): void {
    const data = { users }
    fs.writeFileSync(this.dbFilePath, JSON.stringify(data, null, 2))
  }
  // Получить список всех пользователей
  getUsers(): IUser[] {
    return this.readData()
  }

  // Получить пользователя по Username
  getUserByUsername (username: string): IUser | undefined {
    const users = this.readData()
    return users.find(user => user.username === username)
  }

  // Добавить нового пользователя
  addUser(newUser: IUser): IUser {
    const users = this.readData()
    users.push(newUser)
    this.writeData(users)
    return newUser
  }

  // Обновить информация о пользователя
  updateUser(username: string, updatedData: IUser): IUser | null {
    const users = this.readData()
    const index = users.findIndex((user) => user.username === username)
    if (index === -1) {
      return null
    }
    const updatedUser = { ...users[index], ...updatedData }
    users[index] = updatedUser
    this.writeData(users)
    return updatedUser
  }

  // Удалить пользователя по username
  deleteUser(username: string): boolean {
    let users = this.readData()
    const index = users.findIndex((user) => user.username === username)
    if (index === -1) {
      return false
    }
    users = users.filter((user) => user.username !== username)
    this.writeData(users)
    return true
  }

  // Метод для обновления статуса работника
  updateUserStatusIndex(username: string, status_working: number): IUser | undefined {
    const users = this.readData()
    const user = users.find((user) => user.username === username)
    if (!user) return undefined

    user.status_index = status_working
    this.writeData(users)
    return user
  }
}

export default UserService
