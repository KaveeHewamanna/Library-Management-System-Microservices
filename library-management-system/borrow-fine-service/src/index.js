require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const express      = require('express');
const cors         = require('cors');
const morgan       = require('morgan');
const mongoose     = require('mongoose');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi    = require('swagger-ui-express');

const borrowRoutes = require('./routes/borrowRoutes');

const app  = express();
const PORT = process.env.PORT || 3004;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB: library_borrows'))
  .catch((err) => console.error('❌ MongoDB connection error:', err.message));

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Borrow & Fine Management Service API',
      version: '1.0.0',
      description:
        'Microservice for managing book borrowing and overdue fines.\n\n- Books are due **14 days** from borrow date\n- Overdue fine: **$0.50 per day**\n\n**Developer:** IT22258694\n\n**IT4020 Assignment 2 — 2026**',
      contact: { name: 'IT22258694' },
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
  customSiteTitle: 'Borrow & Fine Management API',
  customCss: '.swagger-ui .topbar { background-color: #dc2626; }',
}));

app.use('/api/borrows', borrowRoutes);

app.get('/health', (req, res) => {
  res.json({ service: 'Borrow & Fine Management Service', developer: 'IT22258694', status: 'running', port: PORT });
});

app.get('/', (req, res) => {
  res.json({
    service: 'Borrow & Fine Management Service',
    developer: 'IT22258694',
    version: '1.0.0',
    docs: `http://localhost:${PORT}/api-docs`,
    endpoints: '/api/borrows',
    finePolicy: '$0.50 per day overdue, 14-day borrow period',
  });
});

app.listen(PORT, () => {
  console.log(`\n💰 Borrow & Fine Management Service (IT22258694)`);
  console.log(`   Running at : http://localhost:${PORT}`);
  console.log(`   Swagger UI : http://localhost:${PORT}/api-docs`);
  console.log(`   Fine Rate  : $${process.env.FINE_RATE_PER_DAY || 0.50}/day overdue\n`);
});

