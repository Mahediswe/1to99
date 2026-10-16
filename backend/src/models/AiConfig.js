import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

// AI Ops Admin controlled: guardrails, tone, prohibited topics. Singleton-style config row(s).
const AiConfig = sequelize.define('AiConfig', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  tone: { type: DataTypes.STRING, defaultValue: 'refined, warm, concise — like a private client advisor' },
  prohibitedTopics: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: ['medical advice', 'financial advice', 'politics'] },
  maxUpsellItems: { type: DataTypes.INTEGER, defaultValue: 3 },
}, { tableName: 'ai_configs', timestamps: true });

export default AiConfig;
