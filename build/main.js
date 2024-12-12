import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import setupSwagger from './swagger.js';
import historiesRoutes from './routes/histories-routes.js';
import workersRoutes from './routes/workers-routes.js';
import penaltyRoutes from './routes/penalty-routes.js';
import taskRoutes from './routes/task-route.js';
dotenv.config();
const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};
const app = express();
app.use(express.json());
app.use(cors(corsOptions));
setupSwagger(app);
app.use('/api', historiesRoutes);
app.use('/api', penaltyRoutes);
app.use('/api', workersRoutes);
app.use('/api', taskRoutes);
app.use('/api', taskRoutes);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
//# sourceMappingURL=main.js.map