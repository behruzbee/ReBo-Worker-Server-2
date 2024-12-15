import { Router, Request, Response } from 'express'
import { v4 as uuidV4 } from 'uuid'
import BonusesService from '../service/bonuses-service.js'
import WorkersService from '../service/workers-service.js'
import { bonusSchema } from '../model/bonusSchema.js'
import checkToken from '../helpers/checkToken.js'
import checkPermission, { permissionIndex } from '../helpers/checkPermission.js'

const router = Router()
const workersService = new WorkersService('./workers.json')
const bonusesService = new BonusesService('./bonuses.json', workersService)
// @ts-ignore
router.post(
  '/bonus',
  // @ts-ignore
  checkToken,
  checkPermission([
    permissionIndex.admin,
    permissionIndex.director,
    permissionIndex.manager
  ]),
  (req: Request, res: Response) => {
    const newBonus = req.body

    const result = bonusSchema.safeParse(newBonus)

    if (!result.success) {
      return res.status(400).json({ errors: result.error.errors })
    }

    newBonus['id'] = uuidV4()
    newBonus['time'] = new Date().toISOString()

    const addedBonus = bonusesService.addBonus(newBonus)
    if (addedBonus) {
      res.status(201).json({ message: 'Bonus added successfully' })
    } else {
      res.status(404).json({ message: 'Worker not found' })
    }
  }
)

router.delete(
  '/bonus/:bonusId',
  // @ts-ignore
  checkToken,
  checkPermission([
    permissionIndex.admin,
    permissionIndex.director,
    permissionIndex.manager
  ]),
  (req: Request<{ bonusId: string }>, res: Response) => {
    const bonusId = req.params.bonusId

    const deletedBonus = bonusesService.deleteBonus(bonusId)
    if (deletedBonus) {
      res.status(200).json({ message: 'Bonus deleted successfully' })
    } else {
      res.status(404).json({ message: 'Bonus not found' })
    }
  }
)

router.get(
  '/bonuses',
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
      const bonuses = bonusesService.getBonuses()
      res.json(bonuses)
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch bonuses' })
    }
  }
)
// @ts-ignore
router.get(
  '/bonuses/worker/:workerId',
  // @ts-ignore
  checkToken,
  checkPermission([
    permissionIndex.admin,
    permissionIndex.director,
    permissionIndex.manager
  ]),
  (req: Request<{ workerId: string }>, res: Response) => {
    const workerId = req.params.workerId

    if (!workerId) {
      return res.status(400).json({ error: 'Invalid worker ID' })
    }

    const bonuses = bonusesService.getBonusesByWorkerId(workerId)
    if (bonuses.length > 0) {
      res.json(bonuses)
    } else {
      res.status(404).json({ error: 'No bonuses found for this worker' })
    }
  }
)

export default router
