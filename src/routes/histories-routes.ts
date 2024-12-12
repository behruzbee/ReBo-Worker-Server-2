import { Router, type Request, type Response } from 'express'
import { IHistory } from '../types/history-type.js'
import HistoriesService from '../service/histories-service.js'
import WorkersService from '../service/workers-service.js'
import { v4 as uuidV4 } from 'uuid'
import { historySchema } from '../model/historySchema.js'

const router = Router()
const workersService = new WorkersService('./database/workers.json')
const historiesService = new HistoriesService(
  './database/histories.json',
  workersService
)
// @ts-ignore
router.post( '/history',(req: Request<{}, {}, ICreateHistory>, res: Response) => {
    const newHistory: IHistory = req.body
    const result = historySchema.safeParse(newHistory) 
    if (!result.success) {
      return res.status(400).json({ errors: result.error.errors })
    }

    const addedHistory = historiesService.addHistory({ ...newHistory, id: uuidV4() })
    if (addedHistory) {
      res.status(201).json({ message: 'History added successfully' })
    } else {
      res.status(404).json({ message: 'Worker not found' })
    }
  }
)

router.delete('/history/:id', (req, res) => {
  const isDeleted = historiesService.deleteHistory(req.params.id)
  if (isDeleted) {
    res.status(201).json({ message: 'History added successfully' })
  } else {
    res.status(404).json({ message: 'History not found' })
  }
})

router.get('/histories', (req: Request, res: Response) => {
  try {
    const histories = historiesService.getHistories()
    res.json(histories)
  } catch (error) {
    res.status(500).json({ error: 'Не удалось получить истории' })
  }
})
// @ts-ignore
router.get('/histories/worker/:workerId',(req: Request<{ workerId: string }>, res: Response) => {
    const workerId = req.params.workerId

    if (!workerId) {
      return res.status(400).json({ error: 'Некорректный ID работника' })
    }

    try {
      const histories = historiesService.getHistoriesByWorkerId(workerId)

      if (histories.length > 0) {
        res.json(histories)
      } else {
        res
          .status(404)
          .json({ error: 'Истории для данного работника не найдены' })
      }
    } catch (error) {
      res.status(500).json({ error: 'Не удалось получить истории' })
    }
  }
)

export default router
