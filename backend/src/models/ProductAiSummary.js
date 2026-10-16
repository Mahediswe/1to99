import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

// Cached, regenerable AI review summary per product — grounded strictly in stored reviews (RAG-style, no freeform claims)
const ProductAiSummary = sequelize.define('ProductAiSummary', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  productId: { type: DataTypes.UUID, allowNull: false, unique: true },
  summary: { type: DataTypes.TEXT },
  reviewCountAtGeneration: { type: DataTypes.INTEGER, defaultValue: 0 },
  averageRating: { type: DataTypes.DECIMAL(2, 1), defaultValue: 0 },
}, { tableName: 'product_ai_summaries', timestamps: true });

export default ProductAiSummary;
