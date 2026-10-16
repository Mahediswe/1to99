import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const VipMembership = sequelize.define('VipMembership', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false, unique: true },
  tier: { type: DataTypes.ENUM('silver', 'gold', 'platinum'), defaultValue: 'silver' },
  benefits: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
  points: { type: DataTypes.INTEGER, defaultValue: 0 },
  since: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'vip_memberships', timestamps: true });

export default VipMembership;
