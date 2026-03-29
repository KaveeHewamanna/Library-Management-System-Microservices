require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const express      = require('express');
const cors         = require('cors');
const morgan       = require('morgan');
const mongoose     = require('mongoose');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi    = require('swagger-ui-express');

const userRoutes = require('./routes/userRoutes');

const app  = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// ─── MongoDB Connection ───────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB: library_users'))
  .catch((err) => console.error('❌ MongoDB connection error:', err.message));

// ─── Swagger Configuration ────────────────────────────────────────────────────
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'User Management Service API',
      version: '1.0.0',
      description:
        'Microservice for managing library users — registrations, authentication, and profile management.\n\n**Developer:** IT22563750\n\n**IT4020 Assignment 2 — 2026**',
      contact: { name: 'IT22563750' },
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
          description: 'Enter the JWT token from the /login endpoint',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js', './src/models/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'User Management API',
  customCss: '.swagger-ui .topbar { background-color: #4f46e5; }',
}));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/users', userRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    service: 'User Management Service',
    developer: 'IT22563750',
    status: 'running',
    port: PORT,
    timestamp: new Date().toISOString(),
  });
});

app.get('/', (req, res) => {
  res.json({
    service: 'User Management Service',
    developer: 'IT22563750',
    version: '1.0.0',
    docs: `http://localhost:${PORT}/api-docs`,
    endpoints: '/api/users',
  });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n👤 User Management Service (IT22563750)`);
  console.log(`   Running at : http://localhost:${PORT}`);
  console.log(`   Swagger UI : http://localhost:${PORT}/api-docs\n`);
});

