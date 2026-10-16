import dotenv from 'dotenv';
dotenv.config();
import bcrypt from 'bcryptjs';
import {
  sequelize, User, Product, VipMembership, UserStyleProfile, AiConfig, PosTerminal,
  PricingRule, Review, ProductAiSummary, NewsletterSubscriber,
} from '../models/index.js';
import { summarizeReviews } from '../utils/aiOrchestrator.js';

const products = [
  {
    name: 'Aurelia Silk Evening Gown', brand: 'Maison Aurelia',
    description: 'A hand-draped silk gown cut on the bias for a fluid, sculptural silhouette that moves with the body rather than against it.',
    story: 'Each gown is finished by a single atelier seamstress in Lyon, continuing a bias-cutting technique passed down three generations, using silk woven on century-old jacquard looms.',
    basePrice: 4200, category: 'Evening Wear',
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=900',
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=900',
      'https://images.unsplash.com/photo-1566479179817-c0e5c0e6ff89?w=900',
    ],
    semanticTags: ['silk', 'evening', 'gown', 'gala', 'black-tie', 'elegant', 'formal'],
    stock: 4, isLimitedEdition: true, sizes: ['XS', 'S', 'M', 'L'],
    materials: ['100% Mulberry Silk', 'Hand-finished French seams'], careInstructions: 'Dry clean only. Store on a padded hanger away from direct light.',
    originCountry: 'France',
  },
  {
    name: 'Noir Cashmere Overcoat', brand: 'Verrier',
    description: 'Double-faced cashmere overcoat with hand-stitched horn buttons and a fully canvassed structure that holds its shape for decades.',
    story: 'Woven from Mongolian cashmere at a mill Verrier has worked with exclusively since 1987, then hand-finished by tailors trained in the house\'s original Savile Row atelier.',
    basePrice: 3100, category: 'Outerwear',
    images: [
      'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=900',
      'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=900',
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=900',
    ],
    semanticTags: ['cashmere', 'coat', 'winter', 'minimalist', 'black', 'outerwear'],
    stock: 9, isLimitedEdition: false, sizes: ['46', '48', '50', '52', '54'],
    materials: ['100% Grade-A Mongolian Cashmere'], careInstructions: 'Professional cashmere cleaning only. Brush gently after each wear.',
    originCountry: 'Italy',
  },
  {
    name: 'Héritage Alligator Tote', brand: 'Maison Aurelia',
    description: 'Structured alligator-leather tote with brushed gold hardware, a hand-painted edge finish, and a suede-lined interior with a dedicated laptop sleeve.',
    story: 'Sourced from a certified sustainable tannery; each hide is individually numbered and matched by a master leatherworker so the scale pattern reads seamlessly across every panel.',
    basePrice: 8900, category: 'Leather Goods',
    images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=900',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=900',
      'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=900',
    ],
    semanticTags: ['leather', 'bag', 'tote', 'gold', 'investment-piece', 'handbag'],
    stock: 2, isLimitedEdition: true, sizes: [],
    materials: ['Genuine Alligator Leather', 'Suede lining', 'Brushed 18k gold-plated hardware'], careInstructions: 'Store in the provided dust bag. Avoid prolonged sun exposure and moisture.',
    originCountry: 'France',
  },
  {
    name: 'Solstice Diamond Pendant', brand: 'Verrier Joaillerie',
    description: 'A 1.2ct brilliant-cut diamond suspended on an 18k white gold chain, set in a tension mount that lets light pass through from every angle.',
    story: 'The diamond is GIA-certified and conflict-free, hand-set by Verrier\'s in-house jewelers in a Place Vendôme workshop that has cut stones for four generations.',
    basePrice: 12500, category: 'Fine Jewelry',
    images: [
      'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=900',
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=900',
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=900',
    ],
    semanticTags: ['diamond', 'jewelry', 'gift', 'wedding', 'gold', 'necklace'],
    stock: 6, isLimitedEdition: false, sizes: [],
    materials: ['1.2ct GIA-certified diamond', '18k white gold'], careInstructions: 'Clean with a soft jewelry cloth. Professional inspection recommended annually.',
    originCountry: 'France',
  },
  {
    name: 'Atelier Suede Loafers', brand: 'Verrier',
    description: 'Hand-lasted suede loafers with a full leather sole and a polished horsebit detail, built on a last that\'s remained unchanged since 1962.',
    story: 'Made in a family-run Northampton workshop using a 200-step bench-making process, with a welt that can be resoled indefinitely.',
    basePrice: 980, category: 'Footwear',
    images: [
      'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=900',
      'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=900',
      'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=900',
    ],
    semanticTags: ['suede', 'loafers', 'shoes', 'casual', 'brown', 'footwear'],
    stock: 14, isLimitedEdition: false, sizes: ['39', '40', '41', '42', '43', '44', '45'],
    materials: ['Italian suede upper', 'Full leather sole'], careInstructions: 'Use a suede brush after each wear. Protect with suede spray before first use.',
    originCountry: 'United Kingdom',
  },
  {
    name: 'Perpetuelle Automatic Watch', brand: 'Maison Aurelia',
    description: 'An in-house automatic movement with a 70-hour power reserve, housed in a brushed titanium case with a sapphire display back.',
    story: 'Limited to 200 pieces worldwide, each individually numbered on the caseback and accompanied by a hand-signed certificate from the movement\'s watchmaker.',
    basePrice: 21000, category: 'Watches',
    images: [
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=900',
      'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=900',
      'https://images.unsplash.com/photo-1495856458515-0637185db551?w=900',
    ],
    semanticTags: ['watch', 'titanium', 'limited-edition', 'gift', 'automatic'],
    stock: 3, isLimitedEdition: true, sizes: [],
    materials: ['Grade 5 Titanium case', 'Sapphire crystal', 'In-house automatic movement'], careInstructions: 'Water resistant to 50m. Service recommended every 5 years.',
    originCountry: 'Switzerland',
  },
  {
    name: 'Meridian Wool-Silk Blazer', brand: 'Verrier',
    description: 'A half-canvassed blazer in a wool-silk blend that holds a crisp line all day, cut with softly roped shoulders.',
    story: 'Cut from a mill in Biella that has supplied Verrier\'s tailoring department since the house\'s founding, using a loom pattern exclusive to the brand.',
    basePrice: 2650, category: 'Tailoring',
    images: [
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=900',
      'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=900',
      'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=900',
    ],
    semanticTags: ['blazer', 'wool', 'tailoring', 'formal', 'navy'],
    stock: 7, isLimitedEdition: false, sizes: ['46', '48', '50', '52'],
    materials: ['80% Wool, 20% Silk'], careInstructions: 'Dry clean only. Steam to refresh between wears.',
    originCountry: 'Italy',
  },
  {
    name: 'Voile Cashmere Scarf', brand: 'Maison Aurelia',
    description: 'A featherweight cashmere scarf, hand-rolled at the edges, in a solid ink tone that pairs with almost anything in the atelier.',
    story: 'Woven on vintage shuttle looms in Kashmir at a fraction of standard output speed, which is what gives the weave its unusual softness.',
    basePrice: 620, category: 'Accessories',
    images: [
      'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=900',
      'https://images.unsplash.com/photo-1520903920243-40edd47f1e75?w=900',
    ],
    semanticTags: ['cashmere', 'scarf', 'accessory', 'gift', 'winter'],
    stock: 22, isLimitedEdition: false, sizes: [],
    materials: ['100% Grade-A Cashmere'], careInstructions: 'Hand wash cold or dry clean. Lay flat to dry.',
    originCountry: 'India',
  },
  {
    name: 'Ondine Pearl Drop Earrings', brand: 'Verrier Joaillerie',
    description: 'South Sea pearl drops on a delicate 18k gold hook, each pearl hand-matched for luster and shape.',
    story: 'South Sea pearls are cultivated over 2–4 years off the coast of Western Australia, then hand-graded in Verrier\'s Paris workshop for the closest possible pair match.',
    basePrice: 3400, category: 'Fine Jewelry',
    images: [
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=900',
      'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=900',
    ],
    semanticTags: ['pearl', 'earrings', 'jewelry', 'gold', 'gift'],
    stock: 8, isLimitedEdition: false, sizes: [],
    materials: ['South Sea pearls', '18k gold'], careInstructions: 'Avoid contact with perfume and lotion. Store separately to avoid scratching.',
    originCountry: 'France',
  },
  {
    name: 'Sablé Leather Ankle Boot', brand: 'Verrier',
    description: 'A Chelsea-silhouette ankle boot in burnished calfskin with an elastic gusset and a Blake-stitched sole for a slim profile.',
    story: 'Finished with a hand-burnishing technique that builds up tonal depth in layers, so the leather deepens in color with wear rather than simply scuffing.',
    basePrice: 1150, category: 'Footwear',
    images: [
      'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=900',
      'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=900',
    ],
    semanticTags: ['boots', 'leather', 'shoes', 'black', 'footwear', 'casual'],
    stock: 11, isLimitedEdition: false, sizes: ['38', '39', '40', '41', '42'],
    materials: ['Full-grain calfskin', 'Leather sole'], careInstructions: 'Condition with leather balm every 3 months.',
    originCountry: 'Italy',
  },
];

