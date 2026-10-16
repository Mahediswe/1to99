import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/luxury_ai_commerce';

export const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: process.env.PGSSL === 'true' ? { ssl: { require: true, rejectUnauthorized: false } } : {},
});

export default sequelize;
