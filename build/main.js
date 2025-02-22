import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import setupSwagger from './swagger.js';
import historiesRoutes from './routes/histories-routes.js';
import workersRoutes from './routes/workers-routes.js';
import penaltyRoutes from './routes/penalty-routes.js';
import taskRoutes from './routes/task-route.js';
import bonusRoutes from './routes/bonus-routes.js';
import authRoutes from './routes/auth-routes.js';
import userRoutes from './routes/user-routes.js';
dotenv.config();
const corsOptions = {
    origin: ['https://rebo-worker-dashboard.netlify.app', 'https://rebo-client.netlify.app'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};
const app = express();
app.use(express.json());
app.use(cors(corsOptions));
setupSwagger(app);
app.use('/api', historiesRoutes);
app.use('/api', penaltyRoutes);
app.use('/api', workersRoutes);
app.use('/api', taskRoutes);
app.use('/api', bonusRoutes);
app.use('/api', userRoutes);
app.use('/auth', authRoutes);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
//# sourceMappingURL=main.js.map