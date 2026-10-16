import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const NewsletterSubscriber = sequelize.define('NewsletterSubscriber', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
  source: { type: DataTypes.STRING, defaultValue: 'footer' },
}, { tableName: 'newsletter_subscribers', timestamps: true });

export default NewsletterSubscriber;
