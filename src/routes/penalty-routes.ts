import { Router, Request, Response } from 'express'
import { v4 as uuidV4 } from 'uuid'
import PenaltiesService from '../service/penalties-service.js'
import WorkersService from '../service/workers-service.js'
import { penaltySchema } from '../model/penaltySchema.js'
import checkToken from '../helpers/checkToken.js'
import checkPermission, { permissionIndex } from '../helpers/checkPermission.js'

const router = Router()
const workersService = new WorkersService('./workers.json')
const penaltiesService = new PenaltiesService(
  './penalties.json',
  workersService
)
router.post(
  '/penalty',
  // @ts-ignore
  checkToken,
  checkPermission([
    permissionIndex.admin,
    permissionIndex.director,
    permissionIndex.manager
  ]),
  // @ts-ignore
  (req: Request, res: Response) => {
    const newPenalty = req.body

    const result = penaltySchema.safeParse(newPenalty)

    if (!result.success) {
      return res.status(400).json({ errors: result.error.errors })
    }

    newPenalty['id'] = uuidV4()
    newPenalty['time'] = new Date().toISOString().slice(0, 16)

    const addedPenalty = penaltiesService.addPenalty(newPenalty)
    if (addedPenalty) {
      res.status(201).json({ message: 'Penalty added successfully' })
    } else {
      res.status(404).json({ message: 'Worker not found' })
    }
  }
)

router.delete(
  '/penalty/:penaltyId',
  // @ts-ignore
  checkToken,
  checkPermission([
    permissionIndex.admin,
    permissionIndex.director,
    permissionIndex.manager
  ]),
  (req: Request<{ penaltyId: string }>, res: Response) => {
    const penaltyId = req.params.penaltyId

    const deletedPenalty = penaltiesService.deletePenalty(penaltyId)
    if (deletedPenalty) {
      res.status(200).json({ message: 'Penalty deleted successfully' })
    } else {
      res.status(404).json({ message: 'Penalty not found' })
    }
  }
)

router.get(
  '/penalties',
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
      const penalties = penaltiesService.getPenalties()
      res.json(penalties)
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch penalties' })
    }
  }
)
router.get(
  '/penalties/worker/:workerId',
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
      return res.status(400).json({ error: 'Invalid worker ID' })
    }

    const penalties = penaltiesService.getPenaltiesByWorkerId(workerId)
    res.json(penalties)
  }
)

export default router
