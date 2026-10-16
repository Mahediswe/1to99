import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const PosTransaction = sequelize.define('PosTransaction', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  terminalId: { type: DataTypes.UUID, allowNull: false },
  orderId: { type: DataTypes.UUID, allowNull: true },
  userId: { type: DataTypes.UUID, allowNull: true },
  items: { type: DataTypes.JSONB, defaultValue: [] },
  total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  paymentMethod: { type: DataTypes.ENUM('cash', 'card', 'mobile'), allowNull: false },
}, { tableName: 'pos_transactions', timestamps: true });

export default PosTransaction;
