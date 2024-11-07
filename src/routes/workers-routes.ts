import { Router, Request, Response } from 'express';
import WorkersService from '../service/workers-service.js';
import { IWorker } from '../types/workers-type.js';

const router = Router();
const workersService = new WorkersService('./workers.json');

// Проверка валидности ID
const isValidId = (id: string): boolean => !isNaN(Number(id));

// Проверка обязательных полей работника
const validateWorker = (worker: IWorker): string[] => {
  const errors: string[] = [];

  if (!worker.name || typeof worker.name !== 'string') {
    errors.push('Name is required and should be a string.');
  }

  if (!worker.firstName || typeof worker.firstName !== 'string') {
    errors.push('First name is required and should be a string.');
  }

  if (!worker.position || typeof worker.position !== 'string') {
    errors.push('Position is required and should be a string.');
  }

  if (typeof worker.age !== 'number' || worker.age <= 0) {
    errors.push('Age is required and should be a positive number.');
  }

  return errors;
};

/**
 * @swagger
 * /api/workers:
 *   get:
 *     summary: Get all workers
 *     responses:
 *       200:
 *         description: List of workers
 *       500:
 *         description: Failed to retrieve workers
 */
router.get('/workers', (req: Request, res: Response) => {
  try {
    const workers = workersService.getWorkers();
    res.json(workers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve workers' });
  }
});

/**
 * @swagger
 * /api/workers/{id}:
 *   get:
 *     summary: Get worker by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Worker ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Worker found
 *       400:
 *         description: Invalid worker ID
 *       404:
 *         description: Worker not found
 */
// @ts-ignore
router.get('/workers/:id', (req: Request<{ id: string }>, res: Response) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ error: 'Invalid worker ID' });
  }

  const worker = workersService.getWorkerById(Number(req.params.id));
  if (worker) {
    res.json(worker);
  } else {
    res.status(404).json({ error: 'Worker not found' });
  }
});

/**
 * @swagger
 * /api/workers:
 *   post:
 *     summary: Add a new worker
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Worker'
 *     responses:
 *       201:
 *         description: Worker added
 *       400:
 *         description: Invalid worker data
 *       500:
 *         description: Failed to add worker
 */
// @ts-ignore
router.post('/workers', (req: Request<{}, {}, IWorker>, res: Response) => {
  const newWorker = req.body;
  const errors = validateWorker(newWorker);

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const addedWorker = workersService.addWorker(newWorker);
    res.status(201).json(addedWorker);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add worker' });
  }
});

/**
 * @swagger
 * /api/workers/{id}:
 *   put:
 *     summary: Update a worker by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Worker ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Worker'
 *     responses:
 *       200:
 *         description: Worker updated
 *       400:
 *         description: Invalid worker data
 *       404:
 *         description: Worker not found
 *       500:
 *         description: Failed to update worker
 */
// @ts-ignore
router.put('/workers/:id', (req: Request<{ id: string }, {}, Partial<IWorker>>, res: Response) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ error: 'Invalid worker ID' });
  }

  const updatedData = req.body;
  const errors = validateWorker({ ...updatedData, id: Number(req.params.id) } as IWorker);

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const updatedWorker = workersService.updateWorker(Number(req.params.id), updatedData);
    if (updatedWorker) {
      res.json(updatedWorker);
    } else {
      res.status(404).json({ error: 'Worker not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update worker' });
  }
});

/**
 * @swagger
 * /api/workers/{id}:
 *   delete:
 *     summary: Delete a worker by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Worker ID
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Worker deleted
 *       400:
 *         description: Invalid worker ID
 *       404:
 *         description: Worker not found
 *       500:
 *         description: Failed to delete worker
 */
// @ts-ignore
router.delete('/workers/:id', (req: Request<{ id: string }>, res: Response) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ error: 'Invalid worker ID' });
  }

  try {
    const success = workersService.deleteWorker(Number(req.params.id));
    if (success) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Worker not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete worker' });
  }
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Worker:
 *       type: object
 *       required:
 *         - name
 *         - firstName
 *         - position
 *         - age
 *       properties:
 *         name:
 *           type: string
 *         firstName:
 *           type: string
 *         position:
 *           type: string
 *         age:
 *           type: integer
 *           format: int32
 */

export default router;