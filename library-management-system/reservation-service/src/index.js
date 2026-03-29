require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const express      = require('express');
const cors         = require('cors');
const morgan       = require('morgan');
const mongoose     = require('mongoose');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi    = require('swagger-ui-express');

const reservationRoutes = require('./routes/reservationRoutes');

const app  = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB: library_reservations'))
  .catch((err) => console.error('❌ MongoDB connection error:', err.message));

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Reservation Management Service API',
      version: '1.0.0',
      description:
        'Microservice for managing library book reservations — create, track, and manage holds.\n\n**Developer:** IT22584090\n\n**IT4020 Assignment 2 — 2026**',
      contact: { name: 'IT22584090' },
    },
    servers: [
      { url: `http://localhost:${PORT}`, description: 'Direct Service (Native)' },
      { url: 'http://localhost:3000',    description: 'Via API Gateway' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter the JWT token obtained from User Service /api/users/login',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js', './src/models/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Reservation Management API',
  customCss: '.swagger-ui .topbar { background-color: #d97706; }',
}));

app.use('/api/reservations', reservationRoutes);

app.get('/health', (req, res) => {
  res.json({ service: 'Reservation Management Service', developer: 'IT22584090', status: 'running', port: PORT });
});

app.get('/', (req, res) => {
  res.json({
    service: 'Reservation Management Service',
    developer: 'IT22584090',
    version: '1.0.0',
    docs: `http://localhost:${PORT}/api-docs`,
    endpoints: '/api/reservations',
  });
});

app.listen(PORT, () => {
  console.log(`\n📅 Reservation Management Service (IT22584090)`);
  console.log(`   Running at : http://localhost:${PORT}`);
  console.log(`   Swagger UI : http://localhost:${PORT}/api-docs\n`);
});

