import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'ReBo Worker Management API',
    version: '1.0.0',
    description: 'API documentation for ReBo Worker Management System',
  },
  servers: [
    {
      url: 'http://localhost:5000', // Change this to your production URL later
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.ts', './src/service/*.ts'], // Path to your API routes and service files
};

const swaggerSpec = swaggerJSDoc(options);

const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

export default setupSwagger;