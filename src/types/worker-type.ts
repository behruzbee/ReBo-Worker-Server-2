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
  qr_code_text: string
  created_at: string
}
