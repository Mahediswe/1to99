import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Order = sequelize.define('Order', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  orderNumber: { type: DataTypes.STRING, allowNull: false, unique: true },
  userId: { type: DataTypes.UUID, allowNull: true },
  channel: { type: DataTypes.ENUM('online', 'boutique'), defaultValue: 'online' },
  isVIP: { type: DataTypes.BOOLEAN, defaultValue: false },
  aiAssisted: { type: DataTypes.BOOLEAN, defaultValue: false },
  status: { type: DataTypes.ENUM('pending', 'paid', 'failed', 'processing', 'shipped', 'delivered', 'cancelled'), defaultValue: 'pending' },
  subtotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  discount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  shippingAddress: { type: DataTypes.JSONB, defaultValue: {} },
  giftWrap: { type: DataTypes.BOOLEAN, defaultValue: false },
  whiteGloveDelivery: { type: DataTypes.BOOLEAN, defaultValue: false },
  paymentMethod: { type: DataTypes.STRING },
}, { tableName: 'orders', timestamps: true });

export default Order;
