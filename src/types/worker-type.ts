import { IPenalty } from "./penalty-type.js"

export interface IWorker {
  id: string
  name: string
  lastName: string
  age: number
  position: string
  hours_to_work: string
  monthly_salary: number
  status_working: 'working' | 'not_working'
  monthly_worked_minutes: number
  created_at: string
}
