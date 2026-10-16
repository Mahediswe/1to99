import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const UserStyleProfile = sequelize.define('UserStyleProfile', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false, unique: true },
  preferences: { type: DataTypes.JSONB, defaultValue: {} }, // { colors: [], categories: [], priceRange: {} }
  learnedTags: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
}, { tableName: 'user_style_profiles', timestamps: true });

export default UserStyleProfile;
