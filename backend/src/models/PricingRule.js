import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

// Admin-controlled dynamic pricing rule engine. No autonomous/black-box pricing —
// every adjustment is bound by explicit min/max and toggled by an admin.
const PricingRule = sequelize.define('PricingRule', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  productId: { type: DataTypes.UUID, allowNull: true },
  category: { type: DataTypes.STRING, allowNull: true },
  ruleType: { type: DataTypes.ENUM('demand', 'stock_scarcity', 'vip_discount', 'seasonal'), allowNull: false },
  condition: { type: DataTypes.JSONB, defaultValue: {} }, // e.g. { stockBelow: 5 }
  adjustmentPercent: { type: DataTypes.DECIMAL(5, 2), allowNull: false }, // + or -
  minBoundaryPercent: { type: DataTypes.DECIMAL(5, 2), defaultValue: -15 },
  maxBoundaryPercent: { type: DataTypes.DECIMAL(5, 2), defaultValue: 15 },
  active: { type: DataTypes.BOOLEAN, defaultValue: true },
  createdBy: { type: DataTypes.UUID, allowNull: true },
}, { tableName: 'pricing_rules', timestamps: true });

export default PricingRule;
