import { Router, Request, Response } from 'express';
import {v4 as uuidV4} from 'uuid'
import PenaltiesService from '../service/penalties-service.js';
import WorkersService from '../service/workers-service.js';
import { penaltySchema } from '../model/penaltySchema.js';

const router = Router();
const workersService = new WorkersService('./workers.json');
const penaltiesService = new PenaltiesService('./penalties.json', workersService);
// @ts-ignore
router.post('/penalty', (req: Request, res: Response) => {
  const newPenalty = req.body;

  const result = penaltySchema.safeParse(newPenalty)

  if (!result.success) {
    return res.status(400).json({ errors: result.error.errors });
  }

  newPenalty['id'] = uuidV4()
  newPenalty['time'] = new Date().toISOString()

  const addedPenalty = penaltiesService.addPenalty(newPenalty);
  if (addedPenalty) {
    res.status(201).json({ message: 'Penalty added successfully' });
  } else {
    res.status(404).json({ message: 'Worker not found' });
  }
});

router.delete('/penalty/:penaltyId', (req: Request<{ penaltyId: string }>, res: Response) => {
  const penaltyId = req.params.penaltyId;

  const deletedPenalty = penaltiesService.deletePenalty(penaltyId);
  if (deletedPenalty) {
    res.status(200).json({ message: 'Penalty deleted successfully' });
  } else {
    res.status(404).json({ message: 'Penalty not found' });
  }
});

router.get('/penalties', (req: Request, res: Response) => {
  try {
    const penalties = penaltiesService.getPenalties();
    res.json(penalties);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch penalties' });
  }
});
// @ts-ignore
router.get('/penalties/worker/:workerId', (req: Request<{ workerId: string }>, res: Response) => {
  const workerId = req.params.workerId;

  if (!workerId) {
    return res.status(400).json({ error: 'Invalid worker ID' });
  }

  const penalties = penaltiesService.getPenaltiesByWorkerId(workerId);
  if (penalties.length > 0) {
    res.json(penalties);
  } else {
    res.status(404).json({ error: 'No penalties found for this worker' });
  }
});

export default router;