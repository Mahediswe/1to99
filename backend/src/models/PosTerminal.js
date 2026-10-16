import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const PosTerminal = sequelize.define('PosTerminal', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  terminalCode: { type: DataTypes.STRING, allowNull: false, unique: true },
  boutiqueLocation: { type: DataTypes.STRING, allowNull: false },
  active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'pos_terminals', timestamps: true });

export default PosTerminal;
