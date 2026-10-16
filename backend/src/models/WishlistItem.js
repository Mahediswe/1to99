import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const WishlistItem = sequelize.define('WishlistItem', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  productId: { type: DataTypes.UUID, allowNull: false },
}, {
  tableName: 'wishlist_items',
  timestamps: true,
  indexes: [{ unique: true, fields: ['userId', 'productId'] }],
});

export default WishlistItem;
