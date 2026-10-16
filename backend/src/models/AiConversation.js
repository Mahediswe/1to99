import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const AiConversation = sequelize.define('AiConversation', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: true },
  sessionId: { type: DataTypes.STRING, allowNull: false },
  messages: { type: DataTypes.JSONB, defaultValue: [] }, // [{role, content, functionCall?, createdAt}]
  extractedPreferences: { type: DataTypes.JSONB, defaultValue: {} },
}, {
  tableName: 'ai_conversations',
  timestamps: true,
  indexes: [{ fields: ['userId', 'createdAt'] }],
});

export default AiConversation;
