import express from 'express';
import dotenv from 'dotenv';
import setupSwagger from './swagger.js';
import historiesRoutes from './routes/histories-routes.js';
import workersRoutes from './routes/workers-routes.js';
dotenv.config();
const app = express();
app.use(express.json());
setupSwagger(app);
app.use('/api', historiesRoutes);
app.use('/api', workersRoutes);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
//# sourceMappingURL=main.js.map