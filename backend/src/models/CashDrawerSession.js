import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const CashDrawerSession = sequelize.define('CashDrawerSession', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  terminalId: { type: DataTypes.UUID, allowNull: false },
  openedBy: { type: DataTypes.UUID, allowNull: true },
  openingCash: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  closingCash: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
  variance: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
  status: { type: DataTypes.ENUM('open', 'closed'), defaultValue: 'open' },
  closedAt: { type: DataTypes.DATE, allowNull: true },
}, { tableName: 'cash_drawer_sessions', timestamps: true });

export default CashDrawerSession;
