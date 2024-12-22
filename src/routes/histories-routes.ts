import { Router, type Request, type Response } from 'express'
import { IHistory } from '../types/history-type.js'
import HistoriesService from '../service/histories-service.js'
import WorkersService from '../service/workers-service.js'
import { v4 as uuidV4 } from 'uuid'
import { historySchema } from '../model/historySchema.js'
import checkToken from '../helpers/checkToken.js'
import checkPermission, { permissionIndex } from '../helpers/checkPermission.js'

const router = Router()
const workersService = new WorkersService('./workers.json')
const historiesService = new HistoriesService(
  './histories.json',
  workersService
)
// @ts-ignore
router.post(
  '/history',
  // @ts-ignore
  checkToken,
  checkPermission([
    permissionIndex.admin,
    permissionIndex.director,
    permissionIndex.manager
  ]),
  (req: Request, res: Response) => {
    const newHistory: IHistory = req.body
    const result = historySchema.safeParse(newHistory)
    if (!result.success) {
      return res.status(400).json({ errors: result.error.errors })
    }

    const addedHistory = historiesService.addHistory({
      ...newHistory,
      id: uuidV4()
    })
    if (addedHistory) {
      res.status(201).json({ message: 'History added successfully' })
    } else {
      res.status(404).json({ message: 'Worker not found' })
    }
  }
)

router.post(
  '/history/public',
  // @ts-ignore
  (req: Request, res: Response) => {
    const newHistory: IHistory = req.body
    newHistory.scan_time = new Date().toISOString().slice(0, 16)
    const result = historySchema.safeParse(newHistory)
    if (!result.success) {
      return res.status(400).json({ errors: result.error.errors })
    }

    const addedHistory = historiesService.addHistory({
      ...newHistory,
      id: uuidV4()
    })
    if (addedHistory) {
      res.status(201).json({ message: 'History added successfully' })
    } else {
      res.status(404).json({ message: 'Worker not found' })
    }
  }
)

router.delete(
  '/history/:id',
  // @ts-ignore
  checkToken,
  checkPermission([
    permissionIndex.admin,
    permissionIndex.director,
    permissionIndex.manager
  ]),
  (req, res) => {
    const isDeleted = historiesService.deleteHistory(req.params.id)
    if (isDeleted) {
      res.status(201).json({ message: 'History added successfully' })
    } else {
      res.status(404).json({ message: 'History not found' })
    }
  }
)

router.get(
  '/histories',
  // @ts-ignore
  checkToken,
  checkPermission([
    permissionIndex.admin,
    permissionIndex.director,
    permissionIndex.manager,
    permissionIndex.user
  ]),
  (req: Request, res: Response) => {
    try {
      const histories = historiesService.getHistories()
      res.json(histories)
    } catch (error) {
      res.status(500).json({ error: 'Не удалось получить истории' })
    }
  }
)
router.get(
  '/histories/worker/:workerId',
  // @ts-ignore
  checkToken,
  checkPermission([
    permissionIndex.admin,
    permissionIndex.director,
    permissionIndex.manager
  ]),
  // @ts-ignore
  (req: Request<{ workerId: string }>, res: Response) => {
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
