import { Router, Request, Response } from 'express';
import WorkersService from '../service/workers-service.js';
import { IWorker } from '../types/worker-type.js';
import { workerSchema } from '../model/workerSchema.js';

const router = Router();
const workersService = new WorkersService('./workers.json');

router.get('/workers', (req: Request, res: Response) => {
  try {
    const workers = workersService.getWorkers();
    res.json(workers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve workers' });
  }
});

router.get('/worker/:id', (req: Request<{ id: string }>, res: Response) => {
  const worker = workersService.getWorkerById(req.params.id);
  if (worker) {
    res.json(worker);
  } else {
    res.status(404).json({ error: 'Worker not found' });
  }
});
// @ts-ignore
router.post('/worker', (req: Request<{}, {}, IWorker>, res: Response) => {
  const newWorker = req.body;
  const result = workerSchema.safeParse(newWorker);

  if (!result.success) {
    return res.status(400).json({ errors: result.error.errors });
  }

  try {
    const addedWorker = workersService.addWorker({...newWorker, created_at: new Date().toISOString()});
    res.status(201).json(addedWorker);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add worker' });
  }
});
// @ts-ignore
router.patch('/worker/:id', (req: Request<{ id: string }, {}, Partial<IWorker>>, res: Response) => {
  const updatedData = req.body;
  const result = workerSchema.safeParse({ ...updatedData, id: req.params.id } as IWorker);

  if (!result.success) {
    return res.status(400).json({ errors: result.error.errors });
  }
  
  try {
    const updatedWorker = workersService.updateWorker(req.params.id, updatedData);
    if (updatedWorker) {
      res.json(updatedWorker);
    } else {
      res.status(404).json({ error: 'Worker not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update worker' });
  }
});

router.delete('/worker/:id', (req: Request<{ id: string }>, res: Response) => {
  try {
    const success = workersService.deleteWorker(req.params.id);
    if (success) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Worker not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete worker' });
  }
});

export default router;