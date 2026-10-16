import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const PriceAuditLog = sequelize.define('PriceAuditLog', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  productId: { type: DataTypes.UUID, allowNull: false },
  ruleId: { type: DataTypes.UUID, allowNull: true },
  basePrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  finalPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  adjustmentPercent: { type: DataTypes.DECIMAL(5, 2), allowNull: false },
}, { tableName: 'price_audit_logs', timestamps: true });

export default PriceAuditLog;
