import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const LedgerEntry = sequelize.define('LedgerEntry', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  type: { type: DataTypes.ENUM('sale', 'refund', 'discount'), allowNull: false },
  amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  channel: { type: DataTypes.ENUM('boutique', 'online'), allowNull: false },
  referenceId: { type: DataTypes.UUID, allowNull: true },
}, { tableName: 'ledger_entries', timestamps: true });

export default LedgerEntry;
