import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const OrderItem = sequelize.define('OrderItem', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  orderId: { type: DataTypes.UUID, allowNull: false },
  productId: { type: DataTypes.UUID, allowNull: false },
  nameSnapshot: { type: DataTypes.STRING, allowNull: false },
  priceSnapshot: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
}, { tableName: 'order_items', timestamps: true });

export default OrderItem;