async function seed() {
  await sequelize.sync({ force: true });
  console.log('✔ Database reset');

  await AiConfig.create({});
  await PosTerminal.create({ terminalCode: 'BQ-DHK-01', boutiqueLocation: 'Dhaka Flagship Boutique' });

  const createdProducts = [];
  for (const p of products) {
    const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const product = await Product.create({ ...p, slug });
    createdProducts.push(product);
  }

  // Reviews + grounded AI summary for a few products (realistic spread of sentiment)
  const reviewSets = [
    {
      product: createdProducts[0], // Aurelia Silk Evening Gown
      reviews: [
        { rating: 5, comment: 'Exquisite craftsmanship, the silk drapes beautifully and the fit was perfect for my gala.' },
        { rating: 4, comment: 'Stunning gown, luxurious fabric, but sizing ran slightly large — I\'d size down.' },
        { rating: 5, comment: 'Received endless compliments, exceptional quality and the tailoring is impeccable.' },
        { rating: 5, comment: 'Worth every penny. The bias cut is genuinely flattering, not just marketing language.' },
      ],
    },
    {
      product: createdProducts[1], // Noir Cashmere Overcoat
      reviews: [
        { rating: 5, comment: 'This coat is unbelievably warm without feeling heavy. The cashmere quality is obvious immediately.' },
        { rating: 5, comment: 'Timeless cut, doesn\'t feel trendy or dated. Will wear this for years.' },
        { rating: 3, comment: 'Beautiful coat but delivery took longer than expected for the price point.' },
      ],
    },
    {
      product: createdProducts[5], // Perpetuelle Automatic Watch
      reviews: [
        { rating: 5, comment: 'The movement is a genuine work of art visible through the sapphire back. Worth the wait.' },
        { rating: 4, comment: 'Gorgeous watch, slightly heavier on the wrist than I expected from titanium.' },
      ],
    },
    {
      product: createdProducts[6], // Meridian Wool-Silk Blazer
      reviews: [
        { rating: 5, comment: 'The shoulder line is exactly what I wanted — structured but not stiff.' },
        { rating: 4, comment: 'Great blazer, runs slightly long in the sleeve for my frame.' },
      ],
    },
  ];

  for (const set of reviewSets) {
    for (const r of set.reviews) await Review.create({ productId: set.product.id, ...r });
    const allReviews = await Review.findAll({ where: { productId: set.product.id } });
    const { summary, averageRating } = summarizeReviews(allReviews);
    await ProductAiSummary.create({ productId: set.product.id, summary, averageRating, reviewCountAtGeneration: allReviews.length });
  }

  // Dynamic pricing rules
  const watch = createdProducts[5];
  const tote = createdProducts[2];
  await PricingRule.create({
    productId: watch.id, ruleType: 'stock_scarcity', condition: { stockBelow: 5 },
    adjustmentPercent: 6, minBoundaryPercent: -10, maxBoundaryPercent: 12, active: true,
  });
  await PricingRule.create({
    productId: tote.id, ruleType: 'stock_scarcity', condition: { stockBelow: 3 },
    adjustmentPercent: 8, minBoundaryPercent: -10, maxBoundaryPercent: 12, active: true,
  });
  await PricingRule.create({
    category: 'Fine Jewelry', ruleType: 'vip_discount',
    adjustmentPercent: -8, minBoundaryPercent: -15, maxBoundaryPercent: 5, active: true,
  });
  await PricingRule.create({
    category: 'Evening Wear', ruleType: 'seasonal',
    adjustmentPercent: 4, minBoundaryPercent: -15, maxBoundaryPercent: 15, active: false, // off by default — admin can toggle for gala season
  });

  // A few newsletter subscribers for realistic admin data
  for (const email of ['early.access@example.com', 'concierge.list@example.com']) {
    await NewsletterSubscriber.create({ email, source: 'seed' });
  }

  // Demo users
  const demoUsers = [
    { name: 'Ava Sterling', email: 'customer@demo.com', password: 'password123', role: 'customer', vip: 'platinum' },
    { name: 'Super Admin', email: 'admin@demo.com', password: 'password123', role: 'super_admin' },
    { name: 'Priya Content', email: 'content@demo.com', password: 'password123', role: 'content_admin' },
    { name: 'Omar Pricing', email: 'pricing@demo.com', password: 'password123', role: 'pricing_admin' },
    { name: 'Lena AI Ops', email: 'aiops@demo.com', password: 'password123', role: 'ai_ops_admin' },
    { name: 'Boutique Staff', email: 'pos@demo.com', password: 'password123', role: 'pos_staff' },
  ];
  for (const u of demoUsers) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    const user = await User.create({ name: u.name, email: u.email, passwordHash, role: u.role });
    await UserStyleProfile.create({ userId: user.id, preferences: { colors: ['black', 'gold'], categories: ['Evening Wear', 'Fine Jewelry'] }, learnedTags: ['elegant', 'silk'] });
    if (u.vip) await VipMembership.create({ userId: user.id, tier: u.vip, benefits: ['White-glove delivery', 'Private appointments'], points: 4200 });
  }

  console.log('✔ Seed complete. Demo logins (password: password123):');
  demoUsers.forEach((u) => console.log(`  - ${u.role.padEnd(14)} ${u.email}`));
  process.exit(0);
}

seed().catch((err) => { console.error('Seed failed:', err); process.exit(1); });
