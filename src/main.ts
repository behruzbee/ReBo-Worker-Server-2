import express from 'express'
import dotenv from 'dotenv';
import cors from 'cors'
import setupSwagger from './swagger.js';

import historiesRoutes from './routes/histories-routes.js'
import workersRoutes from './routes/workers-routes.js'

dotenv.config();

// Настройка CORS
const corsOptions = {
  origin: 'https://rebo-work.uz', // Укажите домен, с которого разрешены запросы
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Разрешенные методы
  allowedHeaders: ['Content-Type', 'Authorization'], // Разрешенные заголовки
};

const app = express()

app.use(express.json())
app.use(cors(corsOptions));

setupSwagger(app);

app.use('/api', historiesRoutes);
app.use('/api', workersRoutes);

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})