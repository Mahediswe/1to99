import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Product = sequelize.define('Product', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  slug: { type: DataTypes.STRING, allowNull: false, unique: true },
  brand: { type: DataTypes.STRING },
  description: { type: DataTypes.TEXT },
  story: { type: DataTypes.TEXT }, // provenance / heritage narrative
  basePrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  currency: { type: DataTypes.STRING, defaultValue: 'USD' },
  images: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
  semanticTags: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] }, // style/occasion/material tags for AI search
  category: { type: DataTypes.STRING }, // curated edit / collection, not deep taxonomy
  stock: { type: DataTypes.INTEGER, defaultValue: 0 },
  isLimitedEdition: { type: DataTypes.BOOLEAN, defaultValue: false },
  sizes: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] }, // e.g. ['38','39','40'] or ['S','M','L'] — empty means no size selector (jewelry, watches)
  colorway: { type: DataTypes.STRING, allowNull: true }, // display color name shown next to the swatch
  materials: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] }, // composition line, e.g. ['100% Mulberry Silk']
  careInstructions: { type: DataTypes.TEXT, allowNull: true },
  originCountry: { type: DataTypes.STRING, allowNull: true },
  viewCount: { type: DataTypes.INTEGER, defaultValue: 0 }, // drives real "Trending" signal, not decorative
  searchVector: { type: DataTypes.TSVECTOR }, // Postgres full-text search (semantic-lite substitute for a vector DB)
}, {
  tableName: 'products',
  timestamps: true,
  indexes: [
    { fields: ['slug'], unique: true },
    { fields: ['category'] },
    { using: 'GIN', fields: ['searchVector'] },
    { using: 'GIN', fields: ['semanticTags'] },
  ],
});

export default Product;
