import { Router, Request, Response } from 'express';
import PenaltiesService from '../service/penalties-service.js';
import WorkersService from '../service/workers-service.js';

const router = Router();
const workersService = new WorkersService('./workers.json');
const penaltiesService = new PenaltiesService('./penalties.json', workersService);

/**
 * @swagger
 * /api/penalties:
 *   post:
 *     summary: Add a new penalty to a worker
 *     description: Adds a new penalty entry to a worker's record.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               worker_id:
 *                 type: string
 *                 description: The worker's ID
 *               description:
 *                 type: string
 *                 description: The description of the penalty
 *               amount:
 *                 type: number
 *                 description: The penalty amount
 *               time:
 *                 type: string
 *                 format: date-time
 *                 description: The time the penalty was issued
 *     responses:
 *       200:
 *         description: Successfully added penalty
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Message describing the result of the action
 *       400:
 *         description: Bad request, missing required fields
 *       404:
 *         description: Worker not found
 */
// @ts-ignore
router.post('/penalties', (req: Request, res: Response) => {
  const newPenalty = req.body;

  if (!newPenalty.worker_id || !newPenalty.description || !newPenalty.amount || !newPenalty.time) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const addedPenalty = penaltiesService.addPenalty(newPenalty);
  if (addedPenalty) {
    res.status(201).json({ message: 'Penalty added successfully' });
  } else {
    res.status(404).json({ message: 'Worker not found' });
  }
});

/**
 * @swagger
 * /api/penalties/{penaltyId}:
 *   delete:
 *     summary: Delete a penalty by ID
 *     description: Deletes a penalty entry by its ID.
 *     parameters:
 *       - in: path
 *         name: penaltyId
 *         required: true
 *         description: The ID of the penalty to be deleted
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully deleted penalty
 *       404:
 *         description: Penalty not found
 */
router.delete('/penalties/:penaltyId', (req: Request<{ penaltyId: string }>, res: Response) => {
  const penaltyId = req.params.penaltyId;

  const deletedPenalty = penaltiesService.deletePenalty(penaltyId);
  if (deletedPenalty) {
    res.status(200).json({ message: 'Penalty deleted successfully' });
  } else {
    res.status(404).json({ message: 'Penalty not found' });
  }
});

/**
 * @swagger
 * /api/penalties:
 *   get:
 *     summary: Get all penalties
 *     description: Fetches a list of all penalties.
 *     responses:
 *       200:
 *         description: A list of all penalties
 *       500:
 *         description: Failed to fetch penalties
 */
router.get('/penalties', (req: Request, res: Response) => {
  try {
    const penalties = penaltiesService.getPenalties();
    res.json(penalties);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch penalties' });
  }
});

/**
 * @swagger
 * /api/penalties/worker/{workerId}:
 *   get:
 *     summary: Get penalties by worker ID
 *     parameters:
 *       - in: path
 *         name: workerId
 *         required: true
 *         description: The ID of the worker
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of penalties for the specified worker
 *       404:
 *         description: No penalties found for the worker
 */
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