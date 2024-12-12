export interface ITask {
  id: string // Unique task identifier
  store_name: string // Store or location of the task
  description: string // Task description
  completed_by?: string // Worker who completed the task (if completed)
  completed_at?: string // Completion timestamp
  created_at: string // Task creation timestamp
  status: 'pending' | 'completed' // Task status (pending or completed)
}
