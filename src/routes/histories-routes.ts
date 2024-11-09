import { Router, type Request, type Response } from 'express';
import { IHistory } from '../types/histories-type.js';
import HistoriesService from '../service/histories-service.js';
import WorkersService from '../service/workers-service.js';

const router = Router();
const workersService = new WorkersService('./workers.json');
const historiesService = new HistoriesService('./histories.json', workersService);

/**
 * @swagger
 * /histories:
 *   post:
 *     summary: Add a new work history and update the worker's status
 *     description: Adds a new history entry and updates the worker's working status based on the provided QR code text and worker ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               worker_id:
 *                 type: integer
 *                 description: The worker's ID
 *               qr_code_text:
 *                 type: string
 *                 description: The worker's QR code text
 *               scan_time:
 *                 type: string
 *                 format: date-time
 *                 description: The time of the scan (ISO 8601 format)
 *     responses:
 *       200:
 *         description: Successfully added history
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
router.post('/histories', (req: Request<{}, {}, IHistory>, res: Response) => {
  const newHistory: IHistory = req.body;

  if (!newHistory.worker_id || !newHistory.qr_code_text || !newHistory.scan_time) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const addedHistory = historiesService.addHistory(newHistory);
  if (addedHistory) {
    res.status(201).json({ message: 'History added successfully' });
  } else {
    res.status(404).json({ message: 'Worker not found' });
  }
});

/**
 * @swagger
 * /api/histories:
 *   get:
 *     summary: Получить все истории
 *     responses:
 *       200:
 *         description: Список всех историй
 *       500:
 *         description: Не удалось получить истории
 */
// @ts-ignore

router.get('/histories', (req: Request, res: Response) => {
  try {
    const histories = historiesService.getHistories();
    res.json(histories);
  } catch (error) {
    res.status(500).json({ error: 'Не удалось получить истории' });
  }
});

/**
 * @swagger
 * /api/histories/worker/{workerId}:
 *   get:
 *     summary: Получить истории по ID работника
 *     parameters:
 *       - in: path
 *         name: workerId
 *         required: true
 *         description: ID работника
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Истории для данного работника
 *       400:
 *         description: Некорректный ID работника
 *       404:
 *         description: Истории для данного работника не найдены
 */
// @ts-ignore
router.get('/histories/worker/:workerId', (req: Request<{ workerId: string }>, res: Response) => {
  const workerId = req.params.workerId;

  if (!workerId) {
    return res.status(400).json({ error: 'Некорректный ID работника' });
  }
  try {
    const histories = historiesService.getHistoriesByWorkerId(workerId);

    if (histories.length > 0) {
      res.json(histories);
    } else {
      res.status(404).json({ error: 'Истории для данного работника не найдены' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Не удалось получить истории' });
  }
});

export default router;