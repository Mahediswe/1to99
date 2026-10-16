import sequelize from '../config/db.js';
import User from './User.js';
import Product from './Product.js';
import PricingRule from './PricingRule.js';
import PriceAuditLog from './PriceAuditLog.js';
import AiConversation from './AiConversation.js';
import UserStyleProfile from './UserStyleProfile.js';
import VipMembership from './VipMembership.js';
import Review from './Review.js';
import ProductAiSummary from './ProductAiSummary.js';
import Order from './Order.js';
import OrderItem from './OrderItem.js';
import PosTerminal from './PosTerminal.js';
import PosTransaction from './PosTransaction.js';
import CashDrawerSession from './CashDrawerSession.js';
import LedgerEntry from './LedgerEntry.js';
import AiConfig from './AiConfig.js';
import WishlistItem from './WishlistItem.js';
import NewsletterSubscriber from './NewsletterSubscriber.js';

// Associations
User.hasOne(UserStyleProfile, { foreignKey: 'userId' });
UserStyleProfile.belongsTo(User, { foreignKey: 'userId' });

User.hasOne(VipMembership, { foreignKey: 'userId' });
VipMembership.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(AiConversation, { foreignKey: 'userId' });
AiConversation.belongsTo(User, { foreignKey: 'userId' });

Product.hasMany(Review, { foreignKey: 'productId' });
Review.belongsTo(Product, { foreignKey: 'productId' });

Product.hasOne(ProductAiSummary, { foreignKey: 'productId' });
ProductAiSummary.belongsTo(Product, { foreignKey: 'productId' });

Product.hasMany(PricingRule, { foreignKey: 'productId' });
PricingRule.belongsTo(Product, { foreignKey: 'productId' });

Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });

PosTerminal.hasMany(PosTransaction, { foreignKey: 'terminalId' });
PosTransaction.belongsTo(PosTerminal, { foreignKey: 'terminalId' });

PosTerminal.hasMany(CashDrawerSession, { foreignKey: 'terminalId' });
CashDrawerSession.belongsTo(PosTerminal, { foreignKey: 'terminalId' });

User.hasMany(WishlistItem, { foreignKey: 'userId' });
WishlistItem.belongsTo(User, { foreignKey: 'userId' });
Product.hasMany(WishlistItem, { foreignKey: 'productId' });
WishlistItem.belongsTo(Product, { foreignKey: 'productId' });

export {
  sequelize,
  User,
  Product,
  PricingRule,
  PriceAuditLog,
  AiConversation,
  UserStyleProfile,
  VipMembership,
  Review,
  ProductAiSummary,
  Order,
  OrderItem,
  PosTerminal,
  PosTransaction,
  CashDrawerSession,
  LedgerEntry,
  AiConfig,
  WishlistItem,
  NewsletterSubscriber,
};
