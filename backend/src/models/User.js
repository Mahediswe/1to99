import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
  passwordHash: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('guest', 'customer', 'content_admin', 'pricing_admin', 'ai_ops_admin', 'super_admin', 'pos_staff'), defaultValue: 'customer' },
  twoFactorEnabled: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { tableName: 'users', timestamps: true });

export default User;
