import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { sequelize } from './models/index.js';

import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/products.routes.js';
import searchRoutes from './routes/search.routes.js';
import aiRoutes from './routes/ai.routes.js';
import vipRoutes from './routes/vip.routes.js';
import orderRoutes from './routes/orders.routes.js';
import adminRoutes from './routes/admin.routes.js';
import posRoutes from './routes/pos.routes.js';
import meRoutes from './routes/me.routes.js';
import newsletterRoutes from './routes/newsletter.routes.js';

dotenv.config();
const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'luxury-ai-commerce-api' }));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/vip', vipRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/pos', posRoutes);
app.use('/api/me', meRoutes);
app.use('/api/newsletter', newsletterRoutes);

app.use((req, res) => res.status(404).json({ error: `No route for ${req.method} ${req.path}` }));
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error', detail: err.message });
});

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log('✔ PostgreSQL connected');
    await sequelize.sync(); // dev-friendly auto-migration; use proper migrations in production
    console.log('✔ Models synced');
    app.listen(PORT, () => console.log(`✔ Luxury & AI Commerce API listening on port ${PORT}`));
  } catch (err) {
    console.error('✗ Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
